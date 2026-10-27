#!/usr/bin/env bash
# Copies only the runtime files into dist/ (what gets hosted). No build step needed; open dist/index.html via any static server.
set -euo pipefail; cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist && cp -r index.html style.css src vendor art dist/
echo "dist ready: $(du -sh dist | cut -f1)"
