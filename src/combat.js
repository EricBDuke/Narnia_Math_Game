// Fighters, moves, AI, projectiles and effects.
import * as THREE from 'three';
import { buildPlaceholder, animateRig, setTint, setStone, loadArt } from './models.js';
import { sfx } from './audio.js';

export const SLOT_INFO = {
  main:   { label: 'Main Attack', key: 'J', icon: '⚔', touch: 'Sword' },
  combo1: { label: 'Combo 1', key: 'K', icon: '⚔²', touch: '2 slash' },
  combo2: { label: 'Combo 2', key: 'L', icon: '⚔³', touch: '3 slash' },
  power:  { label: 'Power Move', key: 'I', icon: '★', touch: 'Star' },
  flying: { label: 'Jump / Flying Attack', key: 'U', icon: '🪽', touch: 'Wing' },
  block:  { label: 'Block / Dodge', key: 'O', icon: '🛡', touch: 'Shield' },
  recover:{ label: 'Recover', key: 'R', icon: '↻', touch: 'Circle' },
  jump:   { label: 'Jump', key: 'Space', icon: '↑', touch: 'Up' },
  high:   { label: 'High Jump', key: 'Shift+Space', icon: '⇈', touch: 'Double up' },
};
const GRAV = 28;
const _v = new THREE.Vector3();
const TMP_C = new THREE.Color();

export class World {
  constructor(scene, arena, opts) {
    this.scene = scene; this.arena = arena; this.opts = opts; this.fighters = []; this.projectiles = []; this.fx = []; this.time = 0; this.events = [];
    this.sparkGeo = new THREE.SphereGeometry(0.12, 6, 4);
  }
  emit(type, data) { this.events.push({ type, ...data }); }
  groundAt(x, z, y) {
    let g = 0;
    for (const p of this.arena.platforms) if (Math.abs(x - p.x) < p.w / 2 && Math.abs(z - p.z) < p.d / 2 && y >= p.h - 0.45) g = Math.max(g, p.h);
    return g;
  }
  alive() { return this.fighters.filter(f => !f.dead); }
  update(dt) {
    this.time += dt;
    for (const f of this.fighters) f.update(dt, this);
    // soft separation
    const fs = this.fighters.filter(f => !f.dead && f.state !== 'ko');
    for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
      const a = fs[i], b = fs[j]; const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z; const d = Math.hypot(dx, dz), min = (a.radius + b.radius) * 0.85;
      if (d < min && d > 0.0001 && Math.abs(a.pos.y - b.pos.y) < 1.5) { const push = (min - d) / 2; a.pos.x -= dx / d * push; a.pos.z -= dz / d * push; b.pos.x += dx / d * push; b.pos.z += dz / d * push; }
    }
    for (const p of this.projectiles) p.update(dt, this);
    this.projectiles = this.projectiles.filter(p => !p.done);
    for (const e of this.fx) { e.t += dt; e.update(e, dt); if (e.t >= e.life) { this.scene.remove(e.obj); e.done = true; } }
    this.fx = this.fx.filter(e => !e.done);
  }
  constrain(f) {
    const r = f.radius, B = this.arena.bounds, p = f.pos;
    if (B.type === 'circle') { const d = Math.hypot(p.x, p.z), m = B.r - r; if (d > m) { p.x *= m / d; p.z *= m / d; } }
    else { p.x = Math.max(-B.w + r, Math.min(B.w - r, p.x)); p.z = Math.max(-B.d + r, Math.min(B.d - r, p.z)); }
    for (const o of this.arena.obstacles) { if (o.type === 'cyl') { const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), m = o.r + r * 0.8; if (d < m && d > 0.0001 && p.y < (o.h ?? 99)) { p.x = o.x + dx / d * m; p.z = o.z + dz / d * m; } } }
    for (const pl of this.arena.platforms) { // platform sides block if below top
      if (p.y < pl.h - 0.45) { const hx = pl.w / 2 + r * 0.7, hz = pl.d / 2 + r * 0.7, dx = p.x - pl.x, dz = p.z - pl.z;
        if (Math.abs(dx) < hx && Math.abs(dz) < hz) { if (hx - Math.abs(dx) < hz - Math.abs(dz)) p.x = pl.x + Math.sign(dx || 1) * hx; else p.z = pl.z + Math.sign(dz || 1) * hz; } }
    }
  }
  // ---- effects ----
  spark(pos, color = 0xffe080, n = 7) {
    for (let i = 0; i < n; i++) { const m = new THREE.Mesh(this.sparkGeo, new THREE.MeshBasicMaterial({ color, transparent: true })); m.position.copy(pos);
      const v = new THREE.Vector3((Math.random() - .5) * 8, Math.random() * 6 + 1, (Math.random() - .5) * 8); this.scene.add(m);
      this.fx.push({ obj: m, t: 0, life: 0.4, update: (e, dt) => { m.position.addScaledVector(v, dt); v.y -= 18 * dt; m.material.opacity = 1 - e.t / e.life; m.scale.setScalar(1 - e.t / e.life * 0.5); } }); }
  }
  ring(pos, radius, color = 0xfff0a0, life = 0.45) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.12, 6, 32), new THREE.MeshBasicMaterial({ color, transparent: true })); m.rotation.x = Math.PI / 2; m.position.copy(pos); m.position.y += 0.2; this.scene.add(m);
    this.fx.push({ obj: m, t: 0, life, update: (e) => { const k = e.t / e.life; m.scale.setScalar(0.3 + k * radius); m.material.opacity = 1 - k; } });
  }
  sparkles(pos, color = 0x9affb0) {
    for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(this.sparkGeo, new THREE.MeshBasicMaterial({ color, transparent: true })); const a = Math.random() * 6.28, r = Math.random() * 0.8;
      m.position.set(pos.x + Math.cos(a) * r, pos.y + Math.random(), pos.z + Math.sin(a) * r); this.scene.add(m);
      this.fx.push({ obj: m, t: 0, life: 0.9, update: (e, dt) => { m.position.y += dt * 2.2; m.material.opacity = 1 - e.t / e.life; } }); }
  }
  beam(a, b, color = 0xbfefff) {
    const g = new THREE.BufferGeometry().setFromPoints([a.clone(), b.clone()]); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true })); this.scene.add(l);
    this.fx.push({ obj: l, t: 0, life: 0.35, update: (e) => l.material.opacity = 1 - e.t / e.life });
  }
  fire(pos, dir) {
    const m = new THREE.Mesh(this.sparkGeo, new THREE.MeshBasicMaterial({ color: Math.random() < .5 ? 0xff7a1a : 0xffd040, transparent: true })); m.position.copy(pos); this.scene.add(m);
    const v = dir.clone().multiplyScalar(9 + Math.random() * 3).add(new THREE.Vector3((Math.random() - .5) * 2, Math.random() * 1.5, (Math.random() - .5) * 2));
    this.fx.push({ obj: m, t: 0, life: 0.55, update: (e, dt) => { m.position.addScaledVector(v, dt); m.scale.setScalar(1 + e.t * 5); m.material.opacity = 1 - e.t / e.life; } });
  }
}

class Projectile {
  constructor(world, owner, pos, dir, o) {
    Object.assign(this, { owner, vel: dir.clone().multiplyScalar(o.speed || 22), dmg: o.dmg, kb: o.kb, life: o.life || 1.4, power: o.power, stun: o.stun || 0, done: false, radius: 0.45 });
    const style = o.style;
    let geo, mat;
    if (style === 'arrow') { geo = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5).rotateX(Math.PI / 2); mat = new THREE.MeshBasicMaterial({ color: 0xf0e0b0 }); }
    else if (style === 'ice') { geo = new THREE.ConeGeometry(0.14, 0.7, 5).rotateX(Math.PI / 2); mat = new THREE.MeshBasicMaterial({ color: 0xbff0ff }); }
    else if (style === 'rock') { geo = new THREE.DodecahedronGeometry(0.32); mat = new THREE.MeshStandardMaterial({ color: 0x8a8070, flatShading: true }); }
    else if (style === 'fire') { geo = new THREE.SphereGeometry(0.3, 8, 6); mat = new THREE.MeshBasicMaterial({ color: 0xff8a20 }); }
    else if (style === 'gold') { geo = new THREE.TorusGeometry(0.2, 0.06, 6, 12); mat = new THREE.MeshStandardMaterial({ color: 0xffd040, metalness: .8, roughness: .3 }); }
    else { geo = new THREE.SphereGeometry(0.22, 8, 6); mat = new THREE.MeshBasicMaterial({ color: o.color || 0xfff2a0 }); }
    this.mesh = new THREE.Mesh(geo, mat); this.mesh.position.copy(pos); this.mesh.lookAt(pos.clone().add(dir)); world.scene.add(this.mesh); this.world = world; this.style = style;
  }
  update(dt, world) {
    this.life -= dt; this.mesh.position.addScaledVector(this.vel, dt); if (this.style === 'gold' || this.style === 'rock') this.mesh.rotation.y += dt * 12;
    const p = this.mesh.position;
    for (const f of world.fighters) {
      if (f === this.owner || f.dead || f.state === 'ko') continue;
      if (Math.hypot(f.pos.x - p.x, f.pos.z - p.z) < f.radius + this.radius && p.y > f.pos.y - 0.3 && p.y < f.pos.y + f.height + 0.3) {
        f.takeHit(this.owner, { dmg: this.dmg, kb: this.kb, dir: this.vel.clone().setY(0).normalize(), knockdown: this.power, stun: this.stun }, world); this.life = 0; break;
      }
    }
    if (this.life <= 0 || Math.hypot(p.x, p.z) > 40) { this.done = true; world.scene.remove(this.mesh); }
  }
}

// ---- move definitions by type ----
function nameHas(m, re) { return re.test((m.name + ' ' + m.desc).toLowerCase()); }
function projStyle(f, m) {
  const d = (m.name + ' ' + m.desc).toLowerCase();
  if (/ice|frost|snow/.test(d) || f.weapon === 'wand') return 'ice';
  if (/arrow|bow|shot|volley/.test(d) || f.weapon === 'bow') return 'arrow';
  if (/boulder|rock|nut|honeycomb|dishes|gems/.test(d)) return 'rock';
  if (/fire|dragon/.test(d)) return 'fire';
  if (/armband|ring|gold/.test(d)) return 'gold';
  return 'orb';
}
export function moveDef(f, slot, isPower) {
  const m = f.moves[slot] || { name: slot, desc: '', type: 'melee' };
  const P = isPower ? 1.8 : 1; const type = m.type;
  const base = { slot, name: m.name, type, power: isPower, P };
  switch (type) {
    case 'melee': return { ...base, dur: 0.42, hits: [{ at: 0.18, dmg: 9 * P, range: 1.8, arc: 1.9, kb: 5 * P, kd: isPower }], anim: 'melee' };
    case 'multi': return { ...base, dur: 0.75, hits: [{ at: 0.15, dmg: 5 * P, range: 1.9, arc: 1.9, kb: 2 }, { at: 0.33, dmg: 5 * P, range: 1.9, arc: 1.9, kb: 2 }, { at: 0.52, dmg: 7 * P, range: 2.0, arc: 2.0, kb: 7 * P, kd: isPower }], anim: 'multi' };
    case 'spin': return { ...base, dur: 0.65, hits: [{ at: 0.2, dmg: 10 * P, range: 2.4, arc: 7, kb: 7 * P, kd: isPower }, { at: 0.45, dmg: 4 * P, range: 2.4, arc: 7, kb: 4 }], anim: 'spin' };
    case 'projectile': { const n = nameHas(m, /triple|three|volley|barrage|storm|rain|two|double/) ? 3 : 1; return { ...base, dur: 0.5, proj: { at: 0.22, n, dmg: (n > 1 ? 6 : 9) * P, kb: 3 * P, style: projStyle(f, m) }, anim: 'projectile' }; }
    case 'aoe': return { ...base, dur: 0.7, aoe: { at: 0.3, r: isPower ? 6.5 : 3.8, dmg: (isPower ? 16 : 9), kb: 10, kd: isPower, stun: nameHas(m, /stun|horn|roar|slows|sleepy|howl/) ? (isPower ? 1.2 : 0.6) : 0 }, anim: 'cast' };
    case 'dash': return { ...base, dur: isPower ? 0.85 : 0.5, dash: { speed: isPower ? 19 : 15, from: 0.08, to: isPower ? 0.75 : 0.4, dmg: 10 * P, kb: 8 * P, kd: isPower }, anim: 'multi' };
    case 'stun': return { ...base, dur: 0.55, stunHit: { at: 0.3, range: isPower ? 12 : 8, time: isPower ? 2.6 : 1.4, dmg: isPower ? 10 : 5 }, anim: 'projectile' };
    case 'heal': return { ...base, dur: 0.75, heal: { at: 0.4, amt: isPower ? 45 : 25 }, aoe: isPower ? { at: 0.4, r: 4, dmg: 4, kb: 8, kd: false } : null, anim: 'cast' };
    case 'breath': return { ...base, dur: 1.3, breath: { from: 0.15, to: 1.15, range: isPower ? 7 : 5, dps: isPower ? 34 : 18 }, anim: 'projectile' };
    case 'leap': return { ...base, dur: 2.0, leap: { dmg: 12 * P, r: 2.8, kb: 9 }, anim: 'leap' };
    default: return { ...base, dur: 0.42, hits: [{ at: 0.18, dmg: 9, range: 1.8, arc: 1.9, kb: 5 }], anim: 'melee' };
  }
}

let FID = 0;
export class Fighter {
  constructor(cfg, world, opts) {
    this.id = FID++; this.cfg = cfg; this.isPlayer = !!opts.isPlayer; this.world = world;
    this.rig = buildPlaceholder(cfg); this.group = new THREE.Group(); this.group.add(this.rig.root); world.scene.add(this.group);
    this.height = this.rig.height; this.radius = this.rig.radius;
    const big = cfg.variant?.includes('giant') || cfg.variant === 'elephant';
    this.maxHp = (big ? 125 : cfg.body === 'critter' ? 92 : cfg.body === 'quadruped' || cfg.body === 'centaur' ? 110 : 100) * (opts.hpMul || 1);
    this.hp = this.maxHp; this.lives = opts.lives; this.power = opts.power || 0;
    this.speed = (big ? 5.2 : cfg.body === 'critter' ? 6.8 : cfg.body === 'quadruped' || cfg.body === 'centaur' ? 7.4 : cfg.body === 'bird' ? 7 : 6.3);
    this.dmgMul = opts.dmgMul || 1;
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3(); this.kb = new THREE.Vector3(); this.yaw = 0;
    this.state = 'idle'; this.stateT = 0; this.move = null; this.grounded = true; this.blocking = false; this.invuln = 0; this.stunT = 0; this.hitT = 0;
    this.dodgeT = 0; this.dodgeCD = 0; this.recoverCD = 0; this.dead = false; this.animT = Math.random() * 10; this.flash = 0;
    this.input = { mx: 0, mz: 0, block: false, actions: [] };
    this.stats = { kos: 0, dmg: 0 };
    // Who drives this fighter: LocalController (keyboard/touch), AIController (bot) or NetworkController (Stage 2 online player). See controllers.js.
    this.controller = opts.controller || null; this.ai = this.controller && this.controller.kind === 'ai' ? this.controller : null;
    this.makeTag(); this.tryArt();
  }
  async tryArt() {
    if (!this.cfg.art || !(this.cfg.art.model || this.cfg.art.billboard)) return;
    const r = await loadArt(this.cfg, this.height); if (!r || this.dead) return;
    this.rig.root.visible = false; this.group.add(r.object); this.artObj = r.object;
    if (r.animations?.length) { this.mixer = new THREE.AnimationMixer(r.object); this.clips = {}; r.animations.forEach(c => this.clips[c.name.toLowerCase()] = this.mixer.clipAction(c)); (this.clips.idle || Object.values(this.clips)[0]).play(); }
  }
  makeTag() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; this.tagCtx = c.getContext('2d');
    this.tagTex = new THREE.CanvasTexture(c); this.tagTex.colorSpace = THREE.SRGBColorSpace;
    this.tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tagTex, depthTest: false, transparent: true })); this.tag.renderOrder = 10;
    this.tag.scale.set(2.4, 0.6, 1); this.tag.position.y = this.height + 0.55; this.group.add(this.tag); this.drawTag();
  }
  drawTag() {
    const g = this.tagCtx; g.clearRect(0, 0, 256, 64);
    g.font = 'bold 24px Trebuchet MS, sans-serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,.8)';
    const name = (this.isPlayer ? '★ ' : '') + this.cfg.name.replace(/ \(.*\)/, '');
    g.strokeText(name, 128, 24); g.fillStyle = this.isPlayer ? '#ffe680' : '#ffffff'; g.fillText(name, 128, 24);
    g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(38, 34, 180, 14); const k = Math.max(0, this.hp / this.maxHp);
    g.fillStyle = this.isPlayer ? '#5be06e' : k > .5 ? '#f0a040' : '#e04a3a'; g.fillRect(40, 36, 176 * k, 10);
    this.tagTex.needsUpdate = true; this._tagHp = this.hp;
  }
  spawn(p) { this.pos.copy(p); this.yaw = Math.atan2(-p.x, -p.z); this.vel.set(0, 0, 0); this.kb.set(0, 0, 0); this.state = 'idle'; this.move = null; this.invuln = 2; this.hp = this.maxHp; this.stunT = 0; setStone(this.rig, false); this.group.visible = true; this.drawTag(); }
  forward() { return _v.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)); }
  canAct() { return !this.dead && this.stunT <= 0 && ['idle', 'run', 'air'].includes(this.state) && this.hitT <= 0; }
  nearestEnemy(maxD = 99) { let best = null, bd = maxD; for (const o of this.world.fighters) { if (o === this || o.dead || o.state === 'ko') continue; const d = this.pos.distanceTo(o.pos); if (d < bd) { bd = d; best = o; } } return best; }
  faceToward(o) { this.yaw = Math.atan2(o.pos.x - this.pos.x, o.pos.z - this.pos.z); }
  doAction(a, world) {
    if (this.dead || this.state === 'ko') return false;
    if (a === 'recover') return this.recover(world);
    if (!this.canAct()) return false;
    if (a === 'jump' || a === 'high') { if (!this.grounded) return false; this.vel.y = a === 'high' ? 14.5 : 10; this.grounded = false; this.state = 'air'; sfx.jump(); return true; }
    let slot = a, isPower = false;
    if (a === 'power') { if (this.power < 100) { if (this.isPlayer) world.emit('toast', { text: 'Power meter not full yet!' }); return false; } isPower = true; this.power = 0; sfx.power(); world.emit('power', { f: this }); }
    if (a === 'main' && !this.grounded) slot = 'flying'; // Space then J = flying attack
    const def = moveDef(this.cfg, slot === 'power' ? 'power' : slot, isPower);
    const tgt = this.nearestEnemy(def.type === 'projectile' || def.type === 'stun' ? 14 : 4.5); if (tgt) this.faceToward(tgt);
    this.move = { def, t: 0, fired: new Set(), hitSet: new Set() }; this.state = 'attack';
    if (def.leap) { if (this.grounded) { this.vel.y = 11; this.grounded = false; this.move.leapV = this.forward().clone().multiplyScalar(8); } else { this.vel.y = -20; this.move.leapV = this.forward().clone().multiplyScalar(3); } }
    if (def.type !== 'leap') sfx.whoosh();
    world.emit('move', { f: this, def });
    return true;
  }
  recover(world) {
    if (this.state === 'down' && this.stateT > 0.2) { this.getUp(world, true); return true; }
    if (this.recoverCD > 0 || !this.canAct()) return false;
    // standing recover: quick guard burst that pushes crowding foes away
    this.recoverCD = 4; this.invuln = Math.max(this.invuln, 0.6); world.ring(this.pos, 2.4, 0xbfe0ff, 0.35);
    for (const o of world.fighters) if (o !== this && !o.dead && o.pos.distanceTo(this.pos) < 2.6) o.takeHit(this, { dmg: 0, kb: 7, dir: o.pos.clone().sub(this.pos).setY(0).normalize() }, world);
    world.emit('move', { f: this, def: { slot: 'recover', name: this.cfg.moves.recover.name } });
    return true;
  }
  getUp(world, fast) { this.state = 'idle'; this.stateT = 0; this.invuln = fast ? 1.0 : 0.6; if (fast) { world.ring(this.pos, 2.2, 0xffffff, 0.3); world.emit('move', { f: this, def: { slot: 'recover', name: this.cfg.moves.recover.name } }); } }
  takeHit(src, h, world) {
    if (this.dead || this.state === 'ko' || this.invuln > 0 || this.dodgeT > 0) return false;
    if (this.state === 'down' && this.stateT > 0.25) return false;
    let dmg = h.dmg * (src?.dmgMul || 1); const blocked = this.blocking && this.state !== 'down' && this.stunT <= 0;
    if (blocked) { dmg *= 0.2; this.kb.addScaledVector(h.dir, h.kb * 0.25); sfx.block(); world.spark(this.pos.clone().setY(this.pos.y + this.height * 0.6), 0x99ccff, 4); this.power = Math.min(100, this.power + dmg * 1.5); }
    else {
      if (dmg > 0) { this.flash = 0.18; sfx.hit(); world.spark(this.pos.clone().setY(this.pos.y + this.height * 0.6)); }
      this.kb.addScaledVector(h.dir, h.kb); if (h.kb > 6 && this.grounded) { this.vel.y = 4; this.grounded = false; }
      if (h.stun) { this.stunT = Math.max(this.stunT, h.stun); }
      if (h.knockdown && dmg > 0) { this.state = 'down'; this.stateT = 0; this.move = null; world.emit('down', { f: this }); }
      else if (dmg > 0 && this.state !== 'down') { this.hitT = 0.28; if (this.state === 'attack' && Math.random() < 0.6) { this.move = null; this.state = 'idle'; } }
    }
    this.hp -= dmg; this.power = Math.min(100, this.power + dmg * 0.8);
    if (src && src !== this) { src.power = Math.min(100, src.power + dmg * 1.1); src.stats.dmg += dmg; }
    this.lastHitBy = src;
    if (this.hp <= 0) { this.hp = 0; this.state = 'ko'; this.stateT = 0; this.move = null; this.stunT = 0; sfx.ko(); if (src && src !== this) src.stats.kos++; world.emit('ko', { f: this, by: src }); }
    this.drawTag(); return true;
  }
  stunBy(src, t, world) { if (this.dead || this.state === 'ko' || this.invuln > 0) return; this.stunT = t; setStone(this.rig, true, src.cfg.weapon === 'wand' ? 0xb0c4cc : 0x9aa0c0); world.emit('stun', { f: this, by: src }); }
  runMove(dt, world) {
    const m = this.move, d = m.def; const prevT = m.t; m.t += dt; const ph = m.t / d.dur;
    const crossed = (at) => prevT < at * d.dur && m.t >= at * d.dur;
    const fwd = this.forward().clone();
    if (d.hits) d.hits.forEach((h, i) => { if (crossed(h.at)) this.meleeHit(h, world, i); });
    if (d.proj && crossed(d.proj.at)) {
      for (let i = 0; i < d.proj.n; i++) { const a = (i - (d.proj.n - 1) / 2) * 0.22; const dir = new THREE.Vector3(Math.sin(this.yaw + a), 0, Math.cos(this.yaw + a));
        const tgt = this.nearestEnemy(16); if (tgt && d.proj.n === 1) { dir.copy(tgt.pos).sub(this.pos); dir.y = (tgt.height * 0.5 - this.height * 0.55) * 0.1; dir.normalize(); }
        world.projectiles.push(new Projectile(world, this, this.pos.clone().add(new THREE.Vector3(0, this.height * 0.6, 0)).addScaledVector(fwd, 0.6), dir, { dmg: d.proj.dmg, kb: d.proj.kb, style: d.proj.style, power: d.power })); }
    }
    if (d.aoe && crossed(d.aoe.at)) {
      world.ring(this.pos, d.aoe.r, d.power ? 0xffd040 : 0xfff0c0); if (d.power) world.ring(this.pos, d.aoe.r * 0.6, 0xffffff, 0.6);
      for (const o of world.fighters) if (o !== this && !o.dead && o.pos.distanceTo(this.pos) < d.aoe.r + o.radius) o.takeHit(this, { dmg: d.aoe.dmg, kb: d.aoe.kb, knockdown: d.aoe.kd, stun: d.aoe.stun, dir: o.pos.clone().sub(this.pos).setY(0).normalize() }, world);
    }
    if (d.dash && m.t > d.dash.from * d.dur && m.t < d.dash.to * d.dur) {
      this.pos.addScaledVector(fwd, d.dash.speed * dt); if (Math.random() < 0.5) world.spark(this.pos.clone().setY(this.pos.y + 0.5), d.power ? 0xffd040 : 0xffffff, 1);
      for (const o of world.fighters) if (o !== this && !o.dead && !m.hitSet.has(o) && o.pos.distanceTo(this.pos) < this.radius + o.radius + 0.6) { m.hitSet.add(o); const side = new THREE.Vector3(fwd.z, 0, -fwd.x); o.takeHit(this, { dmg: d.dash.dmg, kb: d.dash.kb, knockdown: d.dash.kd, dir: fwd.clone().addScaledVector(side, Math.random() - .5).normalize() }, world); }
    }
    if (d.stunHit && crossed(d.stunHit.at)) {
      const t = this.nearestEnemy(d.stunHit.range);
      if (t) { this.faceToward(t); world.beam(this.pos.clone().setY(this.pos.y + this.height * 0.7), t.pos.clone().setY(t.pos.y + t.height * 0.5), 0xd0f4ff); if (t.takeHit(this, { dmg: d.stunHit.dmg, kb: 1, dir: fwd }, world)) t.stunBy(this, d.stunHit.time, world); }
      else world.ring(this.pos, 2, 0xd0f4ff);
    }
    if (d.heal && crossed(d.heal.at)) { this.hp = Math.min(this.maxHp, this.hp + d.heal.amt); world.sparkles(this.pos); sfx.heal(); this.drawTag(); world.emit('heal', { f: this }); }
    if (d.breath && m.t > d.breath.from * d.dur && m.t < d.breath.to * d.dur) {
      const mouth = this.pos.clone().setY(this.pos.y + this.height * 0.75).addScaledVector(fwd, 0.5);
      if (Math.random() < 0.8) world.fire(mouth, fwd);
      setTint(this.rig, TMP_C.set(0x30a040), 0.5);
      for (const o of world.fighters) { if (o === this || o.dead) continue; const to = o.pos.clone().sub(this.pos); const dist = to.length(); to.y = 0; to.normalize();
        if (dist < d.breath.range && to.dot(fwd) > 0.6) { m.acc = (m.acc || 0); if (!o._bt || world.time - o._bt > 0.2) { o._bt = world.time; o.takeHit(this, { dmg: d.breath.dps * 0.2, kb: 2.5, dir: to }, world); } } }
    }
    if (d.leap) {
      this.pos.addScaledVector(m.leapV, dt);
      if (m.t > 0.12 && this.grounded) {
        world.ring(this.pos, d.leap.r, d.power ? 0xffd040 : 0xffffff); world.spark(this.pos.clone().setY(this.pos.y + 0.2), 0xe0d0b0, 10); sfx.hit();
        for (const o of world.fighters) if (o !== this && !o.dead && o.pos.distanceTo(this.pos) < d.leap.r + o.radius) o.takeHit(this, { dmg: d.leap.dmg, kb: d.leap.kb, knockdown: true, dir: o.pos.clone().sub(this.pos).setY(0).normalize() }, world);
        this.move = null; this.state = 'idle'; this.hitT = 0.15; return;
      }
    }
    if (m.t >= d.dur) { this.move = null; this.state = this.grounded ? 'idle' : 'air'; }
  }
  meleeHit(h, world, i) {
    const fwd = this.forward().clone();
    let any = false;
    for (const o of world.fighters) {
      if (o === this || o.dead || o.state === 'ko') continue;
      const to = o.pos.clone().sub(this.pos); const dy = Math.abs(to.y); to.y = 0; const dist = to.length();
      if (dist > h.range + o.radius + this.radius * 0.5 || dy > 1.8) continue;
      const ang = Math.acos(Math.max(-1, Math.min(1, to.normalize().dot(fwd)))); if (ang > h.arc / 2 && dist > o.radius + 0.3) continue;
      o.takeHit(this, { dmg: h.dmg, kb: h.kb, knockdown: h.kd, dir: dist > 0.01 ? to : fwd }, world); any = true;
    }
    return any;
  }
  update(dt, world) {
    if (this.dead) return;
    this.animT += dt; this.stateT += dt;
    this.invuln = Math.max(0, this.invuln - dt); this.hitT = Math.max(0, this.hitT - dt); this.dodgeCD = Math.max(0, this.dodgeCD - dt); this.recoverCD = Math.max(0, this.recoverCD - dt);
    this.power = Math.min(100, this.power + dt * 1.2);
    if (this.stunT > 0) { this.stunT -= dt; if (this.stunT <= 0) setStone(this.rig, false); }
    if (this.controller && this.state !== 'ko') this.controller.sample(this, world, dt);
    const inp = this.input;
    if (this.state === 'ko') {
      if (this.stateT > 1.7 && !this._koDone) { this._koDone = true; this.lives--; world.emit('lifeLost', { f: this }); if (this.lives <= 0) { this.dead = true; this.group.visible = false; world.emit('out', { f: this }); return; } this._respawnAt = this.stateT + 0.8; }
      if (this._koDone && this.stateT > this._respawnAt) { this._koDone = false; const sp = world.arena.spawns.slice().sort((a, b) => minD(b, world, this) - minD(a, world, this))[0]; this.spawn(sp); world.emit('respawn', { f: this }); }
    } else if (this.state === 'down') {
      for (const a of inp.actions) if (a === 'recover') this.doAction(a, world);
      if (this.state === 'down' && this.stateT > 1.5) this.getUp(world, false);
    } else {
      // block / dodge
      const moving = Math.hypot(inp.mx, inp.mz) > 0.3;
      if (inp.dodge && this.dodgeCD <= 0 && this.canAct() && this.grounded) { this.dodgeT = 0.38; this.dodgeCD = 0.9; this.dodgeDir = moving ? new THREE.Vector3(inp.mx, 0, inp.mz).normalize() : this.forward().clone().negate(); this.state = 'dodge'; this.stateT = 0; sfx.whoosh(); }
      inp.dodge = false;
      if (this.state === 'dodge') { this.dodgeT -= dt; this.pos.addScaledVector(this.dodgeDir, 13 * dt); if (this.dodgeT <= 0) { this.state = 'idle'; this.dodgeT = 0; } }
      this.blocking = !!inp.block && this.canAct() && this.grounded;
      for (const a of inp.actions) this.doAction(a, world);
      if (this.state === 'attack' && this.move) this.runMove(dt, world);
      // locomotion
      if (this.stunT <= 0 && this.hitT <= 0 && this.state !== 'dodge') {
        let sp = this.speed * (this.blocking ? 0.35 : 1) * (this.state === 'attack' ? (this.move?.def.type === 'leap' ? 0 : 0.25) : 1);
        const mag = Math.min(1, Math.hypot(inp.mx, inp.mz));
        if (mag > 0.05) { this.pos.x += inp.mx / Math.max(1, Math.hypot(inp.mx, inp.mz)) * sp * dt; this.pos.z += inp.mz / Math.max(1, Math.hypot(inp.mx, inp.mz)) * sp * dt;
          if (this.state !== 'attack' && !(this.ai && this.blocking)) { const ty = Math.atan2(inp.mx, inp.mz); let dy = ty - this.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.yaw += dy * Math.min(1, dt * 14); } }
        this.speedNorm = mag;
        if (this.state === 'idle' || this.state === 'run') this.state = mag > 0.05 ? 'run' : 'idle';
      } else this.speedNorm = 0;
    }
    // physics
    this.pos.addScaledVector(this.kb, dt); this.kb.multiplyScalar(Math.pow(0.02, dt));
    this.vel.y -= GRAV * dt; this.pos.y += this.vel.y * dt;
    const g = world.groundAt(this.pos.x, this.pos.z, this.pos.y);
    if (this.pos.y <= g) { if (!this.grounded && this.vel.y < -2 && this.state === 'air') this.state = 'idle'; this.pos.y = g; this.vel.y = 0; this.grounded = true; if (this.state === 'air') this.state = 'idle'; }
    else { this.grounded = this.pos.y - g < 0.02; if (!this.grounded && (this.state === 'idle' || this.state === 'run')) this.state = 'air'; }
    world.constrain(this);
    inp.actions.length = 0;
    this.render(dt);
  }
  render(dt) {
    this.group.position.copy(this.pos); this.group.rotation.y = this.yaw;
    if (this.artObj?.userData.billboard) { /* billboard faces camera via main loop */ }
    let mode = 'idle', phase = 0, style;
    if (this.state === 'ko') { mode = 'ko'; phase = Math.min(1, this.stateT / 1.2); }
    else if (this.state === 'down') { mode = 'ko'; phase = 1; }
    else if (this.state === 'dodge') { mode = 'dodge'; phase = 1 - this.dodgeT / 0.38; }
    else if (this.stunT > 0) { mode = 'idle'; }
    else if (this.state === 'attack' && this.move) { const d = this.move.def; phase = Math.min(1, this.move.t / (d.type === 'leap' ? 0.8 : d.dur)); if (d.type === 'leap') { mode = 'leap'; } else { mode = d.anim === 'cast' ? 'cast' : 'attack'; style = d.anim; } }
    else if (this.hitT > 0) { mode = 'hit'; phase = 1 - this.hitT / 0.28; }
    else if (this.blocking) mode = 'block';
    else if (!this.grounded) mode = 'jump';
    animateRig(this.rig, { mode, phase, speed: this.stunT > 0 ? 0 : (this.speedNorm || 0), style }, this.stunT > 0 ? 0 : this.animT);
    // tints: hit flash red, invuln blink, block blue
    this.flash = Math.max(0, this.flash - dt);
    if (this.flash > 0) setTint(this.rig, TMP_C.set(0xff3020), 0.8);
    else if (this.blocking) setTint(this.rig, TMP_C.set(0x3070ff), 0.35);
    else if (this.state !== 'attack' || this.move?.def.type !== 'breath') setTint(this.rig, TMP_C.set(0xffffff), this.invuln > 0 ? (Math.sin(this.animT * 30) > 0 ? 0.35 : 0) : (this.power >= 100 ? 0.08 + Math.sin(this.animT * 6) * 0.05 : 0));
    if (this._tagHp !== this.hp) this.drawTag();
    if (this.mixer) this.mixer.update(dt);
  }
}
function minD(p, world, self) { let m = 99; for (const f of world.fighters) if (f !== self && !f.dead) m = Math.min(m, f.pos.distanceTo(p)); return m; }

export const AI_LEVELS = {
  easy: { cd: [1.5, 2.6], block: 0.12, recover: 1.0, maxOnPlayer: 1, dmgMul: 0.45 },
  medium: { cd: [1.2, 2.1], block: 0.2, recover: 0.8, maxOnPlayer: 1, dmgMul: 0.55 },
  hard: { cd: [0.9, 1.7], block: 0.3, recover: 0.6, maxOnPlayer: 2, dmgMul: 0.65 },
  ultimate: { cd: [0.7, 1.3], block: 0.4, recover: 0.45, maxOnPlayer: 2, dmgMul: 0.8 },
};
