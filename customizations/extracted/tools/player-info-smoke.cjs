// Isolated Electron profile; exercises the real Player class and default layout.
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const output=path.resolve(__dirname,'../output/player-card-layout-qa');
fs.mkdirSync(output,{recursive:true});
app.setPath('userData',path.join(app.getPath('temp'),'noname-player-info-'+Date.now()));
app.commandLine.appendSwitch('no-sandbox');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const w=new BrowserWindow({show:false,width:1440,height:810,webPreferences:{nodeIntegration:true,contextIsolation:false,backgroundThrottling:false,preload:path.join(__dirname,'online-smoke-preload.cjs')}});
 const run=code=>w.webContents.executeJavaScript(`(async()=>{const {lib,game,ui,_status}=await import('./noname.js');${code}})()`);
 try{
  await w.loadURL('http://127.0.0.1:8196/');
  let ready=false;
  for(let i=0;i<100;i++){try{ready=await run('return !!lib.config?.mode && !!ui.create.player;');}catch{}if(ready)break;await delay(300);}
  assert.equal(ready,true,'engine bootstrap');
  await run(`await game.promises.saveConfig('new_tutorial',true);`);
  await w.reload();
  ready=false;
  for(let i=0;i<100;i++){try{ready=await run('return !!lib.config?.mode && !!ui.create.player;');}catch{}if(ready)break;await delay(300);}
  assert.equal(ready,true,'engine reloaded without tutorial');
  const checks=await run(`
   const checks=[];
   const check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
   // Use actual initialized Player/card nodes; only transport is stubbed.
   const windowNode=document.createElement('div');windowNode.id='window';windowNode.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:hidden';
   const stage=document.createElement('div');stage.id='arena';windowNode.appendChild(stage);document.body.replaceChildren(windowNode);
   stage.style.cssText='background:#263b42';
   ui.arena=stage;
   const a=ui.create.player(stage).init('caocao');
   const b=ui.create.player(stage).init('liubei');
   game.pause();game.players=[a,b];game.dead=[];game.me=a;game.online=false;_status.connectMode=true;
   const broadcasts=[];game.broadcast=(fn,player,isAi)=>broadcasts.push(isAi);
   a.playerid='player-123';a.nickname='玩家甲';a.setNickname();
   b.playerid='generated-ai-seat';b.nickname='玩家乙';b.setNickname();
   const text=p=>{p.updateOnlineInfo();return p.node.onlineinfo.textContent;};
   check(text(a).startsWith('ID: player-123\\n'),'host ID');
   check(text(b).startsWith('人机\\n'),'generated AI ID remains AI');
   b.ws={closed:false};check(text(b).startsWith('ID: generated-ai-seat\\n'),'human takeover');
   b.ws.closed=true;check(text(b).startsWith('人机\\n'),'disconnect becomes AI');
   b.ws.closed=false;check(text(b).startsWith('ID:'),'reconnect restores ID');
   check(broadcasts.includes(true)&&broadcasts.includes(false),'authority broadcasts both transitions');
   check(b.getState().displayAi===false,'snapshot carries authority');
   game.online=true;b.displayAi=true;check(text(b).startsWith('人机'),'remote uses authority');
   b.displayAi=false;check(text(b).startsWith('ID:'),'remote human ID');
   game.online=false;_status.connectMode=false;
   a.hp=3;
   for(let i=0;i<5;i++)a.node.handcards1.appendChild(ui.create.card().init(['spade',i+1,'sha']));
   check(text(a)==='手牌 5/3','over limit visible');
   a.hp=0;check(text(a)==='手牌 5/0','zero limit');
   lib.skill.player_info_qa={mod:{maxHandcard:()=>Infinity}};a.addSkill('player_info_qa');
   check(text(a)==='手牌 5/∞','real skill unlimited limit');
   a.removeSkill('player_info_qa');a.hp=4;text(a);
   a.node.handcards1.firstChild.remove();await new Promise(r=>setTimeout(r,60));
   check(a.node.onlineinfo.textContent==='手牌 4/4','hand mutation refresh');
   a.hp=6;await new Promise(r=>setTimeout(r,650));
   check(a.node.onlineinfo.textContent==='手牌 4/6','limit refresh without draw');
   b.classList.add('connect');delete b.playerid;check(text(b)==='人机','lobby AI');
   b.playerid='lobby-user';check(text(b)==='ID: lobby-user','lobby human');
   b.classList.add('unselectable2');text(b);check(b.node.onlineinfo.hidden,'disabled seat hidden');
   b.classList.remove('connect','unselectable2');
   return checks;
  `);
  const result={success:true,checks,time:new Date().toISOString(),scope:'Real engine online player ID and hand limit; no physical device'};
  fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2));
  console.log('PLAYER_INFO_PASS '+JSON.stringify(result));
 }catch(error){fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({success:false,error:error.stack,time:new Date().toISOString()},null,2));console.error(error);process.exitCode=1;}
 finally{w.destroy();app.exit(process.exitCode||0);}
});
setTimeout(()=>app.exit(1),90000).unref();

