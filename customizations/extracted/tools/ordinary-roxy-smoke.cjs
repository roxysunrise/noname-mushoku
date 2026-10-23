// Exercises ordinary Roxy's mana and chant through the real engine in an isolated profile.
const { app, BrowserWindow } = require('electron');
const path = require('node:path'), fs = require('node:fs');
const output = path.join(__dirname, 'ordinary-roxy-smoke.log');
fs.writeFileSync(output, `RUN ${new Date().toISOString()}\n`);
const log = text => fs.appendFileSync(output, text + '\n');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
app.setPath('userData', path.join(app.getPath('temp'), 'noname-ordinary-roxy-' + Date.now()));
app.commandLine.appendSwitch('no-sandbox');
app.on('window-all-closed', () => {});
app.whenReady().then(async () => {
 const windows = [];
 const run = (w, code) => w.webContents.executeJavaScript(`(async()=>{const {lib,game,ui,_status}=await import('./noname.js');${code}})()`);
 const until = async (w, code, label) => {
  const deadline = Date.now() + 40000;
  while (Date.now() < deadline) { if (await run(w, code).catch(() => false)) return; await delay(200); }
  throw Error('Timeout ' + label + ' ' + await run(w, `return JSON.stringify({event:_status.event?.name,error:_status.withError,text:document.body.innerText.slice(-500)});`));
 };
 try {
  const name = 'boss_alucard';
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
  await run(w, `window.qaDone=false;window.qaResult=null;const next=game.createEvent('tankAlucardQA',false);next.player=game.boss;next.setContent(async()=>{const checks=[];try{
   const boss=game.boss,p=game.players.find(x=>x!==boss),other=game.players.find(x=>x!==boss&&x!==p);
   for(const x of game.players){x.removeSkill(x.getSkills());x.hp=x.maxHp=20;x.hujia=0;await x.discard(x.getCards('he'));}
   const check=(name,pass)=>checks.push({name,pass,error:_status.withError});
   p.init('mt_roxy');p.hp=p.maxHp=20;
   check('new Roxy registry and initial mana',p.countMark('mt_roxy_mana')===2&&p.hasSkill('mt_roxy_spirit')&&!p.hasSkill('mt_study'));
   await lib.skill.mt_roxy_mana.content({}, {},p);
   await lib.skill.mt_roxy_mana.content({}, {},p);
   check('round mana capped at six',p.countMark('mt_roxy_mana')===6);
   const cards=p.countCards('h');await lib.skill.mt_roxy_mana.subSkill.trick.content({}, {},p);
   check('trick draws even at cap',p.countMark('mt_roxy_mana')===6&&p.countCards('h')===cards+1);
   const hp=boss.hp;await lib.skill.mt_roxy_water.content({target:boss},{},p);
   check('water deals two to empty hand and costs mana',boss.hp===hp-2&&p.countMark('mt_roxy_mana')===5&&!lib.skill.mt_roxy_water.filterTarget({},p,boss));
   p.hp=19;await lib.skill.mt_roxy_spirit.content({}, {},p);
   check('spirit heals and spends two mana',p.hp===20&&p.countMark('mt_roxy_mana')===3);
   p.addMark('mt_roxy_mana',1);await lib.skill.mt_roxy_rain.content({}, {},p);
   check('limited rain creates independently active chant',p.awakenedSkills.includes('mt_roxy_rain')&&p.hasSkill('mt_roxy_chant')&&p.countMark('mt_roxy_mana')===0);
   await p.damage(1,boss);check('one actual damage retains chant',p.storage.mt_roxy_chant?.damage===1);
   const before=p.countCards('h');await p.damage(1,boss);
   check('two cumulative damage interrupts and draws two',!p.hasSkill('mt_roxy_chant')&&!p.storage.mt_roxy_chant&&p.countCards('h')===before+2);
   other.init('mt_roxy');other.hp=other.maxHp=20;other.addMark('mt_roxy_mana',2);
   await lib.skill.mt_roxy_rain.content({}, {},other);
   const baseline=new Map(game.players.map(x=>[x,x.hp]));
   const turn=game.createEvent('qaNextTurn',false);turn.player=other;turn.setContent(async(event)=>{await event.trigger('phaseBegin');});await turn;
   check('next own turn releases one thunder damage to all others',game.players.every(x=>x.hp===baseline.get(x)-(x===other?0:1))&&!other.storage.mt_roxy_chant&&!other.hasSkill('mt_roxy_chant'));
   window.qaResult={checks};
  }catch(error){window.qaResult={error:error.stack,checks};}window.qaDone=true;game.pause();});game.resume();`);
  await until(w, 'return window.qaDone;', 'skill checks');
  const result = await run(w, 'return window.qaResult;');
  log(JSON.stringify(result));
  if (result.error || result.checks.length!==9 || result.checks.some(x => !x.pass || x.error)) throw Error(JSON.stringify(result));
  log('PASS'); app.exit(0);
 } catch (error) { log('FAIL ' + error.stack); for (const w of windows) if (!w.isDestroyed()) w.destroy(); app.exit(1); }
});
setTimeout(() => { log('FAIL watchdog'); app.exit(1); }, 150000).unref();
