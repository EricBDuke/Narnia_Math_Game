// Asset URL helpers. The dev tree serves the PNG masters (art/); the hosted build (dist/) serves WebP only, converted by tools/build-webp.py.
// The dist manifest says so with `webp: true` plus the scale each kind of image was shrunk by, so painted sizes stay true to the masters.
let EXT = null, SCALE = { char: 1 };
export const progress = { total: 0, done: 0 };
export function setAssetMode(m) { EXT = m?.webp ? '.webp' : null; SCALE = { char: 1, ...(m?.scale || {}) }; }
export const assetUrl = (p) => encodeURI(EXT ? p.replace(/\.png$/i, EXT) : p);
export const charScale = () => SCALE.char;
export const isWebp = () => !!EXT;
// count a texture/image load in the shared progress bar (the loading screen before a fight)
export function tracked(promise) { progress.total++; return promise.finally(() => { progress.done++; }); }
export function resetProgress() { progress.total = 0; progress.done = 0; }
