"""Build a cumulative runtime patch for independent HTTPS static hosting."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

project = Path(__file__).resolve().parents[1]
runtime = project / 'game/resources/app'
parser = argparse.ArgumentParser()
parser.add_argument('--base-url', default='', help='Actual independent HTTPS hosting directory; omit to produce an unpublished template')
parser.add_argument('--output', type=Path, default=project / 'releases/update-site')
args = parser.parse_args()
if args.base_url:
    from urllib.parse import urlsplit
    url = urlsplit(args.base_url)
    if url.scheme != 'https' or not url.netloc or url.username or any(x in url.hostname for x in ['github.com', 'githubusercontent.com', 'github.io']):
        raise SystemExit('Use an independent HTTPS update directory')
site = args.output.resolve()
site.mkdir(parents=True, exist_ok=True)
version = json.loads((runtime / 'updater/version.json').read_text(encoding='utf-8-sig'))
files = set()
for folder in ['app', 'character', 'card', 'mode', 'noname', 'layout', 'theme', 'game', 'updater']:
    for file in (runtime / folder).rglob('*'):
        if file.is_file() and file.suffix in ['.js', '.mjs', '.cjs', '.css', '.json', '.html', '.ps1']:
            files.add(file.relative_to(runtime).as_posix())
for name in ['index.html', 'noname.js', 'package.json', 'service-worker.js']:
    files.add(name)
for file in (runtime / 'image/character').glob('*'):
    if file.is_file() and file.stem.startswith(('ac_', 'ai_', 'mt_', 'mc_', 'boss_mt_', 'boss_alucard')):
        files.add(file.relative_to(runtime).as_posix())
files.add('image/background/three-kingdoms-loading.jpg')
# Include all existing customization assets, including new portraits maintained by other work.
custom_manifest = project.parent / 'output/noname-upload-20261021/customizations/extracted/manifest.json'
if custom_manifest.exists():
    for item in json.loads(custom_manifest.read_text(encoding='utf-8-sig')):
        name = item['path']
        if not name.startswith('src/') and (runtime / name).is_file():
            files.add(name)
payload = {'schema': 1, 'version': version['version'], 'files': [
    {'path': name, 'sha256': hashlib.sha256((runtime / name).read_bytes()).hexdigest()}
    for name in sorted(files)
]}
archive = site / f"noname-patch-{version['version']}.zip"
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as output:
    output.writestr('payload.json', json.dumps(payload, ensure_ascii=False))
    for name in sorted(files):
        output.write(runtime / name, name)
with zipfile.ZipFile(archive) as output:
    assert output.testzip() is None
    for item in payload['files']:
        assert hashlib.sha256(output.read(item['path'])).hexdigest() == item['sha256']
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
manifest = {'schema': 1, **version, 'windows': {'url': f"{args.base_url.rstrip('/')}/{archive.name}" if args.base_url else '', 'bytes': archive.stat().st_size, 'sha256': digest}}
name = 'noname-update.json' if args.base_url else 'noname-update.template.json'
(site / name).write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(site / '_headers').write_text('/noname-update.json\n  Cache-Control: no-store\n  Access-Control-Allow-Origin: *\n/*.zip\n  Cache-Control: public, max-age=31536000, immutable\n', encoding='utf-8')
(site / 'index.html').write_text('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>无名杀更新服务</title><h1>无名杀更新服务</h1><p>用于游戏客户端的版本检查与更新包分发。</p></html>', encoding='utf-8')
archive.with_suffix('.zip.sha256').write_text(f'{digest}  {archive.name}\n', encoding='ascii')
print(json.dumps({'archive': str(archive), 'bytes': archive.stat().st_size, 'files': len(files), 'sha256': digest, 'configured': bool(args.base_url), 'fits_25mb_static_host': archive.stat().st_size <= 25_000_000}, ensure_ascii=False))
