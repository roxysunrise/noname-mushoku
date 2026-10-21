const $ = id => document.getElementById(id);
const ipc = typeof require === 'function' ? require('electron').ipcRenderer : null;
const call = (action, value) => ipc ? ipc.invoke('noname:update', action, value) : previewCall(action, value);
const state = { local: null, latest: null, busy: false, checking: false, ready: false, config: {} };
const bytes = n => !Number.isFinite(n) ? '—' : n < 1024 ? `${Math.round(n)} B` : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : n < 1073741824 ? `${(n/1048576).toFixed(1)} MB` : `${(n/1073741824).toFixed(2)} GB`;
const time = n => !Number.isFinite(n) ? '—' : n < 60 ? `${Math.ceil(n)} 秒` : `${Math.floor(n/60)} 分 ${Math.ceil(n%60)} 秒`;
function status(text) { $('status').textContent = text; }
function buttons() {
  for (const id of ['check', 'settings', 'enter']) $(id).disabled = state.busy || state.checking;
  $('cancel').hidden = !state.busy;
  $('install').hidden = !state.ready;
  $('enter').hidden = state.ready;
  $('progress').classList.toggle('busy', state.checking);
  if (state.checking) $('progress').removeAttribute('aria-valuenow');
}
function progress(p) {
  $('fill').style.width = `${Math.min(100, p.percent)}%`;
  $('progress').setAttribute('aria-valuenow', Math.floor(p.percent));
  $('percent').textContent = `${p.percent.toFixed(1)}%`;
  $('speed').textContent = `下载速度 ${bytes(p.speed)}/s`;
  $('amount').textContent = `已下载 ${bytes(p.received)} / ${bytes(p.total)}`;
  $('remaining').textContent = `剩余 ${bytes(p.remaining)}`;
  $('eta').textContent = `预计用时 ${time(p.eta)}`;
}
ipc?.on('noname:update-progress', (_event, p) => progress(p));
function notes(data, update = false) {
  $('notice-title').textContent = update ? '发现新版本' : '更新日志';
  $('notice-meta').textContent = `${data.version}　${data.title || ''}${update ? `　${bytes(data.windows.bytes)}` : ''}`;
  $('notes').replaceChildren(...data.notes.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  $('update-actions').hidden = !update;
  $('notice').showModal();
}
async function check() {
  if (state.busy || state.checking) return;
  state.ready = false; state.latest = null; state.checking = true; buttons();
  status('正在检查云端版本…');
  try {
    const result = await call('check');
    if (result.status === 'unconfigured') status('尚未配置更新源，可以直接进入游戏');
    if (result.status === 'current') { status('已是最新版本，整装待发'); $('percent').textContent = '已就绪'; }
    if (result.status === 'incompatible') status('此更新需要新的基础客户端，请联系发布者获取完整安装包');
    if (result.status === 'available') { state.latest = result.latest; status(`发现版本 ${result.latest.version}，等待确认更新`); notes(result.latest, true); }
  } catch (error) { status(`无法检查更新，可以进入游戏或重试。${error.message}`); }
  finally { state.checking = false; buttons(); }
}
$('check').onclick = check;
$('logs').onclick = () => { if (state.local) notes(state.latest || state.local); };
$('close').onclick = $('later').onclick = () => $('notice').close();
$('settings').onclick = () => { $('source').value = state.config.manifestUrl || ''; $('source-error').textContent = ''; $('source-dialog').showModal(); };
$('source-cancel').onclick = () => $('source-dialog').close();
$('source-form').onsubmit = async event => {
  event.preventDefault();
  try { state.config = await call('save', $('source').value.trim()); $('source-dialog').close(); await check(); }
  catch (error) { $('source-error').textContent = error.message; }
};
$('download').onclick = async () => {
  $('notice').close(); state.busy = true; buttons(); status('正在下载更新资源…');
  try { await call('download'); state.ready = true; status('下载与校验完成，重启后安装更新'); $('speed').textContent = '校验通过'; $('eta').textContent = '等待重启安装'; }
  catch (error) { status(error.message.includes('abort') || error.message.includes('取消') ? '下载已取消，可以重试或进入游戏' : `下载未完成，可重新检查后重试。${error.message}`); $('speed').textContent = '下载已停止'; }
  finally { state.busy = false; buttons(); }
};
$('cancel').onclick = () => call('cancel').catch(error => status(error.message));
$('install').onclick = async () => { $('install').disabled = true; status('正在准备安装，游戏即将重启…'); try { await call('install'); } catch (error) { status(error.message); $('install').disabled = false; } };
$('enter').onclick = async () => { status('正在进入游戏…'); try { await call('enter'); } catch (error) { status(error.message); } };

// Browser preview has the same layout. Installation is handled only by the desktop process.
async function previewCall(action, value) {
  if (action === 'info') return { local: await (await fetch('version.json')).json(), settings: await (await fetch('config.json')).json(), platform: 'browser' };
  if (action === 'check') return { status: 'unconfigured' };
  if (action === 'enter') { location.href = '../index.html'; return; }
  if (action === 'save') throw Error('请在桌面客户端中保存更新设置');
  throw Error('下载和安装请使用桌面客户端');
}
try {
  const info = await call('info'); state.local = info.local; state.config = info.settings;
  $('version').textContent = `当前版本 ${info.local.version}`;
  if (info.installResult?.success === false) {
    status(info.installResult.rollbackErrors?.length ? '上次安装失败，恢复未完成，请保留 Updates 目录并联系发布者' : '上次安装失败，已恢复原版本；可重试更新');
  } else await check();
} catch (error) { status(`读取更新信息失败：${error.message}`); }
// Exposed only for isolated UI verification; it never starts a download or install.
if (new URLSearchParams(location.search).get('preview') === '1' && !ipc) {
  window.updatePreview = { progress, notes, state, status };
}
