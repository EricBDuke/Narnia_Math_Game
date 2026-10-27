// Ten more arenas (two per book). Procedural placeholder scenes with distinct layouts, colors and props.
import * as THREE from 'three';
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.85, metalness: o.m ?? 0, flatShading: o.flat ?? true, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 1, transparent: !!o.t, opacity: o.op ?? 1, side: o.ds ? THREE.DoubleSide : THREE.FrontSide });
function add(scene, geo, mat, x, y, z, o = {}) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true; if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; scene.add(m); return m; }
const rand = (a, b) => a + Math.random() * (b - a);
const B = (w, h, d) => new THREE.BoxGeometry(w, h, d), C = (rt, rb, h, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s), S = (r, w = 12, h = 8) => new THREE.SphereGeometry(r, w, h), K = (r, h, s = 8) => new THREE.ConeGeometry(r, h, s);
function lights(scene, o) {
  scene.background = new THREE.Color(o.bg); scene.fog = new THREE.Fog(o.fog ?? o.bg, o.near ?? 30, o.far ?? 90);
  scene.add(new THREE.HemisphereLight(o.sky, o.ground, o.hemi));
  const d = new THREE.DirectionalLight(o.sun, o.sunI); d.position.set(...(o.sunPos || [10, 25, 10])); d.castShadow = true; d.shadow.mapSize.set(1024, 1024);
  Object.assign(d.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 80 }); d.shadow.bias = -0.0008; scene.add(d);
}
function pts(scene, n, area, color, size, h) { const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = rand(-area, area); p[i * 3 + 1] = rand(0, h); p[i * 3 + 2] = rand(-area, area); } g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const o = new THREE.Points(g, new THREE.PointsMaterial({ color, size, transparent: true, opacity: .8, depthWrite: false })); scene.add(o); return o; }
function tree(scene, x, z, o = {}) { const s = o.s || 1; add(scene, C(0.22 * s, 0.32 * s, 2.4 * s, 6), M(o.trunk || 0x5a3a1e), x, 1.2 * s, z); const t = add(scene, o.round ? S(1.6 * s, 8, 6) : K(1.7 * s, 4.5 * s, 7), M(o.leaf || 0x2f6a2a), x, (o.round ? 3.4 : 4.4) * s, z); return t; }
function torch(scene, x, z, h = 2.6, color = 0xff9a40, A) { add(scene, C(0.08, 0.1, h, 6), M(0x3a2a1a), x, h / 2, z); const f = add(scene, S(0.22, 8, 6), M(0xffc060, { e: color, ei: 2.2 }), x, h + 0.1, z, { cast: false }); const l = new THREE.PointLight(color, 10, 12, 1.6); l.position.set(x, h + 0.3, z); scene.add(l); if (A) A.obstacles.push({ type: 'cyl', x, z, r: 0.3 }); return { f, l }; }
const ring = (n, r, off = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2 + off; return [Math.cos(a) * r, Math.sin(a) * r, a]; });

export const MORE = {
  // ---------- The Magician's Nephew ----------
  charn(scene, A) {
    lights(scene, { bg: 0x3a0a08, fog: 0x4a1208, near: 20, far: 70, sky: 0xff8a60, ground: 0x200808, hemi: 0.8, sun: 0xff5a30, sunI: 1.4, sunPos: [-15, 12, -25] });
    add(scene, S(9, 24, 16), new THREE.MeshBasicMaterial({ color: 0xd8401a }), -40, 18, -70, { cast: false }); // the great dying sun
    add(scene, B(18, 0.4, 40), M(0x4a3a3a), 0, -0.2, 0, { cast: false });
    for (let z = -18; z <= 18; z += 2) add(scene, B(18, 0.02, 0.06), M(0x2a1e1e), 0, 0.01, z, { cast: false });
    const stone = M(0x7a6a64), robe = [0x6a2a4a, 0x2a3a6a, 0x5a4a1a, 0x3a5a3a];
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { const z = -15 + i * 5; add(scene, B(1.6, 0.6, 1.6), stone, s * 7.2, 0.3, z); add(scene, B(1.4, 2.2, 0.3), stone, s * 7.8, 1.7, z);
      add(scene, C(0.4, 0.55, 1.6, 8), M(robe[i % 4]), s * 7.2, 1.4, z); add(scene, S(0.3), M(0xc8b8a8), s * 7.2, 2.5, z); add(scene, C(0.22, 0.2, 0.18, 8), M(0xd4a020, { m: .7, r: .3 }), s * 7.2, 2.8, z); A.obstacles.push({ type: 'cyl', x: s * 7.2, z, r: 0.9 }); }
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { add(scene, C(0.7, 0.8, 12, 10), M(0x5a4a48), s * 9.5, 6, -16 + i * 6.4); }
    add(scene, B(22, 1, 44), M(0x2a1e1e), 0, 12.5, 0, { cast: false }).visible = false;
    // the golden bell on its arch, with the little hammer
    add(scene, B(0.3, 3.2, 0.3), M(0xb08a20, { m: .7, r: .35 }), -1.1, 1.6, 0); add(scene, B(0.3, 3.2, 0.3), M(0xb08a20, { m: .7, r: .35 }), 1.1, 1.6, 0); add(scene, B(2.6, 0.3, 0.3), M(0xb08a20, { m: .7, r: .35 }), 0, 3.25, 0);
    const bell = add(scene, K(0.6, 1.0, 14), M(0xf0c040, { m: .9, r: .25, flat: false }), 0, 2.5, 0); add(scene, B(1.0, 0.8, 1.0), M(0x5a4a48), 0, 0.4, 0);
    A.platforms.push({ x: 0, z: 0, w: 1.0, d: 1.0, h: 0.8 }); A.obstacles.push({ type: 'cyl', x: -1.1, z: 0, r: 0.3 }, { type: 'cyl', x: 1.1, z: 0, r: 0.3 });
    const dust = pts(scene, 300, 12, 0xff9a70, 0.08, 10);
    A.bounds = { type: 'rect', w: 6.0, d: 17.5 }; A.camR = null;
    A.spawns = [[-3, -12], [3, -12], [-4, 0], [4, 0], [-3, 12], [3, 12]].map(([x, z]) => new THREE.Vector3(x, 0, z));
    A.update = (t) => { bell.rotation.z = Math.sin(t * 1.2) * 0.08; dust.rotation.y = t * 0.02; };
  },
  creation(scene, A) {
    lights(scene, { bg: 0xffd9a8, fog: 0xffe6c0, near: 35, far: 110, sky: 0xfff2d0, ground: 0x5a8a3a, hemi: 1.1, sun: 0xffe2a0, sunI: 1.9, sunPos: [25, 10, -20] });
    add(scene, new THREE.CircleGeometry(80, 40).rotateX(-Math.PI / 2), M(0x78b040), 0, -0.02, 0, { cast: false });
    add(scene, S(6, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff6d0 }), 50, 8, -60, { cast: false });
    // river
    const river = add(scene, B(4, 0.05, 80), M(0x4ab0e0, { r: .2, m: .1 }), 0, 0.02, 0, { cast: false, ry: 0.5 }); river.position.x = -12;
    for (const [x, z] of [[-30, -30], [30, -35], [-35, 20], [35, 25], [0, -45]]) add(scene, S(rand(10, 16), 10, 8), M(0x6a9a3a), x, -3, z, { cast: false });
    const sprouts = [];
    for (const [x, z] of ring(9, 16.8, 0.2)) { const t = tree(scene, x, z, { leaf: [0x4aa03a, 0x8ac040, 0x3a8a4a][Math.floor(rand(0, 3))], round: true, s: rand(0.8, 1.2) }); sprouts.push(t); A.obstacles.push({ type: 'cyl', x, z, r: 0.6 }); }
    // the lamp-post growing from the iron bar
    add(scene, C(0.09, 0.14, 4, 8), M(0x2a2a2a, { m: .6, r: .4 }), 3, 2, -3); const lampG = add(scene, S(0.3, 10, 8), M(0xfff0b0, { e: 0xffd060, ei: 1.5 }), 3, 4.2, -3, { cast: false }); A.obstacles.push({ type: 'cyl', x: 3, z: -3, r: 0.35 });
    // grassy mounds (animals rising from the earth) as low platforms
    for (const [x, z, s] of [[-5, 4, 2.2], [6, 5, 1.8]]) { add(scene, S(s, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x6aa040), x, 0, z); A.platforms.push({ x, z, w: s * 1.1, d: s * 1.1, h: 0.9 }); }
    const flowers = pts(scene, 400, 16, 0xffe080, 0.12, 0.4);
    A.bounds = { type: 'circle', r: 15 }; A.camR = null;
    A.update = (t) => { sprouts.forEach((s, i) => s.scale.setScalar(1 + Math.sin(t * 0.8 + i) * 0.04)); lampG.material.emissiveIntensity = 1.3 + Math.sin(t * 2) * 0.3; };
  },
  // ---------- The Horse and His Boy ----------
  tashbaan(scene, A) {
    lights(scene, { bg: 0xf0c890, fog: 0xf0d0a0, near: 30, far: 90, sky: 0xfff0d0, ground: 0xb08050, hemi: 1.0, sun: 0xfff0c0, sunI: 2.0, sunPos: [10, 30, 15] });
    add(scene, C(16, 16, 0.3, 40), M(0xd8b07a), 0, -0.15, 0, { cast: false });
    for (const [x, z] of ring(24, 8)) add(scene, B(1.5, 0.02, 1.5), M(0xc0905a), x, 0.01, z, { cast: false });
    const sand = M(0xe0b880), dome = M(0xd09a30, { m: .5, r: .4, flat: false });
    for (const [x, z, a] of ring(10, 21, 0.1)) { const h = rand(5, 10); add(scene, B(6, h, 6), sand, x, h / 2, z, { ry: -a }); add(scene, S(2.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), dome, x, h, z); if (Math.random() < .5) add(scene, C(0.4, 0.5, 4, 8), sand, x + 2, h + 2, z); }
    // terraces: steps as platforms
    for (const [x, z, a] of ring(4, 13, 0.8)) { add(scene, B(3.5, 1.0, 3.5), M(0xc89a62), x, 0.5, z, { ry: 0 }); A.platforms.push({ x, z, w: 3.5, d: 3.5, h: 1.0 }); }
    // fountain at the center
    add(scene, C(2.2, 2.4, 0.8, 20), M(0xd8c0a0), 0, 0.4, 0); const water = add(scene, C(1.9, 1.9, 0.1, 20), M(0x40a8d8, { r: .1, m: .2, flat: false }), 0, 0.8, 0, { cast: false }); add(scene, C(0.25, 0.35, 2, 8), M(0xd8c0a0), 0, 1.4, 0);
    A.obstacles.push({ type: 'cyl', x: 0, z: 0, r: 2.3 });
    for (const [x, z] of ring(6, 15.5, 0.5)) { add(scene, C(0.18, 0.28, 5, 6), M(0x8a6a3a), x, 2.5, z); for (let k = 0; k < 6; k++) add(scene, B(2.4, 0.05, 0.5), M(0x3a7a2a), x + Math.cos(k) * 0.9, 5, z + Math.sin(k) * 0.9, { ry: k, rz: -0.4 }); A.obstacles.push({ type: 'cyl', x, z, r: 0.4 }); }
    // awnings / banners
    for (const [x, z, a] of ring(8, 17, 0.3)) add(scene, B(2.5, 0.05, 1.5), M([0xb0302a, 0x2a5a9a, 0xe0a020][Math.floor(rand(0, 3))]), x, 3, z, { ry: -a, rz: 0.2 });
    A.bounds = { type: 'circle', r: 15.5 }; A.camR = 17;
    A.update = (t) => { water.position.y = 0.8 + Math.sin(t * 3) * 0.02; };
  },
  anvard(scene, A) {
    lights(scene, { bg: 0xa8c0d8, fog: 0xb8c8d8, near: 30, far: 90, sky: 0xe0ecff, ground: 0x5a6a3a, hemi: 1.0, sun: 0xfff4e0, sunI: 1.7, sunPos: [-15, 25, 10] });
    add(scene, new THREE.CircleGeometry(70, 32).rotateX(-Math.PI / 2), M(0x6a8a3a), 0, -0.02, 0, { cast: false });
    add(scene, C(16, 16, 0.25, 36), M(0x8a7a62), 0, -0.1, 0, { cast: false });
    const wall = M(0x8a6a5a);
    // castle wall + gate across the north side
    for (let x = -18; x <= 18; x += 4) { if (Math.abs(x) < 3) continue; add(scene, B(4, 8, 2), wall, x, 4, -16.5); add(scene, B(1.4, 1.2, 2.1), wall, x - 1, 8.6, -16.5); }
    add(scene, B(6, 3, 2), wall, 0, 6.5, -16.5); add(scene, B(4.6, 5, 0.4), M(0x5a3a1e), 0, 2.5, -16.2); // the gate
    for (const x of [-4.5, 4.5]) { add(scene, C(2, 2.2, 12, 10), wall, x, 6, -17); add(scene, K(2.4, 4, 10), M(0x3a5a8a), x, 14, -17); }
    // banners of Archenland
    for (const x of [-8, 8]) add(scene, B(1.4, 3, 0.05), M(0xb02a2a), x, 6, -15.4);
    // battering ram (tree trunk) and siege ladders
    add(scene, C(0.6, 0.6, 7, 10), M(0x6a4a2a), -2, 0.6, -6, { rz: Math.PI / 2, ry: 0.4 }); A.obstacles.push({ type: 'cyl', x: -3.5, z: -5.4, r: 0.8 }, { type: 'cyl', x: -2, z: -6, r: 0.8 }, { type: 'cyl', x: -0.5, z: -6.6, r: 0.8 });
    for (const x of [-11, 10]) { add(scene, B(1.2, 7, 0.15), M(0x7a5a2a), x, 3.2, -15, { rx: 0.3 }); }
    // tents & barricades of the Calormene camp to the south
    for (const [x, z] of [[-9, 9], [0, 13], [9, 9]]) { add(scene, K(2.2, 3, 4), M(0xd8c8a0), x, 1.5, z, { ry: 0.78 }); A.obstacles.push({ type: 'cyl', x, z, r: 1.8 }); }
    for (const [x, z] of [[8, -3], [-9, 1]]) { add(scene, B(3, 1.0, 1), M(0x7a5a2a), x, 0.5, z); A.platforms.push({ x, z, w: 3, d: 1, h: 1.0 }); }
    for (const [x, z] of ring(14, 30)) tree(scene, x, z, { s: 1.4 });
    A.bounds = { type: 'circle', r: 15 }; A.camR = null;
    A.update = () => {};
  },
  // ---------- Prince Caspian ----------
  aslanshow(scene, A) {
    lights(scene, { bg: 0x1a120a, fog: 0x1a120a, near: 16, far: 50, sky: 0xffb070, ground: 0x2a1a0a, hemi: 0.55, sun: 0xffc080, sunI: 0.5, sunPos: [0, 25, 0] });
    add(scene, C(16, 16, 0.4, 36), M(0x5a4632), 0, -0.2, 0, { cast: false });
    const carved = M(0x7a6a52);
    for (const [x, z, a] of ring(16, 17)) { add(scene, B(6.6, 12, 1.4), carved, x, 6, z, { ry: -a + Math.PI / 2 });
      add(scene, new THREE.TorusGeometry(0.9, 0.12, 6, 16), M(0xc8a060, { m: .3 }), x * 0.96, 4, z * 0.96, { ry: -a + Math.PI / 2, cast: false }); }
    add(scene, new THREE.CircleGeometry(19, 24).rotateX(Math.PI / 2), M(0x3a2a1a), 0, 12, 0, { cast: false });
    // the broken Stone Table at the heart of the How (low platform)
    add(scene, B(2.0, 0.9, 4.8), M(0x8a8478), -1.2, 0.45, 0, { ry: 0.12 }); add(scene, B(2.0, 0.9, 4.8), M(0x8a8478), 1.2, 0.45, 0, { ry: -0.12 });
    A.platforms.push({ x: 0, z: 0, w: 4.4, d: 4.8, h: 0.9 });
    const fl = []; for (const [x, z] of ring(8, 12.5, 0.4)) fl.push(torch(scene, x, z, 2.4, 0xff8a30, A));
    // tunnel mouths
    for (const [x, z, a] of ring(4, 16.2, 0.4)) add(scene, B(3, 3.4, 0.6), M(0x0a0806), x, 1.7, z, { ry: -a + Math.PI / 2, cast: false });
    // carved pillars inside the chamber
    for (const [x, z] of ring(6, 8, 0)) { add(scene, C(0.5, 0.6, 12, 8), carved, x, 6, z); A.obstacles.push({ type: 'cyl', x, z, r: 0.7 }); }
    A.bounds = { type: 'circle', r: 15.3 }; A.camR = 15;
    A.update = (t) => fl.forEach((o, i) => { o.l.intensity = 9 + Math.sin(t * 9 + i) * 2; o.f.scale.setScalar(1 + Math.sin(t * 11 + i) * 0.15); });
  },
  cairparavel(scene, A) {
    lights(scene, { bg: 0x9ad0f0, fog: 0xb0d8f0, near: 35, far: 120, sky: 0xe0f4ff, ground: 0x4a7a4a, hemi: 1.05, sun: 0xfff6e0, sunI: 1.8, sunPos: [15, 28, 10] });
    const sea = add(scene, new THREE.PlaneGeometry(260, 260, 40, 40).rotateX(-Math.PI / 2), M(0x2a88c0, { r: .3, m: .1 }), 0, -1.2, 0, { cast: false });
    add(scene, C(20, 24, 2.4, 32), M(0x6a9a4a), 0, -1.2, 0, { cast: false });
    add(scene, C(14, 14, 0.12, 32), M(0xb8b0a0), 0, 0, 0, { cast: false });
    const marble = M(0xd8d0c0);
    // broken pillars of the great hall
    for (const [x, z, a] of ring(12, 12.5)) { const h = rand(1.5, 6); add(scene, C(0.55, 0.6, h, 10), marble, x, h / 2, z); A.obstacles.push({ type: 'cyl', x, z, r: 0.7 }); if (h < 3) add(scene, C(0.55, 0.55, 1.6, 10), marble, x + 1.2, 0.5, z + 0.5, { rz: Math.PI / 2, ry: a }); }
    // dais with the four thrones (step platform)
    add(scene, B(8, 0.8, 3), M(0xc8c0b0), 0, 0.4, -9); A.platforms.push({ x: 0, z: -9, w: 8, d: 3, h: 0.8 });
    for (const x of [-3, -1, 1, 3]) add(scene, B(1.2, 2.2, 0.6), M(0xb8a080), x, 1.9, -10.1);
    // ivy and the apple orchard that grew in the hall
    for (const [x, z] of [[-5, 4], [5, 3], [-2, 8], [3, -3]]) { tree(scene, x, z, { round: true, leaf: 0x3a7a2a, s: 0.9 }); for (let k = 0; k < 5; k++) add(scene, S(0.15, 6, 4), M(0xd03020), x + rand(-1, 1), 3 + rand(-0.5, 0.8), z + rand(-1, 1), { cast: false }); A.obstacles.push({ type: 'cyl', x, z, r: 0.5 }); }
    for (let i = 0; i < 18; i++) add(scene, B(rand(0.4, 1.2), rand(0.2, 0.6), rand(0.4, 1.0)), marble, rand(-11, 11), 0.15, rand(-11, 11), { ry: rand(0, 3) });
    A.bounds = { type: 'circle', r: 14 }; A.camR = null;
    const g = sea.geometry, base = g.attributes.position.array.slice();
    A.update = (t) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, Math.sin(base[i * 3] * 0.15 + t) * 0.35 + Math.cos(base[i * 3 + 2] * 0.12 + t * 0.8) * 0.35); p.needsUpdate = true; };
  },
  // ---------- The Voyage of the Dawn Treader ----------
  dragonisland(scene, A) {
    lights(scene, { bg: 0x8a9a98, fog: 0x9aaaa8, near: 22, far: 75, sky: 0xc8d8d0, ground: 0x3a3a30, hemi: 0.9, sun: 0xf0e8d0, sunI: 1.3, sunPos: [10, 25, -10] });
    add(scene, C(16, 17, 0.6, 30), M(0x5a5a48), 0, -0.3, 0, { cast: false });
    const rock = M(0x4a4a40);
    for (const [x, z] of ring(18, 20)) add(scene, new THREE.DodecahedronGeometry(rand(4, 7), 0), rock, x, rand(2, 5), z);
    for (const [x, z] of ring(6, 30, 0.3)) add(scene, K(rand(6, 9), rand(14, 22), 6), M(0x3a3a34), x, 7, z);
    // the pool where Eustace bathes, and the waterfall
    add(scene, C(3, 3, 0.1, 24), M(0x2a6a7a, { r: .1, m: .3, flat: false }), -8, 0.02, 5, { cast: false });
    const fall = add(scene, B(2.4, 9, 0.2), M(0xb0e0f0, { t: true, op: 0.7, e: 0x406070, ei: .5 }), -10.5, 4.5, 7.5, { ry: 0.8, cast: false });
    // the dragon's cave and its treasure hoard (gold piles are platforms)
    add(scene, S(4, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), rock, 7, 0, -9); add(scene, S(2.2, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x0a0a08), 6, 0, -6.6, { cast: false });
    A.obstacles.push({ type: 'cyl', x: 7, z: -9, r: 4 });
    const gold = M(0xe0b030, { m: .8, r: .3 });
    for (const [x, z, s] of [[2, -4, 1.6], [-3, -7, 1.3]]) { add(scene, S(s, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), gold, x, 0, z); A.platforms.push({ x, z, w: s * 1.2, d: s * 1.2, h: s * 0.6 }); for (let k = 0; k < 6; k++) add(scene, C(0.12, 0.12, 0.04, 10), gold, x + rand(-s, s) * 1.3, 0.03, z + rand(-s, s) * 1.3, { cast: false }); }
    // the dragon's bones / old dragon's head stone
    add(scene, K(0.5, 3, 6), M(0xe8e0c8), 6, 0.4, 6, { rz: 1.3 }); add(scene, K(0.5, 3, 6), M(0xe8e0c8), 6.5, 0.4, 7.5, { rz: 1.2 });
    A.obstacles.push({ type: 'cyl', x: -8, z: 5, r: 0.1 });
    const mist = pts(scene, 300, 18, 0xe0f0f0, 0.25, 6);
    A.bounds = { type: 'circle', r: 15.2 }; A.camR = 16;
    A.update = (t) => { mist.rotation.y = t * 0.03; fall.material.opacity = 0.6 + Math.sin(t * 6) * 0.08; };
  },
  // ---------- The Silver Chair ----------
  harfang(scene, A) {
    lights(scene, { bg: 0x2a1a10, fog: 0x2a1a10, near: 22, far: 70, sky: 0xffd0a0, ground: 0x3a2010, hemi: 0.75, sun: 0xffe0b0, sunI: 1.0, sunPos: [-10, 30, 10] });
    add(scene, B(34, 0.4, 34), M(0x8a6a4a), 0, -0.2, 0, { cast: false });
    for (let x = -16; x <= 16; x += 4) for (let z = -16; z <= 16; z += 4) add(scene, B(3.9, 0.02, 3.9), M((x + z) % 8 === 0 ? 0x7a5a3a : 0x6a4a2e), x, 0.01, z, { cast: false });
    const wall = M(0x7a6a5a);
    for (const [x, z, ry] of [[0, -17, 0], [0, 17, 0], [-17, 0, Math.PI / 2], [17, 0, Math.PI / 2]]) add(scene, B(34, 20, 1), wall, x, 10, z, { ry });
    // giant table legs (the tabletop is far above) and giant chair
    const wood = M(0x5a3a1e);
    for (const [x, z] of [[-6, -4], [6, -4], [-6, 4], [6, 4]]) { add(scene, C(0.9, 1.1, 11, 10), wood, x, 5.5, z); A.obstacles.push({ type: 'cyl', x, z, r: 1.1 }); }
    add(scene, B(15, 0.8, 11), wood, 0, 11.4, 0); add(scene, B(16, 0.3, 12), M(0xe8e0c8), 0, 11.9, 0); // tablecloth
    // giant fireplace with roaring fire
    add(scene, B(8, 7, 2), M(0x5a4a40), 0, 3.5, -15.8); add(scene, B(5, 4, 1), M(0x0a0806), 0, 2, -14.9, { cast: false });
    const fire = add(scene, K(1.6, 2.6, 8), M(0xff8a20, { e: 0xff6a10, ei: 2.5 }), 0, 1.3, -14.6, { cast: false }); const fl = new THREE.PointLight(0xff8a30, 30, 25, 1.4); fl.position.set(0, 2, -13); scene.add(fl);
    A.obstacles.push({ type: 'cyl', x: 0, z: -14.6, r: 2 });
    // giant bowl and spoon on the floor (platform), stools
    add(scene, S(2.2, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xc8b090, { flat: false }), -10, 1.2, 9); A.platforms.push({ x: -10, z: 9, w: 3.4, d: 3.4, h: 1.2 });
    add(scene, B(1.0, 0.25, 7), M(0xc0c0c8, { m: .8, r: .3 }), 9, 0.12, 9, { ry: 0.6 });
    add(scene, B(3, 1.2, 3), wood, 10, 0.6, -8); A.platforms.push({ x: 10, z: -8, w: 3, d: 3, h: 1.2 });
    // snowy windows
    for (const x of [-10, 10]) add(scene, B(4, 6, 0.1), M(0xd0e0f0, { e: 0x8090a0, ei: .6 }), x, 9, 16.4, { cast: false });
    A.bounds = { type: 'rect', w: 15.5, d: 15.5 }; A.camR = 15.5;
    A.update = (t) => { fire.scale.set(1 + Math.sin(t * 9) * .1, 1 + Math.sin(t * 7) * .2, 1); fl.intensity = 26 + Math.sin(t * 13) * 5; };
  },
  // ---------- The Last Battle ----------
  stablehill(scene, A) {
    lights(scene, { bg: 0x0e1430, fog: 0x0e1430, near: 22, far: 70, sky: 0x6a7ab0, ground: 0x1a1a10, hemi: 0.7, sun: 0xa8b8ff, sunI: 0.8, sunPos: [10, 25, -10] });
    add(scene, C(17, 22, 2, 36), M(0x3a4a28), 0, -1, 0, { cast: false });
    add(scene, new THREE.CircleGeometry(80, 30).rotateX(-Math.PI / 2), M(0x1a2414), 0, -2, 0, { cast: false });
    // the stable with its door (obstacle)
    add(scene, B(5, 3.4, 3.4), M(0x5a4028), 0, 1.7, -10); add(scene, B(5.6, 0.3, 4.2), M(0x3a2a18), 0, 3.6, -10, { rz: 0.0 }); add(scene, B(1.4, 2.4, 0.1), M(0x2a1a0e), 0, 1.2, -8.25);
    A.obstacles.push({ type: 'cyl', x: -1.6, z: -10, r: 1.9 }, { type: 'cyl', x: 1.6, z: -10, r: 1.9 });
    // the great bonfire
    add(scene, C(1.6, 1.8, 0.4, 10), M(0x2a2a2a), 0, 0.2, 2); const fire = add(scene, K(1.2, 2.6, 8), M(0xff9a30, { e: 0xff7010, ei: 2.6 }), 0, 1.5, 2, { cast: false });
    const fl = new THREE.PointLight(0xff9a40, 40, 26, 1.3); fl.position.set(0, 2.5, 2); scene.add(fl); A.obstacles.push({ type: 'cyl', x: 0, z: 2, r: 1.6 });
    // the white stone where Tirian is tied, and the trees of the grove
    add(scene, B(1.0, 1.0, 1.0), M(0xd8d8d0), -7, 0.5, -3); A.platforms.push({ x: -7, z: -3, w: 1.0, d: 1.0, h: 1.0 });
    for (const [x, z] of ring(10, 16.8, 0.2)) { if (z < -11 && Math.abs(x) < 4) continue; tree(scene, x, z, { leaf: 0x1a3a1a, trunk: 0x2a1a0e }); A.obstacles.push({ type: 'cyl', x, z, r: 0.5 }); }
    for (const [x, z] of [[8, 6], [-9, 7], [10, -4]]) torch(scene, x, z, 2.4, 0xff8a30, A);
    const stars = pts(scene, 500, 60, 0xffffff, 0.25, 40); stars.position.y = 20;
    const sparks = pts(scene, 80, 1.5, 0xffb060, 0.12, 6); sparks.position.set(0, 1, 2);
    A.bounds = { type: 'circle', r: 15.3 }; A.camR = null;
    A.update = (t) => { fire.scale.set(1 + Math.sin(t * 9) * .12, 1 + Math.sin(t * 7) * .22, 1); fl.intensity = 36 + Math.sin(t * 13) * 6; sparks.rotation.y = t; sparks.position.y = 1 + (t % 2); };
  },
  aslanscountry(scene, A) {
    lights(scene, { bg: 0xfff4d8, fog: 0xfff2d0, near: 40, far: 140, sky: 0xffffff, ground: 0x8ad070, hemi: 1.15, sun: 0xfff0c0, sunI: 2.0, sunPos: [0, 30, -20] });
    add(scene, new THREE.CircleGeometry(90, 40).rotateX(-Math.PI / 2), M(0x9ad868), 0, -0.02, 0, { cast: false });
    add(scene, C(16, 16, 0.1, 40), M(0xb0e880), 0, 0.03, 0, { cast: false });
    // the great waterfall and the mountains of Aslan's Country beyond
    for (const [x, z, h] of [[-40, -70, 50], [0, -85, 70], [45, -65, 45]]) add(scene, K(25, h, 7), M(0xc8d8f0), x, h / 2 - 2, z, { cast: false });
    const fall = add(scene, B(8, 26, 0.5), M(0xe8f8ff, { e: 0xa0d8ff, ei: .8, t: true, op: .85 }), 0, 12, -30, { cast: false });
    add(scene, C(9, 9, 0.2, 24), M(0x80d0f0, { r: .1, m: .2, flat: false }), 0, 0.05, -24, { cast: false });
    // golden fruit trees
    const fruit = [];
    for (const [x, z] of ring(8, 16.8, 0.3)) { tree(scene, x, z, { round: true, leaf: 0x5ab040, s: 1.1 }); for (let k = 0; k < 4; k++) fruit.push(add(scene, S(0.2, 8, 6), M(0xffc020, { e: 0xa06000, ei: .6, m: .3 }), x + rand(-1, 1), 3.6 + rand(-0.4, 0.8), z + rand(-1, 1), { cast: false })); A.obstacles.push({ type: 'cyl', x, z, r: 0.6 }); }
    // the door in the stable that leads here, standing alone
    add(scene, B(0.3, 3, 0.3), M(0x7a5a3a), -1, 1.5, 9); add(scene, B(0.3, 3, 0.3), M(0x7a5a3a), 1, 1.5, 9); add(scene, B(2.3, 0.3, 0.3), M(0x7a5a3a), 0, 3.1, 9);
    A.obstacles.push({ type: 'cyl', x: -1, z: 9, r: 0.3 }, { type: 'cyl', x: 1, z: 9, r: 0.3 });
    // gentle grassy steps (further up!)
    for (const [x, z, h] of [[-6, -6, 0.6], [-6, -9, 1.2], [6, -6, 0.6], [6, -9, 1.2]]) { add(scene, B(3, h, 3), M(0xa8e070), x, h / 2, z); A.platforms.push({ x, z, w: 3, d: 3, h }); }
    const glow = pts(scene, 500, 18, 0xfff0a0, 0.12, 10);
    A.bounds = { type: 'circle', r: 15.3 }; A.camR = null;
    A.update = (t) => { glow.rotation.y = t * 0.04; glow.position.y = Math.sin(t * .6) * .4; fruit.forEach((f, i) => f.material.emissiveIntensity = .5 + Math.sin(t * 2 + i) * .3); fall.material.opacity = .8 + Math.sin(t * 5) * .05; };
  },
};
