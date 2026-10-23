// CSS/DOM regression in isolated Chromium, including a simulated Android cutout.
const {app,BrowserWindow}=require('electron');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../game/resources/app'),output=path.join(__dirname,'mobile-layout-smoke.log');
fs.writeFileSync(output,`RUN ${new Date().toISOString()}\n`);
app.setPath('userData',path.join(app.getPath('temp'),'noname-mobile-layout-'+Date.now()));
app.commandLine.appendSwitch('no-sandbox');
const server=http.createServer((req,res)=>{
 if(req.url==='/'){res.setHeader('Content-Type','text/html;charset=utf-8');res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><link rel="stylesheet" href="/layout/default/layout.css"><link rel="stylesheet" href="/layout/mobile/layout.css"><link rel="stylesheet" href="/layout/mode/boss.css"><body><div id="window"><div class="background" style="inset:0;background:#725d43"></div><div id="system">系统操作</div><div id="bosslist"></div><div class="dialog bosscharacter"><div class="content-container"><div class="content"><div class="caption">选择参战角色</div><div class="buttons"></div></div></div></div><div id="control" class="bosslist"><div class="control">更换　自由选择　应战</div></div></div>');return;}
 const target=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':target.endsWith('.jpg')?'image/jpeg':'application/octet-stream');res.end(fs.readFileSync(target));}catch{res.writeHead(404).end();}
});
app.whenReady().then(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const w=new BrowserWindow({show:false,width:960,height:432,webPreferences:{contextIsolation:false}});
 try{
  await w.loadURL(`http://127.0.0.1:${server.address().port}/`);
  await w.webContents.executeJavaScript(`(async()=>{
   window.NonameUpdater={};const {installMobileAccessibility}=await import('./noname/ui/mobile-accessibility.js');
   const game={documentZoom:1,deviceZoom:1,saveConfig(){}};const lib={config:{},onresize:[],assetURL:'/'};
   const ui={create:{system(){}},updatez(){},update(){}};
   installMobileAccessibility({lib,game,ui,get:{}});
   window.layoutState={lib,game,ui};
   const roster=(await import('./noname/init/mushoku-characters.js')).default;
   const list=document.querySelector('.buttons');for(const [id,info] of Object.entries(roster)){
    const card=document.createElement('div');card.className='button character';card.dataset.id=id;
    const image=document.createElement('img');image.src=info.img;image.style.cssText='width:100%;height:100%;object-fit:cover;position:relative';card.append(image);list.append(card);
   }
   for(const name of ['ac_alucard','boss_mt_roxy','boss_johan-v2']){const boss=document.createElement('div');boss.className='player bossplayer';boss.style.background='center / cover url("image/character/'+name+'.jpg")';document.getElementById('bosslist').append(boss);}
   await document.fonts.ready;
   await Promise.all([...document.images].map(image=>image.decode()));
  })()`);
  const results=[];
  for(const size of [[960,432],[780,360],[640,288]]){
   w.setContentSize(...size);
   await w.webContents.executeJavaScript(`new Promise(resolve=>{const ready=()=>innerWidth===${size[0]}&&innerHeight===${size[1]}?resolve():requestAnimationFrame(ready);ready();})`);
   await w.webContents.executeJavaScript(`(()=>{const {game}=layoutState;game.documentZoom=Math.min(1,innerHeight/500);document.body.style.width=innerWidth/game.documentZoom+'px';document.body.style.height=innerHeight/game.documentZoom+'px';document.body.style.transform='scale('+game.documentZoom+')';window.__nonameInsets={left:28,top:0,right:0,bottom:0,width:innerWidth};dispatchEvent(new Event('noname-safe-area'));})()`);
   await new Promise(resolve=>setTimeout(resolve,650));
   const result=await w.webContents.executeJavaScript(`(()=>{
    const panel=document.querySelector('.dialog'),scroll=panel.querySelector('.content-container'),boss=document.getElementById('bosslist'),controls=document.getElementById('control');
    const box=element=>{const r=element.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
    scroll.scrollTop=scroll.scrollHeight;
    return {size:[innerWidth,innerHeight],window:box(document.getElementById('window')),system:box(document.getElementById('system')),panel:box(panel),boss:box(boss),control:box(controls),card:box(document.querySelector('.button.character')),scrollable:scroll.scrollHeight>scroll.clientHeight,canScroll:scroll.scrollTop>0,portraitCount:[...document.images].filter(image=>image.complete&&image.naturalWidth>0).length,characterSize:getComputedStyle(document.documentElement).getPropertyValue('--character-size')};
   })()`);
   assert.ok(result.window.left===0&&Math.abs(result.window.right-size[0])<2,JSON.stringify(result));
   assert.ok(result.system.left>=27&&result.system.right<=size[0]+1,JSON.stringify(result));
   assert.ok(result.panel.top>=result.boss.bottom-1&&result.panel.height>40,JSON.stringify(result));
   assert.ok(result.panel.bottom<=result.control.top&&result.control.bottom<=size[1]+1,JSON.stringify(result));
   assert.ok(result.scrollable&&result.canScroll,JSON.stringify(result));
   assert.ok(result.portraitCount>=39);assert.equal(Number(result.characterSize),.8);results.push(result);
  }
  const image=await w.webContents.capturePage();fs.writeFileSync(path.join(__dirname,'mobile-layout-preview.png'),image.toPNG());
  fs.appendFileSync(output,'PASS '+JSON.stringify(results)+'\n');
 }catch(error){fs.appendFileSync(output,'FAIL '+error.stack+'\n');process.exitCode=1;}
 finally{w.destroy();server.close();app.exit(process.exitCode||0);}
});
setTimeout(()=>{fs.appendFileSync(output,'FAIL timeout\n');app.exit(2);},60000).unref();
