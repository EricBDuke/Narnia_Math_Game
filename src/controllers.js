// Fighter controllers: the ONLY place a fighter gets its commands from.
// Every controller fills fighter.input = { mx, my, block, dodge, actions[] } once per simulation step via sample(fighter, world, dt).
//   mx: -1..1 left/right.  my: -1..1 (down < -0.6 = drop through a platform / fast fall).
// Stage 2 (online, up to 6 humans + bots): each remote human gets a NetworkController fed by input frames from the server;
// empty slots get AIController bots; the local player keeps a LocalController. The combat code never needs to know which.

// Shared input state written by keyboard / touch handlers (main.js) and read by LocalController.
export class InputState {
  constructor() { this.mx = 0; this.my = 0; this.block = false; this.dodge = false; this.queue = []; }
  press(action) { this.queue.push(action); }
  // serialisable snapshot (what a Stage 2 client would send to the server each tick)
  frame() { const f = { mx: +this.mx.toFixed(3), my: +this.my.toFixed(3), block: this.block, dodge: this.dodge, actions: this.queue.slice() }; this.queue.length = 0; this.dodge = false; return f; }
}
function applyFrame(f, fr) { const inp = f.input; inp.mx = fr.mx; inp.my = fr.my || 0; inp.block = !!fr.block; if (fr.dodge) inp.dodge = true; inp.actions.length = 0; for (const a of fr.actions || []) inp.actions.push(a); }

export class LocalController {
  constructor(state) { this.kind = 'local'; this.state = state; }
  sample(f) { applyFrame(f, this.state.frame()); }
}

// Stage 2 stub: frames arrive from the network (server-authoritative or relayed). Not connected to anything yet.
export class NetworkController {
  constructor(playerId) { this.kind = 'network'; this.playerId = playerId; this.frames = []; this.last = { mx: 0, my: 0, block: false, actions: [] }; }
  push(frame) { this.frames.push(frame); }
  sample(f) { const fr = this.frames.shift(); if (fr) this.last = { ...fr, actions: [] }; applyFrame(f, fr || this.last); }
}

export const AI_LEVELS = {
  easy:     { cd: [2.0, 3.6], block: 0.12, react: 0.55, maxOnPlayer: 1, dmgMul: 0.45, aim: 0.55 },
  medium:   { cd: [1.6, 2.9], block: 0.2, react: 0.4, maxOnPlayer: 1, dmgMul: 0.55, aim: 0.7 },
  hard:     { cd: [1.3, 2.3], block: 0.3, react: 0.28, maxOnPlayer: 2, dmgMul: 0.68, aim: 0.85 },
  ultimate: { cd: [1.0, 1.7], block: 0.4, react: 0.18, maxOnPlayer: 2, dmgMul: 0.8, aim: 1 },
};
const sgn = (v) => v < 0 ? -1 : 1;

// Bots: move along the platforms, jump between them, attack, block, and recover back to the stage after being launched.
export class AIController {
  constructor(level) { this.kind = 'ai'; this.level = level; this.target = null; this.cd = 1 + Math.random(); this.blockT = 0; this.strafe = Math.random() < .5 ? 1 : -1; this.wantDist = 1.8; this.retarget = 0; this.jumpCD = 0; this.rcd = 0; this.dropGoal = false; this.lastAir = 0; this.sub = 0; }
  surfaceOf(world, x, y) { return world.surfaceBelow(x, y + 0.3, 0.2); }
  nextSurface(world, cur, goal) { // breadth-first search over standable surfaces (which can I reach from where I am?)
    if (!cur || !goal || cur === goal) return goal; const S = world.arena.surfaces; const reach = (a, b) => { const gap = Math.max(a.x0 - b.x1, b.x0 - a.x1, 0); return (b.y - a.y <= 4.6) && gap < 8; };
    const prev = new Map([[cur, null]]); const q = [cur]; while (q.length) { const a = q.shift(); if (a === goal) break; for (const b of S) if (!prev.has(b) && reach(a, b)) { prev.set(b, a); q.push(b); } }
    if (!prev.has(goal)) return goal; let n = goal; while (prev.get(n) && prev.get(n) !== cur) n = prev.get(n); return n;
  }
  sample(f, world, dt) {
    const A = this, inp = f.input, L = A.level; inp.actions.length = 0; inp.mx = 0; inp.my = 0; inp.block = false;
    A.cd -= dt; A.retarget -= dt; A.blockT -= dt; A.jumpCD -= dt; A.rcd -= dt;
    const S = world.arena.surfaces, main = S[0];
    if (f.state === 'ledge') { if (f.ledgeT > 0.25) inp.actions.push('jump'); return; }
    if (f.state === 'down') { if (f.stateT > L.react * 0.5) inp.actions.push('recover'); return; }
    if (f.hitstun > 0) { inp.mx = Math.max(-1, Math.min(1, (main.cx - f.pos.x) * 0.3)); return; }
    if (f.stunT > 0) return;
    // ---- recovery: off the stage or below it ----
    const under = world.surfaceBelow(f.pos.x, f.pos.y + 0.3, 0.5);
    const offstage = !f.onGround && (!under || f.pos.y < main.y - 1.2 && (f.pos.x < main.x0 || f.pos.x > main.x1));
    if (offstage) {
      const tx = Math.max(main.x0 + 1.2, Math.min(main.x1 - 1.2, f.pos.x)); inp.mx = Math.abs(f.pos.x - tx) > 0.4 ? sgn(tx - f.pos.x) : 0; if (f.pos.x < main.x0 - 0.5) inp.mx = 1; if (f.pos.x > main.x1 + 0.5) inp.mx = -1;
      if (f.vy < 1 && f.jumpsLeft > 0 && A.jumpCD <= 0 && f.pos.y < main.y + 1) { inp.actions.push('high'); A.jumpCD = 0.5; }
      else if (f.vy < 0 && !f.recoverUsed && A.rcd <= 0 && f.pos.y < main.y - 1.0 && (f.jumpsLeft <= 0 || f.pos.y < main.y - 3.5)) { if (Math.random() < 0.25 + (1 - L.react) * 0.6) inp.actions.push('recover'); else A.rcd = 0.12; }
      return;
    }
    // ---- target ----
    const t0 = A.target; if (!t0 || t0.dead || t0.state === 'ko' || A.retarget <= 0) {
      A.retarget = 2 + Math.random() * 3; const cands = world.fighters.filter(o => o !== f && !o.dead && o.state !== 'ko'); const onPlayer = world.fighters.filter(o => o.ai && o.ai.target && o.ai.target.isPlayer && o !== f).length;
      cands.sort((a, b) => Math.hypot(a.pos.x - f.pos.x, (a.pos.y - f.pos.y) * 1.5) - Math.hypot(b.pos.x - f.pos.x, (b.pos.y - f.pos.y) * 1.5)); let t = cands[0]; const pl = cands.find(c => c.isPlayer);
      if (pl && onPlayer < L.maxOnPlayer && Math.random() < 0.45) t = pl; if (t && t.isPlayer && onPlayer >= L.maxOnPlayer) t = cands.find(c => !c.isPlayer) || t;
      A.target = t; const mt = f.cfg.moves.main.type; A.wantDist = mt === 'projectile' ? 5 + Math.random() * 3 : 1.5 + f.radius + Math.random() * 0.6;
    }
    const t = A.target; if (!t) return;
    const dx = t.pos.x - f.pos.x, dy = t.center - f.center, ad = Math.abs(dx);
    // ---- block when an attack is coming ----
    if (A.blockT > 0) inp.block = true; else if (t.state === 'attack' && ad < 3.2 && Math.abs(dy) < 2 && Math.random() < L.block * dt * 6 && f.onGround) { A.blockT = 0.35 + Math.random() * 0.4; inp.block = true; }
    if (inp.block) return;
    // ---- navigation between platforms ----
    const cur = f.onGround ? f.surf : under, tsf = t.onGround ? t.surf : world.surfaceBelow(t.pos.x, t.pos.y + 0.3, 0.5);
    let goalX = t.pos.x, platformMode = false;
    if (cur && tsf && cur !== tsf && Math.abs(t.pos.y - f.pos.y) > 1.3) {
      platformMode = true; const nx = A.nextSurface(world, cur, tsf), cx = Math.max(nx.x0 + 0.8, Math.min(nx.x1 - 0.8, f.pos.x));
      if (nx.y > cur.y + 0.3) { // go up: stand under/on it and jump
        const inside = f.pos.x > nx.x0 + 0.3 && f.pos.x < nx.x1 - 0.3; goalX = inside ? f.pos.x : cx;
        if (f.onGround && inside && A.jumpCD <= 0) { inp.actions.push((nx.y - cur.y) > 2.3 ? 'high' : 'jump'); A.jumpCD = 0.7; }
        if (!f.onGround && f.jumpsLeft > 0 && f.vy < 1.5 && f.pos.y < nx.y - 0.3 && f.pos.y > cur.y + 1 && A.jumpCD <= 0 && inside) { inp.actions.push('jump'); A.jumpCD = 0.4; }
      } else { // go down: walk off or drop through
        goalX = cx; const over = f.pos.x > nx.x0 + 0.3 && f.pos.x < nx.x1 - 0.3; if (over && f.onGround && !cur.solid) inp.my = -1; else if (cur.solid || !over) goalX = nx.cx;
      }
    }
    // ---- spacing & attacking ----
    const gx = goalX - f.pos.x; let want = platformMode ? 0.4 : A.wantDist; const ga = Math.abs(gx);
    if (ga > want + 0.4) inp.mx = sgn(gx); else if (!platformMode && ga < want - 1.4 && f.onGround) inp.mx = -sgn(gx) * 0.8; else if (!platformMode && Math.random() < 0.03) A.strafe *= -1; if (!platformMode && ga <= want + 1.2) inp.mx += A.strafe * 0.25;
    inp.mx = Math.max(-1, Math.min(1, inp.mx));
    // never walk off a ledge by accident
    if (f.onGround && f.surf && inp.my >= 0 && !platformMode) { const edge = inp.mx > 0 ? f.surf.x1 - f.pos.x : f.pos.x - f.surf.x0; if (inp.mx !== 0 && edge < 1.0 && !(dy < -2.5 && Math.random() < 0.002)) inp.mx = 0; }
    // signature: bots use it too when charged and a foe is close enough for it to land (a short, level-dependent hesitation)
    if (f.sigMeter >= 100 && f.sig && !world.cine && ad < 7.5 && Math.abs(dy) < 3.2 && Math.random() < dt * (1.2 + (1 - L.react) * 3)) { inp.actions.push('signature'); return; }
    if (A.cd <= 0 && ad < A.wantDist + 1.8 && Math.abs(dy) < 2.2 && (ad < 0.6 || sgn(dx) === f.face || Math.abs(inp.mx) < 0.3)) {
      A.cd = L.cd[0] + Math.random() * (L.cd[1] - L.cd[0]); const r = Math.random(); let a;
      if (f.power >= 100 && Math.random() < 0.7) a = 'power'; else if (r < 0.4) a = 'main'; else if (r < 0.62) a = 'combo1'; else if (r < 0.84) a = 'combo2'; else a = 'flying';
      if (f.cfg.moves.main.type === 'projectile' && ad > 3 && r < 0.6) a = 'main'; inp.actions.push(a);
      if (f.face !== sgn(dx) && ad > 0.6) f.face = sgn(dx);
    }
    if (A.cd <= 0 && A.target && f.cfg.moves.main.type === 'projectile' && ad > 4 && ad < 14 && Math.abs(dy) < 2.5 && sgn(dx) === f.face) { A.cd = L.cd[0]; inp.actions.push(Math.random() < 0.5 ? 'main' : 'combo1'); }
    if (f.onGround && !platformMode && A.jumpCD <= 0 && Math.random() < 0.004) { inp.actions.push(Math.random() < 0.5 ? 'jump' : 'high'); A.jumpCD = 1; }
    if (dy > 2.0 && ad < 3 && f.onGround && A.jumpCD <= 0 && !platformMode) { inp.actions.push('jump'); A.jumpCD = 0.8; }
    if (f.recoverCD <= 0 && f.onGround && world.fighters.filter(o => o !== f && !o.dead && o.state !== 'ko' && Math.abs(o.pos.x - f.pos.x) < 2.2 && Math.abs(o.pos.y - f.pos.y) < 1.5).length >= 3 && Math.random() < 0.05) inp.actions.push('recover');
  }
}
