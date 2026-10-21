import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateUrl, validateManifest, fetchManifest, downloadPackage } from './game/resources/app/updater/core.mjs';

const data = Buffer.from('a real downloaded game update');
const hash = x => createHash('sha256').update(x).digest('hex');
const manifest = url => ({ schema: 1, version: '2026.10.22.1', baseVersion: '1.11.7', notes: ['Test update'], windows: { url, bytes: data.length, sha256: hash(data) } });
async function fixture(run) {
  const server = http.createServer((req, res) => {
    if (req.url === '/manifest') { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(manifest(`http://127.0.0.1:${server.address().port}/patch`))); }
    else if (req.url === '/patch') res.end(data);
    else if (req.url === '/short') res.end(data.subarray(0, 4));
    else if (req.url === '/long') res.end(Buffer.concat([data, data]));
    else if (req.url === '/slow') { res.write(data.subarray(0, 1)); const timer = setTimeout(() => res.end(data.subarray(1)), 10000); req.once('close', () => clearTimeout(timer)); }
    else { res.writeHead(503); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'noname-update-test-'));
  try { await run(`http://127.0.0.1:${server.address().port}`, dir); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}
test('independent HTTPS endpoints only, no embedded credentials or GitHub', () => {
  assert.equal(validateUrl('https://updates.example.com/noname-update.json'), 'https://updates.example.com/noname-update.json');
  for (const url of ['http://updates.example.com/m', 'file:///C:/m', 'https://user:pass@example.com/m', 'https://github.com/m', 'https://raw.githubusercontent.com/m', 'https://name.github.io/m']) assert.throws(() => validateUrl(url));
  assert.equal(validateUrl('http://127.0.0.1/m', {allowLocal:true}), 'http://127.0.0.1/m');
});
test('reject invalid manifests before showing a download', () => {
  const valid = manifest('https://updates.example.com/p.zip');
  assert.equal(validateManifest(valid).version, valid.version);
  for (const windows of [{...valid.windows, bytes:-1}, {...valid.windows, sha256:'bad'}, {...valid.windows, url:'http://example.com/p'}]) assert.throws(() => validateManifest({...valid,windows}));
  assert.throws(() => validateManifest({...valid,notes:'bad'}));
});
test('real HTTP manifest request and error handling', () => fixture(async base => {
  assert.equal((await fetchManifest(`${base}/manifest`, {allowLocal:true})).version, '2026.10.22.1');
  await assert.rejects(fetchManifest(`${base}/missing`, {allowLocal:true}), /503/);
}));
test('stream progress and successful byte/hash verification', () => fixture(async (base, dir) => {
  const dest = path.join(dir,'update.zip'); const progress=[];
  await downloadPackage(manifest(`${base}/patch`).windows, dest, {allowLocal:true,onProgress:p=>progress.push(p)});
  assert.deepEqual(fs.readFileSync(dest), data);
  assert.equal(progress.at(-1).percent,100);
  assert.equal(progress.at(-1).remaining,0);
  assert.ok(progress.at(-1).speed > 0);
  assert.ok(!fs.existsSync(dest+'.part'));
}));
test('truncated, oversized and tampered downloads are never installed', () => fixture(async (base, dir) => {
  for (const suffix of ['/short','/long','/patch']) {
    const pkg = manifest(`${base}${suffix}`).windows;
    if (suffix === '/patch') pkg.sha256='0'.repeat(64);
    const dest=path.join(dir,suffix.slice(1)+'.zip');
    await assert.rejects(downloadPackage(pkg,dest,{allowLocal:true}));
    assert.ok(!fs.existsSync(dest)); assert.ok(!fs.existsSync(dest+'.part'));
  }
}));
test('cancel streaming leaves no partial file', () => fixture(async (base, dir) => {
  const controller = new AbortController(); const dest=path.join(dir,'cancel.zip');
  const timer=setTimeout(()=>controller.abort(),60);
  await assert.rejects(downloadPackage(manifest(`${base}/slow`).windows,dest,{allowLocal:true,signal:controller.signal}));
  clearTimeout(timer);assert.ok(!fs.existsSync(dest+'.part')); assert.ok(!fs.existsSync(dest));
}));
test('installer performs a real staged update and rejects traversal or corrupt payloads', {skip:process.platform!=='win32'}, () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'noname-install-test-'));
  const script=fileURLToPath(new URL('./game/resources/app/updater/install.ps1', import.meta.url));
  const maker=String.raw`
import json, hashlib, zipfile, pathlib, sys
root=pathlib.Path(sys.argv[1]); mode=sys.argv[2]
app=root/'game'; app.mkdir(exist_ok=True); (app/'package.json').write_text('{}')
(app/'keep.txt').write_text('personal data'); (app/'a.txt').write_text('old')
version=json.dumps({'version':'v2'}).encode()
files={'a.txt':b'new','updater/version.json':version}
if mode=='rollback':
    (app/'blocked').write_text('blocking file'); files['blocked/b.txt']=b'impossible'
if mode=='traversal': files['../outside.txt']=b'escape'
manifest={'version':'v2','files':[{'path':n,'sha256':hashlib.sha256(b).hexdigest()} for n,b in files.items()]}
if mode=='corrupt': manifest['files'][0]['sha256']='0'*64
with zipfile.ZipFile(root/'update.zip','w') as z:
    z.writestr('payload.json',json.dumps(manifest))
    for n,b in files.items(): z.writestr(n,b)
archive=root/'update.zip'
(root/'job.json').write_text(json.dumps({'pid':0,'appRoot':str(app),'executable':'','archive':str(archive),'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'version':'v2'}))
`;
  for(const mode of ['success','corrupt','traversal','rollback']) {
    const root=path.join(dir,mode);fs.mkdirSync(root);
    const prep=spawnSync('python',['-c',maker,root,mode],{encoding:'utf8'});assert.equal(prep.status,0,prep.stderr);
    const run=spawnSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',script,'-JobFile',path.join(root,'job.json'),'-TestMode'],{encoding:'utf8'});
    const result=JSON.parse(fs.readFileSync(path.join(root,'result.json'),'utf8').replace(/^\uFEFF/,''));
    assert.equal(result.success,mode==='success',JSON.stringify(result)+run.stderr);
    assert.equal(fs.readFileSync(path.join(root,'game/a.txt'),'utf8'),mode==='success'?'new':'old');
    assert.equal(fs.readFileSync(path.join(root,'game/keep.txt'),'utf8'),'personal data');
    assert.ok(!fs.existsSync(path.join(root,'outside.txt')));
    if(mode==='rollback') assert.equal(result.rollbackErrors.length,0);
  }
});
