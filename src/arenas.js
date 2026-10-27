// Four Stage-1 arenas, built procedurally. Each returns collision data + an update(t) for ambient motion.
// previewImage points at future art from "/workspace/Narnia Game Art/Arena Previews/<book>/" (copied by tools/sync-art.sh).
import * as THREE from 'three';
import { MORE } from './arenas-more.js';

const BOOKS = ["01 The Magician's Nephew", "02 The Lion, the Witch and the Wardrobe", "03 The Horse and His Boy", "04 Prince Caspian", "05 The Voyage of the Dawn Treader", "06 The Silver Chair", "07 The Last Battle"];
const TITLES = ["The Magician's Nephew", 'The Lion, the Witch and the Wardrobe', 'The Horse and His Boy', 'Prince Caspian', 'The Voyage of the Dawn Treader', 'The Silver Chair', 'The Last Battle'];
// 14 arenas, two per book. art.source = folder for future preview art; previewImage = web path after tools/sync-art.sh copies it.
const A_ = (b, id, name, blurb) => ({ id, name, book: TITLES[b], bookFolder: BOOKS[b], blurb, artSource: `/workspace/Narnia Game Art/Arena Previews/${BOOKS[b]}/`, previewImage: `art/arenas/${BOOKS[b]}/${name}.png` });
export const ARENAS = [
  A_(0, 'charn', "Charn's Hall of Images", 'The silent hall of kings and queens, with the golden bell'),
  A_(0, 'creation', 'The Song of Creation', 'The new Narnia valley, just sung into being'),
  A_(1, 'castle', "The White Witch's Castle", 'A snowy courtyard full of statues'),
  A_(1, 'stonetable', 'The Stone Table', 'A hilltop at dawn, ringed with standing stones'),
  A_(2, 'tashbaan', 'Tashbaan', 'A sunny courtyard in the great Calormene city'),
  A_(2, 'anvard', 'Siege of Anvard', 'Before the gates of the castle of Archenland'),
  A_(3, 'aslanshow', "Aslan's How", 'The torchlit chamber around the broken Stone Table'),
  A_(3, 'cairparavel', 'Ruins of Cair Paravel', 'Broken pillars and an apple orchard by the sea'),
  A_(4, 'dawntreader', 'Dawn Treader Deck', 'Fight on the deck of the ship sailing east'),
  A_(4, 'dragonisland', 'Dragon Island', "A misty valley with the dragon's cave and its gold"),
  A_(5, 'harfang', 'Harfang', 'The great hall of the giants, with a roaring fire'),
  A_(5, 'underland', 'Underland', "The Queen's dark realm under the earth, lit by lamps"),
  A_(6, 'stablehill', 'Stable Hill', 'The night hill with the stable and the bonfire'),
  A_(6, 'aslanscountry', 'Further Up and Further In', "Aslan's Country, bright and golden"),
];

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.85, metalness: o.m ?? 0, flatShading: o.flat ?? false, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 1, transparent: !!o.t, opacity: o.op ?? 1 });
function add(scene, geo, mat, x, y, z, opts = {}) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = opts.recv ?? true; if (opts.ry) m.rotation.y = opts.ry; scene.add(m); return m; }
const rand = (a, b) => a + Math.random() * (b - a);

function lights(scene, o) {
  scene.add(new THREE.HemisphereLight(o.sky, o.ground, o.hemi));
  const d = new THREE.DirectionalLight(o.sun, o.sunI); d.position.set(...o.sunPos); d.castShadow = true;
  d.shadow.mapSize.set(1024, 1024); const s = d.shadow.camera; s.left = -22; s.right = 22; s.top = 22; s.bottom = -22; s.near = 1; s.far = 80; d.shadow.bias = -0.0008;
  scene.add(d); return d;
}
function particles(scene, n, area, color, size, height) {
  const g = new THREE.BufferGeometry(); const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i * 3] = rand(-area, area); p[i * 3 + 1] = rand(0, height); p[i * 3 + 2] = rand(-area, area); }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.85, depthWrite: false })); scene.add(pts); return pts;
}

export function buildArena(id, scene) {
  const A = { obstacles: [], platforms: [], bounds: { type: 'circle', r: 15 }, update: () => {}, spawns: [] };
  const sp = (r) => { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; A.spawns.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); } };
  if (id === 'castle') {
    scene.background = new THREE.Color(0x9fb8cc); scene.fog = new THREE.Fog(0x9fb8cc, 30, 75);
    lights(scene, { sky: 0xcfe0f0, ground: 0x4a5a6a, hemi: 0.65, sun: 0xeaf6ff, sunI: 1.25, sunPos: [12, 25, 8] });
    add(scene, new THREE.CircleGeometry(40, 48).rotateX(-Math.PI / 2), M(0xc8d4de), 0, 0, 0, { cast: false });
    const flag = M(0xb8c4cc, { flat: true });
    const floor = add(scene, new THREE.CylinderGeometry(16, 16, 0.2, 40), M(0x9aa8b4, { flat: true }), 0, -0.05, 0, { cast: false });
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; add(scene, new THREE.BoxGeometry(1.2, 0.05, 1.2), M(i % 2 ? 0xb4c0ca : 0x96a4b0), Math.cos(a) * rand(3, 15), 0.06, Math.sin(a) * rand(3, 15), { cast: false, ry: a }); }
    // walls & towers
    const wallM = M(0x8e9aa6, { flat: true });
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const r = 18.5; add(scene, new THREE.BoxGeometry(7.6, 7, 1.6), wallM, Math.cos(a) * r, 3.5, Math.sin(a) * r, { ry: -a + Math.PI / 2 });
      for (let k = -1; k <= 1; k++) add(scene, new THREE.BoxGeometry(1.2, 1, 1.7), wallM, Math.cos(a) * r - Math.sin(a) * k * 2.6, 7.5, Math.sin(a) * r + Math.cos(a) * k * 2.6, { ry: -a + Math.PI / 2 }); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.26; add(scene, new THREE.CylinderGeometry(2.2, 2.6, 14, 10), wallM, Math.cos(a) * 19, 7, Math.sin(a) * 19);
      add(scene, new THREE.ConeGeometry(2.8, 5, 10), M(0xdfeef8, { r: 0.4, m: 0.2 }), Math.cos(a) * 19, 16.5, Math.sin(a) * 19); }
    // icicles & frozen statues (obstacles)
    const stoneM = M(0xa8b0b6, { flat: true });
    const statues = [[6, 6, 'lion'], [-7, 4, 'giant'], [3, -8, 'faun'], [-5, -7, 'centaur'], [9, -2, 'dwarf']];
    for (const [x, z, k] of statues) {
      const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.6), stoneM); base.position.y = 0.3; base.castShadow = base.receiveShadow = true; g.add(base);
      const h = k === 'giant' ? 3.4 : k === 'dwarf' ? 1.2 : 2;
      if (k === 'lion' || k === 'centaur') { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.1, 4, 8), stoneM); b.rotation.x = Math.PI / 2; b.position.y = 1.3; b.castShadow = true; g.add(b); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), stoneM); hd.position.set(0, k === 'centaur' ? 2.4 : 1.7, 0.8); hd.castShadow = true; g.add(hd); }
      else { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.35 * (h / 2), h * 0.55, 4, 8), stoneM); b.position.y = 0.6 + h / 2; b.castShadow = true; g.add(b); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.28 * (h / 2), 10, 8), stoneM); hd.position.y = 0.6 + h + 0.15; g.add(hd); }
      A.obstacles.push({ type: 'cyl', x, z, r: 1.0 });
    }
    add(scene, new THREE.CylinderGeometry(0.6, 0.7, 2.6, 8), M(0x3a3a3a, { m: 0.6, r: 0.4 }), 0, 1.3, -1.5); // lamp-post-like brazier
    const fire = add(scene, new THREE.SphereGeometry(0.5, 10, 8), M(0x9fe8ff, { e: 0x66ccff, ei: 2 }), 0, 2.9, -1.5, { cast: false });
    A.obstacles.push({ type: 'cyl', x: 0, z: -1.5, r: 0.8 });
    const snow = particles(scene, 900, 22, 0xffffff, 0.12, 20);
    A.bounds = { type: 'circle', r: 15.5 }; A.camR = 16.5; sp(10);
    A.update = (t, dt) => { const p = snow.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) - dt * 1.5; if (y < 0) y = 20; p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(t + i) * dt * 0.3); } p.needsUpdate = true; fire.scale.setScalar(1 + Math.sin(t * 8) * 0.12); };
  }
  if (id === 'stonetable') {
    scene.background = new THREE.Color(0xf3b98a); scene.fog = new THREE.Fog(0xf3c9a0, 35, 90);
    lights(scene, { sky: 0xffe2c0, ground: 0x4a6a30, hemi: 1.0, sun: 0xffd9a0, sunI: 1.8, sunPos: [-20, 18, 10] });
    add(scene, new THREE.CircleGeometry(60, 48).rotateX(-Math.PI / 2), M(0x5f8a3a), 0, -0.6, 0, { cast: false });
    add(scene, new THREE.CylinderGeometry(17, 22, 1.2, 40), M(0x6c9a42, { flat: true }), 0, -0.6, 0, { cast: false });
    // the Stone Table (cracked) - a platform you can jump onto
    const tableM = M(0x8a8478, { flat: true });
    add(scene, new THREE.BoxGeometry(2.1, 1.1, 5.4), tableM, -1.12, 0.55, 0); add(scene, new THREE.BoxGeometry(2.1, 1.1, 5.4), tableM, 1.12, 0.55, 0);
    add(scene, new THREE.BoxGeometry(0.15, 0.6, 5.4), M(0x2a2a2a), 0, 0.85, 0, { cast: false });
    A.platforms.push({ x: 0, z: 0, w: 4.4, d: 5.4, h: 1.1 });
    // ring of standing stones
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const h = rand(2.5, 4); const x = Math.cos(a) * 14.5, z = Math.sin(a) * 14.5;
      add(scene, new THREE.BoxGeometry(1.2, h, 0.8), M(0x9a9488, { flat: true }), x, h / 2, z, { ry: -a }); A.obstacles.push({ type: 'cyl', x, z, r: 0.8 }); }
    // trees beyond
    for (let i = 0; i < 40; i++) { const a = rand(0, Math.PI * 2), r = rand(22, 45); const x = Math.cos(a) * r, z = Math.sin(a) * r;
      add(scene, new THREE.CylinderGeometry(0.25, 0.35, 2.5, 6), M(0x5a3a1e), x, 0.6, z); add(scene, new THREE.ConeGeometry(rand(1.4, 2.2), rand(3.5, 5.5), 7), M(0x2f5a2a, { flat: true }), x, 4, z); }
    const sun = add(scene, new THREE.SphereGeometry(4, 20, 14), new THREE.MeshBasicMaterial({ color: 0xfff0c0 }), -55, 10, -40, { cast: false });
    const motes = particles(scene, 250, 18, 0xfff2a0, 0.1, 8);
    A.bounds = { type: 'circle', r: 15.5 }; sp(9);
    A.update = (t) => { motes.rotation.y = t * 0.03; motes.position.y = Math.sin(t * 0.5) * 0.3; };
  }
  if (id === 'dawntreader') {
    scene.background = new THREE.Color(0x8fd0f5); scene.fog = new THREE.Fog(0xa8dcf8, 40, 140);
    lights(scene, { sky: 0xd8f0ff, ground: 0x2a6a8a, hemi: 1.1, sun: 0xfff6e0, sunI: 1.8, sunPos: [15, 30, -10] });
    const seaGeo = new THREE.PlaneGeometry(300, 300, 60, 60).rotateX(-Math.PI / 2);
    const sea = add(scene, seaGeo, M(0x1f78b4, { r: 0.35, m: 0.1, flat: true }), 0, -1.6, 0, { cast: false });
    const ship = new THREE.Group(); scene.add(ship);
    const wood = M(0x8a5a32, { flat: true }), dark = M(0x5a3a1e, { flat: true }), gold = M(0xd4a020, { m: 0.6, r: 0.4 });
    const hull = new THREE.Mesh(new THREE.BoxGeometry(14, 3, 34), M(0x6a3e1e, { flat: true })); hull.position.y = -1.55; hull.receiveShadow = true; ship.add(hull);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(13, 0.2, 33), wood); deck.position.y = -0.1; deck.receiveShadow = true; ship.add(deck);
    for (let i = -6; i <= 6; i++) { const pl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.21, 33), dark); pl.position.set(i, -0.09, 0); ship.add(pl); }
    for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 33), dark); r.position.set(s * 6.6, 0.5, 0); r.castShadow = true; ship.add(r); }
    for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(13.5, 1.1, 0.3), dark); r.position.set(0, 0.5, s * 16.6); ship.add(r); }
    // dragon prow (front +z) and stern castle
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.2, 6, 8), gold); neck.position.set(0, 2, 18.5); neck.rotation.x = 0.6; neck.castShadow = true; ship.add(neck);
    const dh = new THREE.Mesh(new THREE.ConeGeometry(1, 2.6, 6), gold); dh.position.set(0, 4.6, 20.4); dh.rotation.x = Math.PI / 2; ship.add(dh);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.8, 5, 6), gold); tail.position.set(0, 2.5, -18.2); tail.rotation.x = -0.6; ship.add(tail);
    // mast + purple sail (the Dawn Treader's sail is purple with a gold lion... kept simple)
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 16, 10), dark); mast.position.set(0, 7.9, 1); mast.castShadow = true; ship.add(mast);
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(10, 8, 10, 6), new THREE.MeshStandardMaterial({ color: 0x7a3ea0, side: THREE.DoubleSide, roughness: 0.9 })); sail.position.set(0, 9, 1.6); sail.castShadow = true; ship.add(sail);
    const lionE = new THREE.Mesh(new THREE.CircleGeometry(1.6, 20), new THREE.MeshStandardMaterial({ color: 0xe0b020, side: THREE.DoubleSide, emissive: 0x403000 })); lionE.position.set(0, 9, 1.65); ship.add(lionE);
    const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 11, 6), dark); yard.rotation.z = Math.PI / 2; yard.position.set(0, 13, 1.5); ship.add(yard);
    A.obstacles.push({ type: 'cyl', x: 0, z: 1, r: 0.7 });
    // barrels & cargo (platform crates)
    for (const [x, z] of [[-4.5, -6], [4.5, 8], [-4.5, 10]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.2, 12), wood); b.position.set(x, 0.6, z); b.castShadow = true; ship.add(b); A.obstacles.push({ type: 'cyl', x, z, r: 0.65 }); }
    const crate = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 2.4), M(0xa0703e, { flat: true })); crate.position.set(3.5, 0.6, -8); crate.castShadow = crate.receiveShadow = true; ship.add(crate);
    A.platforms.push({ x: 3.5, z: -8, w: 2.4, d: 2.4, h: 1.2 });
    const spray = particles(scene, 200, 30, 0xffffff, 0.15, 3);
    A.bounds = { type: 'rect', w: 6.1, d: 16.1 };
    A.spawns = [[-3, -11], [3, -11], [-4, 0], [4, 0], [-3, 12], [3, 12]].map(([x, z]) => new THREE.Vector3(x, 0, z));
    const base = seaGeo.attributes.position.array.slice();
    A.update = (t) => { const p = seaGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.setY(i, Math.sin(x * 0.12 + t * 1.3) * 0.5 + Math.cos(z * 0.1 + t) * 0.5); } p.needsUpdate = true; seaGeo.computeVertexNormals();
      ship.rotation.z = Math.sin(t * 0.6) * 0.015; ship.rotation.x = Math.sin(t * 0.45) * 0.01; const sp = sail.geometry.attributes.position; for (let i = 0; i < sp.count; i++) { sp.setZ(i, Math.sin(sp.getX(i) * 0.3 + t * 2) * 0.25 + 0.8 * (1 - Math.abs(sp.getX(i)) / 5)); } sp.needsUpdate = true; spray.position.y = Math.sin(t) * 0.2; };
  }
  if (id === 'underland') {
    scene.background = new THREE.Color(0x0b0d14); scene.fog = new THREE.Fog(0x0b0d14, 14, 48);
    scene.add(new THREE.HemisphereLight(0x5a6a9a, 0x101010, 0.75));
    const d = new THREE.DirectionalLight(0x8899cc, 0.6); d.position.set(5, 20, 5); d.castShadow = true; d.shadow.mapSize.set(1024, 1024); Object.assign(d.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); scene.add(d);
    add(scene, new THREE.CylinderGeometry(17, 18, 1, 32, 1), M(0x3a3836, { flat: true }), 0, -0.5, 0, { cast: false });
    add(scene, new THREE.CircleGeometry(80, 32).rotateX(-Math.PI / 2), M(0x0a2030, { r: 0.2, m: 0.3 }), 0, -0.9, 0, { cast: false }); // dark underground sea
    const rockM = M(0x2e2c2a, { flat: true });
    for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; const r = rand(19, 23); add(scene, new THREE.DodecahedronGeometry(rand(3, 5.5), 0), rockM, Math.cos(a) * r, rand(1, 5), Math.sin(a) * r); }
    for (let i = 0; i < 60; i++) { const a = rand(0, Math.PI * 2), r = rand(2, 24); const h = rand(2, 7); add(scene, new THREE.ConeGeometry(rand(0.3, 0.9), h, 6), rockM, Math.cos(a) * r, 16 - h / 2, Math.sin(a) * r, { cast: false }).rotation.x = Math.PI; }
    add(scene, new THREE.CircleGeometry(30, 24).rotateX(Math.PI / 2), rockM, 0, 16, 0, { cast: false });
    // glowing fungi + lamps
    const lamps = [];
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.5, r = 13; const x = Math.cos(a) * r, z = Math.sin(a) * r;
      add(scene, new THREE.CylinderGeometry(0.12, 0.15, 3.2, 6), M(0x2a2a2a, { m: 0.5 }), x, 1.6, z); const lp = add(scene, new THREE.SphereGeometry(0.35, 10, 8), M(0xffc060, { e: 0xffa030, ei: 2 }), x, 3.4, z, { cast: false });
      const pl = new THREE.PointLight(0xffaa50, 14, 14, 1.6); pl.position.set(x, 3.4, z); scene.add(pl); lamps.push(pl); A.obstacles.push({ type: 'cyl', x, z, r: 0.4 }); }
    for (let i = 0; i < 40; i++) { const a = rand(0, Math.PI * 2), r = rand(4, 16); const x = Math.cos(a) * r, z = Math.sin(a) * r; const s = rand(0.15, 0.4);
      add(scene, new THREE.CylinderGeometry(0.04, 0.05, s * 1.5, 5), M(0xd0e0c0), x, s * 0.75, z, { cast: false }); add(scene, new THREE.SphereGeometry(s, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0x60ff9a, { e: 0x30d070, ei: 1.4 }), x, s * 1.5, z, { cast: false }); }
    // the Silver Chair on a dais (platform)
    add(scene, new THREE.BoxGeometry(3, 0.8, 3), M(0x4a4846, { flat: true }), 0, 0.4, -9);
    A.platforms.push({ x: 0, z: -9, w: 3, d: 3, h: 0.8 });
    const silver = M(0xd8dde6, { m: 0.9, r: 0.25 });
    add(scene, new THREE.BoxGeometry(1.2, 0.15, 1.1), silver, 0, 1.4, -9.5); add(scene, new THREE.BoxGeometry(1.2, 1.6, 0.12), silver, 0, 2.2, -10.0);
    for (const sx of [-0.55, 0.55]) for (const sz of [-9.0, -10.0]) add(scene, new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6), silver, sx, 1.1, sz);
    const glow = particles(scene, 300, 16, 0x80ffb0, 0.08, 10);
    A.bounds = { type: 'circle', r: 15.5 }; A.camR = 17; sp(10);
    A.update = (t) => { lamps.forEach((l, i) => l.intensity = 12 + Math.sin(t * 7 + i * 2) * 2.5); glow.rotation.y = t * 0.02; };
  }
  if (MORE[id]) MORE[id](scene, A);
  if (!A.spawns.length) sp(Math.min(10, (A.bounds.r || 10) - 3));
  return A;
}
