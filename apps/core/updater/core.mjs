import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export function validateUrl(value, { allowLocal = false } = {}) {
  const url = new URL(value);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(allowLocal && local && url.protocol === 'http:')) throw Error('更新地址必须使用 HTTPS');
  if (url.username || url.password || /(^|\.)(github\.com|githubusercontent\.com|github\.io)$/i.test(url.hostname)) throw Error('请使用独立更新源地址');
  return url.href;
}

export function validateManifest(data, options = {}) {
  if (!data || data.schema !== 1 || !/^[\w.+-]{1,80}$/.test(data.version || '')) throw Error('更新清单格式不正确');
  if (typeof data.baseVersion !== 'string' || !data.baseVersion) throw Error('更新清单缺少基础版本');
  if (!Array.isArray(data.notes) || !data.notes.every(x => typeof x === 'string')) throw Error('更新日志格式不正确');
  const pkg = data.windows;
  if (!pkg || !Number.isSafeInteger(pkg.bytes) || pkg.bytes <= 0 || !/^[a-f0-9]{64}$/i.test(pkg.sha256 || '')) throw Error('更新包大小或校验值不正确');
  validateUrl(pkg.url, options);
  return data;
}

export async function fetchManifest(url, { timeout = 8000, fetcher = fetch, allowLocal = false } = {}) {
  validateUrl(url, { allowLocal });
  const response = await fetcher(url, { signal: AbortSignal.timeout(timeout), cache: 'no-store', redirect: 'error' });
  if (!response.ok) throw Error(`检查更新失败（HTTP ${response.status}）`);
  return validateManifest(await response.json(), { allowLocal });
}

export function formatBytes(value) {
  if (!Number.isFinite(value) || value < 0) return '—';
  if (value < 1024) return `${Math.round(value)} B`;
  const unit = value < 1048576 ? 'KB' : value < 1073741824 ? 'MB' : 'GB';
  return `${(value / ({ KB: 1024, MB: 1048576, GB: 1073741824 }[unit])).toFixed(1)} ${unit}`;
}

export async function downloadPackage(pkg, destination, { fetcher = fetch, signal, onProgress = () => {}, allowLocal = false } = {}) {
  validateUrl(pkg.url, { allowLocal });
  if (!Number.isSafeInteger(pkg.bytes) || pkg.bytes <= 0 || !/^[a-f0-9]{64}$/i.test(pkg.sha256 || '')) throw Error('更新包信息无效');
  const part = `${destination}.part`;
  const controller = new AbortController();
  const combined = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
  let timer;
  const resetTimeout = () => { clearTimeout(timer); timer = setTimeout(() => controller.abort(Error('下载超时，请重试')), 30000); };
  resetTimeout();
  try {
    const response = await fetcher(pkg.url, { signal: combined, redirect: 'follow' });
    if (!response.ok || !response.body) throw Error(`下载失败（HTTP ${response.status}）`);
    if (response.url) validateUrl(response.url, { allowLocal });
    const hash = createHash('sha256');
    let received = 0;
    const start = performance.now();
    let last = 0;
    const meter = new Transform({ transform(chunk, encoding, next) {
      resetTimeout();
      received += chunk.length;
      if (received > pkg.bytes) { next(Error('下载内容超过清单大小')); return; }
      hash.update(chunk);
      const now = performance.now();
      if (now - last >= 150 || received === pkg.bytes) {
        const speed = received / Math.max((now - start) / 1000, .001);
        onProgress({ received, total: pkg.bytes, remaining: Math.max(0, pkg.bytes - received), speed, eta: (pkg.bytes - received) / speed, percent: received / pkg.bytes * 100 });
        last = now;
      }
      next(null, chunk);
    } });
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    await pipeline(Readable.fromWeb(response.body), meter, fs.createWriteStream(part), { signal: combined });
    if (received !== pkg.bytes || hash.digest('hex') !== pkg.sha256.toLowerCase()) throw Error('更新包校验失败，请重新下载');
    fs.renameSync(part, destination);
    return destination;
  } finally {
    clearTimeout(timer);
    if (fs.existsSync(part)) fs.unlinkSync(part);
  }
}
