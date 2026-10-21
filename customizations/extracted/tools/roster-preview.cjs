const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path');
const output=process.env.NONAME_QA_OUTPUT||path.resolve(__dirname,'../output/qa');
fs.mkdirSync(output,{recursive:true});
app.setPath('userData',path.join(app.getPath('temp'),'noname-roster-'+Date.now()));
app.whenReady().then(async()=>{
 const w=new BrowserWindow({show:true,width:1100,height:680,webPreferences:{backgroundThrottling:false,nodeIntegration:true,contextIsolation:false,webSecurity:false,preload:path.join(__dirname,'online-modes-preload.cjs')}});
 const run=code=>w.webContents.executeJavaScript(`(async()=>{const {lib,game,ui,get,_status}=await import('./noname.js');${code}})()`);
 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 const until=async code=>{for(let n=0;n<200;n++){try{if(await run(code))return;}catch{}await delay(150);}throw Error('timeout '+code)};
 try{
  await w.loadURL('http://127.0.0.1:8092/');await until('return !!lib.config.mode;');
  await run(`await game.promises.saveConfig('new_tutorial',true);await game.promises.saveConfig('mode','connect');await game.promises.saveConfig('directstartmode','doudizhu');game.reload();`);
  await until('return !!ui.connectStartButton;');await run('ui.connectStartButton.click();');await until('return !!game.me && !!ui.auto;');
  await run('if(!_status.auto)ui.click.auto();');await until('return game.phaseNumber>0 && game.players.every(p=>p.name);');
  await run(`game.pause2();ui.arena.classList.remove('auto');ui.autonode.hide();
   window.preview=ui.create.dialog('AI · 新武将',[Object.keys(lib.characterPack.ai),'character']);
   Object.assign(window.preview.style,{width:'760px',left:'calc(50% - 380px)',top:'25%',background:'rgba(20,25,32,.97)'});window.preview.open();`);
  await delay(700);
  fs.writeFileSync(path.join(output,'AI武将游戏内预览.png'),(await w.webContents.capturePage()).toPNG());
  const info=await run(`return {buttons:window.preview.buttons.length,rect:window.preview.getBoundingClientRect().toJSON(),display:getComputedStyle(window.preview).display};`);
  if(info.buttons!==5)throw Error(JSON.stringify(info));
  await run(`lib.config.touchscreen=true;const button=window.preview.buttons.find(n=>n.link==='ac_chatgpt');_status.clicked=false;ui.click.intro.call(button,{clientX:430,clientY:140});`);
  await delay(700);
  await run(`for(const animation of document.querySelector('#nodeintro').getAnimations())animation.finish();`);
  await delay(500);
  const popup=await run(`const node=document.querySelector('#nodeintro');const r=node.getBoundingClientRect();const style=getComputedStyle(node);return {text:node.innerText,rect:r.toJSON(),opacity:style.opacity,background:style.background,close:!!node.querySelector('.intro-close'),fits:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1};`);
  if(popup.opacity!=='1'){
   popup.diagnostics=await run(`const node=document.querySelector('#nodeintro');const rules=[];const walk=list=>{for(const rule of list){if(rule.cssRules)walk(rule.cssRules);else if(rule.selectorText&&rule.style?.opacity){try{if(node.matches(rule.selectorText))rules.push(rule.cssText);}catch{}}}};for(const sheet of document.styleSheets){try{walk(sheet.cssRules)}catch{}}return {class:node.className,style:node.getAttribute('style'),rules};`);
  }
  if(!popup.close||!popup.fits||!popup.text.includes('星海龙吟')||popup.opacity!=='1')throw Error(JSON.stringify(popup));
  fs.writeFileSync(path.join(output,'AI称号与技能详情.png'),(await w.webContents.capturePage()).toPNG());
  await run(`document.querySelector('.intro-close').click();`);await until(`return !document.querySelector('#nodeintro');`);
  await run(`window.preview.close();ui.openDisplaySettings();[...document.querySelectorAll('.accessibility-panel button')].find(node=>node.textContent==='手机紧凑').click();`);
  w.setContentSize(844,390);await delay(500);
  fs.writeFileSync(path.join(output,'显示与操作.png'),(await w.webContents.capturePage()).toPNG());
  await run(`document.querySelector('.accessibility-close').click();`);await delay(500);
  fs.writeFileSync(path.join(output,'手机横屏游戏内预览.png'),(await w.webContents.capturePage()).toPNG());
  fs.writeFileSync(path.join(__dirname,'roster-preview.log'),'PASS '+JSON.stringify({info,popup})+'\n');
 }catch(error){fs.writeFileSync(path.join(__dirname,'roster-preview.log'),'FAIL '+error.stack);process.exitCode=1;}
 finally{w.destroy();app.exit(process.exitCode||0);}
});
setTimeout(()=>app.exit(2),90000).unref();
