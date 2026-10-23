// Isolated UI harness: no game profiles, room connections, or running app are touched.
const {app,BrowserWindow}=require('electron');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../game/resources/app');
const results=[];
app.setPath('userData',path.join(app.getPath('temp'),'noname-mobile-ui-'+Date.now()));
app.commandLine.appendSwitch('no-sandbox');
const server=http.createServer((req,res)=>{
 if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><link rel="stylesheet" href="/layout/default/layout.css"></head><body><div id="window"><div id="arena"></div></div></body></html>');return;}
 const target=path.join(root,decodeURIComponent(req.url.split('?')[0]));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try {res.setHeader('Content-Type',target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':'application/octet-stream');res.end(fs.readFileSync(target));}catch{res.writeHead(404).end();}
});
app.whenReady().then(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const w=new BrowserWindow({show:false,width:900,height:500,webPreferences:{contextIsolation:false}});
 try {
  await w.loadURL(`http://127.0.0.1:${server.address().port}/`);
  const setup=await w.webContents.executeJavaScript(`(async()=>{
   const {installMobileAccessibility}=await import('./noname/ui/mobile-accessibility.js');
   const config={ui_zoom:'100%',connect_nickname:'旧昵称',character_size:100,character_card_side:'right',image_background:'default'};
   const game={deviceZoom:1,saveConfig(key,value){config[key]=value;},updateBackground(){}};
   const ui={updatez(){document.body.style.transform='scale('+game.documentZoom+')';},update(){},create:{system(label,callback){window.openDisplay=callback;}}};
   const lib={config,assetURL:'/',onresize:[],configMenu:{appearence:{config:{image_background:{item:{default:'默认',forest:'森林'},onclick(key){config.image_background=key;}}}}}};
   const get={connectNickname:()=>config.connect_nickname,plainText:value=>String(value),is:{banWords:()=>false}};
   installMobileAccessibility({lib,game,ui,get}); window.testUI={ui,game,config};
   return typeof ui.openDisplaySettings;
  })()`);
  assert.equal(setup,'function');
  const run=code=>w.webContents.executeJavaScript(`(()=>{const {ui,game,config}=window.testUI;${code}})()`);
  await new Promise(r=>setTimeout(r,100));
  assert.equal(await run(`ui.openDisplaySettings();return document.querySelector('[aria-label="显示与操作"]').getAttribute('role');`),'dialog');
  assert.equal(await run(`return document.querySelector('[aria-label="武将牌位置"]');`),null);
  assert.equal(await run(`return document.documentElement.hasAttribute('data-player-card-side');`),false);
  await new Promise(r=>setTimeout(r,100));
  assert.equal(await run(`const input=document.querySelector('input[aria-label="整体界面（含手牌）"]');input.value=85;input.dispatchEvent(new Event('input'));return game.documentZoom;`),.85);
  assert.equal(await run(`[...document.querySelectorAll('.accessibility-panel button')].find(n=>n.textContent==='保留缩放').click();return config.ui_zoom;`),'85%');
  assert.equal(await run(`const input=document.querySelector('input[aria-label="选将与武将卡尺寸"]');input.value=75;input.dispatchEvent(new Event('input'));return config.character_size;`),75);
  assert.equal(await run(`return document.documentElement.style.getPropertyValue('--character-size');`),'0.75');
  assert.equal(await run(`const input=document.querySelector('input[aria-label="手牌尺寸"]');input.value=80;input.dispatchEvent(new Event('input'));return config.handcard_size;`),80);
  assert.equal(await run(`return document.documentElement.style.getPropertyValue('--handcard-size');`),'0.8');
  assert.equal(await run(`[...document.querySelectorAll('.accessibility-panel button')].find(n=>n.textContent==='70%').click();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return Math.round(game.documentZoom*100);`),85);
  assert.equal(await run(`ui.openDisplaySettings();[...document.querySelectorAll('.accessibility-panel button')].find(n=>n.textContent==='手机紧凑').click();return [config.ui_zoom,config.character_size,config.handcard_size].join(',');`),'85%,80,85');
  assert.equal(await run(`ui.editConnectNickname();const input=document.querySelector('input[type=text]');input.value='新昵称';[...document.querySelectorAll('.accessibility-panel button')].find(n=>n.textContent==='保存昵称').click();return config.connect_nickname;`),'新昵称');
  assert.equal(await run(`ui.editConnectNickname();document.querySelector('input[type=text]').value='取消测试';[...document.querySelectorAll('.accessibility-panel button')].find(n=>n.textContent==='取消').click();return config.connect_nickname;`),'新昵称');
  assert.equal(await run(`ui.openBackgroundSettings();[...document.querySelectorAll('.accessibility-backgrounds button')].find(n=>n.textContent==='森林').click();return config.image_background;`),'forest');
  assert.equal(await run(`return document.querySelectorAll('.accessibility-overlay').length;`),0);
  for(const size of [[900,500],[680,320],[1280,600]]){
   w.setContentSize(...size);
   const fit=await run(`ui.openDisplaySettings();const rect=document.querySelector('.accessibility-panel').getBoundingClientRect();const overlay=document.querySelector('.accessibility-overlay');return {fits:rect.left>=0&&rect.top>=0&&rect.right<=innerWidth&&rect.bottom<=innerHeight,parent:overlay.parentNode===document.documentElement,width:rect.width};`);
   assert.equal(fit.fits,true,JSON.stringify({size,fit}));assert.equal(fit.parent,true);results.push({size,...fit});
  }
  assert.equal(await run(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return document.querySelectorAll('.accessibility-overlay').length;`),0);
			console.log('MOBILE_UI_PASS '+JSON.stringify({viewports:results}));
			fs.writeFileSync(path.join(__dirname,'player-card-settings-smoke.log'),'MOBILE_UI_PASS '+JSON.stringify({viewports:results})+'\n');
		}catch(error){console.error(error);fs.writeFileSync(path.join(__dirname,'player-card-settings-smoke.log'),'MOBILE_UI_FAIL '+error.stack);process.exitCode=1;}
 finally{w.destroy();server.close();app.exit(process.exitCode||0);}
});
