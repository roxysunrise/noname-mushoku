"""Reject APKs whose gameplay code differs from the desktop runtime."""
from pathlib import Path
import argparse
import hashlib
import json
import zipfile


def verify(apk, source, manifest_path):
    expected = json.loads(manifest_path.read_text('utf-8'))
    # Include engine, card/character skills and modes, not only custom portraits.
    for directory in ('character', 'card', 'mode', 'noname', 'game'):
        for file in (source / directory).rglob('*.js'):
            expected[file.relative_to(source).as_posix()] = hashlib.sha256(file.read_bytes()).hexdigest()
    for rel in ('noname.js',):
        expected[rel] = hashlib.sha256((source / rel).read_bytes()).hexdigest()
    with zipfile.ZipFile(apk) as archive:
        if archive.testzip() is not None:
            raise ValueError('APK CRC check failed')
        for rel, digest in sorted(expected.items()):
            if hashlib.sha256((source / rel).read_bytes()).hexdigest() != digest:
                raise ValueError(f'Desktop runtime changed after staging: {rel}')
            if hashlib.sha256(archive.read('assets/game/' + rel)).hexdigest() != digest:
                raise ValueError(f'APK differs from desktop runtime: {rel}')
    print(f'Android/desktop runtime parity PASS: {len(expected)} files', flush=True)


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('apk', type=Path)
    args = parser.parse_args()
    verify(args.apk, root / 'game/resources/app', root / 'android/build/runtime-manifest.json')
