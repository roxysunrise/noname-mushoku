"""Stage the real game for Android, retaining registered portraits and used audio."""
from pathlib import Path
import json, re, shutil, hashlib
from android_portraits import portrait_references as collect_portrait_references
root = Path(__file__).resolve().parents[1]
source = root / 'game/resources/app'
portrait_references = collect_portrait_references(source)
target = root / 'android/build/assets/game'
# Recreate only the generated staging directory, never runtime sources.
assert target.resolve() == (root / 'android/build/assets/game').resolve()
if target.exists(): shutil.rmtree(target)
target.mkdir(parents=True, exist_ok=True)
# Keep every portrait explicitly referenced by a shipped character pack. A fixed
# allowlist silently drops newly registered characters from Android builds.
count = size = 0
for file in source.rglob('*'):
    if not file.is_file(): continue
    rel = file.relative_to(source)
    parts = rel.parts
    if parts[0] in {'src','docs','app'} or file.name == 'service-worker.js': continue
    if len(parts)>1 and parts[0]=='audio' and parts[1] in {'background','skill','die'}: continue
    if len(parts)>2 and parts[:2]==('image','character') and not file.name.startswith('default_') and rel.as_posix() not in portrait_references: continue
    if len(parts)>4 and parts[:4]==('image','mode','boss','character') and rel.as_posix() not in portrait_references: continue
    dest = target / rel
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(file,dest)
    count += 1; size += file.stat().st_size
# All runtime modules are compiled JS already: no service worker / TS compiler is needed.
html=(source/'index.html').read_text('utf-8')
html,n=re.subn(r'<script type="module">.*?</script>', '', html, count=1, flags=re.S)
assert n in (0,1), 'Unexpected JIT bootstrap count'
(target/'index.html').write_text(html,encoding='utf-8')
manifest={}
for rel in ['character/mushoku.js','character/minecraft.js','character/ai.js','character/western.js','character/modern.js','noname/init/mushoku-rosters.js','noname/init/mushoku-characters.js','LICENSE',*[f'image/character/{name}.jpg' for name in ['ac_chatgpt','ai_doubao','ai_deepseek','ai_claude','ai_grok']],'noname/init/mushoku-alucard.js','noname/init/mushoku-online.js','game/config.json']:
    manifest[rel]=hashlib.sha256((target/rel).read_bytes()).hexdigest()
for rel in sorted(portrait_references):
    if (source / rel).is_file():
        staged = target / rel
        assert staged.is_file(), f'Referenced character portrait was not staged: {rel}'
        manifest[rel]=hashlib.sha256(staged.read_bytes()).hexdigest()
(root/'android/build/runtime-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({'files':count,'bytes':size,'portraits':len(portrait_references),'target':str(target)},ensure_ascii=False),flush=True)
