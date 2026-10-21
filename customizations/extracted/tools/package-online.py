"""Package the customized Windows runtime and verify the resulting archive."""
from pathlib import Path
import argparse
import hashlib
import json
import zipfile

project = Path(__file__).resolve().parents[1]
runtime = project / 'game'
parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, default=project / 'releases/noname-windows-latest.zip')
destination = parser.parse_args().output.resolve()
prefix = '无名杀联机版/'
files = sorted(p for p in runtime.rglob('*') if p.is_file()
               and not any('backup' in part.lower() or part == '__pycache__'
                           for part in p.relative_to(runtime).parts))
destination.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(destination, 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=1) as archive:
    for index, path in enumerate(files, 1):
        archive.write(path, prefix + path.relative_to(runtime).as_posix())
        if index % 3000 == 0:
            print(f'Packaged {index}/{len(files)} files', flush=True)

with zipfile.ZipFile(destination) as archive:
    assert len(archive.infolist()) == len(files)
    assert archive.testzip() is None, 'Archive CRC verification failed'
    for relative in ['noname.exe', 'resources/app/character/mushoku.js',
                     'resources/app/character/minecraft.js',
                     'resources/app/character/ai.js', 'resources/app/LICENSE',
                     *[f'resources/app/image/character/{name}.jpg' for name in ['ac_chatgpt','ai_doubao','ai_deepseek','ai_claude','ai_grok']],
                     'resources/app/noname/init/mushoku-online.js',
                     'resources/app/node_modules/ws/package.json',
                     'resources/app/docs/online-ai-room.md']:
        assert archive.read(prefix + relative) == (runtime / relative).read_bytes(), relative

digest = hashlib.file_digest(destination.open('rb'), 'sha256').hexdigest()
destination.with_suffix('.zip.sha256').write_text(f'{digest}  {destination.name}\n', encoding='ascii')
print(json.dumps({'archive': str(destination), 'files': len(files),
                  'bytes': destination.stat().st_size, 'sha256': digest,
                  'crc_verified': True}, ensure_ascii=False), flush=True)
