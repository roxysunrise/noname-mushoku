const { app, BrowserWindow } = require('electron');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const output = path.join(__dirname, 'online-avatar.log');
fs.writeFileSync(output, `RUN ${new Date().toISOString()}\n`);
const log = (...args) => fs.appendFileSync(output, args.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ') + '\n');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
app.setPath('userData', path.join(app.getPath('temp'), `noname-avatar-${Date.now()}`));
app.commandLine.appendSwitch('no-sandbox');
app.on('window-all-closed', () => {});
app.whenReady().then(async () => {
 const window = new BrowserWindow({ show: false, width: 1100, height: 760, webPreferences: { offscreen: true, backgroundThrottling: false, nodeIntegration: true, contextIsolation: false, webSecurity: false, preload: path.join(__dirname, 'online-modes-preload.cjs') } });
 const run = code => window.webContents.executeJavaScript(`(async()=>{const {lib,game,ui,get,_status}=await import('./noname.js');${code}})()`);
 const until = async (code, label) => { const end = Date.now() + 30000; while (Date.now() < end) { try { if (await run(code)) return; } catch {} await delay(150); } throw Error('Timeout ' + label); };
 async function click(selector) {
  const point = await run(`const n=document.querySelector(${JSON.stringify(selector)});n.scrollIntoView({block:'center'});const r=n.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;if(!n.contains(document.elementFromPoint(x,y)))throw Error('Blocked '+${JSON.stringify(selector)});return {x:Math.round(x),y:Math.round(y)};`);
  window.webContents.sendInputEvent({ type: 'mouseDown', ...point, button: 'left', clickCount: 1 });
  window.webContents.sendInputEvent({ type: 'mouseUp', ...point, button: 'left', clickCount: 1 });
 }
 try {
  await window.loadURL('http://127.0.0.1:8092/');
  await until('return !!ui.openConnectAvatarPicker;', 'load');
  await run(`await game.promises.saveConfig('new_tutorial',true);ui.openConnectAvatarPicker();`);
  await until(`return document.querySelectorAll('[data-connect-avatar]').length===19;`, 'cards');
  assert.equal(await run(`const imgs=[...document.querySelectorAll('.accessibility-avatar-card img')];await Promise.all(imgs.map(i=>i.decode()));return imgs.every(i=>i.naturalWidth>0);`), true);
  log('ALL_19_PORTRAITS_PASS');
  await run(`[...document.querySelectorAll('.accessibility-avatar-tabs button')].find(n=>n.textContent==='AI').click();`);
  assert.equal(await run(`return [...document.querySelectorAll('[data-connect-avatar]')].filter(n=>!n.hidden).length;`), 5);
  await delay(300);
  fs.writeFileSync(path.join(__dirname, 'online-avatar-desktop.png'), (await window.webContents.capturePage()).toPNG());
  await click('[data-connect-avatar="ac_chatgpt"]');
  await until(`return lib.config.connect_avatar==='ac_chatgpt'&&!document.querySelector('.accessibility-overlay');`, 'save GPT');
  await window.reload();await until('return !!ui.openConnectAvatarPicker;', 'reload');
  assert.equal(await run(`return lib.config.connect_avatar;`), 'ac_chatgpt');
  log('DESKTOP_CLICK_PERSIST_PASS');
  // Exercise the actual settings-row constructor instead of opening only the helper.
  await run(`const {createConfig}=await import('./noname/ui/create/menu/index.js');window.qaAvatarRow=createConfig({...lib.mode.connect.config.connect_avatar,init:lib.config.connect_avatar});window.qaAvatarRow.style.cssText='position:fixed;left:20px;top:70px;width:300px;height:50px;z-index:90000';document.documentElement.append(window.qaAvatarRow);`);
  assert.equal(await run(`return document.querySelector('[data-edit-connect-avatar]').contentEditable;`), 'false');
  await click('[data-edit-connect-avatar]');await until(`return !!document.querySelector('.accessibility-avatar-grid');`, 'settings-row picker');
  log('SETTINGS_ROW_PICKER_PASS');
  await click('.accessibility-close');
  assert.equal(await run('return lib.config.connect_avatar;'), 'ac_chatgpt');
  await run(`document.querySelector('[data-edit-connect-avatar]').focus();`);
  window.webContents.sendInputEvent({type:'keyDown',keyCode:'Return'});
  window.webContents.sendInputEvent({type:'keyUp',keyCode:'Return'});
  await until(`return !!document.querySelector('.accessibility-avatar-grid');`, 'keyboard picker');
  log('CANCEL_AND_KEYBOARD_PASS');
  window.setContentSize(844, 390);
  await run(`const input=document.querySelector('input[aria-label="搜索联机头像角色名称"]');input.value='洛琪希';input.dispatchEvent(new Event('input'));`);
  assert.equal(await run(`return [...document.querySelectorAll('[data-connect-avatar]')].filter(n=>!n.hidden).length;`), 1);
  await delay(300);
  fs.writeFileSync(path.join(__dirname, 'online-avatar-mobile.png'), (await window.webContents.capturePage()).toPNG());
  await click('[data-connect-avatar="mt_roxy"]');
  await until(`return lib.config.connect_avatar==='mt_roxy'&&!document.querySelector('.accessibility-overlay');`, 'mobile save');
  assert.equal(await run(`return document.querySelector('[data-edit-connect-avatar]').textContent;`), '洛琪希');
  await window.reload();await until('return !!ui.openConnectAvatarPicker;', 'second reload');
  assert.equal(await run(`return lib.config.connect_avatar;`), 'mt_roxy');
  log('MOBILE_CLICK_SEARCH_PERSIST_PASS');
  await run(`await game.promises.saveConfig('mode','connect');await game.promises.saveConfig('directstartmode','versus');await game.promises.saveConfig('connect_versus_mode','1v1','versus');game.reload();`);
  await until('return !!ui.connectStartButton;', 'lobby');
  assert.equal(await run(`return game.connectPlayers[0].avatar;`), 'mt_roxy');
  log('LOBBY_AVATAR_PASS');log('PASS');window.destroy();app.exit(0);
 } catch (error) { log('FAIL', error.stack); app.exit(1); }
});
setTimeout(() => { log('FAIL watchdog'); app.exit(1); }, 150000).unref();
