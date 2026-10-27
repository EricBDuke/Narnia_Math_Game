// Narnia Math Brawler - main: screens, math gate, select, camera, input, round flow.
import * as THREE from 'three';
import { FIGHTERS } from './fighters.js';
import { ARENAS, buildArena } from './arenas.js';
import { DIFFICULTIES, GATE, makeSet, check, hint, explain } from './math.js';
import { aslanLine } from './narration.js';
import { World, Fighter, SLOT_INFO, AI_LEVELS } from './combat.js';
import { InputState, LocalController, AIController } from './controllers.js';
const inputState = new InputState(); // keyboard + touch write here; LocalController feeds it to the player's fighter
import { buildPlaceholder, animateRig } from './models.js';
import { sfx, unlockAudio, setMuted, isMuted } from './audio.js';

const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const params = new URLSearchParams(location.search);
const IS_TOUCH = params.get('touch') === '1' || (params.get('touch') !== '0' && (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0));
const settings = Object.assign({ diff: 'easy', mode: 'mixed', pool: 'starters', fighter: 'peter', arena: 'random', round: 1 }, JSON.parse(localStorage.getItem('nmb-settings') || '{}'));
const save = () => localStorage.setItem('nmb-settings', JSON.stringify(settings));
let MANIFEST = { files: [] };

// ---------- renderer ----------
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_TOUCH ? 1.5 : 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); updatePreviewOffset();
  $('#rotate').classList.toggle('hidden', !(IS_TOUCH && h > w)); }
addEventListener('resize', resize);

// ---------- screens ----------
let screen = 'title';
function show(id) { screen = id; $$('.screen').forEach(s => s.classList.add('hidden')); const el = $('#s-' + id); if (el) el.classList.remove('hidden');
  $('#s-hud').classList.toggle('hidden', !['fight', 'pause', 'moves', 'end'].includes(id)); }
let aslanTimer = 0;
function aslan(moment, secs = 6) {
  const l = aslanLine(moment); if (!l) return; const el = $('#aslan'); el.classList.remove('hidden'); el.querySelector('.q').textContent = l.text; el.querySelector('.src').textContent = '— ' + l.source;
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; clearTimeout(aslanTimer); aslanTimer = setTimeout(() => el.classList.add('hidden'), secs * 1000);
}
function hideAslan() { $('#aslan').classList.add('hidden'); }
function segment(id, key, onChange) {
  $$(`#${id} button`).forEach(b => { b.classList.toggle('on', b.dataset.v === settings[key]); b.onclick = () => { sfx.click(); settings[key] = b.dataset.v; save(); segment(id, key, onChange); onChange && onChange(); }; });
}
document.addEventListener('pointerdown', () => unlockAudio(), { capture: true });
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('touchmove', e => { if (!e.target.closest('#grid, #arena-pick, #mr-list')) e.preventDefault(); }, { passive: false });
document.addEventListener('dblclick', e => e.preventDefault());

// ---------- TITLE ----------
function toTitle() { show('title'); hideAslan(); segment('diff', 'diff'); segment('mode', 'mode'); segment('pool', 'pool'); setScene(previewScene); }
$('#btn-start').onclick = () => { sfx.click(); settings.round = 1; save(); startMath(); };

// ---------- MATH GATE ----------
let M = null;
function startMath(moment) {
  M = { set: makeSet(settings.diff, settings.mode), i: 0, score: 0, results: [], field: 'ans', vals: { ans: '', rem: '' }, answered: false, usedHint: false };
  show('math'); renderProblem(); setScene(previewScene);
  aslan(moment || 'mathEncouragement', 5);
}
function renderProblem() {
  const p = M.set[M.i]; M.vals = { ans: '', rem: '' }; M.field = 'ans'; M.answered = false;
  $('#m-prog').textContent = `Problem ${M.i + 1} of ${GATE.total}`; $('#m-score').textContent = `Score ${M.score}`;
  $('#m-dots').innerHTML = M.set.map((_, k) => `<i class="${M.results[k] === true ? 'ok' : M.results[k] === false ? 'no' : ''} ${k === M.i ? 'cur' : ''}"></i>`).join('');
  $('#m-kind').textContent = p.kind === 'mul' ? 'Multiply' : 'Long division: find the quotient and the remainder';
  $('#m-problem').textContent = p.text;
  $('#f-rem').classList.toggle('hidden', p.kind !== 'div'); $('#pad-switch').style.visibility = p.kind === 'div' ? 'visible' : 'hidden';
  $('#f-ans label').textContent = p.kind === 'div' ? 'Quotient' : 'Answer';
  $('#m-feedback').textContent = ''; $('#m-feedback').className = ''; $('#m-hint').classList.add('hidden');
  $('#btn-check').classList.remove('hidden'); $('#btn-next').classList.add('hidden'); $('#btn-hint').classList.remove('hidden');
  drawFields();
}
function drawFields() { for (const k of ['ans', 'rem']) { const el = $('#f-' + k); el.classList.toggle('active', M.field === k && !M.answered); el.querySelector('.val').textContent = M.vals[k] ? Number(M.vals[k]).toLocaleString() : ''; } }
function padKey(k) {
  if (!M || screen !== 'math') return;
  if (M.answered) { if (k === 'enter') nextProblem(); return; }
  const p = M.set[M.i];
  if (/^\d$/.test(k)) { if (M.vals[M.field].length < 7) M.vals[M.field] = (M.vals[M.field] + k).replace(/^0+(\d)/, '$1'); sfx.click(); }
  else if (k === 'back') M.vals[M.field] = M.vals[M.field].slice(0, -1);
  else if (k === 'clear') M.vals[M.field] = '';
  else if (k === 'switch' && p.kind === 'div') M.field = M.field === 'ans' ? 'rem' : 'ans';
  else if (k === 'enter') { if (p.kind === 'div' && M.field === 'ans' && M.vals.ans !== '' && M.vals.rem === '') { M.field = 'rem'; } else submitAnswer(); }
  drawFields();
}
function submitAnswer() {
  const p = M.set[M.i]; if (M.vals.ans === '') { $('#m-feedback').textContent = 'Type your answer first.'; return; }
  const ok = check(p, M.vals.ans, M.vals.rem); M.answered = true; M.results[M.i] = ok; if (ok) M.score++;
  $('#m-feedback').className = ok ? 'ok' : 'no';
  $('#m-feedback').textContent = ok ? '✓ Correct!' : `Not quite. ${explain(p)}`;
  if (ok) sfx.correct(); else { sfx.wrong(); aslan('wrongAnswer', 5); }
  $('#btn-check').classList.add('hidden'); $('#btn-next').classList.remove('hidden'); $('#btn-hint').classList.add('hidden');
  $('#btn-next').textContent = M.i === GATE.total - 1 ? 'See score' : 'Next';
  $('#m-score').textContent = `Score ${M.score}`; drawFields();
  $('#m-dots').innerHTML = M.set.map((_, k) => `<i class="${M.results[k] === true ? 'ok' : M.results[k] === false ? 'no' : ''} ${k === M.i ? 'cur' : ''}"></i>`).join('');
}
function nextProblem() { if (M.i < GATE.total - 1) { M.i++; renderProblem(); } else mathResult(); }
$$('#pad button').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); padKey(b.dataset.k); }));
$$('#m-inputs .field').forEach(f => f.addEventListener('pointerdown', () => { if (M && !M.answered) { M.field = f.dataset.f; drawFields(); } }));
$('#btn-check').onclick = () => submitAnswer();
$('#btn-next').onclick = () => nextProblem();
$('#btn-hint').onclick = () => { const p = M.set[M.i]; $('#m-hint').textContent = 'Hint: ' + hint(p); $('#m-hint').classList.remove('hidden'); aslan('mathHint', 5); };
let gateBonus = { power: 0, hpMul: 1, label: '' };
function mathResult() {
  const s = M.score, pass = s >= GATE.pass;
  gateBonus = s === 10 ? { power: 100, hpMul: 1.2, label: 'Perfect 10! Your Power Move starts full and you get +20% health.' } : s === 9 ? { power: 50, hpMul: 1.1, label: '9 of 10! Your power meter starts half full and you get +10% health.' } : { power: 0, hpMul: 1, label: '' };
  show('mresult');
  $('#mr-title').textContent = `${s} / ${GATE.total}`;
  $('#mr-text').innerHTML = pass ? `<b style="color:#8af0a0">You may fight!</b> You needed ${GATE.pass} correct. ${gateBonus.label}` : `<b style="color:#ff9a8a">You need ${GATE.pass} correct to fight.</b> Try 10 new problems.`;
  $('#mr-list').innerHTML = M.set.map((p, k) => `<li class="${M.results[k] ? 'ok' : 'no'}">${M.results[k] ? '✓' : '✗'} ${explain(p)}</li>`).join('');
  $('#btn-to-select').classList.toggle('hidden', !pass);
  if (pass) { sfx.win(); if (s === 10) aslan('levelUp', 6); } else { sfx.lose(); aslan('wrongAnswer', 6); }
}
$('#btn-to-select').onclick = () => { sfx.click(); toSelect(); };
$('#btn-retry-math').onclick = () => { sfx.click(); startMath('mathEncouragement'); };

// ---------- SELECT ----------
const BOOK_SHORT = { mn: "Nephew", lww: 'LWW', hhb: 'Horse & Boy', pc: 'Caspian', vdt: 'Dawn Treader', sc: 'Silver Chair', lb: 'Last Battle' };
let selBook = 'all';
const portraitCache = {};
let portraitRenderer = null, portraitScene = null, portraitCam = null;
function portrait(cfg) {
  if (portraitCache[cfg.id]) return portraitCache[cfg.id];
  if (!portraitRenderer) {
    portraitRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); portraitRenderer.setSize(168, 168); portraitRenderer.outputColorSpace = THREE.SRGBColorSpace;
    portraitScene = new THREE.Scene(); portraitScene.add(new THREE.HemisphereLight(0xffffff, 0x445066, 1.6)); const d = new THREE.DirectionalLight(0xffffff, 1.6); d.position.set(2, 4, 5); portraitScene.add(d);
    portraitCam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  }
  const rig = buildPlaceholder(cfg); animateRig(rig, { mode: 'idle', speed: 0 }, 0); rig.root.rotation.y = cfg.body === 'quadruped' || cfg.body === 'centaur' ? 0.9 : 0.35; portraitScene.add(rig.root);
  const h = rig.height, wide = cfg.body === 'quadruped' || cfg.body === 'centaur';
  const focusY = wide ? h * 0.55 : h * 0.78, dist = wide ? h * 2.0 : h * 1.15;
  portraitCam.position.set(0, focusY + h * 0.05, dist); portraitCam.lookAt(0, focusY, 0);
  portraitRenderer.render(portraitScene, portraitCam); const url = portraitRenderer.domElement.toDataURL('image/png');
  portraitScene.remove(rig.root); rig.root.traverse(o => { if (o.isMesh) o.material.dispose(); });
  return portraitCache[cfg.id] = url;
}
const artUrl = (p) => p && MANIFEST.files.includes(p) ? encodeURI(p) : null;
function poolList() { return settings.pool === 'all' ? FIGHTERS : FIGHTERS.filter(f => f.starter); }
function toSelect() {
  show('select'); hideAslan();
  const books = ['all', ...new Set(poolList().map(f => f.bookId))];
  $('#sel-book').innerHTML = books.map(b => `<button data-b="${b}" class="${b === selBook ? 'on' : ''}">${b === 'all' ? 'All' : BOOK_SHORT[b]}</button>`).join('');
  $$('#sel-book button').forEach(b => b.onclick = () => { selBook = b.dataset.b; toSelect(); });
  if (!books.includes(selBook)) selBook = 'all';
  const list = poolList().filter(f => selBook === 'all' || f.bookId === selBook);
  if (!poolList().find(f => f.id === settings.fighter)) settings.fighter = poolList()[0].id;
  $('#grid').innerHTML = list.map(f => `<div class="card ${f.id === settings.fighter ? 'on' : ''}" data-id="${f.id}">${f.starter && settings.pool === 'all' ? '<span class="star">★</span>' : ''}<img alt="" data-id="${f.id}"><div>${f.name}</div></div>`).join('');
  $$('#grid .card').forEach(c => c.onclick = () => { sfx.click(); settings.fighter = c.dataset.id; save(); $$('#grid .card').forEach(x => x.classList.toggle('on', x === c)); selectInfo(); });
  // portraits progressively (art image if present, else rendered placeholder)
  const imgs = $$('#grid img'); let k = 0;
  const step = () => { for (let n = 0; n < 6 && k < imgs.length; n++, k++) { const f = FIGHTERS.find(x => x.id === imgs[k].dataset.id); imgs[k].src = artUrl(f.art.action) || artUrl(f.art.front) || portrait(f); } if (k < imgs.length && screen === 'select') requestAnimationFrame(step); };
  step();
  // arenas grouped by book
  let html = '<button data-a="random" class="' + (settings.arena === 'random' ? 'on' : '') + '">🎲 Random</button>'; let lastBook = '';
  for (const a of ARENAS) { if (a.book !== lastBook) { html += `<div class="grp">${a.book}</div>`; lastBook = a.book; } html += `<button data-a="${a.id}" class="${settings.arena === a.id ? 'on' : ''}" title="${a.blurb}">${a.name}</button>`; }
  $('#arena-pick').innerHTML = html;
  $$('#arena-pick button').forEach(b => b.onclick = () => { sfx.click(); settings.arena = b.dataset.a; save(); $$('#arena-pick button').forEach(x => x.classList.toggle('on', x === b)); });
  selectInfo(); setScene(previewScene); requestAnimationFrame(updatePreviewOffset);
}
function selectInfo() {
  const f = FIGHTERS.find(x => x.id === settings.fighter);
  $('#si-name').textContent = f.name; $('#si-book').textContent = f.book; $('#si-bio').textContent = f.bio;
  $('#si-moves').innerHTML = ['main', 'combo1', 'combo2', 'power', 'flying', 'recover'].map(s => `<tr><td>${IS_TOUCH ? SLOT_INFO[s].icon : SLOT_INFO[s].key} ${SLOT_INFO[s].label}</td><td>${f.moves[s].name}</td><td>${f.moves[s].desc}</td></tr>`).join('');
  setPreviewFighter(f);
}
$('#btn-fight').onclick = () => { sfx.click(); startRound(); };

// ---------- preview scene (title / math / select background) ----------
const previewScene = new THREE.Scene();
previewScene.background = new THREE.Color(0x1b2440); previewScene.fog = new THREE.Fog(0x1b2440, 12, 40);
previewScene.add(new THREE.HemisphereLight(0xcfe0ff, 0x203050, 1.2));
const pKey = new THREE.SpotLight(0xffe8b0, 60, 30, 0.5, 0.5); pKey.position.set(3, 9, 6); pKey.castShadow = true; previewScene.add(pKey);
const ped = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.5, 32), new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.6 })); ped.position.y = -0.25; ped.receiveShadow = true; previewScene.add(ped);
const lamp = new THREE.Group(); { const m = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: .6, roughness: .4 }); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 5, 8), m); post.position.y = 2.5; lamp.add(post);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffe0a0, emissive: 0xffc060, emissiveIntensity: 2 })); glow.position.y = 5.2; lamp.add(glow); const pl = new THREE.PointLight(0xffc070, 20, 12); pl.position.y = 5.2; lamp.add(pl); }
lamp.position.set(-4, 0, -4); previewScene.add(lamp);
const snowG = new THREE.BufferGeometry(); { const a = new Float32Array(600 * 3); for (let i = 0; i < 600; i++) { a[i * 3] = (Math.random() - .5) * 30; a[i * 3 + 1] = Math.random() * 14; a[i * 3 + 2] = (Math.random() - .5) * 20 - 3; } snowG.setAttribute('position', new THREE.BufferAttribute(a, 3)); }
previewScene.add(new THREE.Points(snowG, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.8 })));
for (let i = 0; i < 18; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.9 + Math.random(), 4 + Math.random() * 3, 7), new THREE.MeshStandardMaterial({ color: 0x2a4a3a, flatShading: true })); const a = Math.PI * (0.9 + Math.random() * 1.2); t.position.set(Math.cos(a) * (9 + Math.random() * 6), 2, Math.sin(a) * 6 - 8); previewScene.add(t); }
let previewRig = null;
function setPreviewFighter(f) { if (previewRig) previewScene.remove(previewRig.root); previewRig = buildPlaceholder(f); previewRig.root.traverse(o => { if (o.isMesh) o.castShadow = true; }); previewScene.add(previewRig.root); }
setPreviewFighter(FIGHTERS.find(f => f.id === settings.fighter) || FIGHTERS[0]);
function updatePreviewOffset() {
  if (screen === 'select') { const L = $('.sel-left').getBoundingClientRect(), R = $('.sel-right').getBoundingClientRect(); const cx = (L.right + R.left) / 2; camera.setViewOffset(innerWidth, innerHeight, (innerWidth / 2 - cx), 0, innerWidth, innerHeight); }
  else if (screen === 'math' && !IS_TOUCH) { camera.clearViewOffset(); }
  else camera.clearViewOffset();
}

// ---------- ROUND ----------
let world = null, player = null, arenaScene = null, activeScene = previewScene, roundOver = false, arenaDef = null;
function setScene(s) { activeScene = s; if (s === previewScene) updatePreviewOffset(); }
function disposeScene(s) { s?.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => { m.map?.dispose(); m.dispose(); }); }); }
function startRound() {
  if (arenaScene) disposeScene(arenaScene);
  arenaScene = new THREE.Scene();
  arenaDef = settings.arena === 'random' ? ARENAS[Math.floor(Math.random() * ARENAS.length)] : ARENAS.find(a => a.id === settings.arena) || ARENAS[0];
  const arena = buildArena(arenaDef.id, arenaScene);
  const lvl = AI_LEVELS[settings.diff];
  world = new World(arenaScene, arena, {});
  const me = FIGHTERS.find(f => f.id === settings.fighter);
  const pool = poolList().filter(f => f.id !== me.id).sort(() => Math.random() - 0.5).slice(0, 5);
  inputState.queue.length = 0;
  player = new Fighter(me, world, { isPlayer: true, lives: 3, power: gateBonus.power, hpMul: gateBonus.hpMul, controller: new LocalController(inputState) });
  world.fighters.push(player);
  pool.forEach(cfg => world.fighters.push(new Fighter(cfg, world, { controller: new AIController(lvl), lives: 2, dmgMul: lvl.dmgMul })));
  world.fighters.forEach((f, i) => f.spawn(arena.spawns[i % arena.spawns.length]));
  player.invuln = 3;
  camera.clearViewOffset(); cam.yaw = Math.atan2(player.pos.x, player.pos.z); cam.pitch = 0.62; cam.dist = IS_TOUCH ? 15 : 14; cam.target.copy(player.pos); camDist = 0;
  collectOccluders();
  roundOver = false; setScene(arenaScene); show('fight'); buildHUD(); buildTouch();
  banner(arenaDef.name, 2.2); setTimeout(() => { if (screen === 'fight' && !roundOver) banner('FIGHT!', 1.0); }, 2300);
  aslan('arenaIntro', 5);
  window.__nmb.roundStart = performance.now();
}
function endRound(win) {
  if (roundOver) return; roundOver = true;
  setTimeout(() => {
    show('end'); $('#end-title').textContent = win ? 'Victory!' : 'Defeat';
    const kos = player.stats.kos; $('#end-text').innerHTML = win ? `${player.cfg.name} is the last one standing in ${arenaDef.name}! Knockouts: ${kos}.` : `${player.cfg.name} is out of lives. Knockouts: ${kos}. Solve 10 more problems to fight again.`;
    if (win) { sfx.win(); aslan('victory', 8); } else { sfx.lose(); aslan('defeat', 8); }
    settings.round++; settings.lastWin = win; save();
  }, 1600);
}
$('#btn-next-round').onclick = () => { sfx.click(); startMath(settings.lastWin ? 'betweenRounds' : 'playAgain'); };
$('#btn-menu').onclick = () => { sfx.click(); toTitle(); };

// ---------- HUD ----------
let bannerT = 0;
function banner(text, secs = 1.5) { const b = $('#banner'); b.textContent = text; b.classList.add('show'); clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove('show'), secs * 1000); }
let toastT = 0;
function toast(text, secs = 2) { $('#toast').textContent = text; clearTimeout(toastT); toastT = setTimeout(() => $('#toast').textContent = '', secs * 1000); }
const ML_SLOTS = ['main', 'combo1', 'combo2', 'power', 'flying', 'jump', 'high', 'block', 'recover'];
function moveName(s) { const m = player.cfg.moves; return s === 'jump' ? 'Jump' : s === 'high' ? 'High Jump' : s === 'block' ? 'Block / Dodge' : m[s].name; }
function buildHUD() {
  $('#hud-me .portrait').style.backgroundImage = `url(${artUrl(player.cfg.art.front) || portrait(player.cfg)})`;
  $('#hud-me .name').textContent = player.cfg.name;
  $('#hud-foes').innerHTML = world.fighters.filter(f => !f.isPlayer).map(f => `<div class="foe" data-id="${f.id}"><div class="n">${f.cfg.name.replace(/ \(.*\)/, '')}</div><div class="bar"><i></i></div><div class="l"></div></div>`).join('');
  $('#movelist').innerHTML = `<div class="t">${player.cfg.name.replace(/ \(.*\)/, '')} · moves${IS_TOUCH ? '' : ' (Tab)'}</div>` + ML_SLOTS.map(s => `<div class="r"><kbd>${IS_TOUCH ? SLOT_INFO[s].icon : SLOT_INFO[s].key}</kbd><span>${moveName(s)}</span></div>`).join('');
  $('#ml-table').innerHTML = ML_SLOTS.map(s => `<tr><td>${SLOT_INFO[s].key} · ${SLOT_INFO[s].touch}</td><td>${moveName(s)}</td><td>${['jump', 'high', 'block'].includes(s) ? SLOT_INFO[s].label : player.cfg.moves[s].desc}</td></tr>`).join('');
  $('#cam-hint').textContent = IS_TOUCH ? 'Drag the screen to turn the camera · pinch to zoom' : 'Mouse-drag or Q/E to turn the camera · wheel to zoom';
}
function updateHUD() {
  const p = player; $('#hud-me .hp i').style.width = (p.hp / p.maxHp * 100) + '%'; $('#hud-me .pw i').style.width = p.power + '%';
  $('#hud-me .pw').classList.toggle('full', p.power >= 100); $('#hud-me .lives').textContent = '♥'.repeat(Math.max(0, p.lives)) + '♡'.repeat(Math.max(0, 3 - p.lives));
  for (const f of world.fighters) { if (f.isPlayer) continue; const el = document.querySelector(`.foe[data-id="${f.id}"]`); if (!el) continue; el.querySelector('i').style.width = (f.hp / f.maxHp * 100) + '%'; el.querySelector('.l').textContent = f.dead ? 'OUT' : '♥'.repeat(f.lives); el.classList.toggle('out', f.dead); }
  const pb = document.querySelector('.tb[data-a="power"]'); if (pb) pb.classList.toggle('ready', p.power >= 100);
  const rb = document.querySelector('.tb[data-a="recover"]'); if (rb) rb.classList.toggle('pulse', p.state === 'down');
}
function handleEvents() {
  for (const e of world.events) {
    if (e.type === 'toast' ) toast(e.text);
    if (e.type === 'ko') { if (e.f.isPlayer) banner('Knocked out!', 1.4); else toast(`${e.f.cfg.name} is knocked out${e.by ? ' by ' + e.by.cfg.name : ''}!`); }
    if (e.type === 'lifeLost' && e.f.isPlayer) toast(e.f.lives > 0 ? `You lost a life! ${e.f.lives} left.` : 'No lives left!', 2.5);
    if (e.type === 'out' && !e.f.isPlayer) toast(`${e.f.cfg.name} is out of the round!`, 2.2);
    if (e.type === 'down' && e.f.isPlayer) toast(IS_TOUCH ? 'Knocked down! Tap ↻ to recover' : 'Knocked down! Press R to recover', 1.5);
    if (e.type === 'power' && e.f.isPlayer) banner(e.f.cfg.moves.power.name + '!', 1.2);
    if (e.type === 'stun' && e.f.isPlayer) toast(`${e.by.cfg.name} froze you!`, 1.4);
  }
  world.events.length = 0;
  if (!roundOver) {
    if (player.dead) endRound(false);
    else if (world.fighters.every(f => f.isPlayer || f.dead)) { banner('VICTORY!', 2); endRound(true); }
  }
}

// ---------- occluder fading: scenery between the camera and your fighter turns see-through ----------
let occluders = [], faded = new Set(); const ray = new THREE.Raycaster();
function collectOccluders() {
  occluders = []; faded = new Set(); const fighterObjs = new Set(); world.fighters.forEach(f => f.group.traverse(o => fighterObjs.add(o)));
  arenaScene.traverse(o => { if (!o.isMesh || fighterObjs.has(o) || !o.castShadow) return; o.geometry.computeBoundingSphere(); if (o.geometry.boundingSphere.radius * Math.max(o.scale.x, o.scale.y, o.scale.z) > 0.7) occluders.push(o); });
}
function fadeOccluders() {
  if (!player || player.dead) return;
  const target = player.pos.clone(); target.y += player.height * 0.5; const dir = target.clone().sub(camera.position); const len = dir.length(); dir.normalize();
  ray.set(camera.position, dir); ray.far = len - 0.5; const hits = new Set(ray.intersectObjects(occluders, false).map(h => h.object));
  // also check the head, so tall things in front of the body fade too
  const head = player.pos.clone(); head.y += player.height; const d2 = head.clone().sub(camera.position); ray.set(camera.position, d2.clone().normalize()); ray.far = d2.length() - 0.5; ray.intersectObjects(occluders, false).forEach(h => hits.add(h.object));
  const feet = player.pos.clone(); feet.y += 0.2; const d3 = feet.clone().sub(camera.position); ray.set(camera.position, d3.clone().normalize()); ray.far = d3.length() - 0.5; ray.intersectObjects(occluders, false).forEach(h => hits.add(h.object));
  for (const o of faded) if (!hits.has(o)) { o.material.opacity = o.userData.op0 ?? 1; o.material.transparent = o.userData.tr0 ?? false; o.material.depthWrite = true; o.castShadow = true; faded.delete(o); }
  for (const o of hits) if (!faded.has(o)) { o.userData.op0 = o.material.opacity; o.userData.tr0 = o.material.transparent; o.material.transparent = true; o.material.opacity = 0.2; o.material.depthWrite = false; faded.add(o); }
}

// ---------- camera ----------
const cam = { yaw: 0, pitch: 0.62, dist: 16, target: new THREE.Vector3() }; let camDist = 0;
function updateCamera(dt) {
  if (activeScene === previewScene) {
    const t = performance.now() / 1000;
    if (screen === 'select') { camera.position.set(0, 2.2, 7.2); camera.lookAt(0, 1.1, 0); if (previewRig) { previewRig.root.rotation.y = t * 0.6; animateRig(previewRig, { mode: 'idle', speed: 0 }, t); } }
    else { camera.position.set(Math.sin(t * 0.05) * 2, 2.6, 9); camera.lookAt(0, 1.4, 0); if (previewRig) { previewRig.root.rotation.y = 0.4 + Math.sin(t * 0.4) * 0.3; animateRig(previewRig, { mode: 'idle', speed: 0 }, t); } }
    const p = snowG.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) - dt * 0.8; if (y < 0) y = 14; p.setY(i, y); } p.needsUpdate = true;
    return;
  }
  const yawKeys = (keys.KeyQ ? 1 : 0) - (keys.KeyE ? 1 : 0); cam.yaw += yawKeys * dt * 2.2;
  if (keys.Minus) cam.dist = Math.min(30, cam.dist + dt * 10); if (keys.Equal) cam.dist = Math.max(7, cam.dist - dt * 10);
  const tgt = player && !player.dead ? player.pos : new THREE.Vector3();
  cam.target.lerp(new THREE.Vector3(tgt.x, tgt.y + 1, tgt.z), Math.min(1, dt * 5));
  const cp = Math.cos(cam.pitch); let d = cam.dist; const camR = world?.arena.camR;
  for (let k = 0; k < 12; k++) { const x = cam.target.x + Math.sin(cam.yaw) * cp * d, z = cam.target.z + Math.cos(cam.yaw) * cp * d; if (!camR || Math.hypot(x, z) <= camR || d < 5) break; d *= 0.9; } // keep the camera inside walled arenas
  camDist = camDist ? camDist + (d - camDist) * Math.min(1, dt * 6) : d; d = camDist;
  camera.position.set(cam.target.x + Math.sin(cam.yaw) * cp * d, cam.target.y + Math.sin(cam.pitch) * d, cam.target.z + Math.cos(cam.yaw) * cp * d);
  camera.lookAt(cam.target);
}
// drag to orbit (mouse or touch on the 3D view), pinch / wheel to zoom
const ptrs = new Map(); let pinchD = 0;
canvas.addEventListener('pointerdown', e => { if (screen !== 'fight') return; canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); });
canvas.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if (!p) return;
  if (ptrs.size === 1) { cam.yaw -= (e.clientX - p.x) * 0.006; cam.pitch = Math.max(0.15, Math.min(1.35, cam.pitch + (e.clientY - p.y) * 0.004)); }
  p.x = e.clientX; p.y = e.clientY;
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinchD) cam.dist = Math.max(7, Math.min(30, cam.dist * pinchD / d)); pinchD = d; } });
const endPtr = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinchD = 0; };
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
canvas.addEventListener('wheel', e => { if (screen === 'fight') { cam.dist = Math.max(7, Math.min(30, cam.dist + e.deltaY * 0.01)); e.preventDefault(); } }, { passive: false });

// ---------- keyboard ----------
const keys = {};
addEventListener('keydown', e => {
  if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  unlockAudio();
  if (screen === 'math') {
    if (/^\d$/.test(e.key)) padKey(e.key); else if (e.key === 'Backspace') padKey('back'); else if (e.key === 'Enter') { e.preventDefault(); padKey('enter'); }
    else if (e.code === 'Tab' || e.key === 'r' || e.key === 'R' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') padKey('switch'); else if (e.key === 'Escape') padKey('clear');
    return;
  }
  if (screen === 'moves' && (e.code === 'Tab' || e.code === 'Escape')) { show(prevScreen); if (prevScreen === 'fight') paused = false; return; }
  if (screen === 'pause' && e.code === 'Escape') { resume(); return; }
  if (screen !== 'fight') { if (e.key === 'Enter') { const b = document.querySelector(`#s-${screen} .go:not(.hidden)`); b && b.click(); } return; }
  if (e.repeat) { keys[e.code] = true; return; }
  keys[e.code] = true;
  if (e.code === 'Escape') { pause(); return; }
  if (e.code === 'Tab') { prevScreen = 'fight'; show('moves'); paused = true; return; }
  const map = { KeyJ: 'main', KeyK: 'combo1', KeyL: 'combo2', KeyI: 'power', KeyU: 'flying', KeyR: 'recover' };
  if (map[e.code]) queueAction(map[e.code]);
  if (e.code === 'Space') queueAction(e.shiftKey ? 'high' : 'jump');
  if (e.code === 'KeyO') { const mv = moveVec(); if (Math.hypot(mv.x, mv.z) > 0.3) inputState.dodge = true; }
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
let prevScreen = 'fight', paused = false;
function queueAction(a) { if (player && !roundOver) inputState.press(a); }
const stick = { x: 0, y: 0, active: false };
function moveVec() {
  let ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0), iy = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
  if (stick.active) { ix = stick.x; iy = stick.y; }
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
  return { x: fx * iy + rx * ix, z: fz * iy + rz * ix };
}
let touchBlock = false;
function pause() { if (screen !== 'fight') return; paused = true; show('pause'); $('#btn-mute').textContent = 'Sound: ' + (isMuted() ? 'Off' : 'On'); }
function resume() { paused = false; show('fight'); }
$('#btn-pause').onclick = () => pause();
$('#btn-resume').onclick = () => resume();
$('#btn-moves').onclick = () => { prevScreen = 'pause'; show('moves'); };
$('#btn-moves-close').onclick = () => { if (prevScreen === 'fight') { paused = false; show('fight'); } else show('pause'); };
$('#btn-quit').onclick = () => { paused = false; roundOver = true; startMath('playAgain'); };
$('#btn-mute').onclick = () => { setMuted(!isMuted()); $('#btn-mute').textContent = 'Sound: ' + (isMuted() ? 'Off' : 'On'); };

// ---------- touch controls ----------
const TB = [ // [action, right, bottom, size]
  ['main', 18, 18, 116], ['combo1', 150, 8, 84], ['combo2', 138, 104, 84], ['flying', 48, 150, 84],
  ['power', 8, 250, 76], ['jump', 250, 8, 80], ['high', 250, 102, 76], ['block', 150, 200, 76], ['recover', 240, 192, 70],
];
function buildTouch() {
  $('#touch').classList.toggle('hidden', !IS_TOUCH); if (!IS_TOUCH) return;
  $('#tbtns').innerHTML = TB.map(([a, r, b, s]) => `<button class="tb" data-a="${a}" style="right:${r}px;bottom:${b}px;width:${s}px;height:${s}px"><b>${SLOT_INFO[a].icon}</b><small>${a === 'main' ? 'Main' : SLOT_INFO[a].label.replace('Jump / Flying Attack', 'Flying').replace('Block / Dodge', 'Block')}</small><em>${['jump', 'high', 'block'].includes(a) ? '' : player.cfg.moves[a].name}</em></button>`).join('');
  $$('#tbtns .tb').forEach(b => {
    const a = b.dataset.a;
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); b.setPointerCapture(e.pointerId); b.classList.add('down'); unlockAudio();
      if (a === 'block') { touchBlock = true; if (stick.active && Math.hypot(stick.x, stick.y) > 0.5) inputState.dodge = true; } else queueAction(a); });
    const up = e => { b.classList.remove('down'); if (a === 'block') touchBlock = false; };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  });
}
{ const el = $('#stick'), knob = el.querySelector('.knob'); let id = null;
  const setK = (e) => { const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const R = r.width / 2; const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`; stick.x = dx / R; stick.y = -dy / R; stick.active = true; };
  el.addEventListener('pointerdown', e => { e.preventDefault(); id = e.pointerId; el.setPointerCapture(id); setK(e); });
  el.addEventListener('pointermove', e => { if (e.pointerId === id) setK(e); });
  const end = e => { if (e.pointerId !== id) return; id = null; stick.x = stick.y = 0; stick.active = false; knob.style.transform = ''; };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); }

// ---------- loop ----------
let last = performance.now(), acc = 0; const STEP = 1 / 60;
function loop(now) {
  requestAnimationFrame(loop);
  let dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (activeScene === arenaScene && world) {
    if (screen === 'fight' && !paused) {
      acc += dt;
      while (acc >= STEP) {
        const mv = moveVec(); inputState.mx = mv.x; inputState.mz = mv.z; inputState.block = !!keys.KeyO || touchBlock;
        world.update(STEP); world.arena.update(world.time, STEP); handleEvents(); acc -= STEP;
      }
      updateHUD();
    }
    for (const f of world.fighters) if (f.artObj?.userData.billboard) f.artObj.lookAt(camera.position.x, f.artObj.getWorldPosition(new THREE.Vector3()).y, camera.position.z);
  }
  updateCamera(dt);
  if (activeScene === arenaScene && world) fadeOccluders();
  renderer.render(activeScene, camera);
}

// ---------- test/debug hooks (read-only state; debug actions only with ?debug=1) ----------
window.__nmb = {
  get screen() { return screen; }, get math() { return M; }, get world() { return world; }, get player() { return player; }, FIGHTERS, ARENAS, settings,
  state() { return { screen, round: settings.round, player: player && { name: player.cfg.name, hp: Math.round(player.hp), lives: player.lives, power: Math.round(player.power), state: player.state, dead: player.dead, kos: player.stats.kos, pos: player.pos.toArray().map(v => +v.toFixed(2)) },
    foes: world ? world.fighters.filter(f => !f.isPlayer).map(f => ({ name: f.cfg.name, hp: Math.round(f.hp), lives: f.lives, dead: f.dead, state: f.state, dmgDealt: Math.round(f.stats.dmg) })) : [], arena: arenaDef?.id }; },
};
if (params.get('debug') === '1') Object.assign(window.__nmb, {
  hurtPlayer(n) { player.takeHit(null, { dmg: n, kb: 0, dir: new THREE.Vector3(1, 0, 0) }, world); player.invuln = 0; },
  koFoes() { world.fighters.forEach(f => { if (!f.isPlayer && !f.dead) { f.lives = 1; f.invuln = 0; f.dodgeT = 0; f.state = 'idle'; f.takeHit(player, { dmg: 9999, kb: 0, dir: new THREE.Vector3(1, 0, 0) }, world); } }); },
  setPower(v) { player.power = v; }, noInvuln() { player.invuln = 0; },
  startRound(arenaId, fighterId) { if (arenaId) settings.arena = arenaId; if (fighterId) settings.fighter = fighterId; startRound(); },
});

// ---------- boot ----------
(async function boot() {
  try { const r = await fetch('art/manifest.json', { cache: 'no-store' }); if (r.ok) MANIFEST = await r.json(); } catch (e) {}
  resize(); toTitle(); $('#loading').classList.add('hidden'); requestAnimationFrame(loop);
  if (IS_TOUCH) $('#title-hint').textContent = 'iPad: use the number pad for answers. In battle: joystick on the left, move buttons on the right.';
})();
