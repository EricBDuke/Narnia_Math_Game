// Fighter controllers: the ONLY place a fighter gets its commands from.
// Every controller fills fighter.input = { mx, mz, block, dodge, actions[] } once per simulation step via sample(fighter, world, dt).
// Stage 2 (online, up to 6 humans + bots): each remote human gets a NetworkController fed by input frames from the server;
// empty slots get AIController bots; the local player keeps a LocalController. The combat code never needs to know which.

// Shared input state written by keyboard / touch handlers (main.js) and read by LocalController.
export class InputState {
  constructor() { this.mx = 0; this.mz = 0; this.block = false; this.dodge = false; this.queue = []; }
  press(action) { this.queue.push(action); }
  // serialisable snapshot (what a Stage 2 client would send to the server each tick)
  frame() { const f = { mx: +this.mx.toFixed(3), mz: +this.mz.toFixed(3), block: this.block, dodge: this.dodge, actions: this.queue.slice() }; this.queue.length = 0; this.dodge = false; return f; }
}
function applyFrame(f, fr) { const inp = f.input; inp.mx = fr.mx; inp.mz = fr.mz; inp.block = !!fr.block; if (fr.dodge) inp.dodge = true; inp.actions.length = 0; for (const a of fr.actions || []) inp.actions.push(a); }

export class LocalController {
  constructor(state) { this.kind = 'local'; this.state = state; }
  sample(f) { applyFrame(f, this.state.frame()); }
}

// Stage 2 stub: frames arrive from the network (server-authoritative or relayed). Not connected to anything yet.
export class NetworkController {
  constructor(playerId) { this.kind = 'network'; this.playerId = playerId; this.frames = []; this.last = { mx: 0, mz: 0, block: false, actions: [] }; }
  push(frame) { this.frames.push(frame); }
  sample(f) { const fr = this.frames.shift(); if (fr) this.last = { ...fr, actions: [] }; applyFrame(f, fr || this.last); }
}

export class AIController {
  constructor(level) { this.kind = 'ai'; this.level = level; this.think = 0; this.target = null; this.cd = 1 + Math.random(); this.blockT = 0; this.strafe = Math.random() < .5 ? 1 : -1; this.wantDist = 1.6; this.retarget = 0; }
  sample(f, world, dt) {
    const A = this, inp = f.input; inp.actions.length = 0; inp.mx = inp.mz = 0; inp.block = false;
    const L = A.level; A.think -= dt; A.cd -= dt; A.retarget -= dt; A.blockT -= dt;
    if (f.state === 'down') { if (f.stateT > L.recover && Math.random() < 0.05) inp.actions.push('recover'); return; }
    if (!A.target || A.target.dead || A.target.state === 'ko' || A.retarget <= 0) {
      A.retarget = 2 + Math.random() * 3;
      const cands = world.fighters.filter(o => o !== this && !o.dead && o.state !== 'ko');
      const onPlayer = world.fighters.filter(o => o.ai && o.ai.target && o.ai.target.isPlayer && o !== this).length;
      cands.sort((a, b) => a.pos.distanceTo(f.pos) - b.pos.distanceTo(f.pos));
      let t = cands[0]; const pl = cands.find(c => c.isPlayer);
      if (pl && onPlayer < L.maxOnPlayer && Math.random() < 0.45) t = pl;
      if (t && t.isPlayer && onPlayer >= L.maxOnPlayer) t = cands.find(c => !c.isPlayer) || t;
      A.target = t; const mt = f.cfg.moves.main.type; A.wantDist = mt === 'projectile' ? 6 + Math.random() * 3 : 1.4 + f.radius;
    }
    const t = A.target; if (!t) return;
    const to = t.pos.clone().sub(f.pos); to.y = 0; const dist = to.length(); to.normalize();
    // block if target is attacking close by
    if (A.blockT > 0) { inp.block = true; }
    else if (t.state === 'attack' && dist < 3 && Math.random() < L.block * dt * 6) { A.blockT = 0.4 + Math.random() * 0.4; inp.block = true; }
    if (inp.block) return;
    const side = new V3(to.z, 0, -to.x);
    if (dist > A.wantDist + 0.5) { inp.mx = to.x + side.x * 0.25 * A.strafe; inp.mz = to.z + side.z * 0.25 * A.strafe; }
    else if (dist < A.wantDist - 1.5) { inp.mx = -to.x; inp.mz = -to.z; }
    else if (Math.random() < 0.02) A.strafe *= -1;
    if (dist <= A.wantDist + 1.0) { inp.mx += side.x * 0.3 * A.strafe; inp.mz += side.z * 0.3 * A.strafe; f.yaw = Math.atan2(to.x, to.z); }
    if (A.cd <= 0 && dist < A.wantDist + 1.6) {
      A.cd = L.cd[0] + Math.random() * (L.cd[1] - L.cd[0]);
      let a; const r = Math.random();
      if (f.power >= 100 && Math.random() < 0.7) a = 'power';
      else if (r < 0.42) a = 'main'; else if (r < 0.64) a = 'combo1'; else if (r < 0.86) a = 'combo2'; else a = 'flying';
      inp.actions.push(a);
    }
    if (Math.random() < 0.003) inp.actions.push(Math.random() < .5 ? 'jump' : 'high');
    if (f.recoverCD <= 0 && world.fighters.filter(o => o !== this && !o.dead && o.pos.distanceTo(f.pos) < 2).length >= 3 && Math.random() < 0.05) inp.actions.push('recover');
  }
}
class V3 { constructor(x, y, z) { this.x = x; this.y = y; this.z = z; } }
