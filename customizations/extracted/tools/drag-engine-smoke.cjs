// Real game DOM, card/target filters, and bubbling touch events; isolated save data.
const {app,BrowserWindow}=require('electron');
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const output=path.join(__dirname,'drag-engine-smoke.log');
fs.writeFileSync(output,'RUN '+new Date().toISOString()+'\n');
const log=x=>fs.appendFileSync(output,JSON.stringify(x)+'\n');
app.setPath('userData',path.join(app.getPath('temp'),'noname-drag-engine-'+Date.now()));
app.commandLine.appendSwitch('no-sandbox');
app.whenReady().then(async()=>{
 const w=new BrowserWindow({show:false,width:1100,height:700,webPreferences:{nodeIntegration:true,contextIsolation:false,webSecurity:false,preload:path.join(__dirname,'online-modes-preload.cjs')}});
 const run=code=>w.webContents.executeJavaScript(`(async()=>{const {lib,game,ui,get,_status}=await import('./noname.js');${code}})()`);
 const until=async(code,label)=>{for(let i=0;i<220;i++){if(await run(code).catch(()=>false))return;await new Promise(r=>setTimeout(r,200));}throw Error('Timeout '+label)};
 try{
  await w.loadURL('http://127.0.0.1:8092/');await until('return !!ui.arena','load');
  await run(`await game.promises.saveConfig('new_tutorial',true);await game.promises.saveConfig('mode','connect');await game.promises.saveConfig('directstartmode','doudizhu');await game.promises.saveConfig('connect_doudizhu_mode','normal','doudizhu');game.reload();`);
  await until('return !!ui.connectStartButton && !!_status.waitingForPlayer','lobby');await run('ui.connectStartButton.click()');
  await until('return !!game.me && !!ui.auto','auto');await run('if(!_status.auto)ui.click.auto()');
  await until('return game.phaseNumber>0 && game.players.every(p=>p.name)','start');await run('game.pause();');
  const results=await run(`
   _status.auto=false;ui.arena.classList.remove('auto');lib.config.touchscreen=true;lib.config.enable_drag=true;lib.config.auto_confirm=false;
   document.addEventListener('touchmove',ui.click.windowtouchmove);document.addEventListener('touchend',ui.click.windowtouchend);
   for(const p of game.players){p.removeSkill(p.getSkills());p.hp=p.maxHp=20;p.node.handcards1.replaceChildren();p.node.handcards2.replaceChildren();}
   const p=game.me,checks=[];let committed;
   // Keep the paused game loop stationary while checking the real release path.
   ui.click.ok=()=>{committed={cards:ui.selected.cards.slice(),targets:ui.selected.targets.slice()};game.uncheck();};
   const initText=await (await fetch('./noname/init/index.js')).text();
   const filter=initText.slice(initText.indexOf('function createTouchDraggedFilter() {'),initText.indexOf('async function tryLoadCustomStyle'));
   new Function('game','_status',filter+';createTouchDraggedFilter();')(game,_status);
   const touch=(card,type,pos)=>{const e=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:type==='touchend'?[]:[pos]});card.dispatchEvent(e);};
   for(const fold of [true,false])for(const name of ['sha','juedou'])for(const selected of [false,true]){
    game.uncheck();p.node.handcards1.replaceChildren();lib.config.fold_card=fold;committed=null;
    const card=game.createCard(name);p.node.handcards1.appendChild(card);ui.updatehl();
    const evt=p.chooseToUse();evt.type='phase';evt.isMine=()=>true;evt._aiexclude=[];evt._skillChoice=[];_status.eventManager.setStatusEvent(evt,true);_status.currentPhase=p;
    _status.clicked=false;_status.dragged=false;game.check();
    const target=game.players.find(t=>t!==p&&p.canUse(card,t));if(!target)throw Error('No legal '+name+' target');
    if(selected){ui.click.card.call(card);_status.clicked=false;}
    await new Promise(r=>setTimeout(r,150));
    const r=card.getBoundingClientRect(),pos={clientX:r.left+r.width/2,clientY:r.top+r.height/2};
    touch(card,'touchstart',pos);touch(card,'touchmove',{clientX:pos.clientX,clientY:pos.clientY-25});
    const tr=target.getBoundingClientRect();touch(card,'touchmove',{clientX:tr.left+tr.width/2,clientY:tr.top+tr.height/2});
    const label=[name,fold?'folded':'scrollable',selected?'selected':'direct'].join('/');
    checks.push({name:label+' target',ok:ui.selected.targets.includes(target)});
    touch(card,'touchend',pos);
    checks.push({name:label+' release',ok:!!committed&&committed.cards[0]===card&&committed.targets[0]===target});
   }
   return checks;
  `);
  log(results);assert.ok(results.every(c=>c.ok),'Failed: '+JSON.stringify(results.filter(c=>!c.ok)));log('PASS');
 }catch(e){log(e.stack);process.exitCode=1;}finally{w.destroy();app.exit(process.exitCode||0);}
});
setTimeout(()=>app.exit(2),90000).unref();
