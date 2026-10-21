const {app,BrowserWindow}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const mode=process.argv.find(a=>a.startsWith('--test-mode='))?.split('=')[1] || 'doudizhu';
const bossName=process.argv.find(a=>a.startsWith('--test-boss='))?.split('=')[1] || 'boss_mt_roxy';
const teams=process.argv.find(a=>a.startsWith('--teams='))?.split('=')[1] || 'random';
const versus=process.argv.find(a=>a.startsWith('--versus='))?.split('=')[1] || '2v2';
const humanBoss=process.argv.find(a=>a.startsWith('--human-boss='))?.split('=')[1];
const output=path.join(__dirname,`online-${mode}-${teams}-${versus}-${humanBoss||'late'}.log`);
fs.writeFileSync(output,`RUN ${new Date().toISOString()} ${mode}\n`);
const log=(...args)=>fs.appendFileSync(output,args.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ')+'\n');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
app.setPath('userData',path.join(app.getPath('temp'),`noname-${mode}-${Date.now()}`));
app.commandLine.appendSwitch('no-sandbox');
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const windows=[];
 const make=()=>{
  const w=new BrowserWindow({show:false,webPreferences:{partition:`test-${Math.random()}`,backgroundThrottling:false,nodeIntegration:true,contextIsolation:false,webSecurity:false,preload:path.join(__dirname,'online-modes-preload.cjs')}});
  windows.push(w);
  w.webContents.on('console-message',(_e,level,message)=>{if(level>=2)log('CONSOLE',message)});
  w.webContents.on('render-process-gone',(_e,info)=>log('RENDER_GONE',info));
  return w;
 };
 const run=(w,code)=>w.webContents.executeJavaScript(`(async()=>{const {lib,game,ui,get,_status}=await import('./noname.js');${code}})()`);
 const until=async(w,code,label,timeout=40000)=>{const end=Date.now()+timeout;while(Date.now()<end){try{if(await run(w,code))return;}catch{}await delay(500)}throw Error('Timeout '+label+' '+await run(w,`return JSON.stringify({text:document.body.innerText.slice(-900),phase:game.phaseNumber,event:_status.event?.name,error:_status.withError});`));};
 try{
  const host=make();await host.loadURL('http://127.0.0.1:8092/');
  await until(host,'return !!lib.config.mode;','initial load');
  await run(host,`await game.promises.saveConfig('new_tutorial',true);await game.promises.saveConfig('mode','connect');await game.promises.saveConfig('directstartmode',${JSON.stringify(mode)});await game.promises.saveConfig('connect_player_number','4','identity');await game.promises.saveConfig('connect_identity_mode','normal','identity');await game.promises.saveConfig('connect_versus_mode',${JSON.stringify(versus)},'versus');await game.promises.saveConfig('connect_team_mode',${JSON.stringify(teams)},${JSON.stringify(mode)});await game.promises.saveConfig('connect_doudizhu_mode','normal','doudizhu');await game.promises.saveConfig('connect_boss_character',${JSON.stringify(bossName)},'boss');await game.promises.saveConfig('connect_cards',['jiubian']);await game.promises.saveConfig('connect_double_character',false,${JSON.stringify(mode)});game.reload();`);
  await until(host,'return !!ui.connectStartButton && !!_status.waitingForPlayer;','lobby');
  log('LOBBY',await run(host,'return lib.configOL;'));
  assert.deepEqual(await run(host,`return ['identity','doudizhu','versus','boss'].filter(m=>!!lib.mode[m].connect);`),['identity','doudizhu','versus','boss']);
  let guest;
  async function connectGuest(beforeStart=false){
   guest=make();await guest.loadURL('http://127.0.0.1:8092/');
   await until(guest,'return !!lib.config.mode;','guest load');
   await run(guest,`await game.promises.saveConfig('new_tutorial',true);await game.promises.saveConfig('mode','connect');await game.promises.saveConfig('directstartmode');game.reload();`);
   await until(guest,'return !!ui.ipbutton;','guest connect UI');
   await run(guest,`game.connect('127.0.0.1:18080');`);
   await until(guest,beforeStart?'return !!_status.waitingForPlayer && !!game.onlineID;':'return !!game.me?.name && !!game.onlineID;','guest join');
  }
  if(teams==='free')await connectGuest(true);
  await run(host,'ui.connectStartButton.click();');
  if(teams==='free'){
   for(const [w,role] of [[host,humanBoss==='guest'?'fan':'zhu'],[guest,humanBoss==='guest'?'zhu':'fan']]){
    await until(w,`return _status.event?.name==='chooseButton' && _status.imchoosing && _status.event.dialog?.buttons.some(b=>b.link==='random');`,'manual team choice');
    if(w===host){await delay(200);fs.writeFileSync(path.join(__dirname,`online-${mode}-team-choice.png`),(await host.webContents.capturePage()).toPNG());}
    await run(w,`window.qaRoleChoices=_status.event.dialog.buttons.map(b=>b.link);const b=_status.event.dialog.buttons.find(b=>b.link===${JSON.stringify(role)});ui.click.button.call(b);if(ui.selected.buttons.length)ui.click.ok();`);
    log('ROLE_CHOICE_PASS',w===host?'host':'guest',role);
   }
  }
  await until(host,'return !!game.me?.playerid && !!lib.playerOL[game.me.playerid];','arena initialized');
  await run(host,'if(!_status.auto)ui.click.auto();');
  if(guest)await run(guest,'if(!_status.auto)ui.click.auto();');
  await until(host,'return game.phaseNumber>0 && game.players.every(p=>p.name);','start');
  await run(host,'game.pause();');
  const initial=await run(host,'return game.players.map(p=>({id:p.playerid,name:p.name,side:p.side,hp:p.hp}));');
  assert.equal(new Set(initial.map(p=>p.name)).size,initial.length);
  assert.equal(initial.length,mode==='doudizhu'?3:mode==='versus'&&versus==='1v1'?2:4);
  if(mode==='boss')assert.equal(initial.filter(p=>p.side).length,1);
  log('START_PASS',initial);
  if(!guest)await connectGuest();
  await until(guest,'return !!game.me?.name && !!game.onlineID;','takeover');
  const snapshot=()=>`return {id:game.me.playerid,name:game.me.name,hp:game.me.hp,side:game.me.side,identity:game.me.identity,cards:game.me.getCards('h').map(c=>c.cardid),boss:game.boss?.name};`;
  const gs=await run(guest,snapshot());
  const authoritative=()=>run(host,`const p=lib.playerOL[${JSON.stringify(gs.id)}];return {id:p.playerid,name:p.name,hp:p.hp,side:p.side,identity:p.identity,cards:p.getCards('h').map(c=>c.cardid),boss:game.boss?.name};`);
  const hs=await authoritative();
  assert.deepEqual(gs,hs);
  if(mode==='versus')for(const w of [host,guest])assert.equal(await run(w,`return game.players.every(p=>p.node.identity.firstChild.textContent===(p.side===game.me.side?'友':'敌'));`),true);
  if(teams==='free'){
   assert.equal(await run(host,'return game.me.identity;'),humanBoss==='guest'?'fan':'zhu');
   assert.equal(gs.identity,humanBoss==='guest'?'zhu':'fan');
   if(mode==='boss')assert.equal(await run(humanBoss==='guest'?guest:host,'return game.me===game.boss;'),true);
   if(mode==='identity')assert.equal(await run(guest,`return game.players.filter(p=>p!==game.me&&p!==game.zhu).every(p=>!p.identityShown&&p.node.identity.classList.contains('guessing'));`),true);
  }
  log('TAKEOVER_PASS',gs);
  await run(guest,`localStorage.setItem(lib.configprefix+'directstart',true);game.ws.onclose=null;game.ws.close();`);
  await until(host,`return lib.playerOL[${JSON.stringify(gs.id)}].ws.closed;`,'disconnect');
  await guest.reload();await until(guest,'return !!ui.ipbutton;','reconnect UI');
  await run(guest,`game.connect('127.0.0.1:18080',ok=>{if(ok)game.onlineID=lib.config.reconnect_info?.[1];});`);
  await until(guest,`return game.me?.playerid===${JSON.stringify(gs.id)} && !!game.me.name;`,'reconnect');
  // An in-flight draw may finish while the socket is disconnected; compare the
  // reconnect snapshot against current authority, never a stale pre-disconnect hand.
  const reconnected=await run(guest,snapshot());
  assert.equal(reconnected.id,hs.id);assert.equal(reconnected.name,hs.name);assert.equal(reconnected.side,hs.side);
  assert.deepEqual(reconnected,await authoritative());
  if(mode==='versus')assert.equal(await run(guest,`return game.players.every(p=>p.node.identity.firstChild.textContent===(p.side===game.me.side?'友':'敌'));`),true);
  log('RECONNECT_PASS');
  if(mode==='boss'){
   await run(host,`game.resume();game.boss.die();`);
   await until(host,'return !!_status.over;','host victory');
   await until(guest,'return !!_status.over;','guest victory');
   log('BOSS_VICTORY_PASS');
  }else if(mode==='versus'){
   await run(host,`game.resume();const enemy=game.players.filter(p=>p.side!==game.me.side);for(const p of enemy)p.die();`);
   await until(host,'return !!_status.over;','versus victory');
   await until(guest,'return !!_status.over;','remote versus result');
   log('VERSUS_VICTORY_PASS');
  }
  log('PASS');for(const w of windows)w.destroy();app.exit(0);
 }catch(e){log('FAIL',e.stack);app.exit(1);}
});
setTimeout(()=>{log('FAIL watchdog');app.exit(1)},180000).unref();
