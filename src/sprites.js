// Character billboards from Narnia Game Art PNGs (side / action / jump poses), animated with squash, stretch, lean and swing.
// Falls back (in combat.js) to the procedural 3D rig when no art exists for a fighter.
import * as THREE from 'three';
import { TEX } from './fx.js';
import { assetUrl, charScale, tracked } from './assets.js';

let REG = { files: new Set(), facing: {}, chars: {}, sizes: {} };
const loader = new THREE.TextureLoader(), cache = new Map();
export function setArtRegistry(manifest) { REG = { files: new Set(manifest?.files || []), facing: manifest?.facing || {}, chars: manifest?.chars || {}, sizes: manifest?.sizes || {} }; cache.clear(); }
// the roster says 'The White Witch - side.png' but the art is 'White Witch - side.png': accept either spelling
const alias = (p) => { if (!p) return null; if (REG.files.has(p)) return p; const q = p.replace(/\/The ([^/]+)$/, '/$1'); return REG.files.has(q) ? q : null; };
export const artUrl = (p) => { const q = alias(p); return q ? assetUrl(q) : null; };
// all painted characters share one scale: 1.80 m = 1306 px of the 1536 px canvas (feet at the bottom). Height in game = measured from the opaque pixels of the side pose.
// point each roster fighter at its art files using the manifest's name matching (sync-art.sh fuzzy-matches file names to the roster)
export function applyArtMap(fighters) {
  for (const f of fighters) { const base = REG.chars[f.id]; if (!base) continue; f.art = { ...(f.art || {}), side: base + ' - side.png', action: base + ' - action.png' }; }
}
export const PX_PER_M = 1306 / 1.8;
function measureBounds(img, ow, oh) { // opaque size in metres at the shared px/m scale (ow x oh = the master's size; the hosted WebP is shrunk)
  const w = 128, h = Math.round(128 * img.height / img.width), c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h); const d = g.getImageData(0, 0, w, h).data; let top = h, bot = -1, l = w, r = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { if (y < top) top = y; if (y > bot) bot = y; if (x < l) l = x; if (x > r) r = x; }
  return bot < 0 ? null : { h: (bot - top + 1) / h * oh / PX_PER_M, w: (r - l + 1) / w * ow / PX_PER_M };
}
export function artPaths(cfg) { // { side, action, jump } relative paths present in the manifest
  const a = cfg.art || {}; const out = {}; const side = alias(a.side), jump = side ? side.replace(/ - side\.png$/, ' - jump.png') : null;
  for (const k of ['combo1', 'combo2', 'power']) { const q = side ? side.replace(/ - side\.png$/, ` - ${k}.png`) : null; if (q && REG.files.has(q)) out[k] = q; } // optional per-move poses
  if (side && REG.files.has(side)) out.side = side; if (alias(a.action)) out.action = alias(a.action); if (jump && REG.files.has(jump)) out.jump = jump;
  if (!out.side && out.action) out.side = out.action; if (!out.side && out.jump) out.side = out.jump; return out;
}
function loadTex(path) {
  if (!cache.has(path)) cache.set(path, tracked(new Promise((res) => loader.load(assetUrl(path), t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; res({ tex: t, facing: REG.facing[path] === 'left' ? -1 : 1 }); }, undefined, () => res(null)))));
  return cache.get(path);
}
export async function makeBillboard(cfg, height, opts = {}) { // opts.only: load just these poses (the select-screen preview needs one, a fight needs all six)
  const paths = artPaths(cfg); if (!paths.side) return null;
  const poses = {}, keys = (opts.only || ['side', 'action', 'jump', 'combo1', 'combo2', 'power']).filter(k => paths[k]); // all poses fetched in parallel
  (await Promise.all(keys.map(k => loadTex(paths[k])))).forEach((r, i) => { if (r) poses[keys[i]] = r; });
  if (!poses.side) return null; poses.action ||= poses.side; poses.jump ||= poses.side; for (const k of ['combo1', 'combo2', 'power']) poses[k] ||= poses.action; // per-move poses fall back to the action pose
  const img = poses.side.tex.image, aspect = img.width / img.height, cs = charScale(), ow = img.width / cs, oh = img.height / cs, std = ow === 1024 && oh === 1536, bounds = std ? measureBounds(img, ow, oh) : null;
  // Real size: Characters/sizes.json (via the manifest) when present; peter_scale art is used as drawn, fit_to_canvas art is scaled so its length (quadrupeds) or height matches.
  // Fallback without sizes.json: derive from the image; big quadrupeds drawn fit-to-canvas get ~1.5x so a horse's withers stand ~1.6 m.
  // Gameplay caps: nothing taller than 1.6x Peter (2.9 m) so giants don't swallow the stage, nothing shorter than 0.4x Peter (0.72 m) so tiny fighters stay visible on iPad.
  const quad = cfg.body === 'quadruped' || cfg.body === 'centaur', nm = paths.side.replace(/^.*\//, '').replace(/ - side\.png$/, ''), sz = REG.sizes[nm];
  let K = 1; if (bounds) {
    if (sz && sz.mode === 'fitToCanvas') K = (quad || cfg.body === 'critter' || sz.len && !sz.h) && sz.len ? sz.len / bounds.w : sz.h ? sz.h / bounds.h : 1;
    else if (!sz && quad) K = cfg.artScale || 1.48;
    const hh = bounds.h * K; if (hh > 2.9) K *= 2.9 / hh; else if (hh < 0.72) K *= 0.72 / hh;
  }
  const realH = bounds ? bounds.h * K : null, realW = bounds ? bounds.w * K : null;
  const h = bounds ? oh / PX_PER_M * K : height * 1.1, w = h * aspect; // painted characters: true-to-scale canvas; others keep the old sizing
  const root = new THREE.Group(), geo = new THREE.PlaneGeometry(w, h);
  const mat = new THREE.MeshBasicMaterial({ map: poses.side.tex, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, toneMapped: false, fog: false });
  const plane = new THREE.Mesh(geo, mat); plane.renderOrder = 10; root.add(plane);
  const fmat = new THREE.MeshBasicMaterial({ map: poses.side.tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, side: THREE.DoubleSide, color: 0xffffff, fog: false, toneMapped: false });
  const flash = new THREE.Mesh(geo, fmat); flash.renderOrder = 11; flash.position.z = 0.02; root.add(flash);
  const rmat = new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, side: THREE.DoubleSide, fog: false, toneMapped: false });
  const rim = new THREE.Mesh(geo, rmat); rim.renderOrder = 10.5; rim.position.z = 0.015; root.add(rim);
  return { root, plane, flash, rim, mat, fmat, rmat, poses, h, w, realH, realW, quad: quad && !!bounds, cur: 'side', baseTint: new THREE.Color(1, 1, 1) };
}
// thin light-edge texture (left or right band of the silhouette), cached per pose texture
function rimTexture(tex, side) {
  tex.userData.rim ||= {}; if (tex.userData.rim[side]) return tex.userData.rim[side];
  const img = tex.image, w = 512, h = Math.round(512 * img.height / img.width), c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.drawImage(img, 0, 0, w, h); g.globalCompositeOperation = 'destination-out'; g.drawImage(img, side * 5, 0, w, h); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return (tex.userData.rim[side] = t);
}
export function animateBillboard(bb, S) {
  // S: { face, t, speed, grounded, vy, mode: idle|run|attack|hit|ko|block|jump|dodge, phase, seg, kind, hitArc, tumble, frozen, landT, invuln, power, flash, flashColor }
  const h = bb.h, f = S.face;
  const want0 = S.sigPose || S.mode === 'attack' && ['combo1', 'combo2', 'power'].includes(S.slot) ? S.slot : S.mode === 'attack' && S.kind !== 'melee-main' ? 'action' : (!S.grounded && S.mode !== 'hit' && S.mode !== 'ko') ? 'jump' : 'side';
  const want = bb.poses[want0] ? want0 : bb.poses.action ? 'action' : bb.poses.side ? 'side' : Object.keys(bb.poses)[0];
  if (want !== bb.cur) { bb.cur = want; const p = bb.poses[want]; bb.mat.map = p.tex; bb.fmat.map = p.tex; bb.mat.needsUpdate = true; bb.fmat.needsUpdate = true; }
  const gr = S.grade; // arena colour grade { tint: Color, rim: Color, side: -1|1 (screen side the light comes from) }
  if (gr) { bb.mat.color.copy(gr.tint); }
  const pf = bb.poses[bb.cur].facing; // art facing: 1 = faces right
  let sx = 1, sy = 1, lean = 0, ox = 0, oy = 0, roll = 0;
  const t = S.t, run = S.speed;
  const breathe = Math.sin(t * 2.4) * 0.012; sy += breathe; sx -= breathe * 0.6;
  if (S.grounded && run > 0.1 && S.mode === 'run') { const b = Math.abs(Math.sin(t * 12)); oy += b * 0.05 * h; lean += -f * 0.07 * run; sx += Math.sin(t * 12) * 0.025; sy -= b * 0.03; }
  if (!S.grounded && S.mode !== 'ko') { const k = Math.max(-1, Math.min(1, S.vy / 14)); sy += 0.07 * Math.abs(k); sx -= 0.05 * Math.abs(k); lean += -f * 0.05 * k; }
  if (S.landT > 0) { const k = S.landT / 0.14; sy -= 0.14 * k; sx += 0.1 * k; }
  if (S.mode === 'block') { sy -= 0.07; lean += f * 0.06; }
  if (S.mode === 'dodge') { sx += 0.12; sy -= 0.08; lean += -f * 0.2; }
  if (S.mode === 'attack') {
    const seg = S.seg; // 0..1 across the current swing: wind-up (0-0.4), strike (0.4-0.65), follow-through
    const wind = Math.min(1, seg / 0.4), strike = seg < 0.4 ? 0 : Math.min(1, (seg - 0.4) / 0.25), rec = seg < 0.65 ? 0 : (seg - 0.65) / 0.35;
    const k = (seg < 0.4 ? -wind * 0.55 : (seg < 0.65 ? -0.55 + strike * 1.7 : 1.15 * (1 - rec)));
    lean += -f * 0.22 * k; ox += f * 0.2 * h * Math.max(0, k) * (S.kind === 'thrust' ? 1.6 : 1); oy += (S.kind === 'upper' ? 0.1 * h * Math.max(0, k) : 0);
    sx += 0.1 * Math.max(0, k); sy -= 0.05 * Math.max(0, k) - 0.03 * Math.min(0, k);
    if (S.kind === 'spin') sx *= Math.cos(S.phase * Math.PI * 2 * (S.spins || 2));
    if (S.kind === 'cast') { sy += Math.sin(S.phase * Math.PI) * 0.1; oy += Math.sin(S.phase * Math.PI) * 0.06 * h; }
  }
  if (S.mode === 'hit') { const a = Math.sin(Math.min(1, S.phase) * Math.PI); lean += f * 0.3 * a; ox -= f * 0.12 * h * a; sx -= 0.1 * a; sy += 0.06 * a; }
  if (S.tumble) { roll = -f * (t * 16); }
  if (S.mode === 'ko') { roll = -f * S.phase * 10; sx *= 1 - S.phase * 0.6; sy *= 1 - S.phase * 0.6; }
  if (S.frozen) { sx *= 1.0; }
  const root = bb.root;
  if (S.sigScale) { sx *= S.sigScale; sy *= S.sigScale; oy += (S.sigLift || 0) * 0.07 * h; }
  root.scale.set(sx * f * pf, sy, 1); // flip horizontally for facing (art is authored facing right unless the manifest says left)
  root.rotation.z = (S.tumble || S.mode === 'ko') ? roll : lean;
  bb.plane.position.set(ox * 1, h / 2 + oy, 0); bb.flash.position.set(ox, h / 2 + oy, 0.02);
  if (S.tumble || S.mode === 'ko') { bb.plane.position.y = 0; bb.flash.position.y = 0; root.userData.lift = h / 2; } else root.userData.lift = 0;
  // tints: additive overlay for hit flash / block / freeze / power glow
  let fo = 0; const col = bb.fmat.color;
  if (S.flash > 0) { fo = Math.min(0.85, S.flash * 5); col.set(0xff6a50); }
  else if (S.frozen) { fo = 0.55; col.set(0x70d8ff); }
  else if (S.mode === 'block') { fo = 0.28; col.set(0x4a8aff); }
  else if (S.sigGlow > 0) { fo = Math.min(0.9, S.sigGlow * (0.85 + 0.15 * Math.sin(t * 20))); col.copy(S.sigColor); }
  else if (S.sigReady) { fo = 0.2 + Math.sin(t * 8) * 0.12; col.copy(S.sigColor); }
  else if (S.power) { fo = 0.12 + Math.sin(t * 6) * 0.07; col.set(0xffd860); }
  bb.fmat.opacity = fo;
  if (gr && bb.rmat) { const mirrored = f * pf < 0, side = (gr.side < 0) !== mirrored ? 1 : -1; const rt = rimTexture(bb.poses[bb.cur].tex, side); if (bb.rmat.map !== rt) { bb.rmat.map = rt; bb.rmat.needsUpdate = true; } bb.rmat.color.copy(gr.rim); bb.rmat.opacity = gr.rimOp || 0.8; bb.rim.position.set(ox, bb.plane.position.y, 0.015); }
  bb.mat.opacity = S.invuln > 0 ? (Math.sin(t * 30) > 0 ? 0.45 : 0.9) : 1; bb.fmat.visible = fo > 0.01;
}
