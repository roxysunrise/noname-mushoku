// Runs real damage/card events in an isolated Electron profile, never the user's save.
const { app, BrowserWindow } = require('electron');
const path = require('node:path'), fs = require('node:fs'), assert = require('node:assert/strict');
const output = path.join(__dirname, 'boss-balance-smoke.log');
fs.writeFileSync(output, `RUN ${new Date().toISOString()}\n`);
const log = text => fs.appendFileSync(output, text + '\n');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
app.setPath('userData', path.join(app.getPath('temp'), 'noname-boss-balance-' + Date.now()));
app.commandLine.appendSwitch('no-sandbox');
app.on('window-all-closed', () => {});
app.whenReady().then(async () => {
 const windows = [];
 const run = (w, code) => w.webContents.executeJavaScript(`(async()=>{const {lib,game,ui,get,_status}=await import('./noname.js');${code}})()`);
 const until = async (w, code, label) => {
  const deadline = Date.now() + 40000;
  while (Date.now() < deadline) {
   if (await run(w, code).catch(() => false)) return;
   await delay(200);
  }
  throw Error('Timeout ' + label + ' ' + await run(w, `return JSON.stringify({event:_status.event?.name,error:_status.withError,text:document.body.innerText.slice(-500)});`));
 };
 try {
  for (const name of ['boss_alucard', 'boss_mt_roxy']) {
   const w = new BrowserWindow({ show: false, webPreferences: { partition: name + Date.now(), nodeIntegration: true, contextIsolation: false, webSecurity: false, preload: path.join(__dirname, 'online-modes-preload.cjs') } });
   windows.push(w);
   w.webContents.on('console-message', (_e, level, message) => { if (level >= 3) log('CONSOLE ' + message); });
   await w.loadURL('http://127.0.0.1:8092/');
   await until(w, 'return !!lib.config.mode;', 'load');
   await run(w, `await game.promises.saveConfig('new_tutorial',true);await game.promises.saveConfig('mode','connect');await game.promises.saveConfig('directstartmode','boss');await game.promises.saveConfig('connect_boss_character',${JSON.stringify(name)},'boss');game.reload();`);
   await until(w, 'return !!ui.connectStartButton && !!_status.waitingForPlayer;', 'lobby');
   await run(w, 'ui.connectStartButton.click();');
   await until(w, 'return !!game.me && !!ui.auto;', 'auto');
   await run(w, 'if(!_status.auto)ui.click.auto();');
   await until(w, 'return game.phaseNumber>0 && game.players.every(p=>p.name);', 'start');
   await run(w, 'game.pause();');
   const code = name === 'boss_alucard' ? `
    const p=game.boss,t=game.players.find(x=>x!==p);p.removeSkill('al_dualguns');
    p.hp=p.maxHp=1;p.hujia=0;p.storage.al_blood=2;delete p.storage.al_last_stand_used;
    const sha=new lib.element.VCard({name:'sha'});
    await p.damage(2,t,sha);checks.push(p.hp===1&&p.countMark('al_blood')===1);
    await p.damage(1,t,sha);checks.push(p.hp===1&&p.countMark('al_blood')===0);
    await p.damage(1,t,sha);checks.push(p.hp===1&&p.storage.al_last_stand_used&&p.countMark('al_blood')===1);
    await p.damage(2,t,new lib.element.VCard({name:'huogong'}));await p.loseHp();checks.push(p.hp===1);
    await t.discard(t.getCards('e'));const trick=new lib.element.VCard({name:'wuzhong'}),delay=new lib.element.VCard({name:'lebu'});
    checks.push(lib.filter.cardEnabled(trick,t)===false&&lib.filter.cardEnabled(delay,t)===false);
    checks.push(lib.filter.cardEnabled(trick,p)!==false);
    await t.equip(game.createCard('bagua'));checks.push(lib.filter.cardEnabled(trick,t)!==false);
    await t.discard(t.getCards('e'));checks.push(lib.filter.cardEnabled(trick,t)===false);
    t.hp=t.maxHp=10;t.hujia=0;
    p.storage.al_blood=0;p.removeSkill('al_king_fed');
    const use=p.useCard(sha,t,false);use.directHit=[t];await use;
    checks.push(p.countMark('al_blood')===1);
    const use2=p.useCard(sha,t,false);use2.directHit=[t];await use2;checks.push(p.countMark('al_blood')===1);
    game.roundNumber=2;checks.push(!lib.skill.al_river.filter({},p));game.roundNumber=3;checks.push(lib.skill.al_river.filter({},p));
    p.removeSkill('al_night');checks.push(lib.filter.cardEnabled(trick,t)!==false);
   ` : `
    const p=game.boss,t=game.players.find(x=>x!==p);p.hp=p.maxHp=10;p.hujia=0;p.storage.mt_boss_mana=4;
    p.removeSkill('mt_boss_shield_used');delete p.storage.mt_boss_resolved;delete p.storage.mt_boss_chant;
    await p.damage(3,t);checks.push(p.hp===8&&p.countMark('mt_boss_mana')===2);
    await p.damage(2,t);checks.push(p.hp===6&&p.countMark('mt_boss_mana')===2);
    await p.damage(1,t);checks.push(p.hp===7&&p.storage.mt_boss_resolved&&p.countMark('mt_boss_mana')===4);
    p.storage.mt_boss_chant={damage:0};await p.damage(3,t);checks.push(p.storage.mt_boss_chant?.damage===3);
    await p.damage(1,t);checks.push(!p.storage.mt_boss_chant&&p.countMark('mt_boss_mana')===5);
   `;
   await run(w, `window.qaDone=false;window.qaResult=null;const next=game.createEvent('bossBalanceQA',false);next.player=game.boss;next.setContent(async()=>{const checks=[];try{${code}window.qaResult={checks};}catch(error){window.qaResult={error:error.stack};}window.qaDone=true;game.pause();});game.resume();`);
   await until(w, 'return window.qaDone;', 'skill checks');
   const result = await run(w, 'return window.qaResult;');
   log(name + ' ' + JSON.stringify(result));
   assert.ok(!result.error, result.error);
   assert.ok(result.checks.length > 0 && result.checks.every(Boolean), JSON.stringify(result));
   w.destroy();
   await delay(500);
  }
  log('PASS');app.exit(0);
 } catch (error) { log('FAIL ' + error.stack);for (const w of windows) if (!w.isDestroyed()) w.destroy();app.exit(1); }
});
setTimeout(() => { log('FAIL watchdog');app.exit(1); }, 150000).unref();
