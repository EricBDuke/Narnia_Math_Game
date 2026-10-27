// One-time generator: roster-raw.json (from the Roster Page) + LOOKS table -> src/fighters.js
// After generation, src/fighters.js is the hand-editable source of truth.
const fs = require('fs');
const raw = require('./roster-raw.json');
const BOOK_FOLDERS = { mn: "01 The Magician's Nephew", lww: "02 The Lion, the Witch and the Wardrobe", hhb: "03 The Horse and His Boy", pc: "04 Prince Caspian", vdt: "05 The Voyage of the Dawn Treader", sc: "06 The Silver Chair", lb: "07 The Last Battle" };
// name: [body, variant, scale, primary, secondary, skinOrFur, hair, weapon, sex]
const SK = '#f1c9a5', TAN = '#c8946a', DARK = '#9a6a44';
const LOOKS = {
  'Queen Helen': ['biped','',1,'#7a9e7e','#f2e6c9',SK,'#6b3e26','none','f'],
  'Aunt Letty': ['biped','',1,'#4b4b6b','#dddddd',SK,'#9a9a9a','none','f'],
  'Digory Kirke': ['biped','child',0.82,'#5a6e8c','#c9b28a',SK,'#5a3a1e','hammer','m'],
  'Polly Plummer': ['biped','child',0.8,'#b5485d','#f4e3c1',SK,'#c9a25a','none','f'],
  'King Frank (the Cabby)': ['biped','crown',1.05,'#3b4a3a','#c9a227',SK,'#3a2a1a','whip','m'],
  'Fledge': ['quadruped','horse-winged',1,'#a0522d','#5a2d0c','#a0522d','#f3eee0','none','m'],
  'Uncle Andrew': ['biped','thin',1,'#5c4033','#e8e0c8',SK,'#d8d8d8','cane','m'],
  'The Bulldog': ['quadruped','dog',0.6,'#c8a27a','#f0e0c8','#c8a27a','#3a2a1a','none','m'],
  'The Elephant': ['quadruped','elephant',1.5,'#8d8d8d','#bdbdbd','#8d8d8d','#eeeeee','none','m'],
  'The Bear': ['quadruped','bear',1.1,'#6b4423','#8a5a33','#6b4423','#3a2412','none','m'],
  'Peter': ['biped','',1,'#c0392b','#d4ac0d',SK,'#c9a25a','swordshield','m'],
  'Susan': ['biped','',0.95,'#2e7d32','#e0c068',SK,'#3b2414','bow','f'],
  'Edmund': ['biped','',0.88,'#34495e','#b0bec5',SK,'#2b1a0e','sword','m'],
  'Lucy': ['biped','child',0.78,'#d35454','#f7e1a0',SK,'#b5651d','dagger','f'],
  "The Witch's Dwarf": ['biped','dwarf',0.68,'#4a3b2a','#aa3333',SK,'#222222','whip','m'],
  'The White Witch': ['biped','crown',1.12,'#e8f4fb','#7fc8ef','#f4f7fb','#1a1a1a','wand','f'],
  'Mr. Beaver': ['critter','beaver',0.6,'#7b4a2a','#a8754f','#7b4a2a','#4a2a14','none','m'],
  'Mr. Tumnus': ['biped','faun',0.95,'#8b5a2b','#c0392b',SK,'#3b2a1a','umbrella','m'],
  'Maugrim': ['quadruped','wolf',0.9,'#5f6a72','#8c969e','#5f6a72','#3a4248','none','m'],
  'Giant Rumblebuffin': ['biped','giant',1.9,'#6d5d3b','#8a7a55',SK,'#7a4a1a','club','m'],
  'Shasta (Prince Cor)': ['biped','child',0.85,'#c9a87a','#7a5a3a',TAN,'#e0c27a','swordshield','m'],
  'Aravis': ['biped','',0.95,'#7b2d5a','#e0b84a',DARK,'#1a1a1a','dagger','f'],
  'Bree': ['quadruped','horse',1.05,'#5a3a22','#1a1a1a','#5a3a22','#1a1a1a','none','m'],
  'Hwin': ['quadruped','horse',0.92,'#d8cfc0','#9a9080','#d8cfc0','#ffffff','none','f'],
  'Prince Corin Thunder-Fist': ['biped','child',0.86,'#8e2a2a','#d4a64a',SK,'#e0c27a','none','m'],
  'King Lune': ['biped','crown-beard',1.05,'#8a2d2d','#d4a64a',SK,'#b0b0b0','sword','m'],
  'Prince Rabadash': ['biped','turban',1.02,'#b03a2e','#f1c40f',DARK,'#111111','scimitar','m'],
  'Lord Peridan': ['biped','',1,'#2c5d8a','#c0c0c0',SK,'#6b4a2a','sword','m'],
  'Anradin Tarkaan': ['biped','turban-beard',1.02,'#6c3483','#f5cba7',DARK,'#b0281a','scimitar','m'],
  'Lord Darrin': ['biped','beard',1,'#5d6d2a','#c0c0c0',SK,'#5a3a1a','sword','m'],
  'Prince Caspian': ['biped','',1,'#1f3a93','#c9a227',SK,'#2b1a0e','sword','m'],
  'Lord Glozelle': ['biped','helmet',1.02,'#5b5b5b','#7b241c',SK,'#2a2a2a','sword','m'],
  'Lord Sopespian': ['biped','helmet',1,'#4a4a4a','#1f618d',SK,'#2a2a2a','spear','m'],
  'Trumpkin': ['biped','dwarf',0.68,'#8e3b2a','#4a6b2a',SK,'#c0461a','sword','m'],
  'Pattertwig': ['critter','squirrel',0.5,'#b5532a','#f0d0a0','#b5532a','#7a2a10','none','m'],
  'Trufflehunter': ['critter','badger',0.62,'#5a5a5a','#f0f0f0','#5a5a5a','#1a1a1a','none','m'],
  'Glenstorm': ['centaur','',1.15,'#6b4b2a','#c9a227',SK,'#c9a25a','sword','m'],
  'King Miraz': ['biped','crown-beard',1.08,'#3d3d3d','#7b1f1f',SK,'#222222','sword','m'],
  'Wimbleweather': ['biped','giant',1.8,'#5b6b3b','#8a6a3a',SK,'#4a3a1a','club','m'],
  'Nikabrik': ['biped','dwarf',0.66,'#2b2b2b','#5a3a1a',SK,'#111111','axe','m'],
  'Coriakin': ['biped','beard',1,'#2d3e8c','#f5e663',SK,'#e8e8e8','staff','m'],
  'Lord Rhoop': ['biped','beard',0.98,'#5a5a4a','#8a8a7a','#e0c8b0','#cfcfcf','sword','m'],
  'Chief Duffer': ['monopod','',0.75,'#c08a3a','#7a4a1a',SK,'#5a3a1a','none','m'],
  'Eustace': ['biped','child',0.86,'#7a8a99','#d4b26a',SK,'#d8b878','sword','m'],
  'Reepicheep': ['critter','mouse',0.5,'#8a7a6a','#c0392b','#8a7a6a','#c0392b','rapier','m'],
  'Captain Drinian': ['biped','beard',1.02,'#1a3a5a','#d4a64a',TAN,'#3a2a1a','sword','m'],
  'Rynelf': ['biped','',1.05,'#7a5a3a','#e0d0b0',TAN,'#4a2a1a','oar','m'],
  'Lord Bern': ['biped','beard',1,'#3a5a3a','#c0c0c0',SK,'#8a8a8a','swordshield','m'],
  'Pug': ['biped','fat',1,'#6b5a3a','#3a3a2a',TAN,'#2a2a2a','whip','m'],
  'Ramandu': ['biped','beard',1,'#f5f5f0','#c9d6ff','#f0e0d0','#ffffff','staff','m'],
  'Jill Pole': ['biped','child',0.8,'#4a6a8a','#c9a25a',SK,'#6b3a1a','none','f'],
  'King of Harfang': ['biped','giant-crown',1.85,'#8a3a3a','#d4a64a',SK,'#5a3a1a','none','m'],
  'Puddleglum': ['biped','marshwiggle',1.1,'#5a6b3a','#3a4a2a','#a6b07a','#3a4a2a','spear','m'],
  'Prince Rilian': ['biped','',1.02,'#1a1a1a','#c0c0c0',SK,'#d0b070','swordshield','m'],
  'Lady of the Green Kirtle': ['biped','crown',1.05,'#1e8a3a','#a0f0a0','#f2e4d8','#e0c060','none','f'],
  'Glimfeather': ['bird','owl',0.75,'#f0f0ea','#c8b890','#f0f0ea','#e0a020','none','m'],
  'Golg': ['biped','gnome',0.72,'#7a4a2a','#d4a020','#c89a7a','#3a2a1a','spear','m'],
  'Warden of the Marches of Underland': ['biped','gnome',0.78,'#3a3a4a','#8a8a6a','#b8a090','#2a2a2a','spear','m'],
  'Queen of Harfang': ['biped','giant-crown',1.8,'#8a3a7a','#d4a64a',SK,'#7a4a2a','fan','f'],
  'Ettinsmoor Giant': ['biped','giant',1.9,'#6a6a5a','#4a4a3a','#b8a890','#3a3a2a','club','m'],
  'King Tirian': ['biped','crown',1.02,'#2a4a8a','#d4a64a',SK,'#c9a25a','sword','m'],
  'Jewel': ['quadruped','unicorn',1,'#f8f8ff','#e0c060','#f8f8ff','#f0e8d0','none','m'],
  'Puzzle': ['quadruped','donkey',0.85,'#8a8478','#5a5448','#8a8478','#3a3428','none','m'],
  'Griffle': ['biped','dwarf',0.66,'#2b2b2b','#6b4a2a',SK,'#111111','bow','m'],
  'Poggin': ['biped','dwarf',0.68,'#6b3a2a','#c0a060',SK,'#8a5a2a','swordshield','m'],
  'Farsight': ['bird','eagle',0.8,'#6b4a2a','#f0f0f0','#6b4a2a','#e0c020','none','m'],
  'Roonwit': ['centaur','',1.15,'#4a3a2a','#2a4a6a',TAN,'#3a2a1a','spear','m'],
  'Emeth': ['biped','turban',1,'#d4c8a8','#2a6a8a',DARK,'#111111','scimitar','m'],
  'Rishda Tarkaan': ['biped','turban-beard',1.05,'#7a1a1a','#d4a020',DARK,'#111111','scimitar','m'],
  'Shift': ['biped','ape',0.85,'#5a4a3a','#8a7a6a','#5a4a3a','#3a2a1a','none','m'],
};
// Ages for the Pevensies (LWW): Peter 18, Susan 16, Edmund 14, Lucy 12 -> scale 1.0 / 0.95 / 0.88 / 0.78 (Lucy smallest)
const STARTERS = ['Peter','Susan','Edmund','Lucy','The White Witch','Prince Caspian','Trumpkin','Reepicheep','Eustace','Puddleglum'];
const SLOTS = ['main','combo1','combo2','power','flying','recover'];
function classify(slot, name, desc) {
  const d = (name + ' ' + desc).toLowerCase();
  if (slot === 'recover') return 'recover';
  if (slot === 'flying') return 'leap';
  if (/heal|cordial|refills/.test(d)) return 'heal';
  if (/arrow|shot|fires|throws|hurl|flings|boulder|snowball|gems|dishes|pelt|toss(es)? (a|the)|armband|spark|fire\b|breathes fire/.test(d)) return /rain|storm|everyone|volley|barrage|all/.test(d) && slot==='power' ? 'aoe' : 'projectile';
  if (/statue|freezes|net |traps|sleepy|slows|blinds|curtain|lion skin over/.test(d)) return /all|every|nearby|foes\b/.test(d) && !/one foe|a foe/.test(d) ? 'aoe' : 'stun';
  if (/charge|rush|dash|gallop|stampede|through|speed burst|zips|bounces all over|leads a/.test(d)) return 'dash';
  if (/wave|blast|shockwave|roar|stuns|quake|shakes|all foes|everyone|arena|push|gust|shout|burst|glow|light|block|guard|shield|wall|counter/.test(d)) return slot==='main'?'melee':'aoe';
  if (/spin|sweep|around|twirl|whirl|storm|fury/.test(d)) return 'spin';
  if (/two|three|four|five|double|triple|flurry|many|barrage|one-two|jab, jab|chain/.test(d)) return 'multi';
  return 'melee';
}
// hand-tuned overrides for the 10 starters (move types)
const OVR = {
  'Peter': { combo1:'multi', combo2:'multi', power:'dash' },
  'Susan': { main:'projectile', combo1:'projectile', combo2:'multi', power:'aoe' },
  'Edmund': { combo1:'melee', combo2:'spin', power:'aoe' },
  'Lucy': { combo1:'multi', combo2:'spin', power:'heal' },
  'The White Witch': { combo1:'multi', combo2:'projectile', power:'stun' },
  'Prince Caspian': { combo1:'multi', combo2:'aoe', power:'dash' },
  'Trumpkin': { combo1:'dash', combo2:'projectile', power:'spin' },
  'Reepicheep': { combo1:'multi', combo2:'dash', power:'dash' },
  'Eustace': { combo1:'multi', combo2:'projectile', power:'breath' },
  'Puddleglum': { combo1:'multi', combo2:'melee', power:'aoe' },
};
const out = [];
for (const b of raw) for (const c of b.chars) {
  const L = LOOKS[c[0]]; if (!L) throw new Error('no look for ' + c[0]);
  const moves = {};
  c.slice(2).forEach((m, i) => { const k = SLOTS[i]; const j = m.indexOf('|'); const name = m.slice(0, j), desc = m.slice(j + 1);
    moves[k] = { name, desc, type: (OVR[c[0]] && OVR[c[0]][k]) || classify(k, name, desc) }; });
  const id = c[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  out.push({ id, name: c[0], book: b.title, bookId: b.id, bio: c[1], starter: STARTERS.includes(c[0]),
    body: L[0], variant: L[1], scale: L[2], colors: { primary: L[3], secondary: L[4], skin: L[5], hair: L[6] }, weapon: L[7], sex: L[8],
    art: { source: `/workspace/Narnia Game Art/Characters/${BOOK_FOLDERS[b.id]}/`, front: `art/characters/${BOOK_FOLDERS[b.id]}/${c[0]} - front.png`, side: `art/characters/${BOOK_FOLDERS[b.id]}/${c[0]} - side.png`, back: `art/characters/${BOOK_FOLDERS[b.id]}/${c[0]} - back.png`, action: `art/characters/${BOOK_FOLDERS[b.id]}/${c[0]} - action.png`, model: null, billboard: false },
    moves });
}
const header = `// Narnia Math Brawler - FIGHTER CONFIG (single source of truth, edit freely)
// 70 fighters from the Roster Page (10 per book). Aslan is NOT here: he is the narrator.
// body: biped | critter (small upright animal: mouse, beaver, badger, squirrel) | quadruped (horse, horse-winged, unicorn, donkey, dog, wolf, bear, elephant)
//       | centaur | bird (owl, eagle) | monopod (Dufflepud)
// variant (biped): child, dwarf, giant, faun, marshwiggle, ape, gnome, thin, fat, crown, beard, turban, helmet (combine with '-')
// move type: melee | multi | spin | projectile | aoe | dash | stun | heal | breath | leap | recover
// art.front/side/back (+ optional action = dynamic fighting pose, used on the select screen when present): final reference PNGs (1024x1536, transparent) from "/workspace/Narnia Game Art/Characters/<book>/<Name> - front|side|back.png",
//   copied into art/characters/... by tools/sync-art.sh (which skips ' - ChatGPT' / ' - built-in' test files and _Peter previews). Front is shown on cards/HUD when present.
// art.model: optional GLB path (e.g. "art/models/peter.glb"). If it loads, it replaces the procedural placeholder; clips named idle/run/attack/hit/jump/block/ko are used if present.
// art.billboard: true = show art.front as a flat sprite in 3D instead of the placeholder (quick preview of new art).
// starter: true = in the default 10-fighter pool. Set ROSTER_MODE in settings to 'all' to draw from all 70.
`;
fs.writeFileSync(__dirname + '/../src/fighters.js', header + 'export const FIGHTERS = ' + JSON.stringify(out, null, 1) + ';\n');
const tally = {}; out.forEach(f => Object.values(f.moves).forEach(m => tally[m.type] = (tally[m.type] || 0) + 1));
console.log(out.length, 'fighters', tally);
console.log(out.filter(f=>f.starter).map(f=>f.name+': '+Object.values(f.moves).map(m=>m.name+'('+m.type+')').join(', ')).join('\n'));
