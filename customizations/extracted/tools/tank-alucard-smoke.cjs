// Reproduces Alucard Sha damage against Tank in an isolated Electron profile.
const { app, BrowserWindow } = require('electron');
const path = require('node:path'), fs = require('node:fs');
const output = path.join(__dirname, 'tank-alucard-smoke.log');
fs.writeFileSync(output, `RUN ${new Date().toISOString()}\n`);
const log = text => fs.appendFileSync(output, text + '\n');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
app.setPath('userData', path.join(app.getPath('temp'), 'noname-tank-alucard-' + Date.now()));
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
   const boss=game.boss,tank=game.players.find(x=>x!==boss);
   for(const x of game.players){x.removeSkill(x.getSkills());x.hp=x.maxHp=12;x.hujia=0;}
   tank.addSkill(['ac_armor','ac_immunity']);
   const check=(name,pass)=>checks.push({name,pass,error:_status.withError});
   await tank.damage(1,boss,new lib.element.VCard({name:'sha'}));check('one Sha damage reduced to zero',tank.hp===12&&tank.maxHp===12);
   await tank.damage(2,boss,new lib.element.VCard({name:'sha'}));check('card damage does not reduce max HP',tank.hp===11&&tank.maxHp===12);
   lib.skill.qa_foreign_effect={charlotte:true};
   const nested=game.createEvent('useCard',false);nested.player=boss;
   nested.setContent(async()=>{const effect=game.createEvent('qa_foreign_effect');effect.player=boss;effect.setContent(async()=>{await tank.damage(2,boss);await tank.loseHp(2);await tank.loseMaxHp(2);});await effect;});await nested;
   check('foreign skill effects within card resolution are immune',tank.hp===11&&tank.maxHp===12);
   const thunder=game.createEvent('qa_foreign_effect',false);thunder.player=boss;thunder.setContent(async()=>{await tank.damage(1,boss,'thunder');});await thunder;
   check('thunder bypasses immunity and gains one damage',tank.hp===9&&tank.maxHp===12);
   await lib.skill.al_river.content({}, {},boss);
   const sha=new lib.element.VCard({name:'sha'});
   check('river blocks target selection',!lib.filter.targetEnabled(sha,tank,boss)&&!lib.filter.targetEnabled2(sha,tank,boss));
   check('river expires at next Boss turn',boss.tempSkills.al_river_turn?.player==='phaseBegin');
   boss.removeSkill('al_river_turn');check('target selectable after protection expires',lib.filter.targetEnabled(sha,tank,boss));
   window.qaResult={checks};
  }catch(error){window.qaResult={error:error.stack,checks};}window.qaDone=true;game.pause();});game.resume();`);
  await until(w, 'return window.qaDone;', 'skill checks');
  const result = await run(w, 'return window.qaResult;');
  log(JSON.stringify(result));
  if (result.error || result.checks.length!==7 || result.checks.some(x => !x.pass || x.error)) throw Error(JSON.stringify(result));
  log('PASS'); app.exit(0);
 } catch (error) { log('FAIL ' + error.stack); for (const w of windows) if (!w.isDestroyed()) w.destroy(); app.exit(1); }
});
setTimeout(() => { log('FAIL watchdog'); app.exit(1); }, 150000).unref();
