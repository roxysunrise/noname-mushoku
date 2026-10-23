// Real engine checks in a hidden window with an isolated save profile.
const { app, BrowserWindow } = require('electron');
const path = require('node:path'), fs = require('node:fs'), assert = require('node:assert/strict');
const output = path.join(__dirname, 'new-roster-smoke.log');
fs.writeFileSync(output, `RUN ${new Date().toISOString()}\n`);
const log = message => fs.appendFileSync(output, message + '\n');
app.setPath('userData', path.join(app.getPath('temp'), 'noname-new-roster-' + Date.now()));
app.commandLine.appendSwitch('no-sandbox');
app.whenReady().then(async () => {
 const w = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true, contextIsolation: false, webSecurity: false, preload: path.join(__dirname, 'online-modes-preload.cjs') } });
 const run = code => w.webContents.executeJavaScript(`(async()=>{const {lib,game,ui,get,_status}=await import('./noname.js');${code}})()`);
 const until = async code => { for (let i=0;i<240;i++) { if(await run(code).catch(()=>false))return; await new Promise(r=>setTimeout(r,200)); } throw Error('Timeout '+code); };
 w.webContents.on('console-message', (_e, level, message) => { if(level>=3)log('CONSOLE '+message); });
 try {
  await w.loadURL('http://127.0.0.1:8092/');await until('return !!ui.arena;');
  await run(`await game.promises.saveConfig('new_tutorial',true);await game.promises.saveConfig('mode','connect');await game.promises.saveConfig('directstartmode','boss');await game.promises.saveConfig('connect_boss_character','boss_johan','boss');game.reload();`);
  await until('return !!ui.connectStartButton && !!_status.waitingForPlayer;');await run('ui.connectStartButton.click();');
  await until('return !!game.me && !!ui.auto;');await run('if(!_status.auto)ui.click.auto();');
  await until('return game.phaseNumber>0 && game.players.every(p=>p.name);');await run('game.pause();');
  await run(`window.qaDone=false;const next=game.createEvent('newRosterQA',false);next.player=game.boss;next.setContent(async()=>{const checks=[];try{
   const boss=game.boss,t=game.players.find(p=>p!==boss);checks.push(boss.name==='boss_johan');
   checks.push(!!lib.skill.jh_terror_aura&&lib.group.includes('qun'));
   boss.hp=boss.maxHp=8;boss.hujia=0;
   await lib.skill.jh_crime.content({target:t},{},boss);
   await boss.damage(1,t);checks.push(boss.hp===8&&!boss.hasSkill('jh_crime_guard'));
   await boss.damage(1,t);checks.push(boss.hp===7);
   await boss.damage(1,game.players.find(p=>p!==boss&&p!==t));checks.push(boss.hp===6);
   boss.addSkill('jh_terror');checks.push(lib.skill.jh_terror_aura.mod.maxHandcard(t,4)===3);
   for(const p of game.players)p.removeSkill(p.getSkills());
   t.init('ac_tank');t.hp=t.maxHp=3;t.hujia=0;
   await t.damage(1,boss,new lib.element.VCard({name:'sha'}));checks.push(t.hp===3&&t.maxHp===3);
   await t.damage(2,boss,new lib.element.VCard({name:'sha'}));window.qaTank={hp:t.hp,maxHp:t.maxHp};checks.push(t.hp===2&&t.maxHp===2);
   t.hp=1;await t.recover(1);checks.push(t.hp===1);
   t.init('ac_fighter');checks.push(t.countMark('ac_mount')===5);
   t.init('ac_okabe');t.hp=0;
   await lib.skill.ac_worldline.content({}, {},t);checks.push(t.hp===2&&t.storage.ac_worldline_turns===2&&t.getCards('h').length>=3);
   checks.push(t.disabledSkills.ac_mail?.includes('ac_worldline')&&t.disabledSkills.ac_mail_replace?.includes('ac_worldline'));
   t.init('ac_alucard');t.hp=t.maxHp=4;t.hujia=0;
   await t.damage(4,boss,new lib.element.VCard({name:'sha'}));checks.push(t.hp===4&&t.countMark('ac_life')===1);
   await lib.skill.ac_river.content({}, {},t);checks.push(t.countMark('ac_life')===0&&t.storage.ac_river_bonus===1);
   boss.hp=boss.maxHp=10;boss.hujia=0;await boss.discard(boss.getCards('h'));t.hp=1;
   const attack=t.useCard(new lib.element.VCard({name:'sha'}),boss,false);await attack;
   checks.push(boss.maxHp===9&&boss.hp===8);
   window.qaResult={checks,tank:window.qaTank};
  }catch(error){window.qaResult={checks,error:error.stack};}window.qaDone=true;game.pause();});game.resume();`);
  await until('return window.qaDone;');const result=await run('return window.qaResult;');log(JSON.stringify(result));
  assert.ok(!result.error,result.error);assert.ok(result.checks.length>=10&&result.checks.every(Boolean),JSON.stringify(result));
  log('PASS');w.destroy();app.exit(0);
 }catch(error){log('FAIL '+error.stack);w.destroy();app.exit(1);}
});
setTimeout(()=>{log('FAIL watchdog');app.exit(2);},120000).unref();
