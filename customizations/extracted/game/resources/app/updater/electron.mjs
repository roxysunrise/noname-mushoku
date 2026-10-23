import { ipcMain, net, dialog, app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fetchManifest, validateUrl, downloadPackage, updateStatus } from './core.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));

export function installUpdater({ dataRoot, appRoot, getGameUrl, fetcher = net.fetch }) {
  const local = readJson(path.join(directory, 'version.json'));
  const defaults = readJson(path.join(directory, 'config.json'));
  const settingsPath = path.join(dataRoot, 'updater-settings.json');
  const work = path.join(dataRoot, 'Updates');
  let latest = null;
  let active = null;
  let ready = null;
  let owner = null;
  function settings() {
    try { return { ...defaults, ...readJson(settingsPath) }; } catch { return defaults; }
  }
  const isLauncher = sender => {
    try { const url = new URL(sender.getURL()); return ['127.0.0.1', 'localhost'].includes(url.hostname) && url.pathname === '/updater/launcher.html' && url.origin === new URL(getGameUrl()).origin; } catch { return false; }
  };
  ipcMain.handle('noname:update', async (event, action, value) => {
    if (!isLauncher(event.sender)) throw Error('请从启动页操作更新');
    switch (action) {
      case 'info': return { local, settings: settings(), platform: process.platform, installResult: fs.existsSync(path.join(work, 'result.json')) ? readJson(path.join(work, 'result.json')) : null };
      case 'save': {
        if (active) throw Error('请先取消下载');
        const url = String(value || '').trim();
        if (url) validateUrl(url);
        fs.mkdirSync(dataRoot, { recursive: true });
        fs.writeFileSync(settingsPath, JSON.stringify({ manifestUrl: url }, null, 2));
        latest = ready = null;
        return settings();
      }
      case 'check': {
        if (active) throw Error('正在下载');
        const config = settings();
        latest = null; ready = null;
        if (!config.manifestUrl) return { status: 'unconfigured' };
        latest = await fetchManifest(config.manifestUrl, { timeout: config.checkTimeoutMs, fetcher });
        return { status: updateStatus(latest, local), latest };
      }
      case 'download': {
        if (process.platform !== 'win32') throw Error('此更新包适用于 Windows 桌面版');
        if (!latest || updateStatus(latest, local) !== 'available') throw Error('只允许安装比本地更新的版本，请先检查可用更新');
        if (active) throw Error('正在下载');
        ready = null;
        active = new AbortController();
        owner = event.sender;
        const manifest = latest;
        const destination = path.join(work, 'update.zip');
        try {
          await downloadPackage(manifest.windows, destination, { fetcher, signal: active.signal, onProgress: progress => {
            if (!event.sender.isDestroyed()) event.sender.send('noname:update-progress', progress);
          } });
          ready = { manifest, destination };
          return { status: 'ready' };
        } finally { active = null; owner = null; }
      }
      case 'cancel': active?.abort(); return true;
      case 'enter':
        if (active) throw Error('请先取消下载再进入游戏');
        await event.sender.loadURL(getGameUrl()); return true;
      case 'install': {
        if (!ready || active) throw Error('请先下载并校验更新');
        if (updateStatus(ready.manifest, readJson(path.join(directory, 'version.json'))) !== 'available') throw Error('本地版本已变化，禁止安装旧版本，请重新检查');
        // Keep the running helper outside the app tree that it replaces.
        fs.mkdirSync(work, { recursive: true });
        const helper = path.join(work, 'install.ps1');
        fs.copyFileSync(path.join(directory, 'install.ps1'), helper);
        fs.writeFileSync(path.join(work, 'job.json'), JSON.stringify({ pid: process.pid, appRoot, executable: process.execPath, archive: ready.destination, sha256: ready.manifest.windows.sha256, version: ready.manifest.version }));
        const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', helper, '-JobFile', path.join(work, 'job.json')], { detached: true, windowsHide: true, stdio: 'ignore' });
        await new Promise((resolve, reject) => { child.once('spawn', resolve); child.once('error', reject); });
        child.unref();
        app.quit();
        return true;
      }
      default: throw Error('未知更新操作');
    }
  });
  app.on('web-contents-created', (_event, contents) => contents.once('destroyed', () => { if (owner === contents) active?.abort(); }));
  app.on('before-quit', () => active?.abort());
  return { showLogs: win => dialog.showMessageBox(win, { title: `更新日志 ${local.version}`, message: local.title, detail: local.notes.join('\n'), buttons: ['关闭'] }) };
}
