// Visual effects: GPU point particles, slash swooshes, impact flashes, shock rings, beams.
// Everything is generated in code (canvas textures + shaders). No image files.
import * as THREE from 'three';

function canvasTex(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export const TEX = {};
function makeTextures() {
  if (TEX.glow) return;
  TEX.glow = canvasTex(128, (g, s) => { const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, s, s); });
  TEX.star = canvasTex(256, (g, s) => {
    g.translate(s / 2, s / 2); const r = g.createRadialGradient(0, 0, 0, 0, 0, s / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.2, 'rgba(255,255,255,.7)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(-s / 2, -s / 2, s, s);
    g.fillStyle = 'rgba(255,255,255,.95)';
    for (let i = 0; i < 8; i++) { g.save(); g.rotate(i * Math.PI / 4 + 0.2); const L = i % 2 ? s * 0.28 : s * 0.48; g.beginPath(); g.moveTo(0, -5); g.lineTo(L, 0); g.lineTo(0, 5); g.closePath(); g.fill(); g.restore(); }
  });
  TEX.beam = canvasTex(64, (g, s) => { const r = g.createLinearGradient(0, 0, 0, s); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(0.5, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, s, s); });
  TEX.shadow = canvasTex(128, (g, s) => { const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, 'rgba(0,0,0,.55)'); r.addColorStop(0.6, 'rgba(0,0,0,.25)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, s, s); });
  TEX.ring = canvasTex(256, (g, s) => { const r = g.createRadialGradient(s / 2, s / 2, s * 0.3, s / 2, s / 2, s / 2); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(0.7, 'rgba(255,255,255,.9)'); r.addColorStop(0.85, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, s, s); });
}

const PT_VERT = `
attribute vec4 aCol; attribute float aSize; varying vec4 vCol; uniform float uScale;
void main(){ vCol = aCol; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = max(1.0, aSize * uScale / -mv.z); gl_Position = projectionMatrix * mv; }`;
const PT_FRAG = `
varying vec4 vCol;
void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; if (r > 1.0) discard; float a = pow(1.0 - r, 1.6); gl_FragColor = vec4(vCol.rgb, vCol.a * a); }`;

class Pool {
  constructor(scene, n, additive) {
    this.n = n; this.i = 0;
    this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 4); this.size = new Float32Array(n);
    this.vel = new Float32Array(n * 3); this.life = new Float32Array(n); this.age = new Float32Array(n); this.grav = new Float32Array(n); this.drag = new Float32Array(n); this.grow = new Float32Array(n); this.s0 = new Float32Array(n); this.a0 = new Float32Array(n);
    for (let k = 0; k < n; k++) this.pos[k * 3 + 1] = -9999;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aCol', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    this.mat = new THREE.ShaderMaterial({ vertexShader: PT_VERT, fragmentShader: PT_FRAG, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, uniforms: { uScale: { value: 600 } }, fog: false });
    this.pts = new THREE.Points(g, this.mat); this.pts.frustumCulled = false; this.pts.renderOrder = additive ? 20 : 12; scene.add(this.pts); this.g = g;
  }
  emit(x, y, z, vx, vy, vz, r, gg, b, a, size, life, grav = 0, drag = 0, grow = 0) {
    const k = this.i; this.i = (this.i + 1) % this.n; const p = k * 3, c = k * 4;
    this.pos[p] = x; this.pos[p + 1] = y; this.pos[p + 2] = z; this.vel[p] = vx; this.vel[p + 1] = vy; this.vel[p + 2] = vz;
    this.col[c] = r; this.col[c + 1] = gg; this.col[c + 2] = b; this.col[c + 3] = a; this.a0[k] = a; this.s0[k] = size; this.size[k] = size; this.life[k] = life; this.age[k] = 0; this.grav[k] = grav; this.drag[k] = drag; this.grow[k] = grow;
  }
  update(dt) {
    for (let k = 0; k < this.n; k++) {
      if (this.age[k] >= this.life[k]) { if (this.size[k] !== 0) { this.size[k] = 0; this.pos[k * 3 + 1] = -9999; } continue; }
      this.age[k] += dt; const t = this.age[k] / this.life[k]; const p = k * 3, d = Math.max(0, 1 - this.drag[k] * dt);
      this.vel[p] *= d; this.vel[p + 1] = this.vel[p + 1] * d - this.grav[k] * dt; this.vel[p + 2] *= d;
      this.pos[p] += this.vel[p] * dt; this.pos[p + 1] += this.vel[p + 1] * dt; this.pos[p + 2] += this.vel[p + 2] * dt;
      this.col[k * 4 + 3] = this.a0[k] * (1 - t) * (t < 0.1 ? t / 0.1 : 1); this.size[k] = this.s0[k] * (1 + this.grow[k] * t);
    }
    this.g.attributes.position.needsUpdate = true; this.g.attributes.aCol.needsUpdate = true; this.g.attributes.aSize.needsUpdate = true;
  }
}

const SW_VERT = `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const SW_FRAG = `
varying vec2 vP; uniform float uP, uSpan, uInner, uOuter, uTail, uFade; uniform vec3 uCol;
void main(){
  float a = atan(vP.y, vP.x); float t = (a + uSpan * 0.5) / uSpan; if (t < 0.0 || t > 1.0) discard;
  float head = uP * (1.0 + uTail); float d = head - t; if (d < 0.0 || d > uTail) discard;
  float along = 1.0 - d / uTail; float r = (length(vP) - uInner) / (uOuter - uInner);
  float prof = smoothstep(0.0, 0.25, r) * (1.0 - smoothstep(0.55, 1.0, r)) * 1.2 + smoothstep(0.35, 0.5, r) * (1.0 - smoothstep(0.5, 0.62, r)) * 0.9;
  float al = pow(along, 1.6) * prof * (1.0 - uFade);
  gl_FragColor = vec4(mix(uCol, vec3(1.0), pow(along, 5.0) * 0.8), al);
}`;

export class FX {
  constructor(scene) {
    makeTextures(); this.scene = scene; this.items = [];
    this.add = new Pool(scene, 2600, true); this.dust = new Pool(scene, 900, false);
    this.swGeoCache = {};
  }
  setScale(pxPerUnit) { this.add.mat.uniforms.uScale.value = pxPerUnit; this.dust.mat.uniforms.uScale.value = pxPerUnit; }
  // ---- particles ----
  spark(x, y, z, n, color, speed = 8, size = 0.22, life = 0.45, grav = 14) {
    const c = new THREE.Color(color);
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = speed * (0.3 + Math.random() * 0.9); this.add.emit(x, y, z + (Math.random() - .5) * 0.6, Math.cos(a) * s, Math.sin(a) * s + 2, (Math.random() - .5) * 3, c.r, c.g, c.b, 1, size * (0.5 + Math.random()), life * (0.6 + Math.random() * 0.8), grav, 1.5); }
  }
  burstDir(x, y, z, dx, dy, n, color, speed = 10, size = 0.25, life = 0.4, spread = 0.7) {
    const c = new THREE.Color(color), base = Math.atan2(dy, dx);
    for (let i = 0; i < n; i++) { const a = base + (Math.random() - .5) * spread * 2, s = speed * (0.4 + Math.random() * 0.8); this.add.emit(x, y, z, Math.cos(a) * s, Math.sin(a) * s, (Math.random() - .5) * 2, c.r, c.g, c.b, 1, size * (0.6 + Math.random() * 0.8), life * (0.6 + Math.random() * 0.7), 6, 2.2); }
  }
  dustPuff(x, y, z, n, color = 0xd8ccb0, size = 0.7) {
    const c = new THREE.Color(color);
    for (let i = 0; i < n; i++) { const s = (Math.random() - .5) * 5; this.dust.emit(x + (Math.random() - .5) * 0.6, y + 0.1, z + (Math.random() - .5) * 0.8, s, 0.8 + Math.random() * 1.8, (Math.random() - .5) * 1.2, c.r, c.g, c.b, 0.5, size * (0.6 + Math.random()), 0.55 + Math.random() * 0.3, -1.5, 2.5, 1.2); }
  }
  trail(x, y, z, color, size = 0.35, life = 0.3, n = 1) {
    const c = new THREE.Color(color); for (let i = 0; i < n; i++) this.add.emit(x + (Math.random() - .5) * 0.2, y + (Math.random() - .5) * 0.2, z, (Math.random() - .5), (Math.random() - .5), 0, c.r, c.g, c.b, 0.9, size, life, 0, 2, -0.5);
  }
  embers(x, y, z, n, color, area = 1) {
    const c = new THREE.Color(color); for (let i = 0; i < n; i++) this.add.emit(x + (Math.random() - .5) * area, y, z + (Math.random() - .5) * area, (Math.random() - .5) * 1.5, 1.5 + Math.random() * 3, (Math.random() - .5), c.r, c.g, c.b, 0.9, 0.12 + Math.random() * 0.14, 0.8 + Math.random() * 1.0, -0.5, 0.3);
  }
  // ---- sprites ----
  _sprite(tex, color, size, life, z, x, y, upd, rot = 0) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false })); m.material.rotation = rot;
    m.position.set(x, y, z); m.scale.setScalar(size); m.renderOrder = 30; this.scene.add(m); this.items.push({ obj: m, t: 0, life, upd, size }); return m;
  }
  flash(x, y, z, size = 2.6, color = 0xffffff, life = 0.22) { this._sprite(TEX.star, color, size, life, z + 0.8, x, y, (it, k) => { it.obj.scale.setScalar(it.size * (0.5 + k * 0.9)); it.obj.material.opacity = 1 - k; }, Math.random() * 3); this._sprite(TEX.glow, color, size * 1.1, life * 0.9, z + 0.7, x, y, (it, k) => { it.obj.material.opacity = (1 - k) * (1 - k) * 0.32; }); }
  glow(x, y, z, size, color, life) { return this._sprite(TEX.glow, color, size, life, z + 0.5, x, y, (it, k) => { it.obj.material.opacity = (1 - k) * 0.55; it.obj.scale.setScalar(it.size * (1 + k * 0.4)); }); }
  shock(x, y, z, radius, color = 0xffffff, life = 0.45) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: TEX.ring, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false }));
    m.position.set(x, y, z + 0.6); m.renderOrder = 28; this.scene.add(m);
    this.items.push({ obj: m, t: 0, life, upd: (it, k) => { const e = 1 - Math.pow(1 - k, 3); m.scale.setScalar(0.1 + e * radius * 0.5); m.material.opacity = (1 - k) * 0.7; } });
  }
  groundRing(x, y, z, radius, color = 0xffffff, life = 0.5) { // flat ring on the floor
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: TEX.ring, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.06, z); m.renderOrder = 8; this.scene.add(m);
    this.items.push({ obj: m, t: 0, life, upd: (it, k) => { m.scale.setScalar(0.15 + (1 - Math.pow(1 - k, 3)) * radius * 0.5); m.material.opacity = (1 - k) * 0.8; } });
  }
  beam(ax, ay, bx, by, z, color = 0xbfefff, width = 0.7, life = 0.35) {
    const L = Math.hypot(bx - ax, by - ay);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: TEX.beam, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false }));
    m.position.set((ax + bx) / 2, (ay + by) / 2, z + 0.6); m.rotation.z = Math.atan2(by - ay, bx - ax); m.scale.set(L, width, 1); m.renderOrder = 29; this.scene.add(m);
    this.items.push({ obj: m, t: 0, life, upd: (it, k) => { m.scale.y = width * (1 - k * 0.6) * (1 + Math.sin(k * 40) * 0.15); m.material.opacity = 1 - k; } });
  }
  // swoosh: a glowing crescent sweeping from angle a0 to a1 (degrees, 0 = +x). face flips left/right.
  swoosh(x, y, z, face, radius, a0, a1, color, life = 0.22, width = 0.55, full = false) {
    let span = full ? Math.PI * 1.9 : Math.min(Math.PI * 1.4, Math.abs(a1 - a0) * Math.PI / 180 + 0.6);
    const key = Math.round(radius * 10) + '_' + Math.round(span * 10) + '_' + Math.round(width * 10);
    let geo = this.swGeoCache[key]; if (!geo) { const inner = radius * (1 - width), outer = radius; geo = new THREE.RingGeometry(inner, outer, 40, 1, -span / 2, span); geo.userData = { inner, outer }; this.swGeoCache[key] = geo; }
    const mat = new THREE.ShaderMaterial({ vertexShader: SW_VERT, fragmentShader: SW_FRAG, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
      uniforms: { uP: { value: 0 }, uSpan: { value: span }, uInner: { value: geo.userData.inner }, uOuter: { value: geo.userData.outer }, uTail: { value: 0.55 }, uFade: { value: 0 }, uCol: { value: new THREE.Color(color) } } });
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z + 0.7); m.renderOrder = 27;
    const mid = (a0 + a1) / 2; m.rotation.z = (face > 0 ? mid : 180 - mid) * Math.PI / 180;
    const worldCCW = (a1 > a0) === (face > 0); m.scale.y = worldCCW ? 1 : -1; if (full) { m.rotation.z = 0; m.scale.y = face > 0 ? 1 : -1; }
    this.scene.add(m); this.items.push({ obj: m, t: 0, life, upd: (it, k) => { mat.uniforms.uP.value = Math.min(1, k * 1.15); mat.uniforms.uFade.value = Math.max(0, k - 0.55) / 0.45; }, dispose: () => mat.dispose() });
  }
  update(dt) {
    this.add.update(dt); this.dust.update(dt);
    for (const it of this.items) { it.t += dt; const k = Math.min(1, it.t / it.life); it.upd(it, k); if (k >= 1) { this.scene.remove(it.obj); it.obj.material?.dispose?.(); it.done = true; } }
    if (this.items.some(i => i.done)) this.items = this.items.filter(i => !i.done);
  }
  clear() { for (const it of this.items) { this.scene.remove(it.obj); it.obj.material?.dispose?.(); } this.items = []; }
  dispose() { this.clear(); this.scene.remove(this.add.pts); this.scene.remove(this.dust.pts); this.add.g.dispose(); this.dust.g.dispose(); this.add.mat.dispose(); this.dust.mat.dispose(); }
}
