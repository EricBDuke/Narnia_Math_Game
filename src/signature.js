// SIGNATURE MOVES: one per fighter (all 70). A meter charges as a fighter lands hits, chains combos, takes damage, blocks and dodges; when full the move
// (key P / the SIGNATURE touch button) plays a short cinematic (everyone else freezes ~1 s, zoom on the user, name banner, big effect + sound) and then the strike.
// While it runs the user has super armor + invulnerability, its hits ignore blocking and always interrupt, and nothing (not even a power move) can stop it.
// Each def: [name, kind (timeline shape), motif (effect look), colour, second colour, sound flavour, one-line description, extras]
//   kinds: charge | nova | beam | volley | slam | whirl | rush | dive | storm        motifs: roar | frost | blades | quake | volley | wind | fire | star | nature | shadow | sea
import { sfx } from './audio.js';
import { SA, spriteFx, windSprite, spriteFor } from './sigart.js';

const G = 0xffd45a, W = 0xffffff;
export const SIG = {
  // ---- The Magician's Nephew
  'queen-helen': ['Blessing of the New Land', 'nova', 'star', 0xffe27a, 0xfff6c8, 'chime', 'A golden blessing rolls outward from the Queen of Narnia'],
  'aunt-letty': ['Mind Your Manners', 'nova', 'wind', 0xd8b8ff, W, 'echo', 'A sharp word that sends everyone staggering back'],
  'digory-kirke': ['Silver Apple of Narnia', 'storm', 'nature', 0xe8f0ff, 0x9affb0, 'chime', 'Apple-light floods the arena'],
  'polly-plummer': ['Pool Between the Worlds', 'nova', 'sea', 0x7affc8, W, 'splash', 'A green-gold ripple expands from her feet'],
  'king-frank-the-cabby': ['Crowned in Narnia', 'charge', 'roar', G, 0xffe9a8, 'horn', 'A kingly charge, crown shining'],
  'fledge': ['Flight over the New Land', 'dive', 'wind', 0xbfe8ff, W, 'bird', 'A soaring winged dive through every foe'],
  'uncle-andrew': ["Magician's Dust", 'storm', 'shadow', 0xc890ff, 0xffe27a, 'echo', 'A burst of strange dust that bowls everyone over'],
  'the-bulldog': ['Bulldog Bravado', 'rush', 'quake', 0xffb070, 0xffe0c0, 'growl', 'A fearless, snapping rush', { pitch: 1.0 }],
  'the-elephant': ['Trumpet and Trample', 'slam', 'quake', 0xc8b8a0, 0xffe0b0, 'trumpet', 'A mighty leap and earth-shaking stomp'],
  'the-bear': ["Bear's Avalanche", 'rush', 'quake', 0xd0a070, 0xfff0d0, 'growl', 'A roaring rush that tumbles all in its path', { pitch: 0.7 }],
  // ---- The Lion, the Witch and the Wardrobe
  'peter': ["High King's Charge", 'charge', 'roar', G, 0xfff2c0, 'lion', 'A golden lion-roar shockwave behind a sword charge'],
  'susan': ['Arrows of the Gentle Queen', 'volley', 'volley', 0xffe090, W, 'bow', 'A great fan of arrows from the sky', { style: 'arrow' }],
  'edmund': ['Verdict of the Just', 'whirl', 'blades', 0xcfe6ff, W, 'steel', 'A whirl of silver cuts, then the final blow'],
  'lucy': ['Cordial of the Valiant Queen', 'nova', 'star', 0xff9a8a, 0xffe27a, 'chime', 'Fire-flower light heals her and blasts foes away', { heal: 40 }],
  'the-witch-s-dwarf': ['Winter Sledge Run', 'charge', 'frost', 0xbfe8ff, W, 'freeze', 'A runaway sledge of ice through every foe'],
  'the-white-witch': ['Eternal Winter', 'beam', 'frost', 0x9fe8ff, W, 'freeze', 'A freezing blast that holds every foe in the cold'],
  'mr-beaver': ["Beaver's Dam Burst", 'nova', 'sea', 0x7ac0ff, W, 'splash', 'The dam breaks in a rush of water'],
  'mr-tumnus': ['Lantern Waste Lullaby', 'nova', 'star', 0xffd890, 0x9fe8ff, 'chime', 'A glowing pipe tune that pushes foes away'],
  'maugrim': ['Hunt of Fenris Ulf', 'rush', 'shadow', 0xaab4d0, W, 'howl', 'A howling wolf-pack rush', { pitch: 1.1 }],
  'giant-rumblebuffin': ["Giant's Thunder-Step", 'slam', 'quake', 0xc8a878, 0xfff0d0, 'boom', 'A giant leap and a ground-splitting stomp'],
  // ---- The Horse and His Boy
  'shasta-prince-cor': ['Run to Archenland', 'charge', 'wind', 0xffe8a0, W, 'drum', 'A desperate run that nothing can slow'],
  'aravis': ['Dagger of the Tarkheena', 'whirl', 'blades', 0xffd0a0, W, 'steel', 'A spinning dagger dance'],
  'bree': ["Warhorse's Charge", 'charge', 'wind', 0xd8b890, W, 'whinny', 'A thundering Narnian warhorse charge', { pitch: 0.9 }],
  'hwin': ['Mare of Courage', 'charge', 'wind', 0xffd8e0, W, 'whinny', 'A swift gallop of quiet courage', { pitch: 1.15 }],
  'prince-corin-thunder-fist': ['Thunder-Fist Fury', 'rush', 'blades', 0xffa050, 0xfff0c0, 'punch', 'A storm of punches ending in a thunderclap'],
  'king-lune': ['Archenland Sally', 'charge', 'roar', G, W, 'horn', 'The King of Archenland sallies out to charge'],
  'prince-rabadash': ["Scimitars of Tisroc's Heir", 'whirl', 'fire', 0xff7a40, 0xffe0a0, 'steel', 'A blazing scimitar whirlwind'],
  'lord-peridan': ['Gale of Splendour Hyaline', 'storm', 'wind', 0x9fe0ff, W, 'wind', 'A sea gale rolls over the arena'],
  'anradin-tarkaan': ["Tarkaan's Sandstorm", 'whirl', 'wind', 0xe8c070, 0xfff0c8, 'wind', 'A whirling desert storm of blades'],
  'lord-darrin': ['Archenland Standard Charge', 'charge', 'roar', 0xff9a70, 0xffe9c8, 'horn', 'A charge under the lords\' banner'],
  // ---- Prince Caspian
  'prince-caspian': ['Rightful King of Narnia', 'charge', 'roar', 0x7ab8ff, 0xfff2c0, 'horn', 'The old horn sounds and the king charges'],
  'lord-glozelle': ["Marshal's Onslaught", 'rush', 'shadow', 0xff6a6a, 0xffd0d0, 'steel', 'A relentless Telmarine onslaught'],
  'lord-sopespian': ['Spear from the Shadows', 'charge', 'shadow', 0xc890ff, W, 'echo', 'A lunge out of the dark'],
  'trumpkin': ["Red Dwarf's Volley", 'volley', 'volley', 0xff9a60, 0xffe0b0, 'bow', 'A dwarf-archer\'s volley', { style: 'arrow' }],
  'pattertwig': ['Chatter of Pattertwig', 'volley', 'nature', 0xc89050, 0xffe0a0, 'squeak', 'A squirrel\'s storm of acorns', { style: 'rock' }],
  'trufflehunter': ["Badger's Loyal Stand", 'rush', 'quake', 0xd8d8d8, 0xffffff, 'growl', 'An old badger\'s fierce stand', { pitch: 0.9 }],
  'glenstorm': ['Starlit Centaur Charge', 'charge', 'star', 0xb0c8ff, W, 'drum', 'A centaur charge beneath the stars'],
  'king-miraz': ["Usurper's Fury", 'whirl', 'fire', 0xff5050, 0xffd0a0, 'steel', 'A furious spinning slash'],
  'wimbleweather': ['The Giant Awakens', 'slam', 'quake', 0xb0d890, 0xfff0d0, 'boom', 'A giant stirs and the ground splits'],
  'nikabrik': ["Black Dwarf's Axe Storm", 'whirl', 'blades', 0xa8a8b8, W, 'steel', 'A tornado of axe-swings'],
  // ---- The Voyage of the Dawn Treader
  'coriakin': ['Great Spell of the Island', 'storm', 'star', G, 0xff9aff, 'chime', 'A grand spell of light'],
  'lord-rhoop': ['Light from the Dark Island', 'nova', 'star', W, 0x9fe8ff, 'chime', 'A burst of light that drives back the dark'],
  'chief-duffer': ['Great Hop of the Dufflepuds', 'slam', 'quake', 0xffc060, 0xfff0c8, 'boing', 'One enormous hop, one enormous landing'],
  'eustace': ["Dragon's Flame", 'nova', 'fire', 0xff7a30, 0xffe0a0, 'fire', 'A roaring fire-burst'],
  'reepicheep': ['Honour of the Mice', 'rush', 'blades', G, W, 'squeak', 'A lightning rapier dash, a hundred hits of honour'],
  'captain-drinian': ["Dawn Treader's Gale", 'storm', 'wind', 0x9fe0ff, W, 'wind', 'A great wind fills the sails and the arena'],
  'rynelf': ['Oar of the Dawn Treader', 'whirl', 'sea', 0x7ac0ff, W, 'splash', 'A sweeping oar-whirl with a sea spray'],
  'lord-bern': ['Shield of the Seven Lords', 'nova', 'blades', 0xcfe6ff, W, 'steel', 'A ringing shield-burst'],
  'pug': ['Net of the Lone Islands', 'beam', 'nature', 0xe8d8a0, W, 'rope', 'A great net that holds every foe'],
  'ramandu': ['Rising of the Star', 'storm', 'star', 0xfff0b0, 0xb0c8ff, 'chime', 'An old star rises over the arena'],
  // ---- The Silver Chair
  'jill-pole': ['Signs Remembered', 'storm', 'star', G, W, 'chime', 'Four glowing signs light the whole arena'],
  'king-of-harfang': ['Harfang Great Hunt', 'charge', 'frost', 0xbfe8ff, W, 'boom', 'A giant\'s hunting charge'],
  'puddleglum': ['Stamp on the Green Fire', 'slam', 'nature', 0x8aff8a, 0xfff0c8, 'boom', 'A brave stamp that breaks the spell'],
  'prince-rilian': ['Silver Chair Broken', 'nova', 'blades', 0xcfe6ff, G, 'steel', 'The enchantment shatters in a silver blast'],
  'lady-of-the-green-kirtle': ['Great Green Serpent', 'beam', 'nature', 0x50ff80, 0xd0ffd8, 'hiss', 'A coiling green blast that binds all foes'],
  'glimfeather': ['Parliament Takes Flight', 'dive', 'wind', 0xe8e0c0, W, 'hoot', 'An owl dive through every foe'],
  'golg': ['Hot Breath of Bism', 'nova', 'fire', 0xff5a30, 0xffd080, 'fire', 'Fire from the deep rushes up'],
  'warden-of-the-marches-of-underland': ['March of the Earthmen', 'charge', 'quake', 0xc8a878, 0xfff0d0, 'drum', 'A marching charge from below'],
  'queen-of-harfang': ['Harfang Autumn Feast', 'storm', 'fire', 0xff9a50, 0xffe0a0, 'chime', 'A feast-storm of autumn light'],
  'ettinsmoor-giant': ['Ettinsmoor Boulder Storm', 'volley', 'quake', 0xb0a090, 0xfff0d0, 'boom', 'A rain of great boulders', { style: 'rock' }],
  // ---- The Last Battle
  'king-tirian': ['Narnia\'s Last King Rides', 'nova', 'roar', G, W, 'horn', 'Light of the old kings blazes outward'],
  'jewel': ['Unicorn\'s Shining Charge', 'charge', 'star', W, 0xd0f0ff, 'whinny', 'A shining-horn charge', { pitch: 1.1 }],
  'puzzle': ["Puzzle's Loyal Charge", 'charge', 'nature', 0xd8c8a0, 0xfff0d0, 'bray', 'A loyal, stubborn charge'],
  'griffle': ['Dwarf Arrow Storm', 'volley', 'volley', 0xff9a70, 0xffe0c0, 'bow', 'Arrows for the Dwarfs, arrows for all', { style: 'arrow' }],
  'poggin': ["Poggin's Faithful Charge", 'charge', 'roar', 0xffd8a0, W, 'horn', 'A faithful, furious charge'],
  'farsight': ["Eagle's Thunder Dive", 'dive', 'wind', 0xffe090, W, 'bird', 'A lightning dive from the high sky'],
  'roonwit': ['Message of the Stars', 'volley', 'star', 0xb0c8ff, W, 'bow', 'Star-arrows rain from the sky', { style: 'arrow' }],
  'emeth': ["True Heart's Blow", 'whirl', 'star', 0xffe27a, W, 'steel', 'A golden whirl of an honest heart'],
  'rishda-tarkaan': ['Calormene Legion March', 'charge', 'fire', 0xff8a30, 0xffe0a0, 'drum', 'The legion marches through'],
  'shift': ['Tashlan, Tashlan!', 'nova', 'shadow', 0xc890ff, 0xffe27a, 'echo', 'A booming false roar from the dark'],
};
export const SIG_IDS = Object.keys(SIG);
export const sigDef = (id) => { const a = SIG[id]; return a && { name: a[0], kind: a[1], motif: a[2], c: a[3], c2: a[4], snd: a[5], desc: a[6], ...(a[7] || {}) }; };

// give every fighter a cfg.moves.signature so move lists (corner list, Tab list, select screen) read it like any other slot
export function attachSignatures(fighters) {
  for (const f of fighters) { const d = sigDef(f.id); if (!d) continue; f.moves.signature = { name: d.name, desc: d.desc + '. Unstoppable once charged.', type: 'signature' }; f.sig = d; }
}

// ---- timeline for the strike (after the cinematic) ----
const H = (t, range, dmg, kb, ang, fx, o = {}) => ({ k: 'hit', t, range, dmg, kb, ang, fx, sig: 1, pierce: 1, ...o });
const PU = (t, r, dmg, kb, ang, o = {}) => ({ k: 'pulse', t, r, dmg, kb, ang, sig: 1, pierce: 1, ...o });
const PR = (t, n, dmg, kb, o = {}) => ({ k: 'proj', t, n, dmg, kb, sig: 1, ...o });
const LU = (t, vx, dur) => ({ k: 'lunge', t, vx, dur });
const FIN = { fin: 1, big: 1 };
export function sigMove(d) {
  const ev = []; let dur = 1, anim = 'melee';
  switch (d.kind) {
    case 'charge': ev.push(LU(0, 26, 0.5), H(0.06, 3.2, 6, 1.5, 30, 'thrust'), H(0.16, 3.2, 6, 1.5, 30, 'thrust'), H(0.26, 3.2, 6, 1.5, 30, 'thrust'), H(0.36, 3.4, 7, 2, 35, 'thrust'), H(0.52, 4.6, 16, 27, 42, 'smash', FIN)); dur = 0.9; break;
    case 'nova': ev.push(PU(0.05, 4.5, 8, 9, 45), PU(0.28, 7, 10, 14, 50), PU(0.5, 9.5, 18, 28, 50, FIN)); if (d.heal) ev.push({ k: 'heal', t: 0.1, amt: d.heal }); dur = 1.0; anim = 'cast'; break;
    case 'beam': ev.push({ k: 'beam', t: 0.1, range: 17, time: 2.4, dmg: 12, all: 1, big: 1, sig: 1 }, PU(0.42, 6.5, 8, 24, 50, FIN)); dur = 0.9; anim = 'cast'; break;
    case 'volley': ev.push(PR(0.08, 9, 6, 8, { style: d.style || 'orb', spread: 9, big: 1 }), PR(0.28, 9, 6, 9, { style: d.style || 'orb', spread: 9, big: 1 }), PR(0.48, 11, 7, 12, { style: d.style || 'orb', spread: 7, big: 1 }), PU(0.6, 4.5, 10, 25, 50, FIN)); dur = 1.0; anim = 'projectile'; break;
    case 'slam': ev.push(H(0.02, 2.6, 6, 5, 80, 'upper', { rise: 3 }), { k: 'drop', t: 0.36 }, PU(0.58, 5, 10, 14, 55), PU(0.66, 9.5, 18, 28, 55, FIN)); dur = 1.0; break;
    case 'whirl': { ev.push(LU(0, 9, 0.7)); [0.1, 0.24, 0.38, 0.52, 0.66].forEach(t => ev.push(H(t, 3.6, 5, 2, 50, 'spin', { arc: 'all' }))); ev.push(H(0.82, 4.8, 16, 27, 50, 'spin', { arc: 'all', ...FIN })); dur = 1.15; anim = 'spin'; break; }
    case 'rush': { ev.push(LU(0, 22, 0.6)); for (let i = 0; i < 8; i++) ev.push(H(0.06 + i * 0.07, 3.2, 3.5, 1.2, 25, 'jab')); ev.push(H(0.7, 4.6, 16, 27, 42, 'smash', FIN)); dur = 1.0; anim = 'dash'; break; }
    case 'dive': ev.push(H(0, 3, 8, 1.5, 60, 'upper', { rise: 4 }), LU(0.28, 26, 0.4), H(0.32, 3.6, 9, 1.5, 30, 'thrust'), H(0.41, 3.6, 9, 1.5, 30, 'thrust'), H(0.5, 3.6, 9, 1.5, 30, 'thrust'), PU(0.54, 5, 8, 2, 40), PU(0.66, 6.5, 24, 28, 40, FIN)); dur = 1.0; break;
    case 'storm': default: ev.push(PU(0.08, 11, 10, 18, 50, FIN), PU(0.45, 12, 10, 26, 55, FIN)); if (d.heal) ev.push({ k: 'heal', t: 0.1, amt: d.heal }); dur = 0.95; anim = 'cast'; break;
  }
  return { slot: 'signature', name: d.name, desc: d.desc, type: 'signature', power: true, sig: true, events: ev, dur, anim, color: d.c };
}

// ---- effects ----
const rnd = (a, b) => a + Math.random() * (b - a);
// per-frame while the cinematic winds up: p = 0..1 (light gathers, motif-flavoured)
export function windupFx(world, f, d, p, dt) {
  const fx = world.fx, x = f.pos.x, y = f.pos.y, cy = f.center, z = f.pos.z;
  if (!f.sigWS && SA.ready) { f.sigWS = windSprite(fx, f, spriteFor(d.motif), { color: d.c, size: 8.5, spin: 1.1, opacity: 0.8 }); f.sigWS2 = windSprite(fx, f, 'star', { color: d.c2, size: 5.5, spin: -2.2, opacity: 0.7 }); }
  if (Math.random() < dt * 40) fx.embers(x, y + 0.2, z, 2, Math.random() < 0.5 ? d.c : d.c2, f.radius * 2.4);
  if (Math.random() < dt * 14) { const a = rnd(0, 6.28), r = 2.8 * (1 - p) + 0.6; fx.spark(x + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9, z, 1, d.c2, 0.5, 0.24, 0.35, 0); }
  if (Math.random() < dt * 4) fx.groundRing(x, y, z, 1.2 + 4 * p, d.c, 0.35);
  if (Math.random() < dt * 5) fx.glow(x, cy, z, 3 + 5 * p, d.c, 0.3);
  if (d.motif === 'frost' && Math.random() < dt * 12) fx.spark(x + rnd(-2, 2), y + rnd(0, 3), z, 1, 0xffffff, 0.6, 0.2, 0.6, -1);
  if (d.motif === 'fire' && Math.random() < dt * 18) fx.embers(x + rnd(-1, 1), y, z, 2, 0xff8030, 1.6);
  if (d.motif === 'wind' && Math.random() < dt * 6) fx.swoosh(x, cy, z, f.face, 1.5 + 2 * p, 0, 0, d.c2, 0.3, 0.3, true);
}
// the big effect at the start of the strike: every motif has its own shape, built from the colours and the sound flavour of that fighter
export function burstFx(world, f, d) {
  const fx = world.fx, x = f.pos.x, y = f.pos.y, cy = f.center, z = f.pos.z, fc = f.face, c = d.c, c2 = d.c2;
  for (const k of ['sigWS', 'sigWS2']) if (f[k]) { f[k].fadeOut = 1; f[k] = null; }
  if (SA.ready) { // painted effect sprites: the main motif big behind and in front, a star flash, and a ground burst for the heavy kinds
    const sp = spriteFor(d.motif);
    spriteFx(fx, sp, x, cy, z, { size: 7, grow: 1.4, s0: 0.3, spin: 1.2, life: 0.9, color: c, k: 0.3 });
    spriteFx(fx, sp, x + fc * 5, cy, z, { size: 4.5, grow: 1.5, s0: 0.3, spin: -1.1, life: 0.75, color: c2, k: 0.3, delay: 0.1 });
    spriteFx(fx, 'star', x, cy, z, { size: 7, grow: 1.15, s0: 0.2, spin: 0.5, life: 0.35, color: c2, k: 0.4, opacity: 0.6 });
    if (d.kind === 'slam' || d.motif === 'quake') spriteFx(fx, 'earth', x + fc * 2, y + 1.6, z, { size: 5.5, grow: 1.3, s0: 0.5, spin: 0, life: 0.9, color: c, k: 0.15, delay: 0.2 });
    if (d.kind === 'volley') for (let i = 0; i < 4; i++) spriteFx(fx, 'blades', x + fc * (3 + i * 3), y + 2, z, { size: 8, grow: 1.4, s0: 0.4, life: 0.6, color: i % 2 ? c : c2, delay: 0.1 + i * 0.1 });
  }
  fx.flash(x, cy, z, 9, W, 0.35); fx.flash(x, cy, z, 6, c, 0.45); fx.flash(x, cy, z, 9, c2, 0.15); fx.glow(x, cy, z, 9, c, 0.6); fx.shock(x, cy, z, 8, c, 0.55); fx.groundRing(x, y, z, 12, c2, 0.7);
  const rays = (n, len, w, col) => { for (let i = 0; i < n; i++) { const a = i / n * 6.283 + rnd(-0.1, 0.1); fx.beam(x, cy, x + Math.cos(a) * len, cy + Math.sin(a) * len, z, col, w, 0.4); } };
  switch (d.motif) {
    case 'roar': fx.shock(x, cy, z, 13, c2, 0.7); fx.shock(x, cy, z, 18, c, 0.9); rays(12, 10, 0.5, c); fx.dustPuff(x, y, z, 14, 0xe8d8b0, 1.2); break;
    case 'frost': rays(16, 11, 0.32, c2); fx.spark(x, cy, z, 50, c2, 11, 0.24, 0.9, 2); fx.shock(x, cy, z, 15, 0xffffff, 0.8); fx.groundRing(x, y, z, 18, c, 1.0); break;
    case 'blades': for (let i = 0; i < 4; i++) fx.swoosh(x, cy, z, fc, 2.6 + i * 0.9, 0, 0, i % 2 ? c2 : c, 0.5, 0.7, true); fx.spark(x, cy, z, 40, W, 13, 0.18, 0.5, 4); rays(8, 7, 0.22, W); break;
    case 'quake': fx.dustPuff(x, y, z, 26, 0xc8b898, 1.6); fx.groundRing(x, y, z, 7, c, 0.5); fx.groundRing(x, y, z, 13, c2, 0.8); fx.groundRing(x, y, z, 19, c, 1.1); fx.spark(x, y + 0.3, z, 40, c, 12, 0.3, 0.9, 16); break;
    case 'volley': for (let i = 0; i < 14; i++) { const bx = x + fc * (1.5 + i * 1.0) + rnd(-0.4, 0.4); fx.beam(bx - fc * 1.2, y + 12, bx, y + 0.2, z, i % 2 ? c : c2, 0.22, 0.5); fx.spark(bx, y + 0.3, z, 3, c, 5, 0.2, 0.4, 8); } break;
    case 'wind': for (let i = 0; i < 5; i++) fx.swoosh(x, cy, z, fc, 2 + i * 1.3, 0, 0, i % 2 ? c2 : c, 0.7, 0.45, true); fx.spark(x, cy, z, 36, c2, 12, 0.18, 0.7, 0); fx.dustPuff(x, y, z, 10, 0xe8e8e8, 1.2); break;
    case 'fire': fx.embers(x, y, z, 80, 0xff8a30, 5); fx.spark(x, cy, z, 50, c, 13, 0.3, 0.8, 4); for (let i = -4; i <= 4; i++) fx.beam(x + i * 1.1, y, x + i * 1.1 + rnd(-0.3, 0.3), y + rnd(3, 7), z, i % 2 ? c : c2, 0.6, 0.6); break;
    case 'star': rays(20, 12, 0.18, W); rays(10, 8, 0.4, c); fx.embers(x, cy, z, 50, c, 5); fx.flash(x, cy + 1, z, 12, c2, 0.5); break;
    case 'nature': fx.spark(x, y + 0.3, z, 60, c, 8, 0.28, 1.0, -3); fx.groundRing(x, y, z, 10, c2, 0.9); for (let i = 0; i < 10; i++) fx.beam(x + rnd(-6, 6), y, x + rnd(-6, 6), y + rnd(2, 6), z, c, 0.3, 0.7); break;
    case 'shadow': fx.shock(x, cy, z, 16, c, 0.8); fx.shock(x, cy, z, 10, 0x201030, 0.6); rays(14, 9, 0.35, c2); fx.spark(x, cy, z, 40, c, 9, 0.28, 0.9, -2); break;
    case 'sea': fx.groundRing(x, y, z, 8, W, 0.5); fx.groundRing(x, y, z, 15, c, 0.9); fx.spark(x, y + 0.3, z, 60, c2, 11, 0.25, 0.8, 14); for (let i = 0; i < 3; i++) fx.swoosh(x, y + 0.6, z, fc, 3 + i * 1.5, 40, 140, c, 0.6, 0.5, true); break;
    default: rays(10, 8, 0.4, c);
  }
}
export const sigSound = (d, phase) => sfx.sig(d.snd, phase, d.pitch || 1);
