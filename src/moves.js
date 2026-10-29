// Move choreography. Every fighter's Main / Combo 1 / Combo 2 / Power / Flying move is built here from its move TYPE (from fighters.js)
// into a timeline of events (hits, projectiles, pulses, lunges, beams...). Combos are multi-hit with distinct swing shapes, lunges and finishers.
// Timeline event times are in seconds. ang = launch angle in degrees (0 = straight ahead, 90 = straight up).
const H = (t, range, dmg, kb, ang, fx, o = {}) => ({ k: 'hit', t, range, dmg, kb, ang, fx, ...o });
const PU = (t, r, dmg, kb, ang, o = {}) => ({ k: 'pulse', t, r, dmg, kb, ang, ...o });
const PR = (t, n, dmg, kb, o = {}) => ({ k: 'proj', t, n, dmg, kb, ...o });
const V = (t, name) => ({ k: 'vfx', t, name });
const LU = (t, vx, dur = 0.3) => ({ k: 'lunge', t, vx, dur });

export function fxColor(f, m) {
  const d = ((m?.name || '') + ' ' + (m?.desc || '')).toLowerCase();
  if (/ice|frost|snow|freez|winter|cold/.test(d) || f.weapon === 'wand') return 0x9fe8ff;
  if (/fire|flame|dragon|burn|ember|torch|sun/.test(d)) return 0xff8a30;
  if (/gold|crown|royal|star|light|holy|aslan/.test(d)) return 0xffe27a;
  if (/heal|leaf|nature|tree|spring|green/.test(d)) return 0x9affb0;
  if (/shadow|dark|curse|evil|black/.test(d)) return 0xc890ff;
  if (f.weapon === 'bow') return 0xffe090;
  if (['sword', 'swordshield', 'rapier', 'dagger', 'scimitar', 'spear', 'axe'].includes(f.weapon)) return 0xcfe6ff;
  if (['club', 'hammer', 'oar', 'cane', 'umbrella', 'fan', 'whip', 'staff'].includes(f.weapon)) return 0xffc878;
  return 0xffe6c0;
}
export function projStyle(f, m) {
  const d = (m.name + ' ' + m.desc).toLowerCase();
  if (/ice|frost|snow/.test(d) || f.weapon === 'wand') return 'ice';
  if (/arrow|bow|shot|volley|dart/.test(d) || f.weapon === 'bow') return 'arrow';
  if (/boulder|rock|nut|honeycomb|dishes|gems|stone|apple|bone/.test(d)) return 'rock';
  if (/fire|dragon|flame/.test(d)) return 'fire';
  if (/armband|ring|gold|coin/.test(d)) return 'gold';
  return 'orb';
}
const nameHas = (m, re) => re.test((m.name + ' ' + m.desc).toLowerCase());

// swoosh shapes per fx kind: [startAngle, endAngle, radiusScale, widthFraction, dyOffset]
export const SWING = {
  slash: [75, -65, 0.75, 0.5, 0.1], slashUp: [-60, 75, 0.75, 0.5, 0], upper: [-20, 115, 0.7, 0.55, 0], smash: [110, -60, 0.9, 0.6, 0.2],
  thrust: [-9, 9, 1.0, 0.22, 0], sweep: [-40, 35, 0.85, 0.4, -0.45], spin: [0, 0, 0.8, 0.45, 0], jab: [20, -12, 0.7, 0.35, 0.1], burst: [0, 0, 0, 0, 0],
};

export function buildMove(f, slot, isPower) {
  const m = f.moves[slot] || { name: slot, desc: '', type: 'melee' };
  let type = m.type; const base = { slot, name: m.name, desc: m.desc, type, power: isPower, events: [], dur: 0.5, anim: 'melee', color: fxColor(f, m) };
  const main = slot === 'main', c1 = slot === 'combo1', c2 = slot === 'combo2', pw = slot === 'power';
  const kind = pw ? 'power' : c2 ? 'c2' : c1 ? 'c1' : 'main';
  const D = (dur, anim, events) => ({ ...base, dur, anim, events });
  switch (type) {
    case 'melee': default:
      return { main: D(0.45, 'melee', [H(0.15, 2.1, 7, 8, 38, 'slash')]),
        c1: D(0.85, 'multi', [H(0.14, 2.0, 5, 3, 28, 'slash'), H(0.32, 2.0, 5, 3, 28, 'slashUp'), H(0.52, 2.2, 8, 11, 72, 'upper', { lunge: 3, rise: 3, fin: 1 })]),
        c2: D(1.2, 'multi', [H(0.1, 2.4, 5, 3, 20, 'thrust', { lunge: 10 }), H(0.3, 2.1, 6, 3.5, 20, 'smash'), H(0.5, 2.2, 5, 4, 25, 'sweep'), H(0.78, 2.5, 10, 12, 48, 'smash', { lunge: 5, fin: 1 })]),
        power: D(1.65, 'multi', [V(0, 'zoom'), H(0.22, 2.4, 5, 3, 25, 'slash'), H(0.36, 2.4, 5, 3, 25, 'slashUp'), H(0.5, 2.4, 5, 3, 20, 'slash'), H(0.64, 2.8, 6, 4, 20, 'thrust', { lunge: 9 }), H(0.86, 2.4, 6, 5, 80, 'upper', { rise: 5 }), H(1.15, 3.2, 14, 16, 45, 'smash', { fin: 1, big: 1, lunge: 3 })]) }[kind];
    case 'multi': {
      const flurry = (n, t0, gap, fin) => Array.from({ length: n }, (_, i) => H(t0 + i * gap, 1.9, i === n - 1 ? 8 : 3 + (i % 2), i === n - 1 ? 11 : 2.2, i === n - 1 ? 50 : 22, i === n - 1 ? 'upper' : (i % 2 ? 'jab' : 'slashUp'), { lunge: 2, fin: i === n - 1 ? 1 : 0, rise: i === n - 1 ? 3 : 0 }));
      return { main: D(0.55, 'multi', [H(0.13, 1.9, 4, 2.5, 25, 'slash'), H(0.3, 1.9, 5, 5.5, 30, 'slashUp')]),
        c1: D(0.95, 'multi', flurry(4, 0.12, 0.15)), c2: D(1.25, 'multi', [LU(0.05, 6, 0.4), ...flurry(6, 0.1, 0.13)]),
        power: D(1.75, 'multi', [V(0, 'zoom'), LU(0.1, 5, 0.7), ...flurry(8, 0.2, 0.11), H(1.3, 3, 14, 16, 45, 'smash', { fin: 1, big: 1 })]) }[kind]; }
    case 'spin': {
      const sp = (t, r, d, kb, fin) => H(t, r, d, kb, 55, 'spin', { arc: 'all', fin: fin ? 1 : 0, lunge: 3 });
      return { main: D(0.6, 'spin', [sp(0.2, 2.5, 8, 8)]), c1: D(0.8, 'spin', [sp(0.18, 2.5, 5, 4), sp(0.42, 2.7, 8, 11, 1)]),
        c2: D(1.0, 'spin', [LU(0.05, 5, 0.7), sp(0.18, 2.5, 4, 3), sp(0.4, 2.6, 5, 4), sp(0.65, 2.9, 8, 12, 1)]),
        power: D(1.5, 'spin', [V(0, 'zoom'), LU(0.1, 6, 1.0), sp(0.22, 2.7, 4, 3), sp(0.42, 2.8, 4, 3), sp(0.62, 2.9, 5, 4), sp(0.82, 3.0, 6, 5), H(1.1, 3.6, 14, 17, 50, 'spin', { arc: 'all', fin: 1, big: 1 })]) }[kind]; }
    case 'dash': {
      const dh = (t, d = 4, kb = 3, ang = 25, fin = 0) => H(t, 1.9, d, kb, ang, 'thrust', { fin });
      return { main: D(0.55, 'dash', [LU(0.05, 16, 0.32), dh(0.1), dh(0.2), dh(0.3, 6, 9, 35, 1)]),
        c1: D(0.8, 'dash', [LU(0.05, 16, 0.32), dh(0.1), dh(0.2), dh(0.3, 4, 4, 25), H(0.55, 2.4, 9, 12, 55, 'smash', { fin: 1 })]),
        c2: D(1.1, 'dash', [LU(0.05, 15, 0.3), dh(0.1), dh(0.2), LU(0.45, 15, 0.3), dh(0.5), dh(0.6), H(0.82, 2.6, 10, 13, 45, 'smash', { fin: 1 })]),
        power: D(1.5, 'dash', [V(0, 'zoom'), LU(0.1, 22, 0.8), dh(0.15, 4, 3), dh(0.28, 4, 3), dh(0.4, 4, 3), dh(0.52, 4, 3), dh(0.64, 5, 4), H(1.0, 3.2, 14, 17, 45, 'smash', { fin: 1, big: 1 })]) }[kind]; }
    case 'aoe': {
      return { main: D(0.7, 'cast', [PU(0.3, 3.4, 7, 9, 45)]), c1: D(0.85, 'cast', [PU(0.25, 3.0, 6, 5, 40), PU(0.5, 4.0, 8, 11, 50, { fin: 1 })]),
        c2: D(1.1, 'cast', [PU(0.25, 3.0, 5, 4, 40), PU(0.45, 4.2, 6, 5, 45), PU(0.7, 5.4, 9, 12, 50, { fin: 1 })]),
        power: D(1.4, 'cast', [V(0, 'zoom'), PU(0.35, 4.0, 5, 4, 45), PU(0.6, 5.6, 7, 6, 45), PU(0.85, 7.4, 14, 17, 50, { fin: 1, big: 1, stun: nameHas(m, /stun|horn|roar|slows|sleepy|howl/) ? 0.9 : 0 })]) }[kind]; }
    case 'projectile': {
      const st = projStyle(f, m);
      return { main: D(0.5, 'projectile', [PR(0.22, 1, 9, 5, { style: st })]), c1: D(0.85, 'projectile', [PR(0.2, 1, 6, 3.5, { style: st }), PR(0.38, 1, 6, 3.5, { style: st }), PR(0.56, 1, 9, 8, { style: st })]),
        c2: D(1.0, 'projectile', [PR(0.25, 5, 5, 3.5, { style: st, spread: 11 }), PR(0.55, 3, 7, 6, { style: st, spread: 7 })]),
        power: D(1.55, 'projectile', [V(0, 'zoom'), PR(0.3, 7, 5, 4, { style: st, spread: 9 }), PR(0.6, 7, 5, 4, { style: st, spread: 9 }), PR(0.9, 9, 6, 7, { style: st, spread: 8, big: 1 })]) }[kind]; }
    case 'stun':
      return { main: D(0.55, 'projectile', [{ k: 'beam', t: 0.3, range: 9, time: 1.2, dmg: 5 }]), c1: D(0.55, 'projectile', [{ k: 'beam', t: 0.3, range: 9, time: 1.3, dmg: 5 }]), c2: D(0.7, 'projectile', [{ k: 'beam', t: 0.35, range: 11, time: 1.8, dmg: 6 }]),
        power: D(1.1, 'cast', [V(0, 'zoom'), { k: 'beam', t: 0.4, range: 14, time: 2.8, dmg: 8, all: 1, big: 1 }]) }[kind];
    case 'heal':
      return { main: D(0.7, 'cast', [{ k: 'heal', t: 0.35, amt: 18 }]), c1: D(0.7, 'cast', [{ k: 'heal', t: 0.35, amt: 18 }]), c2: D(0.7, 'cast', [{ k: 'heal', t: 0.35, amt: 18 }]),
        power: D(1.0, 'cast', [V(0, 'zoom'), { k: 'heal', t: 0.4, amt: 40 }, PU(0.45, 4.2, 4, 9, 50, { fin: 1, big: 1, color: 0x9affb0 })]) }[kind];
    case 'breath':
      return { main: D(0.9, 'breath', [{ k: 'stream', t: 0.15, dur: 0.6, range: 5, dps: 16 }]), c1: D(0.9, 'breath', [{ k: 'stream', t: 0.15, dur: 0.6, range: 5, dps: 16 }]), c2: D(1.1, 'breath', [{ k: 'stream', t: 0.15, dur: 0.8, range: 5.5, dps: 20 }]),
        power: D(1.5, 'breath', [V(0, 'zoom'), { k: 'stream', t: 0.2, dur: 1.1, range: 7.5, dps: 38, big: 1 }]) }[kind];
    case 'leap': // flying attack (J in the air, or U): hop forward, then dive
      return { ...base, dur: 1.6, anim: 'leap', leap: true, events: [] };
  }
}
