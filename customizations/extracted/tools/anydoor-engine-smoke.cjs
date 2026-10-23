// Real event dispatcher and physical cards, isolated save profile and hidden window.
const {app,BrowserWindow}=require('electron');
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const output=path.join(__dirname,'anydoor-engine-smoke.log');
fs.writeFileSync(output,`RUN ${new Date().toISOString()}\n`);
const log=text=>fs.appendFileSync(output,text+'\n');
app.setPath('userData',path.join(app.getPath('temp'),'noname-sixteen-'+Date.now()));
app.commandLine.appendSwitch('no-sandbox');
app.whenReady().then(async()=>{
 const w=new BrowserWindow({show:false,webPreferences:{nodeIntegration:true,contextIsolation:false,webSecurity:false,preload:path.join(__dirname,'online-modes-preload.cjs')}});
 const run=code=>w.webContents.executeJavaScript(`(async()=>{const {lib,game,ui,get,_status}=await import('./noname.js');${code}})()`);
 const until=async(code,label)=>{for(let i=0;i<220;i++){if(await run(code).catch(()=>false))return;await new Promise(r=>setTimeout(r,200));}throw Error('Timeout '+label+' '+await run(`return JSON.stringify({event:_status.event?.name,doorStage:window.doorStage,text:document.body.innerText.slice(-300)});`));};
 w.webContents.on('console-message',(_e,level,message)=>{if(level>=3)log('CONSOLE '+message);});
 try{
  await w.loadURL('http://127.0.0.1:8092/');await until('return !!ui.arena;','load');
  await run(`await game.promises.saveConfig('new_tutorial',true);await game.promises.saveConfig('mode','connect');await game.promises.saveConfig('directstartmode','doudizhu');await game.promises.saveConfig('connect_doudizhu_mode','normal','doudizhu');game.reload();`);
  await until('return !!ui.connectStartButton && !!_status.waitingForPlayer;','lobby');await run('ui.connectStartButton.click();');
  await until('return !!game.me && !!ui.auto;','auto');await run('if(!_status.auto)ui.click.auto();');
  await until('return game.phaseNumber>0 && game.players.every(p=>p.name);','start');await run('game.pause();');
  await run(`window.qaDone=false;const next=game.createEvent('anydoorQA',false);next.player=game.me;next.setContent(async event=>{
   const checks=[];const check=(name,ok)=>{checks.push({name,ok:!!ok});if(!ok)throw Error(name);};
   try{
    const [p,t,u]=game.players;
    for(const actor of game.players){actor.removeSkill(actor.getSkills());actor.hp=actor.maxHp=30;actor.hujia=0;await actor.discard(actor.getCards('hej'));}
    p.addSkill('ac_anydoor');let doorChoice=null,doorPrompts=0;const originalChooseTarget=p.chooseTarget;
    p.chooseTarget=function(...args){const choice=originalChooseTarget.apply(this,args);if(typeof args[0]==='string'&&args[0].startsWith('任意门')){doorPrompts++;choice.set('ai',target=>target===doorChoice?10:-10);if(doorChoice)choice.set('forced',true);}return choice;};
    try {
     window.doorStage='wuzhong cancel';const beforeDoor=p.countCards('h');await p.useCard({name:'wuzhong',isCard:true},p);
     check('Anydoor cancelled Wuzhong finishes',p.countCards('h')===beforeDoor+2&&doorPrompts===1);await p.discard(p.getCards('h'));
     window.doorStage='wuzhong add';doorChoice=u;const beforeDraw=u.countCards('h');await p.useCard({name:'wuzhong',isCard:true},p);
     check('Anydoor added Wuzhong target draws',u.countCards('h')===beforeDraw+2);
     for(const actor of game.players)await actor.discard(actor.getCards('h'));
     window.doorStage='duel add';doorChoice=u;const beforeAdded=u.hp;let use=t.useCard({name:'juedou',isCard:true},p);await use;
     check('Anydoor added Duel target settles damage',use.targets.includes(u)&&u.hp===beforeAdded-1);
     window.doorStage='duel remove self';doorChoice=p;const beforeRemoved=p.hp,beforeKept=u.hp;use=t.useCard({name:'juedou',isCard:true},[p,u]);await use;
     check('Anydoor removed self is excluded',!use.targets.includes(p)&&p.hp===beforeRemoved&&u.hp===beforeKept-1);
     window.doorStage='duel cancel';doorChoice=null;const beforeCancelled=p.hp;use=t.useCard({name:'juedou',isCard:true},p);await use;
     check('Anydoor cancelled Duel finishes',p.hp===beforeCancelled-1&&use.targets.length===1);
    }finally{p.chooseTarget=originalChooseTarget;p.removeSkill('ac_anydoor');}
    window.qaResult={checks,errorFlag:!!_status.withError};
   }catch(error){window.qaResult={checks,error:error.stack};}window.qaDone=true;game.pause();
  });game.resume();`);
  await until('return window.qaDone;','checks');const result=await run('return window.qaResult;');log(JSON.stringify(result));assert.ok(!result.error,result.error);assert.ok(!result.errorFlag);assert.ok(result.checks.every(c=>c.ok));log('PASS');w.destroy();app.exit(0);
 }catch(error){log('FAIL '+error.stack);w.destroy();app.exit(1);}
});
setTimeout(()=>{log('FAIL watchdog');app.exit(2);},140000).unref();

