#!/usr/bin/env bash
# Copies final art from the shared "Narnia Game Art" folder into the game and rebuilds art/manifest.json.
# Characters: "<Name> - front.png", "<Name> - side.png", "<Name> - back.png", optional "<Name> - action.png" (1024x1536 transparent).
# Skips test files: anything with " - ChatGPT" or " - built-in" in the name, and "_Peter" previews.
# Arenas: any PNG/JPG in "Arena Previews/<book>/" (match it to an arena by setting previewImage in src/arenas.js).
set -euo pipefail
SRC="${1:-/workspace/Narnia Game Art}"
cd "$(dirname "$0")/.."
mkdir -p art/characters art/arenas art/models
python3 - "$SRC" <<'PY'
import os, sys, shutil, json, re
src = sys.argv[1]; files = []
def ok(name):
    return not re.search(r' - (ChatGPT|built-in)', name, re.I) and not name.startswith('_Peter')
for sub, dest, pat in [('Characters', 'art/characters', re.compile(r' - (front|side|back|action)\.png$', re.I)), ('Arena Previews', 'art/arenas', re.compile(r'\.(png|jpe?g)$', re.I))]:
    root = os.path.join(src, sub)
    if not os.path.isdir(root): continue
    for book in sorted(os.listdir(root)):
        bdir = os.path.join(root, book)
        if not os.path.isdir(bdir): continue
        for f in sorted(os.listdir(bdir)):
            if pat.search(f) and ok(f):
                os.makedirs(os.path.join(dest, book), exist_ok=True)
                shutil.copy2(os.path.join(bdir, f), os.path.join(dest, book, f)); files.append(f"{dest}/{book}/{f}")
for f in sorted(os.listdir('art/models')):
    if f.lower().endswith('.glb'): files.append('art/models/' + f)
json.dump({'files': files}, open('art/manifest.json', 'w'), indent=1)
print(len(files), 'art files in manifest')
PY
