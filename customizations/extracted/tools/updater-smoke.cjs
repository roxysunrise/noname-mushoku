const {app,BrowserWindow}=require('electron');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {createHash}=require('node:crypto');
const output=path.resolve(__dirname,'../output/updater-qa');fs.mkdirSync(output,{recursive:true});
const dataRoot=path.join(app.getPath('temp'),'noname-updater-smoke-'+Date.now());
fs.mkdirSync(dataRoot,{recursive:true});fs.writeFileSync(path.join(dataRoot,'updater-settings.json'),JSON.stringify({manifestUrl:''}));
app.setPath('userData',path.join(dataRoot,'profile'));
app.commandLine.appendSwitch('no-sandbox');
app.whenReady().then(async()=>{
  let win;
  try {
    const {installUpdater}=await import(pathToFileURL(path.resolve(__dirname,'../game/resources/app/updater/electron.mjs')));
    const data=Buffer.alloc(512*1024,7);
    const remote={schema:1,version:'qa-next-version',baseVersion:'1.11.7',title:'三国更新验证',notes:['验证独立更新源。','验证真实下载进度与校验。'],windows:{url:'https://updates.example.test/patch.zip',bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')}};
    const fixture=async(url,opts)=>{
      if(url.endsWith('.json')) return new Response(JSON.stringify(remote),{headers:{'Content-Type':'application/json'}});
      let offset=0;
      return new Response(new ReadableStream({async pull(controller){
        await new Promise(r=>setTimeout(r,60));
        if(opts.signal.aborted){controller.error(Error('aborted'));return;}
        if(offset>=data.length){controller.close();return;}
        controller.enqueue(data.subarray(offset,offset+16384));offset+=16384;
      }}));
    };
    installUpdater({dataRoot,appRoot:path.resolve(__dirname,'../game/resources/app'),getGameUrl:()=> 'http://127.0.0.1:8097/index.html',fetcher:fixture});
    win=new BrowserWindow({show:false,width:1440,height:810,webPreferences:{nodeIntegration:true,contextIsolation:false,sandbox:false}});
    const errors=[];win.webContents.on('console-message',(_event,level,message)=>{if(level>=3)errors.push(message)});
    await win.loadURL('http://127.0.0.1:8097/updater/launcher.html');
    const run=code=>win.webContents.executeJavaScript(code);
    const until=async(code)=>{for(let i=0;i<120;i++){if(await run(code))return;await new Promise(r=>setTimeout(r,100));}throw Error('UI timeout: '+code)};
    await until("document.querySelector('#status').textContent.includes('尚未配置')");
    await run("document.querySelector('#settings').click();document.querySelector('#source').value='https://updates.example.test/noname-update.json';document.querySelector('#source-form').requestSubmit();");
    await until("document.querySelector('#notice').open && document.querySelector('#notice-title').textContent==='发现新版本'");
    assert.equal(JSON.parse(fs.readFileSync(path.join(dataRoot,'updater-settings.json'),'utf8')).manifestUrl,'https://updates.example.test/noname-update.json');
    fs.writeFileSync(path.join(output,'update-confirm.png'),(await win.webContents.capturePage()).toPNG());
    await run("document.querySelector('#download').click()");
    await until("document.querySelector('#percent').textContent.includes('%') && parseFloat(document.querySelector('#percent').textContent)>10");
    assert.ok(await run("document.querySelector('#enter').disabled"));
    fs.writeFileSync(path.join(output,'download-progress.png'),(await win.webContents.capturePage()).toPNG());
    await run("document.querySelector('#cancel').click()");
    await until("!document.querySelector('#enter').disabled");
    assert.ok(!fs.existsSync(path.join(dataRoot,'Updates/update.zip.part')));
    await run("document.querySelector('#check').click()");
    await until("document.querySelector('#notice').open");
    await run("document.querySelector('#download').click()");
    await until("!document.querySelector('#install').hidden");
    assert.equal(fs.statSync(path.join(dataRoot,'Updates/update.zip')).size,data.length);
    assert.ok(await run("document.querySelector('#status').textContent.includes('校验完成')"));
    // Decline and accept flows above run against the real Electron IPC/backend with an isolated network fixture.
    await win.reload();
    await until("document.querySelector('#notice').open");
    await run("document.querySelector('#later').click();document.querySelector('#enter').click()");
    await until("location.pathname==='/index.html'");
    assert.deepEqual(errors,[]);
    const result={success:true,checks:['unconfigured entry','persistent independent source','version prompt and logs','download progress','cancel cleanup','hash verified ready state','decline and enter game'],network:'isolated controlled fixture; public server is verified separately'};
    fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
    app.exit(0);
  }catch(error){console.error(error);fs.writeFileSync(path.join(output,'failure.txt'),String(error.stack));app.exit(1);}
});
