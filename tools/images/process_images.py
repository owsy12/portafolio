import json, os, sys
from PIL import Image
import pathlib
ROOT=pathlib.Path(__file__).resolve().parents[2]
P=str(ROOT/'public'/'projects')
manifest_path=str(ROOT/'content'/'images.json')
os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}
def save(src, slug, name, maxw=1600, pixel=False):
    os.makedirs(f'{P}/{slug}', exist_ok=True)
    im = Image.open(src).convert('RGB')
    if pixel:
        s = max(1, 1536 // im.width)
        im = im.resize((im.width*s, im.height*s), Image.NEAREST)
    elif im.width > maxw:
        im = im.resize((maxw, round(im.height*maxw/im.width)), Image.LANCZOS)
    out = f'{P}/{slug}/{name}.webp'
    im.save(out, 'WEBP', quality=82 if not pixel else 90, method=6)
    manifest[f'/projects/{slug}/{name}.webp'] = {'w': im.width, 'h': im.height}
    print(out, im.size, os.path.getsize(out)//1024, 'KB')
jobs = json.loads(sys.argv[1])
for j in jobs: save(j['src'], j['slug'], j['name'], j.get('maxw',1600), j.get('pixel',False))
json.dump(manifest, open(manifest_path,'w'), indent=1, sort_keys=True)
