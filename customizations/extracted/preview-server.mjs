import http from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = process.argv[2] ? path.resolve(process.argv[2]) + path.sep : fileURLToPath(new URL('./game/resources/app/', import.meta.url));
const port = Number(process.argv[3] || 8091);
http.createServer(async (req,res) => {
 try {
  const url = new URL(req.url,'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  if (['/checkFile','/readFile','/getFileList'].includes(pathname)) {
   const target = path.resolve(root, url.searchParams.get('fileName') ?? url.searchParams.get('dir') ?? '');
   if (target !== root.slice(0,-1) && !target.startsWith(root)) { res.writeHead(403).end(); return; }
   let data;
   if (pathname === '/checkFile') { const info = await stat(target).catch(()=>null); data = info ? (info.isDirectory() ? 'directory' : 'file') : null; }
   if (pathname === '/readFile') data = Array.from(await readFile(target));
   if (pathname === '/getFileList') { const entries = await readdir(target,{withFileTypes:true}); data = {folders:entries.filter(e=>e.isDirectory()).map(e=>e.name),files:entries.filter(e=>e.isFile()).map(e=>e.name)}; }
   res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({success:true,data})); return;
  }
  const file = path.resolve(root,'.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  const mime = { '.js':'text/javascript', '.mjs':'text/javascript', '.ts':'text/javascript', '.html':'text/html', '.json':'application/json', '.css':'text/css', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml', '.woff2':'font/woff2' }[path.extname(file)] || 'application/octet-stream';
  const data = await readFile(file);
  res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(data);
 } catch { res.writeHead(404).end(); }
}).listen(port,'127.0.0.1',()=>console.log(`Noname isolated preview: http://127.0.0.1:${port}`));
