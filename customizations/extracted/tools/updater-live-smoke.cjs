const { app, BrowserWindow, net } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const output = path.resolve(__dirname, '../output/updater-qa');
const dataRoot = path.join(app.getPath('temp'), 'noname-live-update-' + Date.now());
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(dataRoot, { recursive: true });
app.setPath('userData', path.join(dataRoot, 'profile'));
app.whenReady().then(async () => {
  try {
    const root = path.resolve(__dirname, '../game/resources/app');
    const { installUpdater } = await import(pathToFileURL(path.join(root, 'updater/electron.mjs')));
    const { fetchManifest, downloadPackage } = await import(pathToFileURL(path.join(root, 'updater/core.mjs')));
    const config = JSON.parse(fs.readFileSync(path.join(root, 'updater/config.json')));
    const local = JSON.parse(fs.readFileSync(path.join(root, 'updater/version.json')));
    installUpdater({ dataRoot, appRoot: root, getGameUrl: () => 'http://127.0.0.1:8097/index.html' });
    const win = new BrowserWindow({ show: false, width: 1440, height: 810, webPreferences: { nodeIntegration: true, contextIsolation: false, sandbox: false } });
    await win.loadURL('http://127.0.0.1:8097/updater/launcher.html');
    let status;
    for (let i = 0; i < 200; i++) {
      status = await win.webContents.executeJavaScript("document.querySelector('#status').textContent");
      if (status.includes('最新版本')) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.match(status, /最新版本/);
    fs.writeFileSync(path.join(output, 'live-launcher.png'), (await win.webContents.capturePage()).toPNG());
    const manifest = await fetchManifest(config.manifestUrl, { fetcher: net.fetch });
    assert.equal(manifest.version, local.version);
    let progress;
    const destination = path.join(dataRoot, 'live-update.zip');
    await downloadPackage(manifest.windows, destination, { fetcher: net.fetch, onProgress: value => { progress = value; } });
    assert.equal(fs.statSync(destination).size, manifest.windows.bytes);
    assert.equal(progress.percent, 100);
    const result = { success: true, manifestUrl: config.manifestUrl, version: manifest.version, bytes: manifest.windows.bytes, sha256: manifest.windows.sha256, checks: ['actual Electron launcher startup cloud check', 'anonymous Electron net.fetch manifest', 'full public package download and SHA256'], time: new Date().toISOString() };
    fs.writeFileSync(path.join(output, 'live-result.json'), JSON.stringify(result, null, 2));
    fs.unlinkSync(destination);
    console.log(JSON.stringify(result));
    app.exit(0);
  } catch (error) {
    fs.writeFileSync(path.join(output, 'live-failure.txt'), error.stack);
    console.error(error);
    app.exit(1);
  }
});
