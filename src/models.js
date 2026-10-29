// Procedural placeholder rigs (one per body type) + swap-in loader for real art (GLB or image billboard).
import * as THREE from 'three';
import { GLTFLoader } from '../vendor/addons/loaders/GLTFLoader.js';

const geoCache = {};
const G = {
  box: (w, h, d) => geoCache['b' + w + h + d] ||= new THREE.BoxGeometry(w, h, d),
  sph: (r, ws = 16, hs = 12) => geoCache['s' + r + ws] ||= new THREE.SphereGeometry(r, ws, hs),
  cap: (r, l) => geoCache['c' + r + l] ||= new THREE.CapsuleGeometry(r, l, 4, 10),
  cyl: (rt, rb, h, s = 12) => geoCache['y' + rt + rb + h + s] ||= new THREE.CylinderGeometry(rt, rb, h, s),
  cone: (r, h, s = 12) => geoCache['k' + r + h + s] ||= new THREE.ConeGeometry(r, h, s),
};
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: opts.rough ?? 0.65, metalness: opts.metal ?? 0.05, flatShading: !!opts.flat, emissive: opts.emissive || 0x000000, emissiveIntensity: opts.ei ?? 1 });
}
function mesh(geo, m, x = 0, y = 0, z = 0, parent) {
  const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = false;
  if (parent) parent.add(o); return o;
}
function pivot(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; }

// ---------- weapons ----------
function buildWeapon(kind, c) {
  const g = new THREE.Group();
  const steel = mat(0xd8dde6, { metal: 0.8, rough: 0.3 }), wood = mat(0x7a5230), gold = mat(0xd4ac0d, { metal: 0.7, rough: 0.35 });
  switch (kind) {
    case 'sword': case 'swordshield': mesh(G.box(0.07, 0.9, 0.02), steel, 0, 0.5, 0, g); mesh(G.box(0.26, 0.05, 0.06), gold, 0, 0.05, 0, g); mesh(G.cyl(0.03, 0.03, 0.16), wood, 0, -0.06, 0, g); break;
    case 'rapier': mesh(G.cyl(0.012, 0.012, 0.8, 6), steel, 0, 0.45, 0, g); mesh(G.sph(0.06), gold, 0, 0.04, 0, g); break;
    case 'scimitar': { const b = mesh(G.box(0.09, 0.8, 0.02), steel, 0.04, 0.45, 0, g); b.rotation.z = -0.15; mesh(G.box(0.22, 0.05, 0.06), gold, 0, 0.05, 0, g); break; }
    case 'dagger': mesh(G.box(0.05, 0.32, 0.02), steel, 0, 0.2, 0, g); mesh(G.box(0.14, 0.04, 0.04), gold, 0, 0.03, 0, g); break;
    case 'wand': mesh(G.cyl(0.02, 0.025, 0.7, 6), mat(0xe8f8ff, { emissive: 0x66ccff, ei: 0.4 }), 0, 0.3, 0, g); mesh(G.sph(0.05), mat(0xffffff, { emissive: 0x99e6ff, ei: 1 }), 0, 0.66, 0, g); break;
    case 'staff': mesh(G.cyl(0.03, 0.035, 1.6, 6), wood, 0, 0.3, 0, g); mesh(G.sph(0.08), mat(0xfff6c0, { emissive: 0xffe680, ei: 1 }), 0, 1.12, 0, g); break;
    case 'club': mesh(G.cyl(0.13, 0.06, 1.0, 8), mat(0x6b4a2a, { flat: true }), 0, 0.45, 0, g); break;
    case 'axe': mesh(G.cyl(0.025, 0.025, 0.6, 6), wood, 0, 0.25, 0, g); mesh(G.box(0.22, 0.16, 0.03), steel, 0.1, 0.5, 0, g); break;
    case 'hammer': mesh(G.cyl(0.02, 0.02, 0.35, 6), wood, 0, 0.15, 0, g); mesh(G.box(0.14, 0.08, 0.08), gold, 0, 0.32, 0, g); break;
    case 'spear': mesh(G.cyl(0.022, 0.022, 1.7, 6), wood, 0, 0.4, 0, g); mesh(G.cone(0.05, 0.22, 6), steel, 0, 1.33, 0, g); break;
    case 'whip': { const w = mesh(G.cyl(0.015, 0.008, 0.9, 5), mat(0x3a2a1a), 0, 0.45, 0, g); w.rotation.z = 0.3; mesh(G.cyl(0.03, 0.03, 0.2), wood, 0, 0, 0, g); break; }
    case 'cane': mesh(G.cyl(0.02, 0.02, 0.9, 6), mat(0x2a1a0a), 0, 0.3, 0, g); break;
    case 'umbrella': mesh(G.cyl(0.015, 0.015, 0.9, 6), wood, 0, 0.35, 0, g); mesh(G.cone(0.32, 0.28, 8), mat(0x2a2a3a), 0, 0.82, 0, g); break;
    case 'oar': mesh(G.cyl(0.025, 0.025, 1.2, 6), wood, 0, 0.4, 0, g); mesh(G.box(0.16, 0.4, 0.03), wood, 0, 1.05, 0, g); break;
    case 'fan': { const f = mesh(G.cyl(0.35, 0.35, 0.02, 12, 1), mat(c.secondary), 0, 0.35, 0, g); f.rotation.x = Math.PI / 2; break; }
    case 'bow': { const t = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.022, 6, 16, Math.PI * 0.9), wood); t.rotation.z = Math.PI / 2 + 0.15; t.position.set(0, 0.1, 0.02); t.castShadow = true; g.add(t); break; }
  }
  return g;
}

// ---------- biped (humans, dwarfs, giants, faun, marsh-wiggle, ape, earthmen) ----------
function buildBiped(f) {
  const c = f.colors, v = f.variant || '', has = (k) => v.split('-').includes(k);
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const P = mat(c.primary), S = mat(c.secondary, { metal: 0.3, rough: 0.45 }), K = mat(c.skin), H = mat(c.hair), boot = mat(0x3a2a1a);
  const lanky = has('marshwiggle'), ape = has('ape'), faun = has('faun'), dwarf = has('dwarf') || has('gnome');
  const legLen = lanky ? 0.62 : ape ? 0.34 : dwarf ? 0.38 : 0.5, armLen = lanky ? 0.62 : ape ? 0.6 : 0.46;
  const hipY = legLen + 0.32;
  const legMat = faun ? mat(c.primary) : ape ? K : mat(new THREE.Color(c.primary).multiplyScalar(0.55));
  const legs = [-1, 1].map(s => { const p = pivot(body, s * 0.13, hipY, 0); mesh(G.cap(lanky ? 0.06 : 0.09, legLen), legMat, 0, -legLen / 2 - 0.06, 0, p);
    mesh(faun ? G.cyl(0.06, 0.08, 0.1) : G.box(0.15, 0.1, 0.24), faun ? mat(0x222222) : boot, 0, -legLen - 0.17, faun ? 0 : 0.04, p); return p; });
  const torsoH = 0.56, torsoY = hipY + torsoH / 2 - 0.02;
  const torso = pivot(body, 0, torsoY, 0);
  const wide = has('fat') ? 1.35 : has('thin') ? 0.8 : dwarf ? 1.25 : 1;
  mesh(G.cap(0.2 * wide, 0.28), P, 0, 0, 0, torso).scale.set(1.15, 1, 0.8);
  mesh(G.box(0.46 * wide, 0.06, 0.32 * wide), S, 0, -0.18, 0, torso); // belt
  if (f.sex === 'f' && !lanky) mesh(G.cyl(0.2, 0.36, 0.55, 14), P, 0, -0.42, 0, torso); // skirt / gown
  else mesh(G.cyl(0.21 * wide, 0.27 * wide, 0.28, 12), P, 0, -0.32, 0, torso); // tunic hem
  if (ape) torso.rotation.x = 0.35;
  const shoulderY = 0.24;
  const arms = [-1, 1].map(s => { const p = pivot(torso, s * (0.27 * wide), shoulderY, 0); mesh(G.cap(0.07, armLen), ape ? K : P, 0, -armLen / 2 - 0.05, 0, p);
    mesh(G.sph(0.075), K, 0, -armLen - 0.1, 0, p); return p; });
  const neck = pivot(torso, 0, 0.32, 0);
  const head = pivot(neck, 0, 0.16, ape ? 0.08 : 0);
  mesh(G.sph(lanky ? 0.15 : 0.17), K, 0, 0, 0, head).scale.set(1, lanky ? 1.15 : 1.08, 1);
  const eye = mat(0x1a1a1a); mesh(G.sph(0.025, 8, 6), eye, -0.06, 0.03, 0.15, head); mesh(G.sph(0.025, 8, 6), eye, 0.06, 0.03, 0.15, head);
  if (ape) { mesh(G.sph(0.11), mat(new THREE.Color(c.skin).offsetHSL(0, 0, 0.15)), 0, -0.05, 0.12, head); mesh(G.sph(0.06), K, -0.17, 0.04, 0, head); mesh(G.sph(0.06), K, 0.17, 0.04, 0, head); }
  else {
    const hair = mesh(G.sph(0.18, 14, 10, ), H, 0, 0.05, -0.02, head); hair.scale.set(1.02, 0.85, 1.05);
    if (f.sex === 'f') mesh(G.box(0.3, 0.38, 0.1), H, 0, -0.14, -0.12, head);
  }
  if (has('beard') || dwarf) { const b = mesh(G.cone(dwarf ? 0.16 : 0.12, dwarf ? 0.38 : 0.22, 8), H, 0, -0.2, 0.08, head); b.rotation.x = Math.PI; }
  if (has('crown')) { mesh(G.cyl(0.13, 0.12, 0.08, 8), mat(f.name.includes('White Witch') ? 0xe0f4ff : 0xd4ac0d, { metal: 0.8, rough: 0.3 }), 0, 0.17, 0, head); }
  if (has('turban')) { mesh(G.sph(0.2), mat(c.secondary), 0, 0.1, -0.01, head).scale.set(1, 0.7, 1); }
  if (has('helmet')) { mesh(G.sph(0.19, 12, 8), mat(0x9aa0a8, { metal: 0.7, rough: 0.35 }), 0, 0.06, 0, head).scale.set(1, 0.8, 1); }
  if (lanky) { mesh(G.cone(0.2, 0.55, 10), mat(0x2f3a22), 0, 0.32, 0, head); mesh(G.cyl(0.3, 0.3, 0.02, 14), mat(0x2f3a22), 0, 0.12, 0, head); }
  if (faun) { [-1, 1].forEach(s => { const h = mesh(G.cone(0.035, 0.16, 6), mat(0xe8dcc0), s * 0.1, 0.17, 0, head); h.rotation.z = -s * 0.4; });
    mesh(G.cyl(0.2, 0.2, 0.08, 12), mat(c.secondary), 0, 0.3, 0, torso); /* scarf */ }
  if (has('gnome')) { mesh(G.sph(0.06), K, 0, -0.02, 0.17, head); }
  // weapon + shield
  let weapon = null;
  if (f.weapon && f.weapon !== 'none') { weapon = buildWeapon(f.weapon, c); weapon.position.set(0, -armLen - 0.1, 0.04); weapon.rotation.x = Math.PI / 2; arms[1].add(weapon);
    if (f.weapon === 'bow') { weapon.rotation.set(0, 0, 0); arms[0].add(weapon); } }
  if (f.weapon === 'swordshield') { const sh = new THREE.Group(); mesh(G.cyl(0.24, 0.24, 0.05, 16), S, 0, 0, 0, sh).rotation.x = Math.PI / 2;
    mesh(G.cyl(0.13, 0.13, 0.06, 12), mat(c.primary), 0, 0, 0.01, sh).rotation.x = Math.PI / 2; sh.position.set(-0.05, -armLen * 0.6, 0.12); arms[0].add(sh); }
  if (f.name === 'The White Witch') { const cape = mesh(G.box(0.5, 1.1, 0.04), mat(0xbfe6f7), 0, -0.3, -0.18, torso); cape.rotation.x = 0.08; }
  if (f.name === 'Peter' || f.name === 'Prince Caspian' || f.name === 'Prince Rilian' || f.name === 'King Tirian') { mesh(G.box(0.46, 0.9, 0.03), mat(c.secondary === '#c0c0c0' ? 0x444444 : c.primary), 0, -0.2, -0.17, torso); }
  const height = hipY + torsoH + 0.5;
  return { root, body, parts: { torso, head, armL: arms[0], armR: arms[1], legL: legs[0], legR: legs[1], weapon }, height, kind: 'biped', ape };
}

// ---------- critter (small upright animal: mouse, beaver, badger, squirrel) ----------
function buildCritter(f) {
  const c = f.colors, v = f.variant, root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const F = mat(c.skin), L = mat(c.secondary), pink = mat(0xf0a0a0);
  const legs = [-1, 1].map(s => { const p = pivot(body, s * 0.16, 0.42, 0); mesh(G.cap(0.1, 0.18), F, 0, -0.16, 0, p); mesh(G.box(0.14, 0.06, 0.26), v === 'mouse' ? pink : F, 0, -0.36, 0.06, p); return p; });
  const torso = pivot(body, 0, 0.82, 0);
  mesh(G.sph(0.4, 16, 12), F, 0, 0, 0, torso).scale.set(0.95, 1.1, 0.85);
  mesh(G.sph(0.3, 14, 10), mat(v === 'badger' ? 0x2a2a2a : new THREE.Color(c.skin).offsetHSL(0, -0.1, 0.18)), 0, -0.05, 0.14, torso).scale.set(0.9, 1, 0.6);
  const arms = [-1, 1].map(s => { const p = pivot(torso, s * 0.34, 0.15, 0.05); mesh(G.cap(0.07, 0.28), F, 0, -0.2, 0, p); mesh(G.sph(0.07), v === 'mouse' ? pink : F, 0, -0.4, 0, p); return p; });
  const neck = pivot(torso, 0, 0.38, 0), head = pivot(neck, 0, 0.2, 0.04);
  mesh(G.sph(0.3, 16, 12), F, 0, 0, 0, head).scale.set(1, 0.95, 1);
  const snout = mesh(G.sph(0.16, 12, 10), F, 0, -0.06, 0.24, head); snout.scale.set(0.9, 0.8, 1.2);
  mesh(G.sph(0.05, 8, 6), mat(0x1a1a1a), 0, -0.04, 0.42, head);
  const eye = mat(0x111111); mesh(G.sph(0.045, 8, 6), eye, -0.12, 0.07, 0.24, head); mesh(G.sph(0.045, 8, 6), eye, 0.12, 0.07, 0.24, head);
  if (v === 'mouse') { [-1, 1].forEach(s => { const e = mesh(G.cyl(0.18, 0.18, 0.04, 16), pink, s * 0.24, 0.26, -0.02, head); e.rotation.x = Math.PI / 2; });
    const band = mesh(G.cyl(0.29, 0.29, 0.05, 16), mat(0xd4ac0d, { metal: 0.6 }), 0, 0.14, 0, head);
    const feather = mesh(G.cap(0.04, 0.5), mat(0xc0392b), 0.15, 0.45, -0.05, head); feather.rotation.z = -0.4; }
  else if (v === 'badger') { mesh(G.box(0.1, 0.06, 0.5), mat(0xffffff), 0, 0.25, 0.05, head); [-1, 1].forEach(s => mesh(G.sph(0.07), F, s * 0.22, 0.2, -0.05, head)); }
  else { [-1, 1].forEach(s => mesh(G.sph(v === 'squirrel' ? 0.08 : 0.07), F, s * 0.2, 0.25, -0.02, head)); }
  if (v === 'beaver') { mesh(G.box(0.12, 0.08, 0.03), mat(0xfff3c0), 0, -0.2, 0.33, head); }
  const tail = pivot(body, 0, 0.55, -0.32);
  if (v === 'mouse') { const t = mesh(G.cyl(0.025, 0.012, 1.0, 6), pink, 0, 0.2, -0.4, tail); t.rotation.x = -1.1; }
  else if (v === 'beaver') { const t = mesh(G.box(0.3, 0.06, 0.55), mat(0x3a2a1a), 0, -0.3, -0.2, tail); t.rotation.x = 0.3; }
  else if (v === 'squirrel') { const t = mesh(G.cap(0.18, 0.6), F, 0, 0.4, -0.15, tail); t.rotation.x = 0.3; }
  else { mesh(G.sph(0.12), F, 0, 0, 0, tail); }
  let weapon = null;
  if (f.weapon && f.weapon !== 'none') { weapon = buildWeapon(f.weapon, c); weapon.position.set(0, -0.42, 0.04); weapon.rotation.x = Math.PI / 2; arms[1].add(weapon); }
  return { root, body, parts: { torso, head, armL: arms[0], armR: arms[1], legL: legs[0], legR: legs[1], tail, weapon }, height: 1.65, kind: 'critter' };
}

// ---------- quadruped (horse, unicorn, donkey, dog, wolf, bear, elephant, winged horse) ----------
function buildQuad(f) {
  const c = f.colors, v = f.variant, root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const F = mat(c.skin), M = mat(c.secondary), hoof = mat(0x2a2420);
  const P = { horse: [1.0, 0.36, 1.25, 0.95], 'horse-winged': [1.0, 0.36, 1.25, 0.95], unicorn: [1.0, 0.35, 1.2, 0.95], donkey: [0.8, 0.32, 1.0, 0.75],
    dog: [0.55, 0.3, 0.8, 0.5], wolf: [0.75, 0.3, 1.05, 0.7], bear: [0.8, 0.45, 1.1, 0.6], elephant: [1.3, 0.75, 1.5, 1.1] }[v] || [0.9, 0.35, 1.1, 0.8];
  const [legH, bodyR, bodyL, neckLen] = P;
  const torso = pivot(body, 0, legH + bodyR * 0.6, 0);
  const trunkBody = mesh(G.cap(bodyR, bodyL), F, 0, 0, 0, torso); trunkBody.rotation.x = Math.PI / 2;
  const legs = [];
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => { const p = pivot(torso, sx * bodyR * 0.62, -bodyR * 0.35, sz * bodyL * 0.45);
    const thick = v === 'elephant' ? 0.2 : v === 'bear' ? 0.13 : 0.08;
    mesh(G.cap(thick, legH * 0.8), F, 0, -legH / 2 + 0.05, 0, p);
    mesh(G.cyl(thick * 1.1, thick * 1.2, 0.1, 8), ['dog', 'wolf', 'bear'].includes(v) ? F : hoof, 0, -legH + 0.12, 0.02, p); legs.push(p); });
  const neck = pivot(torso, 0, bodyR * 0.4, bodyL * 0.5 + 0.05);
  const isHorse = ['horse', 'horse-winged', 'unicorn', 'donkey'].includes(v);
  if (isHorse) { const n = mesh(G.cap(0.16, neckLen * 0.7), F, 0, neckLen * 0.4, 0.12, neck); n.rotation.x = 0.5;
    const mane = mesh(G.box(0.06, neckLen * 0.85, 0.16), M, 0, neckLen * 0.45, 0.0, neck); mane.rotation.x = 0.5; }
  const head = pivot(neck, 0, isHorse ? neckLen * 0.8 : 0.12, isHorse ? neckLen * 0.45 : 0.15);
  if (isHorse) { const hd = mesh(G.cap(0.13, 0.42), F, 0, 0, 0.18, head); hd.rotation.x = Math.PI / 2 + 0.35;
    const earL = v === 'donkey' ? 0.32 : 0.14; [-1, 1].forEach(s => { const e = mesh(G.cone(0.05, earL, 6), F, s * 0.08, 0.17 + earL / 2 - 0.05, 0.0, head); e.rotation.z = -s * 0.2; });
    if (v === 'unicorn') { const h = mesh(G.cone(0.05, 0.5, 8), mat(0xffe680, { metal: 0.6, rough: 0.3, emissive: 0x806000, ei: 0.3 }), 0, 0.28, 0.18, head); h.rotation.x = 0.7; } }
  else if (v === 'elephant') { mesh(G.sph(0.5, 14, 10), F, 0, 0.1, 0.2, head);
    const tr = pivot(head, 0, -0.05, 0.6); mesh(G.cap(0.1, 0.9), F, 0, -0.5, 0, tr); tr.rotation.x = 0.15;
    [-1, 1].forEach(s => { const e = mesh(G.cyl(0.42, 0.42, 0.05, 14), F, s * 0.48, 0.1, 0.0, head); e.rotation.z = Math.PI / 2; e.scale.set(1, 1, 1.2);
      const t = mesh(G.cone(0.06, 0.5, 8), mat(0xfff8e0), s * 0.2, -0.3, 0.55, head); t.rotation.x = 2.2; }); }
  else { const r = v === 'bear' ? 0.3 : 0.24; mesh(G.sph(r, 14, 10), F, 0, 0.05, 0.1, head);
    const sn = mesh(G.cap(r * 0.45, r * (v === 'wolf' ? 1.2 : 0.5)), v === 'bear' ? mat(0x8a6a4a) : F, 0, -0.02, r + 0.12, head); sn.rotation.x = Math.PI / 2;
    mesh(G.sph(0.045, 8, 6), mat(0x111111), 0, 0.0, r * (v === 'wolf' ? 1.9 : 1.5) + 0.12, head);
    [-1, 1].forEach(s => { if (v === 'bear' || v === 'dog') mesh(G.sph(r * 0.32), F, s * r * 0.75, r * 0.75, 0, head);
      else { const e = mesh(G.cone(0.07, 0.22, 4), F, s * 0.13, r + 0.06, 0.02, head); } });
    if (v === 'dog') { [-1, 1].forEach(s => mesh(G.sph(0.11), F, s * 0.14, -0.1, 0.22, head)); } }
  const eye = mat(0x111111); [-1, 1].forEach(s => mesh(G.sph(0.035, 8, 6), eye, s * (v === 'elephant' ? 0.32 : 0.12), v === 'elephant' ? 0.25 : 0.1, isHorse ? 0.2 : v === 'elephant' ? 0.55 : 0.25, head));
  const tail = pivot(torso, 0, 0.1, -bodyL * 0.5 - bodyR * 0.6);
  if (isHorse) { const t = mesh(G.cap(0.07, 0.6), M, 0, -0.32, -0.1, tail); t.rotation.x = 0.4; }
  else if (v !== 'bear') { const t = mesh(G.cap(v === 'wolf' ? 0.09 : 0.04, v === 'elephant' ? 0.5 : 0.4), F, 0, 0.1, -0.2, tail); t.rotation.x = -0.9; }
  let wingL = null, wingR = null;
  if (v === 'horse-winged') { [wingL, wingR] = [-1, 1].map(s => { const p = pivot(torso, s * 0.3, bodyR * 0.7, 0.3); const w = mesh(G.box(1.3, 0.05, 0.6), mat(c.hair), s * 0.65, 0, 0, p); w.rotation.z = 0; return p; }); }
  const height = legH + bodyR * 2 + 0.6;
  return { root, body, parts: { torso, head, neck, legs, tail, wingL, wingR }, height, kind: 'quad', quadVariant: v };
}

// ---------- centaur ----------
function buildCentaur(f) {
  const q = buildQuad({ ...f, variant: 'horse', colors: { ...f.colors, skin: f.colors.primary, secondary: f.colors.hair } });
  const { torso } = q.parts; q.parts.neck.visible = false;
  const K = mat(f.colors.skin), H = mat(f.colors.hair), S = mat(f.colors.secondary, { metal: 0.3 });
  const up = pivot(torso, 0, 0.3, 0.6);
  mesh(G.cap(0.22, 0.4), K, 0, 0.35, 0, up).scale.set(1.1, 1, 0.8);
  mesh(G.box(0.5, 0.08, 0.34), S, 0, 0.08, 0, up);
  const arms = [-1, 1].map(s => { const p = pivot(up, s * 0.3, 0.62, 0); mesh(G.cap(0.075, 0.5), K, 0, -0.3, 0, p); mesh(G.sph(0.08), K, 0, -0.6, 0, p); return p; });
  const head = pivot(up, 0, 0.95, 0); mesh(G.sph(0.18), K, 0, 0, 0, head); const hr = mesh(G.sph(0.19), H, 0, 0.05, -0.03, head); hr.scale.set(1, 0.85, 1.05);
  const b = mesh(G.cone(0.13, 0.32, 8), H, 0, -0.22, 0.08, head); b.rotation.x = Math.PI;
  const eye = mat(0x111111); mesh(G.sph(0.025, 8, 6), eye, -0.06, 0.03, 0.16, head); mesh(G.sph(0.025, 8, 6), eye, 0.06, 0.03, 0.16, head);
  let weapon = null; if (f.weapon !== 'none') { weapon = buildWeapon(f.weapon, f.colors); weapon.position.set(0, -0.62, 0.04); weapon.rotation.x = Math.PI / 2; arms[1].add(weapon); }
  Object.assign(q.parts, { armL: arms[0], armR: arms[1], humanHead: head, up, weapon });
  q.kind = 'centaur'; q.height += 0.9; return q;
}

// ---------- bird (owl, eagle) ----------
function buildBird(f) {
  const c = f.colors, v = f.variant, root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const F = mat(c.primary), L = mat(c.secondary), B = mat(c.hair);
  const legs = [-1, 1].map(s => { const p = pivot(body, s * 0.18, 0.4, 0); mesh(G.cyl(0.04, 0.04, 0.35, 6), B, 0, -0.18, 0, p); mesh(G.box(0.18, 0.04, 0.2), B, 0, -0.38, 0.05, p); return p; });
  const torso = pivot(body, 0, 0.95, 0);
  mesh(G.sph(0.5, 16, 12), F, 0, 0, 0, torso).scale.set(0.85, 1.1, 0.8);
  mesh(G.sph(0.38, 14, 10), L, 0, -0.08, 0.17, torso).scale.set(0.85, 1.05, 0.6);
  const [wingL, wingR] = [-1, 1].map(s => { const p = pivot(torso, s * 0.4, 0.25, -0.05); const w = mesh(G.box(0.12, 0.85, 0.5), F, s * 0.05, -0.38, 0, p); return p; });
  const neck = pivot(torso, 0, 0.5, 0), head = pivot(neck, 0, 0.18, 0.02);
  mesh(G.sph(v === 'owl' ? 0.36 : 0.27, 16, 12), v === 'eagle' ? mat(0xffffff) : F, 0, 0, 0, head);
  const beak = mesh(G.cone(0.07, 0.22, 6), B, 0, -0.03, v === 'owl' ? 0.36 : 0.3, head); beak.rotation.x = Math.PI / 2 + 0.4;
  const eyeW = mat(v === 'owl' ? 0xffd040 : 0xffffff), eye = mat(0x111111);
  [-1, 1].forEach(s => { mesh(G.sph(v === 'owl' ? 0.1 : 0.05, 10, 8), eyeW, s * 0.13, 0.06, v === 'owl' ? 0.28 : 0.22, head); mesh(G.sph(v === 'owl' ? 0.05 : 0.03, 8, 6), eye, s * 0.13, 0.06, v === 'owl' ? 0.37 : 0.26, head);
    if (v === 'owl') { const e = mesh(G.cone(0.07, 0.18, 4), F, s * 0.22, 0.32, 0, head); e.rotation.z = -s * 0.3; } });
  const tail = pivot(torso, 0, -0.35, -0.35); const t = mesh(G.box(0.4, 0.05, 0.4), F, 0, 0, -0.15, tail); t.rotation.x = 0.4;
  return { root, body, parts: { torso, head, legL: legs[0], legR: legs[1], wingL, wingR, tail }, height: 1.9, kind: 'bird' };
}

// ---------- monopod (Dufflepud) ----------
function buildMonopod(f) {
  const c = f.colors, root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const F = mat(c.primary), K = mat(c.skin), H = mat(c.hair);
  const leg = pivot(body, 0, 0.7, 0); mesh(G.cap(0.15, 0.4), K, 0, -0.32, 0, leg); const foot = mesh(G.box(0.55, 0.16, 0.9), K, 0, -0.62, 0.2, leg);
  const torso = pivot(body, 0, 1.15, 0); mesh(G.sph(0.45, 16, 12), F, 0, 0, 0, torso).scale.set(1, 1.05, 0.9);
  const arms = [-1, 1].map(s => { const p = pivot(torso, s * 0.45, 0.15, 0); mesh(G.cap(0.07, 0.35), F, 0, -0.22, 0, p); mesh(G.sph(0.08), K, 0, -0.45, 0, p); return p; });
  const head = pivot(torso, 0, 0.6, 0); mesh(G.sph(0.25), K, 0, 0, 0, head); const h = mesh(G.sph(0.26), H, 0, 0.07, -0.02, head); h.scale.set(1, 0.7, 1);
  const eye = mat(0x111111); mesh(G.sph(0.03, 8, 6), eye, -0.08, 0.03, 0.23, head); mesh(G.sph(0.03, 8, 6), eye, 0.08, 0.03, 0.23, head);
  mesh(G.sph(0.06), K, 0, -0.03, 0.26, head);
  return { root, body, parts: { torso, head, armL: arms[0], armR: arms[1], legL: leg, legR: leg, foot }, height: 1.75, kind: 'monopod' };
}

export function buildPlaceholder(f) {
  const b = { biped: buildBiped, critter: buildCritter, quadruped: buildQuad, centaur: buildCentaur, bird: buildBird, monopod: buildMonopod }[f.body] || buildBiped;
  const rig = b(f);
  rig.root.scale.setScalar(f.scale || 1);
  rig.height *= f.scale || 1;
  rig.radius = Math.max(0.35, (f.body === 'quadruped' || f.body === 'centaur' ? 0.75 : 0.42) * (f.scale || 1));
  rig.mats = []; rig.root.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); rig.mats.push(o.material); o.material.userData.baseEmissive = o.material.emissive.clone(); o.material.userData.baseColor = o.material.color.clone(); } });
  rig.base = {}; ['torso', 'head', 'armL', 'armR', 'legL', 'legR', 'tail', 'wingL', 'wingR', 'neck', 'up'].forEach(k => { const p = rig.parts[k]; if (p) rig.base[k] = { r: p.rotation.clone(), p: p.position.clone() }; });
  if (rig.parts.legs) rig.base.legs = rig.parts.legs.map(p => p.rotation.clone());
  return rig;
}

// ---------- swap-in loader ----------
const gltf = new GLTFLoader(); const texLoader = new THREE.TextureLoader();
// Tries art.model (GLB) first, then art.billboard image. Resolves with a replacement Object3D or null (keep placeholder).
export async function loadArt(f, targetHeight) {
  const a = f.art || {};
  if (a.model) {
    try {
      const g = await gltf.loadAsync(a.model);
      const obj = g.scene; const box = new THREE.Box3().setFromObject(obj); const h = box.max.y - box.min.y || 1;
      obj.scale.setScalar(targetHeight / h); obj.position.y = -box.min.y * (targetHeight / h);
      obj.traverse(o => { if (o.isMesh) o.castShadow = true; });
      return { object: obj, animations: g.animations };
    } catch (e) { console.info('[art] no model for', f.name, '- using placeholder'); }
  }
  if (a.billboard && a.front) {
    try {
      const tex = await texLoader.loadAsync(encodeURI(a.front)); tex.colorSpace = THREE.SRGBColorSpace;
      const aspect = tex.image.width / tex.image.height;
      const sp = new THREE.Mesh(new THREE.PlaneGeometry(targetHeight * aspect, targetHeight), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide }));
      sp.position.y = targetHeight / 2; sp.userData.billboard = true;
      return { object: sp, animations: [] };
    } catch (e) { console.info('[art] no image for', f.name); }
  }
  return null;
}

// ---------- animation of placeholder rigs ----------
const lerp = (a, b, t) => a + (b - a) * t;
export function animateRig(rig, st, t) {
  // st: { mode: idle|run|attack|block|jump|ko|hit|dodge|cast, phase 0..1, speed 0..1, style }
  const P = rig.parts, B = rig.base;
  for (const k in B) { if (k === 'legs') { P.legs.forEach((p, i) => p.rotation.copy(B.legs[i])); continue; } const p = P[k]; p.rotation.copy(B[k].r); p.position.copy(B[k].p); }
  rig.body.rotation.set(0, 0, 0); rig.body.position.set(0, 0, 0);
  const sw = Math.sin(t * 11) * st.speed;
  const breathe = Math.sin(t * 2.4) * 0.03;
  if (rig.kind === 'quad' || rig.kind === 'centaur') {
    if (P.legs) P.legs.forEach((p, i) => p.rotation.x = (i === 0 || i === 3 ? 1 : -1) * sw * 0.7);
    if (P.tail) P.tail.rotation.x += Math.sin(t * 3) * 0.15;
    if (P.head && rig.kind === 'quad') P.head.rotation.x = breathe * 2 + (st.speed > 0.1 ? Math.sin(t * 11) * 0.08 : 0);
    rig.body.position.y = Math.abs(Math.sin(t * 11)) * 0.08 * st.speed;
    if (P.wingL) { const fl = st.mode === 'jump' ? Math.sin(t * 16) * 0.9 : 0.3 + breathe * 3; P.wingL.rotation.z = fl; P.wingR.rotation.z = -fl; }
    if (rig.kind === 'centaur') { P.armL.rotation.x = -sw * 0.5; P.armR.rotation.x = sw * 0.5; }
  } else if (rig.kind === 'bird') {
    const flap = st.mode === 'jump' || st.speed > 0.1 ? Math.sin(t * 18) * 1.0 + 0.6 : 0.15 + breathe;
    P.wingL.rotation.z = -flap; P.wingR.rotation.z = flap;
    P.legL.rotation.x = sw * 0.5; P.legR.rotation.x = -sw * 0.5; rig.body.position.y = st.speed * 0.15 + breathe;
  } else if (rig.kind === 'monopod') {
    rig.body.position.y = Math.abs(Math.sin(t * (st.speed > 0.1 ? 9 : 3))) * (st.speed > 0.1 ? 0.35 : 0.05);
    P.armL.rotation.z = -0.4 - Math.abs(sw) * 0.5; P.armR.rotation.z = 0.4 + Math.abs(sw) * 0.5;
  } else {
    P.legL.rotation.x = sw * 0.8; P.legR.rotation.x = -sw * 0.8;
    P.armL.rotation.x = -sw * 0.7; P.armR.rotation.x = sw * 0.7 - (rig.parts.weapon ? 0.25 : 0);
    if (P.torso) P.torso.position.y += breathe * 0.5 + Math.abs(Math.sin(t * 11)) * 0.04 * st.speed;
    if (P.tail) P.tail.rotation.z = Math.sin(t * 4) * 0.25;
  }
  const ph = st.phase || 0; const arc = st.seg !== undefined && st.mode === 'attack' ? Math.sin(st.seg * Math.PI) : Math.sin(ph * Math.PI);
  switch (st.mode) {
    case 'attack': {
      const style = st.style || 'melee';
      if (rig.kind === 'quad') {
        const v = rig.quadVariant;
        if (['horse', 'horse-winged', 'unicorn', 'donkey'].includes(v) && style !== 'melee') { P.torso.rotation.x = -arc * 0.6; P.legs[0].rotation.x = -arc * 1.2; P.legs[1].rotation.x = -arc * 1.0; rig.body.position.y += arc * 0.3; }
        else { rig.body.position.z = arc * 0.5; P.head.rotation.x = arc * 0.5; if (P.torso) P.torso.rotation.x = arc * 0.12; P.legs[0].rotation.x = -arc; P.legs[1].rotation.x = -arc * 0.8; }
      } else if (rig.kind === 'bird') { P.wingL.rotation.z = -1.4 * arc; P.wingR.rotation.z = 1.4 * arc; rig.body.position.z = arc * 0.5; P.head.rotation.x = arc * 0.6; }
      else {
        const armR = P.armR, armL = P.armL; const seg = st.seg ?? ph, kind = st.kind || 'slash';
        const wind = Math.min(1, seg / 0.4), k = seg < 0.4 ? -wind * 0.6 : seg < 0.65 ? -0.6 + (seg - 0.4) / 0.25 * 1.75 : 1.15 * (1 - (seg - 0.65) / 0.35); // -0.6 wind-up .. 1.15 follow-through
        if (style === 'projectile' || style === 'cast' || style === 'breath') { armR.rotation.x = -1.5 * Math.min(1, ph * 3); armL.rotation.x = -1.3 * Math.min(1, ph * 3); if (style === 'cast') { armR.rotation.z = -0.5; armL.rotation.z = 0.5; } }
        else if (style === 'spin') { armR.rotation.z = -1.4; armL.rotation.z = 1.4; armR.rotation.x = -0.3; armL.rotation.x = -0.3; }
        else if (style === 'dash') { rig.body.rotation.x = 0.5; armR.rotation.x = 1.0; armL.rotation.x = 1.2; if (P.legL) { P.legL.rotation.x = Math.sin(t * 24) * 1.0; P.legR.rotation.x = -Math.sin(t * 24) * 1.0; } }
        else {
          const arm = (st.hitIdx || 0) % 2 ? armL : armR, other = arm === armR ? armL : armR; const sgn = arm === armR ? 1 : -1;
          if (kind === 'thrust') { arm.rotation.x = -1.2 - 0.5 * Math.max(0, k); other.rotation.x = 0.5; }
          else if (kind === 'upper') { arm.rotation.x = k < 0 ? 0.8 : lerp(0.8, -3.0, Math.min(1, k)); other.rotation.x = -0.5; }
          else if (kind === 'sweep') { arm.rotation.x = -1.4; arm.rotation.z = sgn * lerp(0.8, -0.6, Math.max(0, k)); other.rotation.x = 0.4; }
          else if (kind === 'jab') { arm.rotation.x = -1.5 * Math.max(0.15, Math.min(1, 0.4 + k)); other.rotation.x = -0.4; }
          else { arm.rotation.x = k < 0 ? lerp(0, -2.8, -k / 0.6) : lerp(-2.8, 0.7, Math.min(1, k / 1.15)); arm.rotation.z = sgn * -0.2; other.rotation.x = -0.8 * Math.max(0, k); }
          if (P.torso) P.torso.rotation.y = (arm === armR ? 1 : -1) * lerp(0.45, -0.5, (k + 0.6) / 1.75);
          rig.body.rotation.x = 0.28 * Math.max(0, k);
          if (P.legL) { P.legL.rotation.x = -0.55 * Math.max(0, k); P.legR.rotation.x = 0.5 * Math.max(0, k); }
        }
        if (rig.kind === 'monopod') rig.body.position.y += arc * 0.5;
      }
      if (style === 'spin') rig.body.rotation.y = ph * Math.PI * 2 * (st.spins || 2);
      break; }
    case 'block':
      if (P.armL && rig.kind !== 'quad') { P.armL.rotation.x = -1.4; P.armR.rotation.x = -1.2; P.armL.rotation.z = 0.5; P.armR.rotation.z = -0.5; }
      if (P.wingL) { P.wingL.rotation.z = -2.2; P.wingR.rotation.z = 2.2; }
      if (rig.kind === 'quad') { if (P.torso) P.torso.rotation.x = 0.12; P.head.rotation.x = 0.4; }
      rig.body.position.y -= 0.05; break;
    case 'dodge': rig.body.rotation.x = ph * Math.PI * 2; rig.body.position.y += 0.3 * arc; break;
    case 'jump':
      if (P.legL && rig.kind === 'biped') { P.legL.rotation.x = -0.9; P.legR.rotation.x = 0.3; P.armL.rotation.x = -2.4; P.armR.rotation.x = -2.6; }
      if (P.legs) P.legs.forEach((p, i) => p.rotation.x = i < 2 ? -0.8 : 0.8);
      break;
    case 'leap': rig.body.rotation.x = st.phase < 0.6 ? -st.phase * 0.6 : 0.6; if (P.armR) P.armR.rotation.x = st.phase < 0.6 ? -3 : 0.4; break;
    case 'hit': rig.body.rotation.x = -0.3 * arc; if (P.head) P.head.rotation.x = -0.4 * arc; break;
    case 'ko': {
      const fall = Math.min(1, ph * 3);
      if (rig.kind === 'quad' || rig.kind === 'centaur') { rig.body.rotation.z = fall * Math.PI / 2; rig.body.position.y = fall * 0.25; }
      else { rig.body.rotation.x = -fall * Math.PI / 2; rig.body.position.y = fall * 0.2; rig.body.position.z = -fall * 0.3; }
      break; }
    case 'cast': if (P.armR) { P.armR.rotation.x = -2.8; P.armL.rotation.x = -2.8; } rig.body.position.y += arc * 0.2; break;
  }
}
export function setTint(rig, color, amount) {
  for (const m of rig.mats) { m.emissive.copy(m.userData.baseEmissive).lerp(color, amount); }
}
export function setStone(rig, on, color = 0x9aa5ad) {
  const c = new THREE.Color(color);
  for (const m of rig.mats) m.color.copy(on ? c : m.userData.baseColor);
}
