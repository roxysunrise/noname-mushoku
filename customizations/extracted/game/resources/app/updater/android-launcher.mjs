const $ = id => document.getElementById(id);
const bridge = window.NonameUpdater;
$('enter').onclick = () => bridge?.enter();
$('check').onclick = () => { $('status').textContent = '正在检查更新…'; $('progress').classList.add('busy'); bridge?.check(); };
$('logs').onclick = () => bridge?.logs();
fetch('version.json', { cache: 'no-store' }).then(response => response.json()).then(version => {
  $('version').textContent = `当前版本 ${version.version}`;
}).catch(() => { $('version').textContent = 'Android'; });
setTimeout(() => bridge?.check(), 400);
