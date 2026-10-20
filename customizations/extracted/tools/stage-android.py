"""Stage the real game for Android, retaining registered portraits and used audio."""
from pathlib import Path
import json, re, shutil, hashlib
root = Path(__file__).resolve().parents[1]
source = root / 'game/resources/app'
target = root / 'android/build/assets/game'
target.mkdir(parents=True, exist_ok=True)
characters = {'ac_yumeko','ac_kaito','ac_chatgpt','mc_netherite','boss_alucard','boss_mt_roxy','ac_yuu','mc_dream','th_mokou',
 'mt_rudeus','mt_roxy','mt_sylphie','mt_eris','mt_orsted','mt_ruijerd','mt_paul','mt_ghislaine','caocao'}
count = size = 0
for file in source.rglob('*'):
    if not file.is_file(): continue
    rel = file.relative_to(source)
    parts = rel.parts
    if parts[0] in {'src','docs','app'} or file.name == 'service-worker.js': continue
    if len(parts)>1 and parts[0]=='audio' and parts[1] in {'background','skill','die'}: continue
    if len(parts)>2 and parts[:2]==('image','character') and file.stem not in characters and not file.stem.startswith('default_'): continue
    if len(parts)>4 and parts[:4]==('image','mode','boss','character') and file.stem not in characters: continue
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
for rel in ['character/mushoku.js','character/minecraft.js','noname/init/mushoku-alucard.js','noname/init/mushoku-online.js','game/config.json']:
    manifest[rel]=hashlib.sha256((target/rel).read_bytes()).hexdigest()
(root/'android/build/runtime-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({'files':count,'bytes':size,'target':str(target)},ensure_ascii=False),flush=True)
