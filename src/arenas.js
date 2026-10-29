// 14 side-view arenas (two per book). Each is a detailed 3D scene seen from the side: a main stage plus floating platforms,
// layered parallax scenery (procedural fallback, or Narnia Game Art layers when present), lights, fog, shadows.
// A = { surfaces[], blast{l,r,t,b}, spawns[], update(t,dt), music, center, ... }  (surfaces are what fighters stand on)
import * as THREE from 'three';
import { TEX } from './fx.js';
import { assetUrl, tracked } from './assets.js';

const BOOKS = ["01 The Magician's Nephew", "02 The Lion, the Witch and the Wardrobe", "03 The Horse and His Boy", "04 Prince Caspian", "05 The Voyage of the Dawn Treader", "06 The Silver Chair", "07 The Last Battle"];
const TITLES = ["The Magician's Nephew", 'The Lion, the Witch and the Wardrobe', 'The Horse and His Boy', 'Prince Caspian', 'The Voyage of the Dawn Treader', 'The Silver Chair', 'The Last Battle'];
// art layers (when the Narnia Game Art bot delivers them): /workspace/Narnia Game Art/Arena Previews/<book>/<Arena name>/back.png, mid.png, front.png (3840x1080), platform.png (1024x256 tileable)
const A_ = (b, id, name, blurb, music) => ({ id, name, book: TITLES[b], bookFolder: BOOKS[b], blurb, music, artSource: `/workspace/Narnia Game Art/Arena Previews/${BOOKS[b]}/${name}/`, artDir: `art/arenas/${BOOKS[b]}/${name}/` });
export const ARENAS = [
  A_(0, 'charn', "Charn's Hall of Images", 'The silent hall of kings and queens, with the golden bell', 'dark'),
  A_(0, 'creation', 'The Song of Creation', 'The new Narnia valley, just sung into being', 'golden'),
  A_(1, 'castle', "The White Witch's Castle", 'A snowy courtyard full of statues', 'cold'),
  A_(1, 'stonetable', 'The Stone Table', 'A hilltop at dawn, ringed with standing stones', 'epic'),
  A_(2, 'tashbaan', 'Tashbaan', 'A sunny courtyard in the great Calormene city', 'eastern'),
  A_(2, 'anvard', 'Siege of Anvard', 'Before the gates of the castle of Archenland', 'epic'),
  A_(3, 'aslanshow', "Aslan's How", 'The torchlit chamber around the broken Stone Table', 'dark'),
  A_(3, 'cairparavel', 'Ruins of Cair Paravel', 'Broken pillars and an apple orchard by the sea', 'warm'),
  A_(4, 'dawntreader', 'Dawn Treader Deck', 'Fight on the deck of the ship sailing east', 'sea'),
  A_(4, 'dragonisland', 'Dragon Island', "A misty valley with the dragon's cave and its gold", 'dark'),
  A_(5, 'harfang', 'Harfang', 'The great hall of the giants, with a roaring fire', 'epic'),
  A_(5, 'underland', 'Underland', "The Queen's dark realm under the earth, lit by lamps", 'mystic'),
  A_(6, 'stablehill', 'Stable Hill', 'The night hill with the stable and the bonfire', 'dark'),
  A_(6, 'aslanscountry', 'Further Up and Further In', "Aslan's Country, bright and golden", 'golden'),
];

// ---------- procedural textures ----------
const texCache = {};
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hex = (c) => '#' + new THREE.Color(c).getHexString();
const shade = (c, k) => '#' + new THREE.Color(c).multiplyScalar(k).getHexString();
export function surfaceTex(kind, base, rx = 1, ry = 1) {
  const key = kind + base + rx + ry; if (texCache[key]) return texCache[key];
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), R = rng(base + kind.length * 77);
  g.fillStyle = hex(base); g.fillRect(0, 0, S, S);
  const speck = (n, a, sz) => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${R() < .5 ? '0,0,0' : '255,255,255'},${R() * a})`; g.fillRect(R() * S, R() * S, sz * (0.5 + R()), sz * (0.5 + R())); } };
  if (kind === 'stone' || kind === 'marble') {
    const rows = 4, cols = 3; for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const off = (r % 2) * S / cols / 2; const x = q * S / cols + off, y = r * S / rows; g.fillStyle = shade(base, 0.85 + R() * 0.3); g.fillRect(x + 1, y + 1, S / cols - 2, S / rows - 2); }
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2; for (let r = 0; r <= rows; r++) { g.beginPath(); g.moveTo(0, r * S / rows); g.lineTo(S, r * S / rows); g.stroke(); }
    for (let r = 0; r < rows; r++) for (let q = 0; q <= cols; q++) { const off = (r % 2) * S / cols / 2; g.beginPath(); g.moveTo(q * S / cols + off, r * S / rows); g.lineTo(q * S / cols + off, (r + 1) * S / rows); g.stroke(); }
    if (kind === 'marble') { g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; for (let i = 0; i < 14; i++) { g.beginPath(); let x = R() * S, y = R() * S; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (R() - .3) * 50; y += (R() - .5) * 40; g.lineTo(x, y); } g.stroke(); } }
    speck(500, 0.25, 2);
  } else if (kind === 'slab') { // cool grey cracked stone: mottled blotches, faint strata, dark cracks with light edges, a little moss
    for (let i = 0; i < 90; i++) { const x = R() * S, y = R() * S, r = 18 + R() * 40; const k = 0.78 + R() * 0.44; g.fillStyle = `rgba(${k > 1 ? '255,255,255' : '0,0,0'},${Math.abs(k - 1) * 0.55})`; g.beginPath(); g.ellipse(x, y, r, r * (0.4 + R() * 0.5), R() * 3, 0, 7); g.fill(); }
    g.lineWidth = 1; for (let i = 0; i < 10; i++) { g.strokeStyle = `rgba(0,0,0,${0.06 + R() * 0.08})`; const y = R() * S; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(S * .3, y + (R() - .5) * 14, S * .6, y + (R() - .5) * 14, S, y + (R() - .5) * 10); g.stroke(); }
    for (let i = 0; i < 4; i++) { let x = R() * S, y = R() * S * 0.3; const pts = [[x, y]]; for (let k = 0; k < 9; k++) { x += (R() - .5) * 46; y += 16 + R() * 20; pts.push([x, y]); }
      for (const [col, w, o] of [['rgba(255,255,255,.28)', 3, 1.5], ['rgba(10,10,14,.85)', 2, 0]]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach(([a, b], j) => j ? g.lineTo(a + o, b + o) : g.moveTo(a + o, b + o)); g.stroke(); }
      const [bx, by] = pts[4 + (i % 3)]; g.strokeStyle = 'rgba(10,10,14,.7)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + 30 * (R() - .3), by + 24 * R()); g.stroke(); }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(70,100,50,${R() * 0.25})`; g.beginPath(); g.arc(R() * S, S * (0.7 + R() * 0.3), 2 + R() * 6, 0, 7); g.fill(); }
    speck(700, 0.22, 2);
  } else if (kind === 'cobble') {
    for (let i = 0; i < 70; i++) { const x = R() * S, y = R() * S, r = 14 + R() * 12; g.fillStyle = shade(base, 0.7 + R() * 0.5); g.beginPath(); g.ellipse(x, y, r, r * 0.75, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 2; g.stroke(); }
    speck(300, 0.2, 2);
  } else if (kind === 'grass') {
    for (let i = 0; i < 1800; i++) { g.strokeStyle = shade(base, 0.6 + R() * 0.8); g.lineWidth = 1 + R(); const x = R() * S, y = R() * S; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - .5) * 4, y - 5 - R() * 8); g.stroke(); }
    speck(80, 0.15, 3);
  } else if (kind === 'wood') {
    const pl = 5; for (let i = 0; i < pl; i++) { g.fillStyle = shade(base, 0.8 + R() * 0.4); g.fillRect(0, i * S / pl, S, S / pl - 2); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, i * S / pl); g.lineTo(S, i * S / pl); g.stroke();
      for (let k = 0; k < 7; k++) { g.strokeStyle = `rgba(0,0,0,${0.08 + R() * .12})`; g.lineWidth = 1; const y = i * S / pl + R() * S / pl; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(S * .3, y + (R() - .5) * 6, S * .6, y + (R() - .5) * 6, S, y); g.stroke(); }
      const bx = R() * S; g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.arc(bx, i * S / pl + S / pl / 2, 2, 0, 7); g.fill(); }
  } else if (kind === 'snow') { speck(900, 0.35, 3); g.fillStyle = 'rgba(160,190,230,.25)'; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(R() * S, R() * S, 30, 10, 0, 0, 7); g.fill(); } }
  else if (kind === 'sand') { speck(1500, 0.22, 2); g.strokeStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(0, i * 26 + R() * 10); g.bezierCurveTo(80, i * 26 + R() * 18, 160, i * 26 + R() * 18, S, i * 26 + R() * 10); g.stroke(); } }
  else if (kind === 'gold') { speck(700, 0.4, 3); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,${200 + R() * 55 | 0},${60 + R() * 80 | 0},.5)`; g.beginPath(); g.arc(R() * S, R() * S, 3 + R() * 6, 0, 7); g.fill(); } }
  else { /* rock */ for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${R() < .5 ? '0,0,0' : '255,255,255'},${R() * .16})`; g.beginPath(); g.ellipse(R() * S, R() * S, 8 + R() * 30, 5 + R() * 18, R() * 3, 0, 7); g.fill(); } speck(500, 0.2, 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4;
  return texCache[key] = t;
}
function skyTexture(stops) { const c = document.createElement('canvas'); c.width = 8; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); stops.forEach((s, i) => gr.addColorStop(i / (stops.length - 1), hex(s))); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

// ---------- arena themes ----------
const T = {
  charn:        { sky: [0x2a0a0a, 0x7a2418, 0xe05a2a], fog: 0x6a2a20, fn: 40, ff: 150, hemi: [0xffc4a0, 0x5a3030, 1.7], sun: [0xffa070, 3.0, [-16, 20, 14]], rim: 0xff6a40, tex: 'marble', col: 0xa89090, rock: 0x6a4a4a, plat: 0xb09a9a, stage: 'hall', W: 24, plats: [[-9, 3.6, 5.2], [9, 3.6, 5.2], [0, 7.4, 6]] },
  creation:     { sky: [0x4a7ac8, 0xf5c890, 0xffe9b0], fog: 0xf0d8a8, fn: 40, ff: 150, hemi: [0xfff0c8, 0x4a7a30, 1.1], sun: [0xffe0a0, 2.4, [22, 16, 12]], rim: 0xffd890, tex: 'grass', col: 0x5a9a3a, rock: 0x6a5a3a, plat: 0x6aa044, stage: 'island', W: 26, plats: [[-8, 3.4, 5.6], [8, 3.4, 5.6], [0, 7, 5.2]] },
  castle:       { sky: [0x35527a, 0x8aa8c8, 0xdce8f4], fog: 0xb8cce0, fn: 28, ff: 110, hemi: [0xc8dcf0, 0x506070, 1.0], sun: [0xe6f2ff, 1.9, [-14, 20, 14]], rim: 0x80b0ff, tex: 'snow', col: 0xe6eef6, rock: 0x7a8896, plat: 0xc4d4e4, stage: 'ground', W: 24, plats: [[-8, 3.5, 5], [8, 3.5, 5], [0, 7.2, 5.4]] },
  stonetable:   { sky: [0x3a4a8a, 0xf0906a, 0xffd8a0], fog: 0xf4c8a0, fn: 35, ff: 130, hemi: [0xffd8b0, 0x4a6a2a, 1.0], sun: [0xffc080, 2.4, [-24, 12, 12]], rim: 0xffa060, tex: 'grass', col: 0x5a8a3a, rock: 0x6a6a5a, plat: 0x8a8678, stage: 'ground', W: 26, plats: [[-9, 4.2, 5], [9, 4.2, 5], [0, 2.4, 4.4]] },
  tashbaan:     { sky: [0x2a78c8, 0x7ac0ec, 0xfff0d0], fog: 0xe8dcc0, fn: 40, ff: 150, hemi: [0xfff4dc, 0xa08050, 1.1], sun: [0xfff0d0, 2.6, [14, 24, 14]], rim: 0xffe0a0, tex: 'sand', col: 0xd4b888, rock: 0xb09468, plat: 0xe0c898, stage: 'ground', W: 24, plats: [[-8, 3.4, 5.2], [8, 3.4, 5.2], [0, 7, 5.6]] },
  anvard:       { sky: [0x5a7898, 0xa8bcd0, 0xdce4e8], fog: 0xb8c4cc, fn: 30, ff: 120, hemi: [0xd8e4f0, 0x4a5a40, 1.0], sun: [0xfff4e0, 1.8, [-10, 22, 16]], rim: 0xa0c0ff, tex: 'cobble', col: 0x8a8a84, rock: 0x6a6a64, plat: 0x9a9a92, stage: 'ground', W: 26, plats: [[-9, 3.6, 5], [9, 3.6, 5], [0, 7.4, 5]] },
  aslanshow:    { sky: [0x0a0806, 0x1a1008, 0x2a1a0c], fog: 0x140c06, fn: 25, ff: 80, hemi: [0xa07850, 0x100804, 0.6], sun: [0xffb060, 1.0, [0, 20, 16]], rim: 0xff8030, tex: 'stone', col: 0x6a5a4a, rock: 0x3a2e24, plat: 0x7a6a58, stage: 'hall', W: 24, plats: [[-9, 3.6, 5], [9, 3.6, 5], [0, 7.2, 5.6]] },
  cairparavel:  { sky: [0x4a78c0, 0xf0b890, 0xffe0b0], fog: 0xf0d0b0, fn: 40, ff: 150, hemi: [0xffe8d0, 0x4a7040, 1.0], sun: [0xffd0a0, 2.4, [24, 14, 10]], rim: 0xffb070, tex: 'marble', col: 0xc8bca8, rock: 0x8a7a68, plat: 0xd0c4b0, stage: 'island', W: 24, plats: [[-8.5, 3.5, 5], [8.5, 4.6, 4.6], [0, 7.4, 5]] },
  dawntreader:  { sky: [0x3a8ae0, 0x9ad4f4, 0xf0f8ff], fog: 0xc0e4f8, fn: 45, ff: 170, hemi: [0xe0f4ff, 0x2a6a8a, 1.15], sun: [0xfff6e0, 2.6, [16, 26, 12]], rim: 0xb0e0ff, tex: 'wood', col: 0x9a6a3a, rock: 0x5a3a1e, plat: 0xa87848, stage: 'deck', W: 22, plats: [[-7.5, 3.4, 4.6], [7.5, 3.4, 4.6], [0, 7, 4.2]] },
  dragonisland: { sky: [0x2a3a40, 0x607880, 0x98aeb0], fog: 0x6a8084, fn: 18, ff: 85, hemi: [0xa8c0c0, 0x2a3a30, 0.9], sun: [0xe0f0e0, 1.3, [-12, 20, 14]], rim: 0x60c0a0, tex: 'rock', col: 0x5a5a50, rock: 0x3a3a34, plat: 0x6a685c, stage: 'ground', W: 24, plats: [[-9, 3.4, 5], [9, 3.4, 5], [0, 6.6, 5.4]] },
  harfang:      { sky: [0x1a1008, 0x3a2412, 0x5a3a1c], fog: 0x2a1a0c, fn: 30, ff: 100, hemi: [0xffc888, 0x20140a, 0.8], sun: [0xff9a50, 1.6, [0, 22, 14]], rim: 0xff7020, tex: 'stone', col: 0x7a6a58, rock: 0x4a3c30, plat: 0x8a7a66, stage: 'hall', W: 26, plats: [[-9.5, 3.8, 5.4], [9.5, 3.8, 5.4], [0, 7.8, 6]] },
  underland:    { sky: [0x03060c, 0x0a1220, 0x142030], fog: 0x070d18, fn: 14, ff: 70, hemi: [0x6a82c0, 0x080c14, 0.7], sun: [0x8aa0e0, 0.9, [4, 22, 14]], rim: 0x40ffa0, tex: 'rock', col: 0x4a4a52, rock: 0x2a2a32, plat: 0x585862, stage: 'island', W: 24, plats: [[-8, 3.4, 5], [8, 3.4, 5], [0, 7, 5.4]] },
  stablehill:   { sky: [0x050a1c, 0x142040, 0x2a3458], fog: 0x0e1630, fn: 22, ff: 100, hemi: [0x6a7ab0, 0x141c10, 0.75], sun: [0x9ab0ff, 1.1, [-14, 22, 14]], rim: 0xff8030, tex: 'grass', col: 0x34522e, rock: 0x3a3228, plat: 0x4a6a3a, stage: 'ground', W: 24, plats: [[-8.5, 3.5, 5], [8.5, 3.5, 5], [0, 7.2, 5]] },
  aslanscountry:{ sky: [0x6ab0f0, 0xc8e8ff, 0xfff8e0], fog: 0xf4f0d8, fn: 50, ff: 190, hemi: [0xffffff, 0x80b050, 1.25], sun: [0xfff4c8, 2.8, [18, 26, 12]], rim: 0xfff0b0, tex: 'grass', col: 0x78bc48, rock: 0xb0a070, plat: 0x88c850, stage: 'island', W: 26, plats: [[-9, 3.6, 5.4], [9, 3.6, 5.4], [0, 7.4, 5.6]] },
};

let ART_MANIFEST = null;
export function setArenaArt(m) { ART_MANIFEST = m; }
export const hasArtArena = (id) => !!(ART_MANIFEST?.arenas?.[id]?.back && ART_MANIFEST.arenas[id].platform);

export function buildArena(id, scene, opts = {}) {
  const th = T[id], R = rng(id.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 11)), def = ARENAS.find(a => a.id === id);
  const A = { id, def, surfaces: [], spawns: [], updaters: [], music: def.music, W: th.W, halfW: th.W / 2, stageTop: 0, lights: [] };
  const rr = (a, b) => a + R() * (b - a);
  const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.85, metalness: o.m ?? 0, flatShading: o.flat ?? false, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 1, map: o.map, transparent: !!o.t, opacity: o.op ?? 1, side: o.side });
  const add = (geo, mat, x, y, z, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast ?? false; m.receiveShadow = o.recv ?? false; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz; if (o.rx) m.rotation.x = o.rx; (o.parent || scene).add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d), C = (a, b, h, s = 12) => new THREE.CylinderGeometry(a, b, h, s), S = (r, w = 14, h = 10) => new THREE.SphereGeometry(r, w, h), K = (r, h, s = 8) => new THREE.ConeGeometry(r, h, s);
  const glowMat = (c) => new THREE.MeshBasicMaterial({ color: c });

  // ----- sky, fog, lights -----
  scene.background = skyTexture(th.sky); scene.fog = new THREE.Fog(th.fog, th.fn, th.ff);
  scene.add(new THREE.HemisphereLight(th.hemi[0], th.hemi[1], th.hemi[2]));
  const sun = new THREE.DirectionalLight(th.sun[0], th.sun[1]); sun.position.set(...th.sun[2]); sun.target.position.set(0, 2, 0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 16, bottom: -10, near: 1, far: 90 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; scene.add(sun, sun.target); A.sun = sun;
  const rim = new THREE.DirectionalLight(th.rim, 0.9); rim.position.set(-8 * Math.sign(th.sun[2][0] || 1), 8, -14); scene.add(rim);
  if (hasArtArena(id)) { scene.fog = null; return buildArtArena(A, th, scene, ART_MANIFEST.arenas[id]); }
  const pointLight = (x, y, z, c, i, d = 16) => { const l = new THREE.PointLight(c, i, d, 1.6); l.position.set(x, y, z); scene.add(l); A.lights.push(l); return l; };

  // ----- stage & platforms (what you stand on) -----
  const hw = th.W / 2, depth = 7, stageTex = surfaceTex(th.tex, th.col, th.W / 4, 1.6), sideTex = surfaceTex(th.stage === 'deck' ? 'wood' : th.tex === 'grass' || th.tex === 'snow' || th.tex === 'sand' ? 'rock' : th.tex, th.stage === 'deck' ? 0x6a3e1e : th.rock, th.W / 5, 1);
  const topMat = M(0xffffff, { map: stageTex, r: 0.9 }), sideMat = M(0xffffff, { map: sideTex, r: 0.95 });
  const stage = new THREE.Mesh(B(th.W, 3, depth), [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]); stage.position.set(0, -1.5, 0); stage.castShadow = stage.receiveShadow = true; scene.add(stage);
  add(B(th.W + 0.5, 0.35, depth + 0.5), M(shade(th.col, 0.8), { r: 0.8 }), 0, -0.17, 0, { recv: true });
  A.surfaces.push({ x0: -hw, x1: hw, cx: 0, w: th.W, y: 0, solid: true, bottom: -9, dx: 0 });
  const under = new THREE.Group(); scene.add(under); A.under = under;
  if (th.stage === 'ground' || th.stage === 'hall') { add(B(th.W, 24, depth), M(0xffffff, { map: sideTex }), 0, -15, 0, { parent: under, recv: true }); add(B(th.W + 14, 1, depth + 40), M(shade(th.rock, 0.55)), 0, -26.5, -4, { parent: under }); }
  else if (th.stage === 'island') { for (let i = 0; i < 9; i++) { const x = -hw + (i + 0.5) * th.W / 9, h = rr(7, 14), r = rr(1.9, 2.8); const k = add(K(r, h, 7), M(th.rock, { flat: true, r: 1 }), x, -3 - h / 2, rr(-1, 1), { parent: under, cast: true }); k.rotation.x = Math.PI; k.rotation.y = R() * 3; } add(B(th.W * 0.82, 3, depth * 0.8), M(th.rock, { flat: true }), 0, -4.4, 0, { parent: under }); }
  else if (th.stage === 'deck') { add(B(th.W + 2, 9, depth + 2), M(0xffffff, { map: sideTex }), 0, -7.5, 0, { parent: under }); for (const sx of [-1, 1]) add(B(0.4, 1.3, depth + 0.6), M(0x4a2a12), sx * (hw + 0.6), 0.65, 0, { cast: true, parent: scene }); for (let i = -3; i <= 3; i++) add(C(0.12, 0.12, 1.1, 6), M(0x4a2a12), i * 3.4, 0.5, depth / 2 + 0.2, { cast: true }); add(B(th.W, 0.18, 0.25), M(0x4a2a12), 0, 1.1, depth / 2 + 0.2); add(B(th.W, 0.18, 0.25), M(0x4a2a12), 0, 1.1, -depth / 2 - 0.2); }
  // moving platforms (a few arenas)
  const platTex = surfaceTex(id === 'stonetable' ? 'slab' : th.tex === 'grass' ? 'stone' : th.tex === 'snow' ? 'stone' : th.tex === 'sand' ? 'stone' : th.tex, th.plat, 1.2, 0.6);
  const platMat = M(0xffffff, { map: platTex, r: 0.85 }), platSide = M(shade(th.plat, 0.7), { r: 0.9, flat: true });
  A.platMeshes = [];
  th.plats.forEach(([x, y, w], i) => {
    const g = new THREE.Group(); g.position.set(x, y, 0); scene.add(g);
    const slab = new THREE.Mesh(B(w, 0.5, 3.6), [platSide, platSide, platMat, platSide, platSide, platSide]); slab.position.y = -0.25; slab.castShadow = slab.receiveShadow = true; g.add(slab);
    if (th.stage === 'deck') { for (const sx of [-1, 1]) add(C(0.1, 0.1, 3, 6), M(0x4a2a12), sx * w * 0.42, -1.5, 0, { parent: g }); add(B(w * 0.9, 0.12, 0.12), M(0x6a4a2a), 0, -2.9, 0, { parent: g }); }
    else if (th.stage === 'hall') { for (let k = 0; k < 3; k++) add(K(0.35, rr(0.9, 1.7), 6), platSide, (k - 1) * w * 0.28, -0.5 - 0.5, 0, { parent: g, rx: Math.PI }); }
    else { for (let k = 0; k < 4; k++) { const r = rr(0.25, 0.5); const c = add(K(r, rr(0.8, 1.9), 6), platSide, (k - 1.5) * w * 0.22, -0.6, rr(-0.5, 0.5), { parent: g, rx: Math.PI }); } }
    const s = { x0: x - w / 2, x1: x + w / 2, cx: x, w, y, solid: false, dx: 0, mesh: g };
    A.surfaces.push(s); A.platMeshes.push(g); if (id === 'stonetable' && i === 2) g.visible = false; // the Stone Table itself is the platform (built below)
  });
  if (id === 'tashbaan' || id === 'cairparavel' || id === 'harfang') { const s = A.surfaces[id === 'cairparavel' ? 2 : 3]; if (id !== 'cairparavel') { s.move = { ax: 2.5, sp: 0.5, x: s.cx }; } else { s.move = { ax: 3, sp: 0.4, x: s.cx }; } }
  A.updaters.push((t, dt) => { for (const s of A.surfaces) if (s.move) { const nx = s.move.x + Math.sin(t * s.move.sp) * s.move.ax; s.dx = nx - s.cx; s.cx = nx; s.x0 = nx - s.w / 2; s.x1 = nx + s.w / 2; s.mesh.position.x = nx; } });
  A.spawns = [-9, -5.5, -2, 2, 5.5, 9].map(x => ({ x: x * th.W / 24 * 0.66, y: 0 }));
  A.blast = { l: -hw - 15, r: hw + 15, t: 19, b: -13 };

  // ----- scenery helpers -----
  const dist = new THREE.Group(); scene.add(dist); A.procBack = dist;
  function ridge(z, base, amp, col, seed, w = 300, hscale = 1) { const r = rng(seed); const sh = new THREE.Shape(); sh.moveTo(-w / 2, -60); let y = 0; const n = 60; for (let i = 0; i <= n; i++) { const x = -w / 2 + i * w / n; y = base + (Math.sin(i * 0.31 + seed) * 0.5 + Math.sin(i * 0.77 + seed * 2) * 0.3 + r() * 0.35) * amp * hscale; sh.lineTo(x, y); } sh.lineTo(w / 2, -60); sh.closePath();
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: col, fog: true })); m.position.z = z; dist.add(m); return m; }
  const mid = new THREE.Group(); scene.add(mid);
  const P = (f) => (...a) => { const g = new THREE.Group(); mid.add(g); f(g, ...a); return g; };
  const pine = P((g, x, z, s = 1, col = 0x23472c, snow = false) => { add(C(0.2 * s, 0.3 * s, 2 * s, 6), M(0x4a3020), 0, s, 0, { parent: g }); for (let i = 0; i < 4; i++) { add(K((2.0 - i * 0.4) * s, 2.4 * s, 8), M(col, { flat: true }), 0, (2.2 + i * 1.3) * s, 0, { parent: g, cast: true }); if (snow) add(K((1.7 - i * 0.4) * s, 1.1 * s, 8), M(0xf4f8ff), 0, (2.75 + i * 1.3) * s, 0, { parent: g }); } g.position.set(x, 0, z); });
  const oak = P((g, x, z, s = 1, col = 0x3c7a30) => { add(C(0.3 * s, 0.5 * s, 3.2 * s, 7), M(0x5a3c22), 0, 1.6 * s, 0, { parent: g, cast: true }); for (const [dx, dy, r] of [[0, 4.2, 2.1], [-1.4, 3.6, 1.6], [1.4, 3.7, 1.7], [0.2, 5.2, 1.5]]) add(S(r * s, 10, 8), M(col, { flat: true }), dx * s, dy * s, rr(-0.3, 0.3), { parent: g, cast: true }); g.position.set(x, 0, z); });
  const pillar = P((g, x, z, h = 8, r = 0.8, col = 0x8a8478, broken = false) => { const m = M(col, { map: surfaceTex('stone', col, 1, h / 3), r: 0.8 }); add(B(r * 2.6, 0.6, r * 2.6), m, 0, 0.3, 0, { parent: g, cast: true }); add(C(r, r * 1.08, h, 14), m, 0, h / 2 + 0.6, 0, { parent: g, cast: true }); if (!broken) { add(B(r * 2.6, 0.6, r * 2.6), m, 0, h + 0.9, 0, { parent: g, cast: true }); } else { add(S(r * 0.9, 6, 4), m, r * 0.4, h + 0.7, 0, { parent: g }); const d = add(C(r * 0.9, r, h * 0.35, 10), m, r * 2.2, h * 0.17, 1.4, { parent: g, cast: true }); d.rotation.z = 1.4; } g.position.set(x, 0, z); });
  const tower = P((g, x, z, h = 16, w = 3.4, col = 0x8a929c, roof = 0x9a3a2a, cone = 5) => { const m = M(col, { map: surfaceTex('stone', col, w / 2, h / 4), r: 0.9 }); add(C(w, w * 1.1, h, 12), m, 0, h / 2, 0, { parent: g, cast: true }); add(C(w * 1.25, w * 1.25, 1, 12), m, 0, h + 0.3, 0, { parent: g }); add(K(w * 1.35, cone, 12), M(roof, { flat: true }), 0, h + 1.2 + cone / 2, 0, { parent: g, cast: true }); for (let i = 0; i < 3; i++) add(B(0.5, 1.1, 0.2), M(0x10141c), w * 0.0, h * (0.35 + i * 0.22), w * 1.03, { parent: g }); g.position.set(x, 0, z); });
  const wall = P((g, x, z, w = 14, h = 7, col = 0x8a8a84) => { const m = M(col, { map: surfaceTex('stone', col, w / 4, h / 3), r: 0.9 }); add(B(w, h, 2), m, 0, h / 2, 0, { parent: g, cast: true }); for (let i = 0; i < w / 2; i++) add(B(1.1, 1, 2.1), m, -w / 2 + 1 + i * 2, h + 0.5, 0, { parent: g }); g.position.set(x, 0, z); });
  const rock = P((g, x, z, s = 1, col = 0x5a5a52) => { add(new THREE.DodecahedronGeometry(s, 0), M(col, { flat: true, r: 1 }), 0, s * 0.6, 0, { parent: g, cast: true }).scale.set(1.2, 0.9, 1); g.position.set(x, 0, z); g.rotation.y = R() * 6; });
  const statue = P((g, x, z, kind = 'lion', col = 0xa4acb4) => { const m = M(col, { flat: true, r: 0.7 }); add(B(1.8, 0.8, 1.8), m, 0, 0.4, 0, { parent: g }); if (kind === 'lion') { add(new THREE.CapsuleGeometry(0.5, 1.2, 4, 8), m, 0, 1.5, 0, { parent: g, cast: true }).rotation.z = Math.PI / 2; add(S(0.55, 10, 8), m, 0.95, 1.9, 0, { parent: g }); add(S(0.8, 10, 8), m, 0.85, 1.9, 0, { parent: g }).scale.set(0.5, 1, 1); } else { add(new THREE.CapsuleGeometry(0.4, kind === 'giant' ? 2.8 : 1.5, 4, 8), m, 0, (kind === 'giant' ? 2.2 : 1.6), 0, { parent: g, cast: true }); add(S(0.34, 10, 8), m, 0, kind === 'giant' ? 4.2 : 2.9, 0, { parent: g }); if (kind === 'faun') { add(K(0.07, 0.3, 4), m, 0.12, 3.15, 0, { parent: g }); add(K(0.07, 0.3, 4), m, -0.12, 3.15, 0, { parent: g }); } add(C(0.06, 0.06, 1.4, 5), m, 0.55, 2.2, 0.1, { parent: g }); } g.position.set(x, 0, z); });
  const flames = [];
  function torch(x, y, z, col = 0xff9a3a, lightI = 14, withLight = true) { add(C(0.08, 0.12, 1.4, 6), M(0x2a1e14), x, y - 0.7, z, { parent: mid }); add(C(0.2, 0.1, 0.35, 8), M(0x3a3028, { m: 0.5 }), x, y + 0.05, z, { parent: mid }); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); sp.scale.set(1.5, 2.1, 1); sp.position.set(x, y + 0.5, z); mid.add(sp); const sp2 = sp.clone(); sp2.material = sp.material.clone(); sp2.material.color.set(0xffe090); sp2.scale.set(0.7, 1.1, 1); mid.add(sp2); const l = withLight ? pointLight(x, y + 0.6, z + 1.5, col, lightI, 18) : null; flames.push({ sp, sp2, l, ph: R() * 9, i: lightI, x, y: y + 0.5, z }); }
  A.updaters.push((t, dt) => { for (const f of flames) { const k = 1 + Math.sin(t * 11 + f.ph) * 0.12 + Math.sin(t * 23 + f.ph * 2) * 0.08; f.sp.scale.set(1.5 * k, 2.1 * k * (1 + Math.sin(t * 7 + f.ph) * 0.08), 1); f.sp2.scale.set(0.7 * k, 1.1 * k, 1); if (f.l) f.l.intensity = f.i * (0.85 + (k - 1) * 1.5); if (A.fx && Math.random() < dt * 14) A.fx.embers(f.x, f.y, f.z, 1, 0xffa040, 0.3); } });
  const sunDisc = (x, y, z, r, col, glow = 0xffffff) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({ color: col, fog: false })); m.position.set(x, y, z); dist.add(m); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow, color: glow, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); sp.scale.set(r * 5, r * 5, 1); sp.position.set(x, y, z + 0.1); dist.add(sp); return m; };
  const stars = (n, y0, y1, w = 260, z = -140) => { const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = rr(-w / 2, w / 2); p[i * 3 + 1] = rr(y0, y1); p[i * 3 + 2] = z; } g.setAttribute('position', new THREE.BufferAttribute(p, 3)); dist.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.3, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9 }))); };
  const clouds = (n, y0, y1, col = 0xffffff, op = 0.55) => { for (let i = 0; i < n; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow, color: col, transparent: true, opacity: op, depthWrite: false, fog: false })); const s = rr(14, 30); sp.scale.set(s * 2, s * 0.6, 1); sp.position.set(rr(-110, 110), rr(y0, y1), rr(-120, -80)); sp.userData.v = rr(0.1, 0.4); dist.add(sp); A.updaters.push((t, dt) => { sp.position.x += sp.userData.v * dt; if (sp.position.x > 130) sp.position.x = -130; }); } };
  const motes = (n, col, size, speed = 0.4, h = 14, area = 22, up = 1) => { const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = rr(-area, area); p[i * 3 + 1] = rr(-2, h); p[i * 3 + 2] = rr(-10, 8); } g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: col, size, transparent: true, opacity: 0.85, depthWrite: false, fog: false })); scene.add(pts);
    A.updaters.push((t, dt) => { const a = g.attributes.position; for (let i = 0; i < n; i++) { let y = a.getY(i) + up * speed * dt * (0.6 + (i % 5) * 0.2); if (y > h) y = -2; if (y < -2) y = h; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(t * 0.7 + i) * dt * 0.4); } a.needsUpdate = true; }); return pts; };
  const treeLine = (fn, n, x0, x1, z0, z1, ...a) => { for (let i = 0; i < n; i++) fn(rr(x0, x1), rr(z0, z1), ...a.map(v => typeof v === 'function' ? v() : v)); };
  const farFor = (th.sky[1]); // distant haze colour
  const haze = (c, k) => new THREE.Color(c).lerp(new THREE.Color(th.fog), k).getHex();

  // ----- arena-specific scenery -----
  const SC = {
    charn() { // the Hall of Images: long hall of columns and seated figures, dying red sun, the golden bell
      sunDisc(-40, 40, -150, 28, 0xc83a18, 0xff5a20); ridge(-130, 10, 24, haze(0x2a0c0c, 0.35), 3); ridge(-100, 4, 16, haze(0x1c0808, 0.2), 5);
      add(B(260, 90, 2), M(0x241010), 0, 20, -60, { parent: mid }); // back wall of the hall
      for (let i = -9; i <= 9; i++) { pillar(i * 9, -42, 22, 1.7, 0x6a4a4a); } for (let i = -7; i <= 7; i++) pillar(i * 7, -22, 15, 1.2, 0x7a5a58);
      for (let i = -6; i <= 6; i++) if (Math.abs(i) > 1) { const x = i * 6.4, col = [0x6a2a4a, 0x2a3a6a, 0x5a4a1a, 0x2a5a4a][(i + 6) % 4]; add(B(2.2, 0.8, 2.2), M(0x5a4848), x, 0.4, -9, { parent: mid, cast: true }); add(B(1.9, 2.8, 0.5), M(0x5a4848), x, 2.2, -9.9, { parent: mid }); add(C(0.5, 0.8, 1.8, 8), M(col), x, 1.6, -9, { parent: mid, cast: true }); add(S(0.38), M(0xc8b8a8), x, 2.8, -9, { parent: mid }); add(C(0.3, 0.26, 0.22, 8), M(0xd4a020, { m: 0.8, r: 0.3 }), x, 3.15, -9, { parent: mid }); }
      const bm = M(0xd8a828, { m: 0.9, r: 0.28 }); add(B(0.4, 7, 0.4), bm, -2.4, 3.5, -7, { parent: mid, cast: true }); add(B(0.4, 7, 0.4), bm, 2.4, 3.5, -7, { parent: mid, cast: true }); add(B(5.2, 0.4, 0.4), bm, 0, 7, -7, { parent: mid, cast: true });
      const bell = new THREE.Group(); bell.position.set(0, 6.8, -7); mid.add(bell); add(K(1.2, 2.2, 20), bm, 0, -1.6, 0, { parent: bell, cast: true }).scale.set(1, 1, 1); add(S(0.2), bm, 0, -2.9, 0, { parent: bell }); A.updaters.push((t) => { bell.rotation.z = Math.sin(t * 1.1) * 0.07; });
      torch(-14, 5, -8, 0xff6a20, 8, false); torch(14, 5, -8, 0xff6a20, 8, false); pointLight(0, 6, 5, 0xffa070, 26, 40); pointLight(-9, 4, 6, 0xffb890, 12, 24); pointLight(9, 4, 6, 0xffb890, 12, 24); motes(180, 0xff8a60, 0.2, 0.5, 18, 28);
    },
    creation() { // new valley: rolling hills, young trees, golden dawn, a lamp-post of light
      sunDisc(30, 22, -150, 16, 0xfff0c0, 0xffd890); ridge(-130, 6, 20, haze(0x7aa0b0, 0.6), 2); ridge(-95, 3, 16, haze(0x6a9a70, 0.5), 7); ridge(-62, 0, 11, haze(0x5a9a48, 0.35), 9); ridge(-40, -2, 7, haze(0x4a8a3a, 0.2), 11);
      treeLine(oak, 16, -60, 60, -30, -14, () => rr(1.1, 1.8), () => [0x3c7a30, 0x4a8a38, 0x5a9a3a][R() * 3 | 0]);
      treeLine(pine, 10, -50, 50, -22, -12, () => rr(0.9, 1.4), 0x2a6a38);
      for (let i = 0; i < 40; i++) { const f = add(S(0.12, 6, 4), glowMat([0xffe040, 0xff80c0, 0xffffff][i % 3]), rr(-45, 45), 0.12, rr(-20, -5), { parent: mid }); }
      add(C(0.1, 0.14, 8, 8), M(0x2a2a2a, { m: 0.7, r: 0.4 }), -14, 4, -9, { parent: mid, cast: true }); const lg = add(S(0.5), glowMat(0xfff0b0), -14, 8.3, -9, { parent: mid }); pointLight(-14, 8.3, -6, 0xffe8a0, 10, 22);
      motes(260, 0xffe890, 0.2, 0.6, 16, 30);
    },
    castle() { // snowy courtyard with frozen statues, towers and icicles
      ridge(-140, 8, 30, haze(0x8aa0b8, 0.6), 4); ridge(-100, 4, 22, haze(0x9ab0c8, 0.5), 8); 
      wall(-30, -24, 40, 10, 0x8e9aa8); wall(32, -24, 40, 10, 0x8e9aa8); tower(-14, -26, 22, 3.6, 0x8e9aa8, 0xdfeef8, 7); tower(16, -28, 28, 4, 0x8e9aa8, 0xdfeef8, 9); tower(-44, -28, 18, 3, 0x8e9aa8, 0xdfeef8, 6); tower(46, -26, 20, 3.2, 0x8e9aa8, 0xdfeef8, 7);
      add(B(10, 12, 2), M(0x6a7684), 1, 6, -25, { parent: mid }); add(new THREE.CylinderGeometry(2.5, 2.5, 2, 16, 1, false, 0, Math.PI).rotateX(Math.PI / 2), M(0x1a2230), 1, 9, -23.9, { parent: mid });
      statue(-16, -6, 'lion'); statue(15, -7, 'giant'); statue(-25, -9, 'faun'); statue(24, -8, 'dwarf'); statue(5, -11, 'faun');
      for (let i = 0; i < 50; i++) { const x = rr(-30, 30), h = rr(0.6, 1.8); add(K(0.14, h, 5), M(0xcfe8ff, { r: 0.2, m: 0.2, e: 0x203040 }), x, 9.5 - h / 2 + (Math.abs(x) < 6 ? 0 : -1.5), -23.8, { parent: mid, rx: Math.PI }); }
      treeLine(pine, 14, -70, 70, -45, -30, () => rr(1.4, 2.2), 0x1e3a3a, true);
      const sn = motes(520, 0xffffff, 0.14, -1.6, 22, 30, 1); torch(-6, 5.5, -9, 0x80d8ff, 7, false);
    },
    stonetable() { // dawn hilltop ringed with standing stones; the cracked table
      sunDisc(-46, 14, -150, 18, 0xfff0c0, 0xffa060); ridge(-130, 4, 22, haze(0x7a6aa0, 0.55), 3); ridge(-95, 1, 18, haze(0x7a8a70, 0.5), 5); ridge(-60, -2, 12, haze(0x5a7a40, 0.35), 8);
      for (let i = 0; i < 12; i++) { const x = -34 + i * 6.2 + rr(-1, 1), h = rr(5, 9); add(B(rr(1.6, 2.4), h, 1.4), M(0xffffff, { map: surfaceTex('slab', 0x9a9ca2, 1, 2), flat: true, r: 0.95 }), x, h / 2 - 0.4, rr(-18, -10), { parent: mid, cast: true, ry: rr(-0.3, 0.3) }); }
      treeLine(pine, 20, -80, 80, -48, -28, () => rr(1.5, 2.4), 0x2f5a2a); treeLine(oak, 6, -60, 60, -30, -22, 1.5, 0x4a8a38);
      // the Stone Table: two slabs and a crack, on the low central platform
      const tm = M(0xffffff, { map: surfaceTex('slab', 0x8e9096, 1, 1), flat: true, r: 0.92 });
      add(B(2.3, 2.4, 3.2), tm, -1.17, 1.2, 0, { parent: scene, cast: true, recv: true, rz: 0.012 }); add(B(2.25, 2.3, 3.2), tm, 1.17, 1.15, 0, { parent: scene, cast: true, recv: true, rz: -0.02 }); add(B(0.1, 2.4, 3.1), M(0x050507), 0, 1.2, 0, { parent: scene });
      add(B(5.4, 0.28, 3.7), tm, 0, 0.14, 0, { parent: scene, recv: true }); add(B(0.5, 0.18, 0.9), tm, -2.2, 2.46, 0.6, { parent: scene, rz: 0.2 }); // plinth and a chipped fragment
      for (let i = 0; i < 5; i++) add(B(0.22, 0.04, 0.5), glowMat(0xffd070), -1.9 + i * 0.95, 2.43, 1.2, { parent: scene }); // carved runes
      motes(200, 0xffe0a0, 0.16, 0.3, 10, 26);
    },
    tashbaan() { // sunny Calormene courtyard: domes, minarets, arches, palms
      ridge(-120, 6, 18, haze(0xc8a878, 0.55), 6); const dm = (x, z, r, col) => { add(S(r, 20, 12, ), M(col, { m: 0.3, r: 0.5 }), x, 12 + r * 0.2, z, { parent: mid, cast: true }).scale.y = 0.9; add(C(r * 0.9, r, 11, 16), M(0xe8d4a8, { map: surfaceTex('stone', 0xe8d4a8, r / 2, 3) }), x, 5.5, z, { parent: mid, cast: true }); add(K(0.25, 3, 6), M(0xd8aa20, { m: 0.8, r: 0.3 }), x, 12 + r + 1.5, z, { parent: mid }); };
      dm(-22, -36, 6, 0x2a6aa8); dm(6, -42, 8, 0xa83a2a); dm(34, -34, 5.5, 0x2a8a6a); dm(-50, -40, 5, 0x6a3aa8); dm(56, -44, 6, 0x2a6aa8);
      for (const x of [-32, -10, 18, 44]) { add(C(0.9, 1.1, 24, 10), M(0xe8d4a8), x, 12, -28, { parent: mid, cast: true }); add(C(1.5, 0.9, 1, 10), M(0xd8aa20, { m: 0.6 }), x, 24.5, -28, { parent: mid }); add(K(1.1, 3, 10), M(0x2a6aa8), x, 26.5, -28, { parent: mid }); }
      wall(-10, -22, 90, 7, 0xd8c498); for (let i = -4; i <= 4; i++) { add(B(2.6, 4.6, 0.5), M(0x3a2a1a), i * 9, 2.3, -20.9, { parent: mid }); add(new THREE.CylinderGeometry(1.3, 1.3, 0.5, 14, 1, false, 0, Math.PI).rotateX(Math.PI / 2), M(0x3a2a1a), i * 9, 4.6, -20.9, { parent: mid }); }
      const palm = P((g, x, z, s = 1) => { const t = add(C(0.25 * s, 0.4 * s, 7 * s, 7), M(0x7a5a38), 0, 3.5 * s, 0, { parent: g, cast: true }); t.rotation.z = 0.12; for (let i = 0; i < 7; i++) { const l = add(K(0.4 * s, 4 * s, 4), M(0x3a8a3a, { flat: true }), 0.8 * s + Math.cos(i * 0.9) * 0.5, 7 * s, Math.sin(i * 0.9) * 0.9, { parent: g, cast: true }); l.rotation.set(Math.sin(i * 0.9) * 1.1, 0, -1.2 + Math.cos(i * 0.9) * 0.3); } g.position.set(x, 0, z); });
      for (const x of [-18, -4, 20, 34]) palm(x, rr(-14, -9), rr(0.9, 1.3));
      for (const x of [-20, 0, 24]) { add(C(0.04, 0.04, 6, 4), M(0x3a2a1a), x, 5, -12, { parent: mid }); const f = add(B(1.6, 2.6, 0.04), M([0xa82a2a, 0x2a4aa8, 0xd8aa20][((x + 20) / 20 | 0) % 3]), x + 0.9, 6, -12, { parent: mid }); A.updaters.push((t) => { f.rotation.y = Math.sin(t * 2 + x) * 0.2; }); }
    },
    anvard() { // gates and walls of Anvard, forests and mountains behind
      ridge(-140, 14, 36, haze(0x6a7a96, 0.6), 2); ridge(-105, 8, 26, haze(0x5a6a80, 0.5), 4); ridge(-70, 2, 14, haze(0x2f4a38, 0.4), 6);
      wall(-30, -24, 38, 11, 0x8a8a84); wall(36, -24, 40, 11, 0x8a8a84); tower(-12, -23, 20, 3.6, 0x8a8a84, 0x7a3a2a, 5); tower(14, -23, 20, 3.6, 0x8a8a84, 0x7a3a2a, 5); wall(1, -22, 14, 17, 0x7a7a74);
      add(B(7, 9, 1), M(0x120e0a), 1, 4.5, -20.8, { parent: mid }); add(new THREE.CylinderGeometry(3.5, 3.5, 1, 16, 1, false, 0, Math.PI).rotateX(Math.PI / 2), M(0x120e0a), 1, 9, -20.8, { parent: mid }); for (let i = -3; i <= 3; i++) add(B(0.12, 11, 0.12), M(0x3a3a3a, { m: 0.8 }), 1 + i, 5, -20.2, { parent: mid });
      for (const x of [-8, 10]) { add(C(0.05, 0.05, 8, 4), M(0x3a2a1a), x, 14, -21.5, { parent: mid }); const f = add(B(2, 5, 0.05), M(0xc02a2a), x, 13, -21.5, { parent: mid }); A.updaters.push((t) => { f.rotation.y = Math.sin(t * 1.7 + x) * 0.18; }); }
      treeLine(pine, 24, -85, 85, -55, -30, () => rr(1.6, 2.6), 0x23472c); treeLine(oak, 8, -60, 60, -16, -10, 1.3, 0x3c7a30);
      for (let i = 0; i < 6; i++) rock(rr(-40, 40), rr(-14, -8), rr(0.6, 1.4));
      for (const x of [-14, 20]) torch(x, 3.6, -9, 0xffa040, 6, false);
    },
    aslanshow() { // torchlit chamber inside the Hill, with the broken Stone Table
      add(B(220, 70, 2), M(0x241a12, { map: surfaceTex('rock', 0x4a3a2c, 14, 4) }), 0, 25, -26, { parent: mid, recv: true }); add(B(2, 70, 70), M(0x1a1410), -60, 25, -30, { parent: mid }); add(B(2, 70, 70), M(0x1a1410), 60, 25, -30, { parent: mid });
      for (let i = 0; i < 60; i++) { const h = rr(2, 9), x = rr(-70, 70); add(K(rr(0.4, 1.2), h, 6), M(0x2a2018, { flat: true }), x, 30 - h / 2 + rr(0, 6), rr(-30, -8), { parent: mid, rx: Math.PI }); }
      for (let i = 0; i < 9; i++) { const x = -48 + i * 12, h = rr(8, 14); add(C(1.4, 2, h, 8), M(0x3a3028, { flat: true }), x, h / 2, rr(-20, -16), { parent: mid, cast: true }); }
      for (let i = 0; i < 12; i++) add(B(1.4, 0.06, 0.06), glowMat(0xd8a040), -26 + i * 1.5, 12 + Math.sin(i) * 0.8, -25, { parent: mid }); // faint carved runes
      const tm = M(0x6a6258, { map: surfaceTex('rock', 0x6a6258, 1, 1), flat: true }); add(B(3.4, 1.4, 3), tm, -2.8, 0.7, -8, { parent: mid, cast: true, rz: 0.1 }); add(B(3.4, 1.0, 3), tm, 2.6, 0.5, -8, { parent: mid, cast: true, rz: -0.12 }); add(B(0.12, 1.4, 3), glowMat(0xffc060), 0, 0.7, -8, { parent: mid });
      for (const x of [-30, -18, 16, 28]) torch(x, 6, -14, 0xff8a30, 18); torch(-9, 4, -4, 0xff8a30, 8, false); torch(9, 4, -4, 0xff8a30, 8, false); motes(140, 0xffb060, 0.14, 0.4, 14, 26);
    },
    cairparavel() { // ruined hall by the sea, orchard, sunset
      sunDisc(26, 6, -150, 15, 0xffe0a0, 0xff9a50); const sea = add(B(400, 1, 200), M(0x2a6a9a, { r: 0.25, m: 0.15 }), 0, -6, -100, { parent: dist }); ridge(-120, -4, 5, haze(0x4a6a8a, 0.6), 3, 400);
      for (let i = 0; i < 10; i++) pillar(-36 + i * 8, rr(-22, -14), rr(7, 12), 0.9, 0xd0c4b0, R() < 0.5);
      const arch = P((g, x, z) => { const m = M(0xd0c4b0, { map: surfaceTex('stone', 0xd0c4b0, 1, 3) }); add(B(1.6, 12, 1.6), m, -4, 6, 0, { parent: g, cast: true }); add(B(1.6, 12, 1.6), m, 4, 6, 0, { parent: g, cast: true }); add(new THREE.TorusGeometry(4, 0.8, 8, 16, Math.PI), m, 0, 12, 0, { parent: g, cast: true }); g.position.set(x, 0, z); });
      arch(-2, -26); arch(22, -30); add(B(10, 6, 2), M(0xc0b4a0), -26, 3, -26, { parent: mid, rz: 0.05 });
      const apple = P((g, x, z, s = 1) => { add(C(0.25 * s, 0.4 * s, 3 * s, 7), M(0x5a3c22), 0, 1.5 * s, 0, { parent: g, cast: true }); add(S(2.1 * s, 10, 8), M(0x4a8a38, { flat: true }), 0, 4 * s, 0, { parent: g, cast: true }); for (let i = 0; i < 10; i++) add(S(0.16 * s, 6, 4), glowMat(0xd02a2a), Math.cos(i * 1.7) * 1.7 * s, 4 * s + Math.sin(i * 2.3) * 1.2 * s, 1.5 * s, { parent: g }); g.position.set(x, 0, z); });
      apple(-20, -9, 1.2); apple(18, -11, 1); apple(34, -14, 1.3); for (let i = 0; i < 12; i++) rock(rr(-40, 40), rr(-12, -7), rr(0.4, 1.0), 0xb0a490);
      const waves = []; for (let i = 0; i < 12; i++) { const w = add(B(rr(8, 20), 0.15, 0.4), M(0xffffff, { op: 0.4, t: true }), rr(-80, 80), -5.4, rr(-90, -40), { parent: dist }); waves.push(w); } A.updaters.push((t) => { waves.forEach((w, i) => { w.position.x += Math.sin(t * 0.3 + i) * 0.02; w.material.opacity = 0.2 + 0.25 * Math.sin(t + i); }); });
      motes(120, 0xffd8a0, 0.14, 0.3, 12, 26);
    },
    dawntreader() { // on the deck of the ship: mast, purple sail, dragon prow, open sea
      A.noFloorGround = true; const sea = new THREE.Mesh(new THREE.PlaneGeometry(500, 300, 70, 40).rotateX(-Math.PI / 2), M(0x1f7ab4, { r: 0.25, m: 0.2, flat: true })); sea.position.set(0, -9, -60); sea.receiveShadow = true; scene.add(sea); const base = sea.geometry.attributes.position.array.slice();
      A.updaters.push((t) => { const p = sea.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, Math.sin(base[i * 3] * 0.09 + t * 1.2) * 0.7 + Math.cos(base[i * 3 + 2] * 0.12 + t * 0.9) * 0.6); p.needsUpdate = true; sea.geometry.computeVertexNormals(); });
      clouds(14, 14, 50); sunDisc(40, 36, -150, 12, 0xfffbe0, 0xfff0b0); ridge(-130, -8, 5, haze(0x6aa0c8, 0.6), 4, 500);
      const wood = M(0x6a4020, { map: surfaceTex('wood', 0x7a4c28, 2, 4) }), gold = M(0xd8a828, { m: 0.8, r: 0.3 });
      add(C(0.5, 0.7, 30, 10), wood, -2, 15, -3, { parent: mid, cast: true }); add(C(0.2, 0.2, 18, 8), wood, -2, 22, -2.8, { parent: mid, cast: true }).rotation.z = Math.PI / 2;
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(16, 12, 16, 8), new THREE.MeshStandardMaterial({ color: 0x7a3aa8, roughness: 0.9, side: THREE.DoubleSide })); sail.position.set(-2, 15.5, -2.2); sail.castShadow = true; mid.add(sail);
      const em = add(new THREE.CircleGeometry(3, 24), new THREE.MeshStandardMaterial({ color: 0xe0b020, emissive: 0x403000, side: THREE.DoubleSide }), -2, 15.5, -2.0, { parent: mid });
      A.updaters.push((t) => { const p = sail.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 0.35 + t * 1.6) * 0.3 + 1.1 * (1 - Math.abs(p.getX(i)) / 8)); p.needsUpdate = true; em.position.z = -2.0 + 1.1; });
      for (let i = -2; i <= 2; i++) { const r = add(C(0.03, 0.03, 40, 4), M(0x3a2a1a), -2 + i * 5, 14, -2, { parent: mid }); r.rotation.z = i * 0.35; }
      const prow = new THREE.Group(); prow.position.set(hw + 1.5, 0, 0); mid.add(prow); add(C(0.7, 1.3, 7, 8), gold, 2, 2.5, 0, { parent: prow, cast: true, rz: -0.9 }); add(K(1.1, 3, 8), gold, 5.2, 6, 0, { parent: prow, cast: true, rz: -Math.PI / 2 - 0.3 }); add(S(0.15), glowMat(0xff3030), 5.2, 6.5, 0.9, { parent: prow });
      add(B(5, 3.4, depth), wood, -hw - 1.5, 1.7, 0, { parent: mid, cast: true, recv: true }); add(K(1.2, 5, 8), gold, -hw - 4, 4.5, 0, { parent: mid, rz: 0.9 });
      for (const [x, z] of [[-5, -2.3], [8, 2.2]]) { add(C(0.7, 0.7, 1.3, 12), M(0x7a4a22, { map: surfaceTex('wood', 0x7a4a22, 2, 1) }), x, 0.65, z, { parent: mid, cast: true }); }
      motes(160, 0xffffff, 0.12, 0.6, 7, 26);
    },
    dragonisland() { // misty valley, craggy rocks, the cave and its gold
      ridge(-130, 14, 30, haze(0x3a4a50, 0.6), 7); ridge(-95, 6, 24, haze(0x344044, 0.5), 3); ridge(-60, 0, 16, haze(0x2a3236, 0.4), 5);
      for (let i = 0; i < 14; i++) rock(rr(-60, 60), rr(-40, -14), rr(2, 6), 0x4a4a42);
      add(S(10, 16, 10), M(0x2a2a26, { flat: true }), 0, 2, -22, { parent: mid, cast: true }).scale.set(1.6, 1.4, 0.8); add(S(4.2, 14, 10, ), M(0x040404), 0, 3.6, -14.6, { parent: mid }).scale.set(1.2, 1.1, 0.3);
      const gm = M(0xffc830, { m: 0.9, r: 0.25, e: 0x604000, ei: 0.6, map: surfaceTex('gold', 0xe0a820, 2, 1) }); for (let i = 0; i < 26; i++) add(S(rr(0.4, 1.2), 8, 6), gm, rr(-6, 6), rr(0.1, 0.5) + (1 - Math.abs(i - 13) / 13) * 1.8, rr(-14, -7), { parent: mid, cast: true });
      for (let i = 0; i < 40; i++) add(C(0.2, 0.2, 0.05, 8), gm, rr(-8, 8), rr(0.2, 2), rr(-13, -6), { parent: mid });
      pointLight(0, 3, -9, 0xffc040, 10, 18); for (let i = 0; i < 6; i++) { const x = rr(-28, 28), h = rr(1.2, 2.4); add(C(0.2, 0.28, h, 5), M(0xd8d0b0), x, h / 2, rr(-16, -10), { parent: mid, rz: rr(-0.3, 0.3) }); }
      add(B(300, 14, 1), new THREE.MeshBasicMaterial({ color: 0x8aa0a0, transparent: true, opacity: 0.28, fog: false }), 0, 4, -4, { parent: mid }); // low mist
      motes(240, 0xc8e0e0, 0.2, 0.25, 10, 30, 0.4); motes(60, 0xffd860, 0.14, 0.3, 6, 10, 0.5);
    },
    harfang() { // the giants' great hall: huge hearth fire, giant pillars, giant table
      add(B(260, 80, 2), M(0x3a2c20, { map: surfaceTex('stone', 0x6a5a48, 24, 8) }), 0, 30, -40, { parent: mid, recv: true });
      for (let i = -3; i <= 3; i++) pillar(i * 16, -26, 34, 3, 0x6a5a48); for (let i = -2; i <= 2; i++) { add(B(1, 8, 0.4), M(0x7a1a1a), i * 16 + 8, 22, -23.5, { parent: mid }); }
      add(B(30, 26, 4), M(0x2a2018, { map: surfaceTex('stone', 0x5a4a3c, 10, 6) }), 0, 13, -36, { parent: mid }); add(B(18, 14, 2), M(0x080402), 0, 8, -33.8, { parent: mid });
      const fire = []; for (let i = 0; i < 16; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow, color: [0xff6a1a, 0xffa030, 0xffd060][i % 3], transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); sp.position.set(rr(-6, 6), rr(2, 6), -33.5); sp.userData = { ph: R() * 9, bx: sp.position.x }; mid.add(sp); fire.push(sp); }
      A.updaters.push((t, dt) => { for (const s of fire) { const k = 6 + Math.sin(t * 9 + s.userData.ph) * 1.4; s.scale.set(k, k * 1.5, 1); s.position.y = 4 + Math.sin(t * 6 + s.userData.ph) * 1.2; s.position.x = s.userData.bx + Math.sin(t * 3 + s.userData.ph) * 0.7; } if (A.fx && Math.random() < dt * 40) A.fx.embers(rr(-6, 6), 2, -30, 1, 0xff9a30, 4); });
      pointLight(0, 6, -26, 0xff7a2a, 40, 60); pointLight(-16, 8, -6, 0xff9a40, 10, 30); pointLight(16, 8, -6, 0xff9a40, 10, 30);
      const tb = M(0x5a3a22, { map: surfaceTex('wood', 0x6a4426, 4, 1) }); add(B(60, 2, 9), tb, 0, 9, -16, { parent: mid, cast: true }); for (const x of [-26, 26]) add(B(3, 9, 3), tb, x, 4.5, -16, { parent: mid, cast: true });
      for (const [x, c] of [[-14, 0xc8c8d0], [4, 0xd8b848], [16, 0xa03a2a]]) { add(C(1, 0.8, 1.6, 12), M(c, { m: 0.6, r: 0.4 }), x, 10.8, -16, { parent: mid }); }
      motes(160, 0xff9a40, 0.18, 0.7, 16, 28);
    },
    underland() { // dark cavern under the earth: stalactites, glowing fungi, lamps, black sea, the Silver Chair
      add(B(260, 70, 2), M(0x14141a, { map: surfaceTex('rock', 0x2a2a32, 20, 6) }), 0, 20, -42, { parent: mid });
      for (let i = 0; i < 80; i++) { const h = rr(3, 16); add(K(rr(0.5, 1.8), h, 6), M(0x2a2a32, { flat: true }), rr(-80, 80), 28 - h / 2, rr(-40, -6), { parent: mid, rx: Math.PI }); }
      for (let i = 0; i < 30; i++) { const h = rr(2, 9); add(K(rr(0.6, 1.6), h, 6), M(0x1e1e24, { flat: true }), rr(-80, 80), h / 2 - 2, rr(-40, -12), { parent: mid }); }
      add(B(400, 1, 200), M(0x06141e, { r: 0.15, m: 0.4 }), 0, -9, -60, { parent: dist });
      const cols = [0x60ffa0, 0x60d0ff, 0xc080ff]; for (let i = 0; i < 38; i++) { const x = rr(-46, 46), z = rr(-22, -3), s = rr(0.3, 0.9), c = cols[i % 3]; add(C(0.06, 0.08, s * 1.4, 5), M(0xd0e0c0), x, s * 0.7, z, { parent: mid }); add(S(s, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(c, { e: c, ei: 1.5 }), x, s * 1.4, z, { parent: mid }); if (i % 6 === 0) pointLight(x, s * 1.4 + 0.5, z + 1, c, 3, 9); }
      for (const x of [-26, -12, 14, 28]) torch(x, 4.2, -9, 0xffb050, 9, true);
      add(B(5, 1.2, 4), M(0x3a3a42, { flat: true }), 0, 0.6, -10, { parent: mid, cast: true }); const sv = M(0xdde2ea, { m: 0.95, r: 0.2 }); add(B(1.6, 0.2, 1.4), sv, 0, 2, -10.4, { parent: mid, cast: true }); add(B(1.6, 2.2, 0.15), sv, 0, 3.2, -11.1, { parent: mid, cast: true }); for (const sx of [-0.7, 0.7]) for (const sz of [-9.7, -11]) add(C(0.06, 0.06, 0.8, 6), sv, sx, 1.5, sz, { parent: mid });
      pointLight(0, 5, -9, 0xc0d8ff, 6, 14); motes(280, 0x80ffb0, 0.1, 0.25, 18, 30);
    },
    stablehill() { // night hill: the stable, a great bonfire, stars, dark pines
      stars(220, 20, 130); sunDisc(-52, 52, -150, 7, 0xe8f0ff, 0xaac8ff); ridge(-120, 6, 26, haze(0x101830, 0.5), 5); ridge(-80, 2, 18, haze(0x0c1424, 0.3), 9);
      treeLine(pine, 26, -90, 90, -50, -20, () => rr(1.6, 2.8), 0x142a22);
      const wd = M(0x4a3420, { map: surfaceTex('wood', 0x5a3c22, 3, 2) }); add(B(14, 8, 8), wd, 20, 4, -14, { parent: mid, cast: true }); const rf = add(K(10.5, 5, 4), M(0x3a2a18, { flat: true }), 20, 10.5, -14, { parent: mid, cast: true }); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, 0.8); add(B(4, 5, 0.3), M(0x120a04), 20, 2.5, -9.9, { parent: mid });
      add(C(0.1, 0.1, 6, 5), M(0x3a2a1a), 12, 8, -12, { parent: mid }); const lan = add(S(0.35), glowMat(0xffd080), 12, 10.9, -12, { parent: mid }); pointLight(12, 10.5, -10, 0xffc070, 8, 16);
      for (let i = 0; i < 9; i++) { const l = add(C(0.25, 0.35, 5, 6), M(0x3a2410), -14 + Math.cos(i * 0.7) * 2.2, 2.2, -8 + Math.sin(i * 0.7) * 1.4, { parent: mid, cast: true }); l.rotation.z = (i - 4) * 0.1; l.rotation.x = Math.PI / 2 - 1.1; }
      for (let i = 0; i < 4; i++) torch(-14, 1.4 + i * 0.1, -8, 0xff7a20, 0, false); torch(-14, 2.4, -8, 0xff6a1a, 60, true); pointLight(-14, 4, 3, 0xff7030, 20, 36);
      for (let i = 0; i < 40; i++) A.updaters.push(() => {}); motes(200, 0xff9a40, 0.2, 1.2, 18, 20); for (let i = 0; i < 8; i++) rock(rr(-40, 40), rr(-14, -6), rr(0.5, 1.2), 0x3a3228);
    },
    aslanscountry() { // bright golden land: meadows, mountains, waterfall, fruit trees
      sunDisc(26, 40, -150, 20, 0xffffff, 0xfff0a0); clouds(10, 20, 60, 0xffffff, 0.6); ridge(-135, 20, 46, haze(0xc8d8f0, 0.7), 8); ridge(-105, 10, 32, haze(0x9ac8e8, 0.55), 3); ridge(-75, 3, 18, haze(0x8ac860, 0.4), 6); ridge(-48, -1, 9, haze(0x70b850, 0.25), 2);
      const wf = add(B(5, 36, 0.4), new THREE.MeshBasicMaterial({ color: 0xd8f4ff, transparent: true, opacity: 0.7, fog: true }), -36, 20, -100, { parent: dist }); A.updaters.push((t) => { wf.material.opacity = 0.55 + Math.sin(t * 3) * 0.1; });
      treeLine(oak, 16, -60, 60, -30, -12, () => rr(1.2, 2), () => [0x5aa83a, 0x78c048, 0x9ad060][R() * 3 | 0]);
      const golden = P((g, x, z, s = 1) => { add(C(0.3 * s, 0.5 * s, 4 * s, 8), M(0xb08a40), 0, 2 * s, 0, { parent: g, cast: true }); add(S(2.4 * s, 12, 8), M(0xf0c850, { e: 0x604800, ei: 0.5, flat: true }), 0, 5.2 * s, 0, { parent: g, cast: true }); for (let i = 0; i < 9; i++) add(S(0.2 * s, 6, 4), glowMat(0xffe880), Math.cos(i * 2.1) * 2 * s, 5.2 * s + Math.sin(i * 1.7) * 1.4 * s, Math.sin(i * 2.1) * 1 * s + 1.4 * s, { parent: g }); g.position.set(x, 0, z); }); golden(-22, -10, 1.4); golden(24, -12, 1.2);
      for (let i = 0; i < 70; i++) add(S(0.14, 6, 4), glowMat([0xffffff, 0xffe060, 0xffa0d0, 0xa0d0ff][i % 4]), rr(-50, 50), 0.14, rr(-24, -5), { parent: mid });
      motes(300, 0xfff2a0, 0.2, 0.7, 20, 32);
    },
  };
  SC[id]();
  // ground beyond the stage for 'ground'/'hall' styles gets fog-fade floor
  if (th.stage === 'ground' || th.stage === 'hall') { const fl = add(new THREE.PlaneGeometry(500, 120).rotateX(-Math.PI / 2), M(th.tex === 'grass' || th.tex === 'snow' || th.tex === 'sand' ? th.col : th.rock, { r: 1 }), 0, -9, -70, { parent: under, recv: true }); fl.material.map = null; }
  // ---- optional Narnia Game Art layers ----
  A.loadArt = async (manifest, texLoader) => {
    const info = manifest?.arenas?.[id]; if (!info) return false; let used = false; const load = (u) => tracked(new Promise(res => texLoader.load(assetUrl(u), t => { t.colorSpace = THREE.SRGBColorSpace; res(t); }, undefined, () => res(null))));
    const mk = (tex, z, h, y, order, op = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(h * 3840 / 1080, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false, depthWrite: false, ...op })); m.position.set(0, y, z); m.renderOrder = order; scene.add(m); return m; };
    if (info.back) { const t = await load(info.back); if (t) { mk(t, -120, 110, 28, -30); dist.visible = false; used = true; } }
    if (info.mid) { const t = await load(info.mid); if (t) { mk(t, -45, 58, 13, -20); mid.visible = false; used = true; } }
    if (info.front) { const t = await load(info.front); if (t) { mk(t, 6, 15, 3, 25); used = true; } }
    if (info.platform) { const t = await load(info.platform); if (t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); platMat.map = t; platMat.color.set(0xffffff); platMat.needsUpdate = true; used = true; } }
    return used;
  };
  A.update = (t, dt) => { for (const u of A.updaters) u(t, dt); };
  A.under = under; return A;
}


// ---------------------------------------------------------------------------------------------------------------------
// Art-only stage: used automatically for any arena folder with back/mid/front/platform.png. No procedural scenery at all.
// Every layer is 3840x1080 drawn at one scale (PXM art px per world unit); world y = 0 is the platform tile's surface row.
// ---------------------------------------------------------------------------------------------------------------------
const PXM = 118, ART_W = 3840 / PXM, ART_H = 1080 / PXM;
function edgeMask() { // soft rounded ends and a tapering underside for the thin floating slices (alphaMap reads green)
  const c = document.createElement('canvas'); c.width = 128; c.height = 32; const g = c.getContext('2d'), im = g.createImageData(128, 32);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 128; x++) { const ex = Math.min(x, 127 - x) / 14, ey = (31 - y) / 12, v = Math.max(0, Math.min(1, Math.min(ex, 1) * Math.min(1, ey + 0.15) * (0.55 + 0.45 * Math.min(1, ex * 1.5)))); const o = (y * 128 + x) * 4; im.data[o] = im.data[o + 1] = im.data[o + 2] = v * 255; im.data[o + 3] = 255; }
  g.putImageData(im, 0, 0); return c;
}
function buildArtArena(A, th, scene, info) {
  const surfaceRow = info.surfaceRow ?? 10, R0 = 915 + surfaceRow;           // art row of the walking surface
  const yOf = (row) => (R0 - row) / PXM;                                   // art row -> world y
  const W = 29, hw = W / 2; A.W = W; A.halfW = hw; A.artArena = true; A.groundFrac = 0.8; A.artHalfW = ART_W / 2;
  const col = (a) => new THREE.Color(...a);
  const tint = col(info.tint || [0.5, 0.5, 0.5]); const mx = Math.max(tint.r, tint.g, tint.b, 0.01);
  // colour grade for painted fighters: pull a little of the arena's overall colour in, and a rim in the sun colour
  const lum = 0.2126 * tint.r + 0.7152 * tint.g + 0.0722 * tint.b, dark = Math.max(0, Math.min(1, (0.3 - lum) / 0.2)); // 0 = bright arena, 1 = very dark (Underland, Charn)
  const gt = new THREE.Color(1, 1, 1).lerp(new THREE.Color(tint.r / mx, tint.g / mx, tint.b / mx), 0.38 - 0.18 * dark); gt.multiplyScalar(0.96 + 0.26 * dark);   // dark arenas: lift the fighters so they stay readable
  const rimC = new THREE.Color(th.sun[0]).lerp(new THREE.Color(1, 1, 1), 0.25 + 0.3 * dark).multiplyScalar(0.75 + 0.6 * dark);
  A.grade = { tint: gt, rim: rimC, side: Math.sign(th.sun[2][0] || -1), rimOp: 0.8 + 0.2 * dark, dark };
  scene.background = col(info.topColor || [0.1, 0.1, 0.12]).multiplyScalar(0.7);
  A.spawns = [-5, -3, -1, 1, 3, 5].map(x => ({ x, y: 0 }));
  A.blast = { l: -hw - 7, r: hw + 7, t: 15, b: -11 };
  A.surfaces.push({ x0: -hw, x1: hw, cx: 0, w: W, y: 0, solid: true, bottom: -9, dx: 0 });
  // thin floating platforms (slices of platform.png), kept clear of the centre landmark
  const plats = [[-5.7, 3.3, 3.8], [5.7, 3.3, 3.8]];
  for (const [x, y, w] of plats) A.surfaces.push({ x0: x - w / 2, x1: x + w / 2, cx: x, w, y, solid: false, dx: 0 });
  A.platMeshes = []; A.updaters = A.updaters || []; A.under = null;
  const layers = []; // { mesh, Z (depth behind world plane; negative = in front), X, Y (intended world centre), par }
  const tl = new THREE.TextureLoader();
  const load = (p) => tracked(new Promise(res => tl.load(assetUrl(p), t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }, undefined, () => res(null))));
  const basic = (tex, o = {}) => new THREE.MeshBasicMaterial({ map: tex, transparent: o.opaque ? false : true, depthWrite: false, fog: false, toneMapped: false, side: THREE.DoubleSide, color: o.color ?? 0xffffff });
  const addLayer = (mesh, Z, X, Y, order, par = 0) => { mesh.renderOrder = order; mesh.frustumCulled = false; mesh.visible = false; scene.add(mesh); layers.push({ mesh, Z, X, Y, par }); return mesh; };
  A.loadArt = async () => {
    const [back, mid, front, plat] = await Promise.all([load(info.back), info.mid ? load(info.mid) : null, info.front ? load(info.front) : null, load(info.platform)]);
    if (!back || !plat) return false;
    if (plat.image.width !== 1024) { const pc = document.createElement('canvas'); pc.width = 1024; pc.height = 256; const pg = pc.getContext('2d'); pg.imageSmoothingQuality = 'high'; pg.drawImage(plat.image, 0, 0, 1024, 256); plat.userData.full = pc; }
    const platImg = plat.userData.full || plat.image;
    const full = new THREE.PlaneGeometry(ART_W, ART_H), cy = yOf(540);
    // sky/edge extension above the painting: its top row, stretched upward
    { const c = document.createElement('canvas'); c.width = 1024; c.height = 2; const g = c.getContext('2d'); g.drawImage(back.image, 0, 0, back.image.width, 2, 0, 0, 1024, 2); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      addLayer(new THREE.Mesh(new THREE.PlaneGeometry(ART_W * 1.2, 14), basic(t, { opaque: true })), 4, 0, yOf(0) + 7 - 0.05, -31, 0.08); }
    addLayer(new THREE.Mesh(full, basic(back, { opaque: true })), 4, 0, cy, -30, 0.08);
    if (mid) addLayer(new THREE.Mesh(full, basic(mid)), 2.5, 0, cy, -20, 0.03);
    // dark body below the ground tile (fade), then the tile itself repeated along the stage
    { // body below the tile: starts at the tile's own bottom colour, fades to near-black (never a procedural dirt texture)
      const sc = document.createElement('canvas'); sc.width = 8; sc.height = 1; const sg = sc.getContext('2d'); sg.drawImage(platImg, 0, platImg.height - 24, platImg.width, 24, 0, 0, 8, 1); const px = sg.getImageData(0, 0, 8, 1).data; let r = 0, gg = 0, b = 0; for (let i = 0; i < 8; i++) { r += px[i * 4]; gg += px[i * 4 + 1]; b += px[i * 4 + 2]; } r /= 8; gg /= 8; b /= 8;
      const c = document.createElement('canvas'); c.width = 4; c.height = 64; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 64);
      gr.addColorStop(0, `rgb(${r * 0.42 | 0},${gg * 0.42 | 0},${b * 0.42 | 0})`); gr.addColorStop(0.25, `rgb(${r * 0.16 | 0},${gg * 0.16 | 0},${b * 0.16 | 0})`); gr.addColorStop(0.6, '#070606'); gr.addColorStop(1, '#030303'); g.fillStyle = gr; g.fillRect(0, 0, 4, 64);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const tileBottom = surfaceRow / PXM - 256 / PXM + 0.12;
      addLayer(new THREE.Mesh(new THREE.PlaneGeometry(ART_W * 1.6, 5), basic(t, { opaque: true })), 1.2, 0, tileBottom - 2.5, -12, 0); }
    const tw = 1024 / PXM, tH = 256 / PXM, g1 = plat.clone(); g1.needsUpdate = true; g1.wrapS = THREE.RepeatWrapping; g1.repeat.set(W / tw, 1); g1.offset.x = 0;
    addLayer(new THREE.Mesh(new THREE.PlaneGeometry(W, tH), basic(g1)), 1.2, 0, surfaceRow / PXM - tH / 2, -10, 0);
    // floating ledges: a solid slice of platform.png (opaque body, the tile's own top edge, rounded corners, darker underside) plus a soft shadow under it
    for (const [x, y, w] of plats) {
      const rows = 92, top = Math.max(0, surfaceRow - 8), pw = Math.round(w * PXM), c = document.createElement('canvas'); c.width = pw; c.height = rows; const g = c.getContext('2d');
      const sc = document.createElement('canvas'); sc.width = 4; sc.height = 1; const sg = sc.getContext('2d'); sg.drawImage(platImg, 0, surfaceRow + 30, platImg.width, 40, 0, 0, 4, 1); const bp = sg.getImageData(0, 0, 4, 1).data;
      const R = 14, topY = surfaceRow - top - 5; g.save(); g.beginPath(); g.moveTo(8, topY); g.lineTo(pw - 8, topY); g.quadraticCurveTo(pw, topY, pw, topY + 8); g.lineTo(pw, rows - R); g.quadraticCurveTo(pw, rows, pw - R, rows); g.lineTo(R, rows); g.quadraticCurveTo(0, rows, 0, rows - R); g.lineTo(0, topY + 8); g.quadraticCurveTo(0, topY, 8, topY); g.closePath(); g.clip();
      g.fillStyle = `rgb(${bp[0]},${bp[1]},${bp[2]})`; g.fillRect(0, topY + 6, pw, rows);       // opaque body colour taken from the tile itself
      const off = Math.round(((x + hw) * PXM) % 1024); for (let dx = -off; dx < pw; dx += 1024) g.drawImage(platImg, 0, top, 1024, rows, dx, 0, 1024, rows);   // the tile's own texture and top edge on top
      const sh = g.createLinearGradient(0, rows - 34, 0, rows); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = sh; g.fillRect(0, rows - 34, pw, 34);   // darker underside
      const sd = g.createLinearGradient(0, 0, 18, 0); sd.addColorStop(0, 'rgba(0,0,0,0.35)'); sd.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sd; g.fillRect(0, topY + 6, 18, rows); g.save(); g.translate(pw, 0); g.scale(-1, 1); g.fillRect(0, topY + 6, 18, rows); g.restore();
      g.restore();
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; const hh = rows / PXM;
      addLayer(new THREE.Mesh(new THREE.PlaneGeometry(w, hh), basic(tex)), 1, x, y + (surfaceRow - top) / PXM - hh / 2, -9, 0);
      const sc2 = document.createElement('canvas'); sc2.width = 64; sc2.height = 32; const sg2 = sc2.getContext('2d'), rg = sg2.createRadialGradient(32, 16, 0, 32, 16, 32); rg.addColorStop(0, 'rgba(0,0,0,0.5)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); sg2.setTransform(1, 0, 0, 0.5, 0, 8); sg2.fillStyle = rg; sg2.fillRect(0, 0, 64, 64);
      const st = new THREE.CanvasTexture(sc2); addLayer(new THREE.Mesh(new THREE.PlaneGeometry(w * 1.05, 0.9), basic(st)), 1.05, x, y - hh + (surfaceRow - top) / PXM - 0.28, -9.5, 0);
    }
    if (front) addLayer(new THREE.Mesh(full, basic(front)), -2.2, 0, cy, 25, -0.03);
    layers.forEach(l => { if (!l.keep) l.mesh.visible = true; }); A.artReady = true; return true;
  };
  // keep every layer at the same on-screen scale as the fighters' plane despite its depth: p = c + (P - c) * (d + Z) / d
  A.updateCam = (cx, cy, d) => {
    for (const l of layers) { const k = (d + l.Z) / d, X = l.X + cx * l.par; l.mesh.scale.set(k, k, 1); l.mesh.position.set(cx + (X - cx) * k, cy + (l.Y - cy) * k, -l.Z); }
  };
  A.sun.shadow.camera.far = 60; A.sun.castShadow = false;
  // optional cheap life for painted fires: a flickering warm light (lights the procedural fighters), a pulsing additive glow behind the fighters and drifting embers
  const FIRES = { stablehill: [{ x: 0, y: 2.6, s: 7, i: 1.0 }, { x: -2.7, y: 1.4, s: 3.2, i: 0.55 }] }[A.id] || [];
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,170,70,0.9)'); r.addColorStop(0.45, 'rgba(255,110,30,0.28)'); r.addColorStop(1, 'rgba(255,80,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const fires = FIRES.map((f, n) => {
    const light = new THREE.PointLight(0xff8a30, 2, 14, 1.6); light.position.set(f.x, f.y, 2.5); scene.add(light); A.lights.push(light);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(f.s, f.s), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false, opacity: 0.5 })); glow.renderOrder = -5; glow.position.set(f.x, f.y, -0.6); glow.visible = false; scene.add(glow);
    layers.push({ mesh: glow, Z: 0.6, X: f.x, Y: f.y, par: 0, keep: true }); return { f, light, glow, ph: n * 2.3 };
  });
  A.updaters.push((t, dt) => { for (const o of fires) { const k = 1 + Math.sin(t * 11 + o.ph) * 0.12 + Math.sin(t * 23 + o.ph * 2) * 0.09 + Math.sin(t * 5 + o.ph) * 0.06; o.light.intensity = 2.2 * o.f.i * k; o.glow.material.opacity = 0.42 * o.f.i * k; o.glow.visible = A.artReady; if (A.fx && Math.random() < dt * 16 * o.f.i) A.fx.embers(o.f.x, o.f.y - 0.6, 0, 1, 0xffa040, o.f.s * 0.3); } });
  A.update = (t, dt) => { for (const u of A.updaters) u(t, dt); };
  return A;
}
