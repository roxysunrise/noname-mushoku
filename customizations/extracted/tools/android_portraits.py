"""Resolve canonical portrait metadata, including paths constructed at runtime."""
from pathlib import Path
import json
import re
import subprocess


def portrait_references(source: Path) -> set[str]:
    references = set()
    for registry in (source / 'character', source / 'noname/init'):
        for module in registry.rglob('*.js'):
            references.update(re.findall(
                r'''image/(?:character|mode/boss/character)/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|svg|webp)''',
                module.read_text('utf-8', errors='ignore')))
    registry = (source / 'noname/init/mushoku-characters.js').resolve().as_uri()
    result = subprocess.run(['node', '--input-type=module', '--eval',
        'const {default: roster}=await import(process.argv[1]);'
        'console.log(JSON.stringify(Object.values(roster).map(c=>c.img)));', registry],
        check=True, capture_output=True, text=True, encoding='utf-8')
    for image in json.loads(result.stdout):
        if not isinstance(image, str) or not image.startswith('image/') or '..' in Path(image).parts:
            raise ValueError(f'Invalid registered portrait: {image!r}')
        if not (source / image).is_file():
            raise FileNotFoundError(f'Registered portrait missing: {image}')
        references.add(image)
    return references
