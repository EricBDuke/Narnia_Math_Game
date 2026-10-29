// Side-view platform-fighter simulation: 2D physics (x/y, z only for visual depth), platforms (drop-through), damage-percent knockback,
// hitstun, ledge recovery, blast-zone KOs, respawn invulnerability, multi-hit combos with hit-pause, trails and impact effects.
import * as THREE from 'three';
import { buildPlaceholder, animateRig, setTint, setStone, loadArt } from './models.js';
import { makeBillboard, animateBillboard } from './sprites.js';
import { buildMove, SWING, fxColor } from './moves.js';
import { sfx } from './audio.js';
import { TEX } from './fx.js';

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
export const PHYS = { GRAV: 34, MAXFALL: 26, FASTFALL: 40, JUMP: 13.4, HIGH: 17.8, AIRJUMP: 12.6, AIRHIGH: 15, RECOVER_UP: 17.5 };
const sgn = (v) => v < 0 ? -1 : 1, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rad = Math.PI / 180;
let FID = 0;

export const KB_SCALE = 0.9, KB_GROWTH = 60; // knockback tuning: lower scale/growth = longer stocks
export class World {
  constructor(scene, arena, fx, opts = {}) {
    this.scene = scene; this.arena = arena; this.fx = fx; this.opts = opts; this.fighters = []; this.projectiles = []; this.events = []; this.time = 0;
    this.freeze = 0; this.shake = 0; this.punch = 0; this.flashScreen = 0; this.kick = { x: 0, y: 0 }; this.focus = null; this.focusT = 0; arena.fx = fx;
  }
  emit(type, data) { this.events.push({ type, ...data }); }
  addShake(v) { this.shake = Math.min(1.6, Math.max(this.shake, v)); }
  hitPause(s) { this.freeze = Math.max(this.freeze, s); }
  surfaceBelow(x, y, r = 0.3) { let best = null; for (const s of this.arena.surfaces) if (x > s.x0 - r && x < s.x1 + r && s.y <= y + 0.15 && (!best || s.y > best.y)) best = s; return best; }
  update(dt) {
    if (this.freeze > 0) { this.freeze -= dt; return; }
    this.time += dt; this.arena.update(this.time, dt);
    this.shake = Math.max(0, this.shake - dt * 3.2); this.punch = Math.max(0, this.punch - dt * 2.4); this.flashScreen = Math.max(0, this.flashScreen - dt * 7);
    for (const f of this.fighters) f.update(dt, this);
    const fs = this.fighters.filter(f => !f.dead && f.state !== 'ko');
    for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) { // soft body separation (x only)
      const a = fs[i], b = fs[j]; if (Math.abs(a.pos.y - b.pos.y) > Math.min(a.height, b.height) * 0.7) continue;
      const dx = b.pos.x - a.pos.x, min = (a.radius + b.radius) * 0.72; if (Math.abs(dx) < min) { const push = Math.min((min - Math.abs(dx)) / 2, 7 * dt), s = dx === 0 ? (a.id < b.id ? 1 : -1) : sgn(dx); if (!a.lunging) a.pos.x -= s * push; if (!b.lunging) b.pos.x += s * push; }
    }
    for (const p of this.projectiles) p.update(dt, this);
    this.projectiles = this.projectiles.filter(p => !p.done);
  }
  clearScene() { for (const p of this.projectiles) p.dispose(); this.projectiles = []; }
}

class Projectile {
  constructor(world, owner, x, y, vx, vy, o) {
    Object.assign(this, { world, owner, vx, vy, dmg: o.dmg, kb: o.kb, ang: o.ang ?? 12, life: o.life || 1.3, big: o.big, style: o.style, color: o.color, done: false, grav: o.style === 'rock' ? 9 : 0, radius: 0.5, z: owner.pos.z });
    this.hit = new Set(); this.group = new THREE.Group(); this.group.position.set(x, y, this.z); world.scene.add(this.group); this.x = x; this.y = y;
    const st = o.style; let mesh;
    if (st === 'arrow') { mesh = new THREE.Group(); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5), new THREE.MeshStandardMaterial({ color: 0xe8d8b0 })); sh.rotation.z = Math.PI / 2; const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 6), new THREE.MeshStandardMaterial({ color: 0xc8d0d8, metalness: 0.8, roughness: 0.3 })); tip.rotation.z = -Math.PI / 2; tip.position.x = 0.7; mesh.add(sh, tip); }
    else if (st === 'rock') mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.34), new THREE.MeshStandardMaterial({ color: 0x8a8070, flatShading: true }));
    else if (st === 'gold') mesh = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 6, 14), new THREE.MeshStandardMaterial({ color: 0xffd040, metalness: 0.8, roughness: 0.3, emissive: 0x504000 }));
    else mesh = new THREE.Mesh(new THREE.SphereGeometry(st === 'fire' ? 0.3 : 0.24, 10, 8), new THREE.MeshBasicMaterial({ color: st === 'ice' ? 0xcff4ff : st === 'fire' ? 0xffa030 : 0xfff2b0 }));
    this.group.add(mesh); this.mesh = mesh; if (st !== 'rock') { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow, color: o.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false })); g.scale.setScalar(o.big ? 2.8 : 1.9); g.renderOrder = 25; this.group.add(g); this.glow = g; }
    this.group.rotation.z = Math.atan2(vy, vx);
  }
  update(dt, world) {
    this.life -= dt; this.vy -= this.grav * dt; this.x += this.vx * dt; this.y += this.vy * dt; this.group.position.set(this.x, this.y, this.z); this.group.rotation.z = Math.atan2(this.vy, this.vx);
    if (this.style === 'rock' || this.style === 'gold') this.mesh.rotation.x += dt * 12;
    world.fx.trail(this.x, this.y, this.z, this.color, this.big ? 0.55 : 0.38, 0.28, 2);
    for (const f of world.fighters) {
      if (f === this.owner || f.dead || f.state === 'ko' || this.hit.has(f)) continue;
      if (Math.abs(f.pos.x - this.x) < f.radius + this.radius && this.y > f.pos.y - 0.2 && this.y < f.pos.y + f.height + 0.2) {
        if (f.takeHit(this.owner, { dmg: this.dmg, kb: this.kb, ang: this.ang, dir: sgn(this.vx), big: this.big, fx: 'proj', color: this.color }, world)) { this.hit.add(f); this.life = 0; world.fx.burstDir(this.x, this.y, this.z, sgn(this.vx), 0.3, 10, this.color, 9, 0.28, 0.4); break; }
      }
    }
    const B = world.arena.blast; if (this.life <= 0 || this.x < B.l || this.x > B.r || this.y > B.t + 6 || this.y < B.b - 4) this.dispose();
  }
  dispose() { if (this.done) return; this.done = true; this.world.scene.remove(this.group); this.group.traverse(o => { o.geometry?.dispose(); o.material?.dispose?.(); }); }
}

export class Fighter {
  constructor(cfg, world, opts) {
    this.id = FID++; this.cfg = cfg; this.isPlayer = !!opts.isPlayer; this.world = world;
    this.rig = buildPlaceholder(cfg); this.group = new THREE.Group(); this.group.add(this.rig.root); world.scene.add(this.group); this.rig.root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
    this.height = this.rig.height; this.radius = this.rig.radius * 0.78;
    const big = cfg.variant?.includes('giant') || cfg.variant === 'elephant', jumbo = cfg.variant === 'elephant', quad = cfg.body === 'quadruped' || cfg.body === 'centaur';
    this.weight = (big ? 1.35 : cfg.body === 'critter' ? 0.82 : quad ? 1.15 : cfg.body === 'bird' ? 0.85 : cfg.variant?.includes('child') ? 0.88 : 1) * (jumbo ? 1.3 : 1) * (opts.hpMul || 1);
    if (jumbo) this.weight *= 1.3;
    this.speed = jumbo ? 5.0 : big ? 6.2 : cfg.body === 'critter' ? 8.4 : quad ? 9.2 : cfg.body === 'bird' ? 8.2 : 7.6;
    this.dmgMul = opts.dmgMul || 1; this.lives = opts.lives; this.maxLives = opts.lives; this.power = opts.power || 0;
    this.pct = 0; this.pos = new THREE.Vector3(); this.vx = 0; this.vy = 0; this.face = 1; this.yaw = Math.PI / 2 - 0.3;
    this.state = 'idle'; this.stateT = 0; this.move = null; this.onGround = false; this.surf = null; this.jumpsLeft = 1; this.recoverUsed = false; this.recT = 0; this.dropT = 0; this.ledgeT = 0; this.ledgeCD = 0;
    this.hitstun = 0; this.stunT = 0; this.invuln = 0; this.blocking = false; this.dodgeT = 0; this.dodgeCD = 0; this.recoverCD = 0; this.tumble = false; this.landT = 0; this.lunging = false;
    this.dead = false; this.animT = Math.random() * 10; this.flash = 0; this.koT = 0; this.lastHitBy = null; this.lastHitAt = -99; this.comboHits = 0; this.comboT = 0;
    this.input = { mx: 0, my: 0, block: false, dodge: false, actions: [] }; this.stats = { kos: 0, dmg: 0 };
    this.moveCache = {}; this.fxc = fxColor(cfg, cfg.moves.main);
    this.controller = opts.controller || null; this.ai = this.controller && this.controller.kind === 'ai' ? this.controller : null;
    this.laneZ = ((this.id % 3) - 1) * 0.9;
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: TEX.shadow, transparent: true, depthWrite: false, fog: false })); this.shadow.rotation.x = -Math.PI / 2; this.shadow.renderOrder = 4; world.scene.add(this.shadow);
    this.artPromise = this.tryArt();
  }
  async tryArt() {
    if (this.cfg.art?.model) { const r = await loadArt(this.cfg, this.height); if (r && !this.dead) { this.rig.root.visible = false; this.group.add(r.object); this.artObj = r.object; if (r.animations?.length) { this.mixer = new THREE.AnimationMixer(r.object); this.clips = {}; r.animations.forEach(c => this.clips[c.name.toLowerCase()] = this.mixer.clipAction(c)); (this.clips.idle || Object.values(this.clips)[0]).play(); } return; } }
    const bb = await makeBillboard(this.cfg, this.height); if (!bb || this.disposed) return; this.bb = bb; if (bb.realH) { const k = bb.realH / this.height; this.height = bb.realH; this.radius = Math.max(0.2, this.radius * Math.max(0.4, Math.min(1.1, k))); this.artH = bb.realH; if (bb.quad) this.radius = Math.max(this.radius, 0.3 * bb.realW); } this.rig.root.visible = false; this.group.add(bb.root); this.usesArt = true;
  }
  spawn(x, y, invuln = 2.2) {
    this.pos.set(x, y, this.laneZ); this.vx = this.vy = 0; this.state = 'air'; this.stateT = 0; this.move = null; this.invuln = invuln; this.pct = 0; this.hitstun = 0; this.stunT = 0; this.tumble = false; this.onGround = false; this.recoverUsed = false; this.jumpsLeft = 1; this.recT = 0; this.group.visible = true; this.shadow.visible = true; this.koT = 0;
    setStone(this.rig, false); this.face = x > 0 ? -1 : 1;
  }
  get center() { return this.pos.y + this.height * 0.5; }
  canAct() { return !this.dead && this.stunT <= 0 && this.hitstun <= 0 && ['idle', 'run', 'air'].includes(this.state); }
  nearestEnemy(maxD = 99, inFront = false) { let best = null, bd = maxD; for (const o of this.world.fighters) { if (o === this || o.dead || o.state === 'ko') continue; const dx = o.pos.x - this.pos.x; if (inFront && dx * this.face < -0.5) continue; const d = Math.hypot(dx, o.center - this.center); if (d < bd) { bd = d; best = o; } } return best; }
  getMove(slot, isPower) { const k = slot + (isPower ? '!' : ''); return this.moveCache[k] ||= buildMove(this.cfg, slot, isPower); }
  doAction(a, world) {
    if (this.dead || this.state === 'ko') return false;
    if (this.state === 'ledge') { if (['jump', 'high', 'main', 'recover'].includes(a) || true) this.climbLedge(world); return true; }
    if (a === 'recover') return this.recover(world);
    if (this.state === 'down') { if (this.stateT > 0.12) this.getUp(world, true); return true; }
    if (!this.canAct()) return false;
    if (a === 'jump' || a === 'high') {
      if (this.onGround) { this.vy = a === 'high' ? PHYS.HIGH : PHYS.JUMP; this.onGround = false; this.surf = null; this.state = 'air'; world.fx.dustPuff(this.pos.x, this.pos.y, this.pos.z, 4, undefined, 0.5); sfx.jump(); return true; }
      if (this.jumpsLeft > 0) { this.jumpsLeft--; this.vy = a === 'high' ? PHYS.AIRHIGH : PHYS.AIRJUMP; this.state = 'air'; sfx.jump(); world.fx.groundRing(this.pos.x, this.pos.y, this.pos.z, 2.2, this.fxc, 0.3); world.fx.spark(this.pos.x, this.pos.y + 0.2, this.pos.z, 6, this.fxc, 4, 0.18, 0.3, 4); return true; }
      return false;
    }
    let slot = a, isPower = false;
    if (a === 'power') { if (this.power < 100) { if (this.isPlayer) world.emit('toast', { text: 'Power meter not full yet!' }); return false; } isPower = true; this.power = 0; slot = 'power'; sfx.power(); world.emit('power', { f: this }); }
    if (a === 'main' && !this.onGround) slot = 'flying';
    const def = this.getMove(slot, isPower);
    const tgt = this.nearestEnemy(def.type === 'projectile' || def.type === 'stun' || def.leap ? 16 : 5, true); if (tgt && Math.abs(tgt.pos.x - this.pos.x) > 0.3) this.face = sgn(tgt.pos.x - this.pos.x);
    this.move = { def, t: 0, fired: new Set(), hitSets: def.events.map(() => new Set()), lungeVx: 0, lungeUntil: -1, stream: null, leapHit: new Set(), slot }; this.state = 'attack'; this.stateT = 0;
    if (def.leap) { if (this.onGround) { this.vy = 11; this.vx = this.face * 7; this.onGround = false; this.surf = null; } else { this.vy = 7; this.vx = this.face * 6; } this.move.dive = false; sfx.whoosh(); }
    else sfx.whoosh(isPower ? 1.5 : 1);
    world.emit('move', { f: this, def });
    return true;
  }
  recover(world) {
    if (this.state === 'down' && this.stateT > 0.1) { this.getUp(world, true); return true; }
    if (this.dead || this.hitstun > 0 || this.stunT > 0 || !['idle', 'run', 'air', 'attack'].includes(this.state)) return false;
    if (!this.onGround) { // ledge recovery: boost up and back toward the nearest platform edge
      if (this.recoverUsed) return false; this.recoverUsed = true; this.move = null; this.state = 'air'; this.recT = 0.85;
      const s = this.nearestSurface(); const tx = clamp(this.pos.x, s.x0 + 0.8, s.x1 - 0.8) + (this.pos.x < s.x0 ? -0.3 : this.pos.x > s.x1 ? 0.3 : 0);
      this.vy = PHYS.RECOVER_UP; this.vx = clamp((tx - this.pos.x) * 2.4, -11, 11); if (this.vx) this.face = sgn(this.vx); this.invuln = Math.max(this.invuln, 0.3);
      world.fx.shock(this.pos.x, this.center, this.pos.z, 4, 0xbfe0ff, 0.4); world.fx.spark(this.pos.x, this.pos.y + 0.3, this.pos.z, 14, 0xbfe0ff, 6, 0.25, 0.5, -2); sfx.recover();
      world.emit('move', { f: this, def: { slot: 'recover', name: this.cfg.moves.recover.name } }); return true;
    }
    if (this.recoverCD > 0) return false; // standing recover: a quick guard burst that shoves crowding foes away
    this.recoverCD = 4; this.invuln = Math.max(this.invuln, 0.6); world.fx.shock(this.pos.x, this.center, this.pos.z, 5, 0xbfe0ff, 0.4); world.fx.groundRing(this.pos.x, this.pos.y, this.pos.z, 4, 0xbfe0ff, 0.5); sfx.recover();
    for (const o of world.fighters) if (o !== this && !o.dead && Math.abs(o.pos.x - this.pos.x) < 2.8 && Math.abs(o.center - this.center) < 2.2) o.takeHit(this, { dmg: 0, kb: 8, ang: 25, dir: sgn(o.pos.x - this.pos.x), fx: 'guard' }, world);
    world.emit('move', { f: this, def: { slot: 'recover', name: this.cfg.moves.recover.name } }); return true;
  }
  getUp(world, fast) { this.state = 'idle'; this.stateT = 0; this.invuln = fast ? 0.9 : 0.5; if (fast) { world.fx.shock(this.pos.x, this.center, this.pos.z, 3, 0xffffff, 0.3); sfx.recover(); world.emit('move', { f: this, def: { slot: 'recover', name: this.cfg.moves.recover.name } }); } }
  nearestSurface() { let best = null, bd = 1e9; for (const s of this.world.arena.surfaces) { const dx = Math.max(s.x0 - this.pos.x, 0, this.pos.x - s.x1), dy = Math.max(0, s.y - this.pos.y) * 0.6 + Math.max(0, this.pos.y - s.y) * 0.3; const d = dx + dy; if (d < bd) { bd = d; best = s; } } return best; }
  climbLedge(world) { const s = this.ledgeSurf; if (!s) { this.state = 'air'; return; } const left = this.ledgeSide < 0; this.pos.x = left ? s.x0 + this.radius * 1.2 : s.x1 - this.radius * 1.2; this.pos.y = s.y; this.vx = this.vy = 0; this.state = 'idle'; this.onGround = true; this.surf = s; this.invuln = Math.max(this.invuln, 0.5); this.ledgeCD = 0.7; world.fx.dustPuff(this.pos.x, this.pos.y, this.pos.z, 3); }
  // ---------- being hit ----------
  takeHit(src, h, world) {
    if (this.dead || this.state === 'ko' || this.invuln > 0 || this.dodgeT > 0) return false;
    if (this.state === 'ledge') { this.state = 'air'; }
    let dmg = h.dmg * (src?.dmgMul || 1); const blocked = this.blocking && this.hitstun <= 0 && this.stunT <= 0 && !h.pierce;
    const dir = h.dir, cx = this.pos.x, cy = this.center + (Math.random() - 0.5) * this.height * 0.3, cz = this.pos.z;
    if (blocked) {
      dmg *= 0.15; this.pct += dmg; this.vx += dir * h.kb * 0.35; sfx.block(); world.fx.spark(cx - dir * this.radius * 0.5, cy, cz, 8, 0x9ac8ff, 7, 0.22, 0.3); world.fx.flash(cx - dir * this.radius * 0.5, cy, cz, 1.4, 0x9ac8ff, 0.18); this.power = Math.min(100, this.power + dmg * 2 + 1.5); this.flash = 0.08; this.lastHitBy = src; this.lastHitAt = world.time;
      if (src) { src.power = Math.min(100, src.power + 1); } world.hitPause(0.04); return true;
    }
    this.pct += dmg; let spd = Math.min(56, (h.kb * KB_SCALE * (1 + this.pct / KB_GROWTH)) / this.weight); if (h.kb <= 0) spd = 0;
    const ang = (h.ang ?? 30) * rad; let vx, vy;
    if (h.radial) { const dx = cx - h.ox, dy = this.center - h.oy, L = Math.hypot(dx, dy) || 1; const rx = dx / L, ry = dy / L; const k = Math.max(0.35, Math.cos(ang)); vx = (rx * 0.65 + (rx < 0 ? -1 : 1) * 0.35) * spd * 1.0; vy = (Math.max(0.15, ry) * 0.5 + Math.sin(ang) * 0.5) * spd; }
    else { vx = Math.cos(ang) * dir * spd; vy = Math.sin(ang) * spd; }
    if (this.onGround && vy < 5 && spd > 4) vy = Math.max(vy, 4 + spd * 0.12);
    this.vx = vx; this.vy = vy; if (vy > 0.5 || h.ang < 0) { this.onGround = false; this.surf = null; }
    this.hitstun = clamp(0.14 + spd * 0.011, 0.14, 0.75); this.tumble = spd > 24; this.state = 'hit'; this.stateT = 0; this.move = null; this.blocking = false; this.recT = 0;
    if (h.stun) this.stunT = Math.max(this.stunT, h.stun);
    this.flash = 0.16; this.lastHitBy = src; this.lastHitAt = world.time; this.power = Math.min(100, this.power + dmg * 0.7);
    if (src && src !== this) { src.power = Math.min(100, src.power + dmg * 1.0); src.stats.dmg += dmg; src.comboHits++; src.comboT = 1.0; }
    // ---- impact juice ----
    const big = h.big || h.fin || dmg >= 9, col = h.color || src?.fxc || 0xffe080;
    world.fx.spark(cx, cy, cz, big ? 20 : 9, col, big ? 12 : 8, big ? 0.3 : 0.2, 0.5);
    world.fx.burstDir(cx, cy, cz, dir, 0.4, big ? 12 : 5, 0xffffff, big ? 14 : 9, 0.2, 0.3, 0.45);
    world.fx.flash(cx - dir * 0.2, cy, cz, big ? 2.9 : 2.2, h.big ? 0xfff0c8 : col, big ? 0.2 : 0.16);
    if (big) world.fx.shock(cx, cy, cz, h.big ? 5.5 : 3.6, col, 0.3);
    if (h.big) { world.flashScreen = 0.3; sfx.bigHit(); } else if (h.fin) sfx.hit(14); else if (h.fx === 'proj') sfx.hit(6); else sfx.hit(dmg);
    if (['slash', 'slashUp', 'thrust', 'smash', 'sweep'].includes(h.fx) && src && /sword|rapier|dagger|scimitar|spear|axe/.test(src.cfg.weapon)) sfx.clang(0.5 + (big ? 0.5 : 0));
    world.addShake(h.big ? 1.1 : h.fin ? 0.6 : Math.min(0.35, 0.08 + dmg * 0.02)); if (h.fin || h.big) world.punch = Math.max(world.punch, h.big ? 1 : 0.55);
    world.hitPause(h.big ? 0.16 : h.fin ? 0.09 : Math.min(0.06, 0.02 + dmg * 0.004)); world.kick = { x: dir * (h.big ? 1.2 : h.fin ? 0.6 : 0.2), y: 0.1 };
    // ---- per-move flavour: combo1 = crisp cut, combo2 = heavy crunch, power = finishing blast (each with its own look, shake, hit-pause and sound) ----
    const slot = src?.move?.slot;
    if (slot === 'combo1') {
      world.fx.burstDir(cx, cy, cz, dir, 0.25, 10, 0xffffff, 16, 0.16, 0.22, 0.4); world.fx.spark(cx, cy, cz, 10, col, 11, 0.16, 0.4); world.fx.flash(cx, cy, cz, 1.6, 0xffffff, 0.1);
      sfx.comboA(); world.addShake(0.3); world.hitPause(0.07);
    } else if (slot === 'combo2') {
      world.fx.shock(cx, cy, cz, 3.6, col, 0.28); world.fx.burstDir(cx, cy, cz, dir, 0.7, 16, col, 13, 0.24, 0.3, 0.5); world.fx.spark(cx, cy, cz, 16, 0xffe9b0, 9, 0.2, 0.5); world.fx.dustPuff(cx, this.pos.y, cz, 6);
      sfx.comboB(); world.addShake(0.55); world.hitPause(0.1); world.kick = { x: dir * 0.7, y: 0.12 };
    } else if (slot === 'power') {
      world.fx.shock(cx, cy, cz, 6.5, col, 0.4); world.fx.groundRing(cx, this.pos.y, cz, 6, col, 0.5); world.fx.glow(cx, cy, cz, 4.5, 0xfff0c8, 0.3); world.fx.spark(cx, cy, cz, 30, col, 13, 0.24, 0.65); world.fx.burstDir(cx, cy, cz, dir, 0.9, 20, 0xffffff, 17, 0.26, 0.3, 0.5);
      sfx.comboC(); world.addShake(0.95); world.punch = Math.max(world.punch, 0.55); world.hitPause(0.15); world.flashScreen = Math.max(world.flashScreen, 0.14); world.kick = { x: dir * 1.1, y: 0.15 };
    }
    if (src?.comboHits > 1) sfx.combo(Math.min(src.comboHits, 9));
    world.emit('hit', { f: this, by: src, dmg, big });
    return true;
  }
  stunBy(src, t, world) { if (this.dead || this.state === 'ko' || this.invuln > 0) return; this.stunT = t; this.vx = 0; setStone(this.rig, true, 0xb0e4f4); world.emit('stun', { f: this, by: src }); }
  // ---------- running a move's timeline ----------
  runMove(dt, world) {
    const m = this.move, d = m.def, prev = m.t; m.t += dt; const fx = world.fx, f = this.face, cx = () => this.pos.x, cy = () => this.center;
    const crossed = (t) => prev < t && m.t >= t;
    d.events.forEach((e, i) => {
      if (!crossed(e.t)) return;
      switch (e.k) {
        case 'hit': this.strike(e, m.hitSets[i], world); break;
        case 'pulse': this.pulse(e, m.hitSets[i], world); break;
        case 'proj': this.fireProj(e, d, world); break;
        case 'lunge': m.lungeVx = f * e.vx; m.lungeUntil = m.t + e.dur; fx.dustPuff(this.pos.x - f * 0.5, this.pos.y, this.pos.z, 4); sfx.whoosh(1.2); break;
        case 'beam': this.beam(e, world); break;
        case 'heal': this.pct = Math.max(0, this.pct - e.amt); fx.spark(cx(), cy(), this.pos.z, 24, 0x9affb0, 4, 0.25, 0.9, -3); fx.groundRing(cx(), this.pos.y, this.pos.z, 4, 0x9affb0, 0.7); fx.glow(cx(), cy(), this.pos.z, 5, 0x9affb0, 0.6); sfx.heal(); world.emit('heal', { f: this }); break;
        case 'stream': m.stream = { from: e.t, to: e.t + e.dur, range: e.range, dps: e.dps, big: e.big, nextHit: 0 }; sfx.fire(); break;
        case 'vfx': if (e.name === 'zoom') { world.punch = Math.max(world.punch, 0.9); world.flashScreen = 0.25; world.focus = this; world.focusT = 0.7; fx.shock(cx(), cy(), this.pos.z, 6, d.color, 0.45); fx.glow(cx(), cy(), this.pos.z, 4, d.color, 0.45); sfx.roar(1); } break;
      }
    });
    // lunges (dash / step-in attacks)
    this.lunging = m.t < m.lungeUntil; if (this.lunging) { this.vx = m.lungeVx; if (this.onGround && this.surf) { const nx = this.pos.x + this.vx * 0.06; if (nx < this.surf.x0 + 0.3 || nx > this.surf.x1 - 0.3) this.vx = 0; } /* ground charges stop at the ledge instead of running off */ if (Math.random() < 0.7) fx.trail(this.pos.x - f * 0.4, this.pos.y + this.height * (0.2 + Math.random() * 0.6), this.pos.z, d.color, 0.5, 0.3, 1); }
    // breath stream
    if (m.stream && m.t >= m.stream.from && m.t <= m.stream.to) {
      const S = m.stream, mx = this.pos.x + f * 0.6, my = this.pos.y + this.height * 0.72;
      for (let i = 0; i < 3; i++) { const sp = 8 + Math.random() * 5; fx.add.emit(mx, my, this.pos.z, f * sp * (S.range / 5), (Math.random() - 0.5) * 3 + 0.5, (Math.random() - .5), ...[1, 0.5 + Math.random() * 0.4, 0.1], 0.9, 0.5 + Math.random() * 0.6, 0.45 + Math.random() * 0.2, 0, 0.8, 1.5); }
      if (m.t >= S.nextHit) { S.nextHit = m.t + 0.12; for (const o of world.fighters) { if (o === this || o.dead || o.state === 'ko') continue; const dx = (o.pos.x - this.pos.x) * f; if (dx > -0.3 && dx < S.range + o.radius && Math.abs(o.center - my) < 1.6) o.takeHit(this, { dmg: S.dps * 0.12, kb: 2.6, ang: 18, dir: f, color: 0xff8a30, fx: 'proj' }, world); } }
      world.addShake(0.15);
    }
    // flying attack: dive and slam
    if (d.leap) {
      if (!m.dive && this.vy < 0) { m.dive = true; this.vy = -15; this.vx = f * 7; fx.swoosh(this.pos.x + f * 0.6, this.center, this.pos.z, f, 2.4, 95, -20, d.color, 0.3, 0.5); sfx.slash(1.2); }
      if (m.dive && !this.onGround) { if (Math.random() < 0.8) fx.trail(this.pos.x, this.center, this.pos.z, d.color, 0.6, 0.35, 1);
        for (const o of world.fighters) { if (o === this || o.dead || o.state === 'ko' || m.leapHit.has(o)) continue; if (Math.abs(o.pos.x - this.pos.x) < this.radius + o.radius + 0.6 && Math.abs(o.center - this.center) < (this.height + o.height) * 0.55) { m.leapHit.add(o); o.takeHit(this, { dmg: 7, kb: 8, ang: -55, dir: sgn(o.pos.x - this.pos.x) || f, fx: 'smash', fin: true }, world); this.vy = 9; this.vx *= 0.3; m.dive = false; m.t = Math.max(m.t, 1.0); } } }
      if (m.dive && this.onGround) { this.slam(world, d); this.endMove(); return; }
      if (m.t > 1.7) this.endMove();
      return;
    }
    if (m.t >= d.dur) this.endMove();
  }
  endMove() { this.move = null; this.lunging = false; this.state = this.onGround ? 'idle' : 'air'; }
  slam(world, d) { const fx = world.fx; fx.dustPuff(this.pos.x, this.pos.y, this.pos.z, 10); fx.groundRing(this.pos.x, this.pos.y, this.pos.z, 6, d.color, 0.5); fx.shock(this.pos.x, this.pos.y + 0.5, this.pos.z, 5, d.color, 0.35); fx.spark(this.pos.x, this.pos.y + 0.2, this.pos.z, 16, d.color, 9, 0.25, 0.5); sfx.thud(); world.addShake(0.45); world.hitPause(0.05);
    for (const o of world.fighters) if (o !== this && !o.dead && o.state !== 'ko' && Math.abs(o.pos.x - this.pos.x) < 3.4 + o.radius && Math.abs(o.pos.y - this.pos.y) < 2) o.takeHit(this, { dmg: 7, kb: 8.5, ang: 55, dir: sgn(o.pos.x - this.pos.x), radial: true, ox: this.pos.x, oy: this.center, fin: true, fx: 'burst' }, world); }
  // melee hitbox event
  strike(e, set, world) {
    const fx = world.fx, f = this.face, sw = SWING[e.fx] || SWING.slash, color = this.move.def.color, pw = this.move.def.power;
    const cyv = this.center + (e.dy ?? sw[4] * this.height * 0.4);
    // visuals: swoosh crescent + sound (the weapon/claw trail)
    if (e.fx === 'spin' || e.arc === 'all') fx.swoosh(this.pos.x, this.center, this.pos.z, f, Math.min(e.range, 3.4) * 0.85, 0, 0, color, 0.3, 0.5, true);
    else fx.swoosh(this.pos.x + f * 0.3, cyv, this.pos.z, f, Math.max(1.5, e.range * sw[2] * 1.15), sw[0], sw[1], color, 0.2, Math.max(0.2, sw[3]));
    if (pw || e.fin) fx.swoosh(this.pos.x + f * 0.3, cyv, this.pos.z + 0.05, f, Math.max(1.5, e.range * sw[2] * 1.3), sw[0], sw[1], 0xffffff, 0.16, Math.max(0.16, sw[3] * 0.6), e.fx === 'spin');
    sfx.slash(e.fin ? 1.5 : 1);
    { const slot = this.move.slot; // distinct trails per move: thin white cut / doubled gold arc / huge double crescent
      if (slot === 'combo1') fx.swoosh(this.pos.x + f * 0.35, cyv + 0.15, this.pos.z + 0.04, f, Math.max(1.4, e.range * sw[2]), sw[0] - 18, sw[1] - 10, 0xffffff, 0.13, 0.16);
      else if (slot === 'combo2') { fx.swoosh(this.pos.x + f * 0.3, cyv - 0.2, this.pos.z + 0.04, f, Math.max(1.6, e.range * sw[2] * 1.2), sw[0] + 22, sw[1] + 14, 0xffe0a0, 0.2, 0.35); fx.swoosh(this.pos.x + f * 0.3, cyv + 0.2, this.pos.z + 0.06, f, Math.max(1.4, e.range * sw[2]), sw[0] - 15, sw[1] - 8, color, 0.16, 0.25); sfx.whoosh(1.2); }
      else if (slot === 'power') { fx.swoosh(this.pos.x + f * 0.3, cyv, this.pos.z + 0.08, f, Math.max(2.2, e.range * sw[2] * 1.5), sw[0] + 8, sw[1] + 8, 0xfff0c8, 0.26, 0.6); world.addShake(0.35); sfx.whoosh(1.6); } }
    if (e.lunge) { this.move.lungeVx = f * e.lunge * 2.2; this.move.lungeUntil = this.move.t + 0.14; }
    if (e.rise) { this.vy = Math.max(this.vy, e.rise * 2.2); this.onGround = false; this.surf = null; }
    if (e.fx === 'thrust') fx.burstDir(this.pos.x + f * 0.7, this.center, this.pos.z, f, 0, 5, color, 8, 0.2, 0.3, 0.2);
    let any = 0;
    for (const o of world.fighters) {
      if (o === this || o.dead || o.state === 'ko' || set.has(o)) continue;
      const dx = o.pos.x - this.pos.x, dy = o.center - cyv, reachY = (e.reach ?? 1.35) + o.height * 0.5;
      const all = e.arc === 'all'; const fwd = dx * f;
      if (Math.abs(dy) > reachY + (e.rise ? 0.6 : 0)) continue;
      if (all ? Math.abs(dx) > e.range + o.radius : (fwd < -o.radius * 0.6 - 0.15 || fwd > e.range + o.radius)) continue;
      const hit = o.takeHit(this, { dmg: e.dmg * (pw ? 1.0 : 1), kb: e.kb, ang: e.ang, dir: all ? (sgn(dx) || f) : f, fin: e.fin, big: e.big, fx: e.fx, radial: all && e.fin, ox: this.pos.x, oy: this.center, color }, world);
      if (hit) { set.add(o); any++; }
    }
    return any;
  }
  pulse(e, set, world) {
    const fx = world.fx, color = e.color || this.move.def.color, cx = this.pos.x, cy = this.center, z = this.pos.z, big = e.big;
    fx.shock(cx, cy, z, e.r * 1.2, color, 0.45); fx.groundRing(cx, this.pos.y, z, e.r * 1.9, color, 0.6); fx.glow(cx, cy, z, e.r * 1.0, color, 0.4);
    fx.spark(cx, cy, z, 14 + (big ? 20 : 0), color, 6 + e.r, 0.25, 0.55, 4); fx.dustPuff(cx, this.pos.y, z, 8); sfx.thud(); if (big || e.fin) sfx.shimmer(); else sfx.magic(); world.addShake(big ? 0.8 : 0.3);
    for (const o of world.fighters) {
      if (o === this || o.dead || o.state === 'ko' || set.has(o)) continue;
      const dx = o.pos.x - cx, dy = o.center - cy; if (Math.hypot(dx, dy * 0.8) > e.r + o.radius) continue;
      if (o.takeHit(this, { dmg: e.dmg, kb: e.kb, ang: e.ang, dir: sgn(dx) || this.face, radial: true, ox: cx, oy: cy, fin: e.fin, big: e.big, stun: e.stun, fx: 'burst', color }, world)) set.add(o);
    }
  }
  fireProj(e, d, world) {
    const f = this.face, my = this.pos.y + this.height * 0.62, tgt = this.nearestEnemy(18, true); let base = 0;
    if (tgt && e.n < 4) { const dx = (tgt.pos.x - this.pos.x) * f, dy = tgt.center - my; if (dx > 1) base = clamp(Math.atan2(dy, dx), -0.45, 0.45); }
    const speed = e.style === 'rock' ? 17 : 23, sp = (e.spread || 8) * rad;
    for (let i = 0; i < e.n; i++) { const a = base + (i - (e.n - 1) / 2) * sp; const vx = Math.cos(a) * speed * f, vy = Math.sin(a) * speed + (e.style === 'rock' ? 5 : 0);
      world.projectiles.push(new Projectile(world, this, this.pos.x + f * 0.8, my, vx, vy, { dmg: e.dmg, kb: e.kb, ang: 12, style: e.style, color: d.color, big: e.big, life: 1.25 })); }
    world.fx.flash(this.pos.x + f * 0.9, my, this.pos.z, e.big ? 3 : 1.6, d.color, 0.16); if (e.style === 'arrow') sfx.arrow(); else sfx.magic();
  }
  beam(e, world) {
    const f = this.face, my = this.pos.y + this.height * 0.7; let targets = e.all ? world.fighters.filter(o => o !== this && !o.dead && o.state !== 'ko' && (o.pos.x - this.pos.x) * f > -1 && Math.abs(o.pos.x - this.pos.x) < e.range) : [this.nearestEnemy(e.range, true)].filter(Boolean);
    if (!targets.length) { world.fx.beam(this.pos.x + f * 0.5, my, this.pos.x + f * e.range * 0.6, my, this.pos.z, this.move.def.color, 0.6, 0.3); sfx.ice(); return; }
    for (const t of targets) { world.fx.beam(this.pos.x + f * 0.5, my, t.pos.x, t.center, this.pos.z, 0xd0f4ff, e.big ? 1.1 : 0.7, 0.4); world.fx.flash(t.pos.x, t.center, t.pos.z, 3, 0xd0f4ff, 0.3); if (t.takeHit(this, { dmg: e.dmg, kb: 1, ang: 20, dir: f, fx: 'proj', color: 0xd0f4ff, pierce: true }, world)) t.stunBy(this, e.time, world); }
    sfx.ice();
  }
  // ---------- per-step update ----------
  update(dt, world) {
    if (this.dead) return;
    const B = world.arena.blast;
    this.animT += dt; this.stateT += dt; this.invuln = Math.max(0, this.invuln - dt); this.dodgeCD = Math.max(0, this.dodgeCD - dt); this.recoverCD = Math.max(0, this.recoverCD - dt); this.ledgeCD = Math.max(0, this.ledgeCD - dt); this.dropT = Math.max(0, this.dropT - dt); this.landT = Math.max(0, this.landT - dt); this.recT = Math.max(0, this.recT - dt); this.flash = Math.max(0, this.flash - dt); this.comboT -= dt; if (this.comboT <= 0) this.comboHits = 0;
    this.power = Math.min(100, this.power + dt * 1.0);
    if (this.stunT > 0) { this.stunT -= dt; if (this.stunT <= 0) setStone(this.rig, false); }
    if (this.state === 'ko') { this.koT += dt; if (this.controller?.kind === 'local') { this.controller.sample(this, world, dt); } this.input.actions.length = 0; if (this.koT > 1.5) this.respawn(world); this.render(dt); return; }
    if (this.controller) this.controller.sample(this, world, dt); const inp = this.input;
    // after a respawn a held stick/key must be released and pressed again (and a short control lock) so the player doesn't walk off the stage straight away
    if (this.relLock > 0) { this.relLock -= dt; inp.mx = 0; inp.my = 0; inp.actions.length = 0; if (this.needRelease && Math.abs(this.controller?.state?.mx || 0) < 0.15) this.needRelease = false; }
    else if (this.needRelease) { if (Math.abs(this.controller?.state?.mx || 0) < 0.15) this.needRelease = false; else { inp.mx = 0; inp.my = 0; } }
    if (this.state === 'ledge') {
      this.ledgeT += dt; this.vx = this.vy = 0; this.invuln = Math.max(this.invuln, 0.2);
      for (const a of inp.actions) this.climbLedge(world);
      if (inp.my < -0.6) { this.state = 'air'; this.ledgeCD = 0.5; this.dropT = 0.3; } else if (this.ledgeT > (this.isPlayer ? 1.4 : 0.5) || Math.abs(inp.mx) > 0.5 && sgn(inp.mx) === -this.ledgeSide) this.climbLedge(world);
    } else if (this.hitstun > 0) {
      this.hitstun -= dt; if (inp.mx) this.vx += inp.mx * 9 * dt; // a little air influence
      if (this.hitstun <= 0) { this.state = this.onGround ? 'idle' : 'air'; this.tumble = false; }
    } else if (this.state === 'down') {
      for (const a of inp.actions) this.doAction(a, world); if (this.state === 'down' && this.stateT > 0.6) this.getUp(world, false);
    } else {
      const moving = Math.abs(inp.mx) > 0.3;
      if (inp.dodge && this.dodgeCD <= 0 && this.canAct() && this.onGround) { this.dodgeT = 0.3; this.dodgeCD = 0.8; this.dodgeDir = moving ? sgn(inp.mx) : -this.face; this.state = 'dodge'; this.stateT = 0; this.invuln = Math.max(this.invuln, 0.05); sfx.whoosh(); world.fx.dustPuff(this.pos.x, this.pos.y, this.pos.z, 4); }
      inp.dodge = false;
      if (this.state === 'dodge') { this.dodgeT -= dt; this.vx = this.dodgeDir * 14; world.fx.trail(this.pos.x, this.pos.y + this.height * 0.5, this.pos.z, 0xffffff, 0.5, 0.25, 1); if (this.dodgeT <= 0) { this.state = 'idle'; this.dodgeT = 0; } }
      this.blocking = !!inp.block && this.canAct() && this.onGround;
      for (const a of inp.actions) this.doAction(a, world);
      if (this.state === 'attack' && this.move) this.runMove(dt, world);
      if (this.stunT <= 0 && this.state !== 'dodge' && !this.lunging) {
        // horizontal control
        let sp = this.speed * (this.blocking ? 0.3 : 1) * (this.state === 'attack' ? 0.28 : 1); if (this.state === 'attack' && this.move?.def.leap) sp = 0;
        const tgt = inp.mx * sp, acc = this.onGround ? 80 : 30, dv = clamp(tgt - this.vx, -acc * dt, acc * dt);
        if (this.state === 'attack' && this.move?.def.leap) { /* keep dive velocity */ } else this.vx += dv;
        if (Math.abs(inp.mx) > 0.2 && this.state !== 'attack' && !this.blocking) this.face = sgn(inp.mx);
        if (this.state === 'idle' || this.state === 'run') this.state = Math.abs(inp.mx) > 0.15 && this.onGround ? 'run' : 'idle';
        this.speedNorm = Math.abs(this.vx) / this.speed;
        if (inp.my < -0.6 && this.onGround && this.surf && !this.surf.solid) { this.dropT = 0.28; this.onGround = false; this.surf = null; this.pos.y -= 0.05; this.state = 'air'; }
      } else this.speedNorm = 0;
    }
    // ---- physics ----
    let g = PHYS.GRAV; if (this.state === 'attack' && !this.move?.def.leap) g *= 0.5; if (this.state === 'ledge') g = 0;
    if (!this.onGround) { this.vy -= g * dt; const mf = (inp.my < -0.6 && this.hitstun <= 0 && this.state !== 'attack') ? PHYS.FASTFALL : PHYS.MAXFALL; if (this.vy < -mf && this.hitstun <= 0) this.vy = -mf; }
    if (this.hitstun > 0 && !this.onGround) this.vx *= Math.pow(0.55, dt); // light air drag in hitstun keeps launches long
    if (this.onGround && this.hitstun > 0) this.vx *= Math.pow(0.02, dt);
    if (this.onGround && this.state !== 'dodge' && this.hitstun <= 0 && !this.lunging && Math.abs(inp.mx) < 0.05 && this.state !== 'attack') this.vx *= Math.pow(0.0004, dt);
    const prevY = this.pos.y; if (this.state !== 'ledge') { this.pos.x += this.vx * dt; this.pos.y += this.vy * dt; }
    if (this.onGround && this.surf && this.surf.dx) this.pos.x += this.surf.dx;
    this.collide(prevY, world);
    if (this.state !== 'ledge' && this.state !== 'ko') this.tryLedge(world);
    if (this.pos.x < B.l || this.pos.x > B.r || this.pos.y < B.b || this.pos.y > B.t) this.knockOut(world);
    this.pos.z += (this.laneZ - this.pos.z) * Math.min(1, dt * 6);
    inp.actions.length = 0;
    this.render(dt);
  }
  collide(prevY, world) {
    const r = this.radius; let landed = null;
    for (const s of world.arena.surfaces) {
      if (s.solid && this.state !== 'ledge') { // side walls of the main stage (you can't walk through it from below)
        if (this.pos.y < s.y - 0.08 && this.pos.y + this.height * 0.8 > s.bottom && this.pos.x > s.x0 - r * 0.6 && this.pos.x < s.x1 + r * 0.6 && !(this.vy <= 0 && prevY >= s.y - 0.12)) {
          if (this.pos.x - (s.x0 - r * 0.6) < (s.x1 + r * 0.6) - this.pos.x) { this.pos.x = s.x0 - r * 0.6; this.vx = Math.min(this.vx, 0); } else { this.pos.x = s.x1 + r * 0.6; this.vx = Math.max(this.vx, 0); }
        }
      }
      if (this.vy <= 0 && prevY >= s.y - 0.12 - Math.abs(s.dx || 0) && this.pos.y <= s.y && this.pos.x > s.x0 - r * 0.35 && this.pos.x < s.x1 + r * 0.35 && !(this.dropT > 0 && !s.solid) && this.state !== 'ledge') { if (!landed || s.y > landed.y) landed = s; }
    }
    const wasGround = this.onGround;
    if (landed) {
      const impact = -this.vy; this.pos.y = landed.y; this.vy = 0; this.onGround = true; this.surf = landed; this.jumpsLeft = 1; this.recoverUsed = false; this.recT = 0;
      if (!wasGround) { this.landT = 0.14; if (impact > 7) { world.fx.dustPuff(this.pos.x, this.pos.y, this.pos.z, impact > 16 ? 8 : 4); if (impact > 12) sfx.land(); }
        if (this.hitstun > 0 && this.tumble) { this.state = 'down'; this.stateT = 0; this.hitstun = 0; this.tumble = false; this.invuln = Math.max(this.invuln, 0.25); this.vx *= 0.3; world.fx.dustPuff(this.pos.x, this.pos.y, this.pos.z, 8); sfx.thud(); world.addShake(0.25); }
        else if (this.state === 'air') this.state = 'idle'; }
    } else if (this.onGround) { // still standing?
      const s = this.surf; if (!s || this.pos.x < s.x0 - r * 0.35 || this.pos.x > s.x1 + r * 0.35 || this.pos.y > s.y + 0.05 || this.dropT > 0 && !s.solid) { this.onGround = false; this.surf = null; if (this.state === 'idle' || this.state === 'run') this.state = 'air'; }
    }
    if (!this.onGround && (this.state === 'idle' || this.state === 'run')) this.state = 'air';
  }
  tryLedge(world) {
    if (this.hitstun > 0 || this.onGround || this.ledgeCD > 0 || this.vy > 3 && this.recT <= 0 || this.state === 'attack' || this.stunT > 0) return;
    for (const s of world.arena.surfaces) for (const side of [-1, 1]) {
      const ex = side < 0 ? s.x0 : s.x1, hangY = s.y - this.height * 0.82;
      if (Math.abs(this.pos.x - ex) < 1.6 && this.pos.y < s.y - 0.1 && this.pos.y > s.y - this.height - 1.6 && (this.recT > 0 || this.vy < 0) && (s.solid || this.recT > 0 || this.isPlayer)) {
        this.state = 'ledge'; this.ledgeSurf = s; this.ledgeSide = side; this.ledgeT = 0; this.pos.x = ex + side * (this.radius * 0.95); this.pos.y = hangY; this.vx = this.vy = 0; this.face = -side; this.recoverUsed = false; this.jumpsLeft = 1; this.invuln = Math.max(this.invuln, 0.6); this.recT = 0; this.move = null;
        world.fx.spark(this.pos.x, this.pos.y + this.height * 0.9, this.pos.z, 6, 0xffffff, 3, 0.15, 0.3); return;
      }
    }
  }
  knockOut(world) {
    const B = world.arena.blast, ex = clamp(this.pos.x, B.l, B.r), ey = clamp(this.pos.y, B.b, B.t);
    this.state = 'ko'; this.koT = 0; this.move = null; this.hitstun = 0; this.stunT = 0; this.invuln = 0; this.lives--; this.group.visible = false; this.shadow.visible = false; setStone(this.rig, false);
    const by = this.lastHitBy && world.time - this.lastHitAt < 5 ? this.lastHitBy : null; if (by && by !== this) by.stats.kos++;
    // KO burst at the screen edge where it left
    const fx = world.fx, z = 1; const sx = this.pos.x < B.l + 1 ? B.l + 8 : this.pos.x > B.r - 1 ? B.r - 8 : this.pos.x, sy = this.pos.y > B.t - 1 ? B.t - 3 : this.pos.y < B.b + 1 ? B.b + 4 : this.pos.y;
    this.koPoint = { x: clamp(this.pos.x, B.l, B.r), y: clamp(this.pos.y, B.b, B.t), edgeX: sx, edgeY: sy };
    fx.flash(sx, sy, z, 8, 0xffffff, 0.35); fx.shock(sx, sy, z, 14, this.fxc, 0.55); fx.spark(sx, sy, z, 50, 0xffe080, 16, 0.5, 1.0, 4); fx.spark(sx, sy, z, 24, this.fxc, 10, 0.4, 0.8, 2);
    sfx.ko(); world.addShake(1.2); world.punch = Math.max(world.punch, 0.4); world.hitPause(0.08);
    world.emit('ko', { f: this, by, x: sx, y: sy }); world.emit('lifeLost', { f: this });
    if (this.lives <= 0) { this.dead = true; world.emit('out', { f: this }); }
  }
  respawn(world) {
    const a = world.arena, hw = a.halfW; let best = 0, bs = -1; for (let i = 0; i < 5; i++) { const x = (Math.random() - 0.5) * hw * 0.9; let md = 99; for (const o of world.fighters) if (o !== this && !o.dead && o.state !== 'ko') md = Math.min(md, Math.abs(o.pos.x - x)); if (md > bs) { bs = md; best = x; } }
    this.spawn(best, 11, 2.8); if (this.isPlayer) { this.relLock = 0.4; this.needRelease = true; } world.emit('respawn', { f: this }); sfx.respawn(); world.fx.groundRing(best, 10, 0, 4, 0xfff0a0, 0.8); world.fx.glow(best, 11.8, 0, 5, 0xfff0a0, 0.8); world.emit('lifeLost', { f: this });
  }
  dispose() { this.disposed = true; this.world.scene.remove(this.group); this.world.scene.remove(this.shadow); }
  // ---------- rendering ----------
  render(dt) {
    const w = this.world, S = this.shadow;
    this.group.position.set(this.pos.x, this.pos.y, this.pos.z);
    const surf = w.surfaceBelow(this.pos.x, this.pos.y + 0.2, 0.2);
    if (surf && this.state !== 'ko') { const hgt = Math.max(0, this.pos.y - surf.y); S.visible = true; S.position.set(this.pos.x, surf.y + 0.07, this.pos.z); const k = (this.radius * 3.4 + 0.4) / (1 + hgt * 0.12); S.scale.set(k, k * 0.55, 1); S.material.opacity = Math.max(0.15, 0.9 - hgt * 0.08); S.rotation.z = 0; } else S.visible = false;
    let mode = 'idle', phase = 0, style, seg = 0, kind = 'slash', hitIdx = 0, spins = 2;
    const mv = this.move;
    if (this.state === 'ko') { mode = 'ko'; phase = Math.min(1, this.koT / 0.6); }
    else if (this.state === 'down') { mode = 'ko'; phase = 0.55; }
    else if (this.state === 'dodge') { mode = 'dodge'; phase = 1 - this.dodgeT / 0.3; }
    else if (this.state === 'ledge') { mode = 'jump'; }
    else if (this.hitstun > 0) { mode = 'hit'; phase = 1 - Math.min(1, this.hitstun / 0.35); }
    else if (this.stunT > 0) { mode = 'idle'; }
    else if (this.state === 'attack' && mv) {
      const d = mv.def; phase = Math.min(1, mv.t / d.dur); mode = d.leap ? 'leap' : (d.anim === 'cast' ? 'cast' : 'attack'); style = d.anim;
      const hits = d.events.filter(e => e.k === 'hit' || e.k === 'pulse' || e.k === 'proj');
      let i = -1; for (let k = 0; k < hits.length; k++) if (mv.t >= hits[k].t - 0.12) i = k; if (i < 0) i = 0;
      const t0 = hits[i] ? hits[i].t - 0.12 : 0; seg = clamp((mv.t - t0) / 0.3, 0, 1); hitIdx = i; kind = hits[i]?.fx || 'slash'; spins = Math.max(1, hits.length);
      if (d.anim === 'multi' && hits.length) { /* each hit restarts the swing */ }
    }
    else if (this.blocking) mode = 'block';
    else if (!this.onGround) mode = 'jump';
    else if (this.state === 'run') mode = 'run';
    // face
    const ty = this.face > 0 ? Math.PI / 2 - 0.3 : -Math.PI / 2 + 0.3; let dy = ty - this.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.yaw += dy * Math.min(1, dt * 20); this.group.rotation.y = this.yaw;
    const tumble = this.tumble && this.hitstun > 0;
    if (this.bb) {
      const m2 = mode === 'leap' || mode === 'cast' ? 'attack' : mode === 'run' || mode === 'idle' && this.speedNorm > 0.1 ? 'run' : mode;
      animateBillboard(this.bb, { face: this.face, t: this.animT, speed: Math.min(1, this.speedNorm || 0), grounded: this.onGround, vy: this.vy, mode: m2, slot: this.move && this.move.slot, phase, seg, kind: mode === 'cast' ? 'cast' : kind, spins, tumble, frozen: this.stunT > 0, landT: this.landT, invuln: this.invuln, power: this.power >= 100, flash: this.flash, grade: this.world.grade });
      this.group.rotation.y = 0; this.bb.root.position.y = this.bb.root.userData.lift || 0;
    } else {
      animateRig(this.rig, { mode: mode === 'leap' ? 'leap' : mode, phase, speed: this.stunT > 0 ? 0 : Math.min(1, this.speedNorm || 0), style, seg, kind, hitIdx, spins }, this.stunT > 0 ? 0 : this.animT);
      if (tumble) { this.rig.body.rotation.x = -this.face * this.animT * 15; this.rig.body.position.y += this.height * 0.5; }
      if (this.landT > 0) { this.rig.body.scale.set(1.08, 1 - this.landT * 0.8, 1.08); } else this.rig.body.scale.set(1, 1, 1);
      if (this.flash > 0) setTint(this.rig, new THREE.Color(0xff3020), 0.8); else if (this.blocking) setTint(this.rig, new THREE.Color(0x3070ff), 0.4);
      else setTint(this.rig, new THREE.Color(0xffffff), this.invuln > 0 ? (Math.sin(this.animT * 30) > 0 ? 0.4 : 0) : (this.power >= 100 ? 0.1 + Math.sin(this.animT * 6) * 0.06 : 0));
    }
    if (this.mixer) this.mixer.update(dt);
    // ambient FX: power glow, frozen sparkle, invulnerable ring
    if (this.power >= 100 && Math.random() < 0.25 && this.state !== 'ko') w.fx.embers(this.pos.x, this.pos.y + 0.2, this.pos.z, 1, 0xffd860, this.radius * 2);
    if (this.stunT > 0 && Math.random() < 0.3) w.fx.spark(this.pos.x, this.center, this.pos.z, 1, 0xb0f0ff, 2, 0.15, 0.4, 0);
  }
}
