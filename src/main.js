// Narnia Math Brawler - main: screens, math gate, select, side-view camera, HUD, input, round flow.
import * as THREE from 'three';
import { FIGHTERS } from './fighters.js';
import { ARENAS, buildArena, setArenaArt } from './arenas.js';
import { DIFFICULTIES, GATE, makeSet, check, hint, explain } from './math.js';
import { aslanLine, aslanAny } from './narration.js';
import { World, Fighter, SLOT_INFO } from './combat.js';
import { InputState, LocalController, AIController, AI_LEVELS } from './controllers.js';
import { buildPlaceholder, animateRig } from './models.js';
import { FX } from './fx.js';
import { applyArtMap, setArtRegistry, artUrl, artPaths, makeBillboard } from './sprites.js';
import { attachSignatures } from './signature.js';
import { loadSigArt, SA } from './sigart.js';
import { assetUrl, setAssetMode, progress, resetProgress } from './assets.js';
import { sfx, unlockAudio, setMuted, isMuted, startMusic, stopMusic, audioState, audioLevel } from './audio.js';
const inputState = new InputState(); // keyboard + touch write here; LocalController feeds it to the player's fighter

const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const params = new URLSearchParams(location.search);
const IS_TOUCH = params.get('touch') === '1' || (params.get('touch') !== '0' && (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0));
document.body.classList.toggle('touch', IS_TOUCH);
const settings = Object.assign({ diff: 'easy', mode: 'mixed', fighter: 'peter', arena: 'charn', opps: 5, oppMode: 'random', oppPick: [], round: 1 }, JSON.parse(localStorage.getItem('nmb-settings') || '{}'));
if (!ARENAS.some(a => a.id === settings.arena)) settings.arena = 'charn';
const save = () => localStorage.setItem('nmb-settings', JSON.stringify(settings));
let MANIFEST = { files: [], arenas: {} };

// ---------- renderer ----------
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); // alpha: the painted menu background shows through behind the preview fighter
let pixelRatio = Math.min(window.devicePixelRatio || 1, IS_TOUCH ? 1.5 : 2); if (params.get('pr')) pixelRatio = +params.get('pr');
renderer.setPixelRatio(pixelRatio);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const FOV = 36, camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 600);
function resize() { const w = innerWidth, h = innerHeight; renderer.setPixelRatio(pixelRatio); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); updatePreviewOffset();
  if (fx) fx.setScale(renderer.domElement.height / (2 * Math.tan(FOV * Math.PI / 360)));
  $('#rotate').classList.toggle('hidden', !(IS_TOUCH && h > w)); }
addEventListener('resize', resize);
let fx = null;

// ---------- screens ----------
let screen = 'boot';
let MENU_BG = false; const MENU_SCREENS = ['title', 'select', 'math', 'mresult', 'load', 'welcome', 'arena', 'opps'];
function syncMenuBg() { const on = MENU_BG && MENU_SCREENS.includes(screen) && activeScene === previewScene; $('#menu-bg').classList.toggle('on', on); $('#menu-bg').dataset.s = screen; previewScene.background = on ? null : previewBgColor; previewScene.fog = on ? null : previewFog; lowpoly.visible = !on; menuBlob.visible = on; document.body.classList.toggle('menu-art', on); }
function applyPreviewVis() { const showF = !['welcome', 'arena', 'opps'].includes(screen); if (previewBB) previewBB.root.visible = showF; if (previewRig) previewRig.root.visible = showF && !previewBB; if (!showF) menuBlob.visible = false; }
function show(id) { screen = id; try { applyPreviewVis(); } catch (e) {} document.body.classList.toggle('in-fight', ['fight', 'pause', 'moves', 'end'].includes(id)); $$('.screen').forEach(s => s.classList.add('hidden')); const el = $('#s-' + id); if (el) el.classList.remove('hidden');
  $('#s-hud').classList.toggle('hidden', !['fight', 'pause', 'moves', 'end'].includes(id)); syncMenuBg(); }
let aslanTimer = 0;
function aslan(moment, secs = 6) {
  const l = aslanLine(moment); if (!l) return; const el = $('#aslan'); el.classList.remove('hidden'); el.querySelector('.q').textContent = l.text; el.querySelector('.src').textContent = '— ' + l.source;
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; clearTimeout(aslanTimer); aslanTimer = setTimeout(() => el.classList.add('hidden'), secs * 1000);
}
function hideAslan() { $('#aslan').classList.add('hidden'); }
function segment(id, key, onChange) {
  $$(`#${id} button`).forEach(b => { b.classList.toggle('on', b.dataset.v === settings[key]); b.onclick = () => { sfx.click(); settings[key] = b.dataset.v; save(); segment(id, key, onChange); onChange && onChange(); }; });
}
const tapAudio = () => { unlockAudio(); if (!audioState().music) startMusic('mystic'); };
document.addEventListener('pointerdown', tapAudio, { capture: true });
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('touchmove', e => { if (!e.target.closest('.scrollable, #mr-list')) e.preventDefault(); }, { passive: false });
document.addEventListener('dblclick', e => e.preventDefault());

// ---------- TITLE ----------
function toTitle() { show('title'); hideAslan(); segment('diff', 'diff'); segment('mode', 'mode'); setScene(previewScene); }
$('#btn-start').onclick = () => { sfx.click(); settings.round = 1; save(); startMath(); };

// ---------- MATH GATE ----------
let M = null;
function startMath(moment) {
  M = { set: makeSet(settings.diff, settings.mode), i: 0, score: 0, results: [], field: 'ans', vals: { ans: '', rem: '' }, answered: false, usedHint: false };
  show('math'); renderProblem(); setScene(previewScene); startMusic('mystic');
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
  gateBonus = s === GATE.total ? { power: 100, hpMul: 1.2, label: `Perfect ${GATE.total} of ${GATE.total}! Your Power Move starts full and you are 20% sturdier, so you get knocked back less.` } : { power: 0, hpMul: 1, label: '' };
  show('mresult');
  $('#mr-title').textContent = `${s} / ${GATE.total}`;
  $('#mr-text').innerHTML = pass ? `<b style="color:#8af0a0">You may fight!</b> You needed ${GATE.pass} correct. ${gateBonus.label}` : `<b style="color:#ff9a8a">You need ${GATE.pass} correct to fight.</b> Try ${GATE.total} new problems.`;
  $('#mr-list').innerHTML = M.set.map((p, k) => `<li class="${M.results[k] ? 'ok' : 'no'}">${M.results[k] ? '✓' : '✗'} ${explain(p)}</li>`).join('');
  $('#btn-to-select').classList.toggle('hidden', !pass);
  if (pass) { sfx.win(); if (s === GATE.total) aslan('levelUp', 6); } else { sfx.lose(); aslan('wrongAnswer', 6); }
}
$('#btn-to-select').onclick = () => { sfx.click(); toWelcome(); };
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
  const rig = buildPlaceholder(cfg); animateRig(rig, { mode: 'idle', speed: 0 }, 0); rig.root.rotation.y = cfg.body === 'quadruped' || cfg.body === 'centaur' ? 1.2 : 0.6; portraitScene.add(rig.root);
  const h = rig.height, wide = cfg.body === 'quadruped' || cfg.body === 'centaur';
  const focusY = wide ? h * 0.55 : h * 0.78, dist = wide ? h * 2.0 : h * 1.15;
  portraitCam.position.set(0, focusY + h * 0.05, dist); portraitCam.lookAt(0, focusY, 0);
  portraitRenderer.render(portraitScene, portraitCam); const url = portraitRenderer.domElement.toDataURL('image/png');
  portraitScene.remove(rig.root); rig.root.traverse(o => { if (o.isMesh) o.material.dispose(); });
  return portraitCache[cfg.id] = url;
}
function poolList() { return FIGHTERS; }
const BOOK_IDS = ['mn', 'lww', 'hhb', 'pc', 'vdt', 'sc', 'lb'];
const BOOK_TITLES = BOOK_IDS.map((_, i) => ARENAS[i * 2].book);
const arenasOfBook = (bi) => ARENAS.filter(a => a.book === BOOK_TITLES[bi]);
const bookCardArt = (bi) => { const p = MANIFEST.ui?.bookCards?.[bi]; return p ? assetUrl(p).replace(/'/g, '%27').replace(/"/g, '%22') : null; };
const arenaThumb = (a) => { const m = MANIFEST.arenas?.[a.id]; if (!m) return null; return (MANIFEST.webp ? assetUrl(`art/thumbs/${a.id}.png`) : assetUrl(m.back)).replace(/'/g, '%27').replace(/"/g, '%22'); };
const bookOf = (f) => BOOK_IDS.indexOf(f.bookId);
const STEPS = ['Battlefield', 'Fighter', 'Opponents'];
function drawSteps() { $$('.steps').forEach(el => { const n = +el.dataset.step; el.innerHTML = STEPS.map((t, i) => `<span class="${i + 1 === n ? 'cur' : i + 1 < n ? 'done' : ''}"><i>${i + 1}</i><em>${t}</em></span>`).join(''); }); }
const clickSfx = () => { try { sfx.click(); } catch (e) {} };

// ---- Welcome ----
function toWelcome() {
  show('welcome'); hideAslan(); drawSteps(); const l = aslanAny(); $('#wl-quote').textContent = l.text; $('#wl-src').textContent = '— ' + l.source;
  if (MANIFEST.aslanPortrait) $('#wl-lion').src = assetUrl(MANIFEST.aslanPortrait); setScene(previewScene); setTimeout(() => $('#btn-wl-continue').focus({ preventScroll: true }), 50);
}
$('#btn-wl-continue').onclick = () => { clickSfx(); toArena(null); };

// ---- Arena: book cards, then that book's arenas ----
let arBook = null;
function toArena(book = arBook) {
  arBook = book; show('arena'); hideAslan(); drawSteps(); setScene(previewScene);
  const books = $('#ar-books'), ars = $('#ar-arenas'); books.classList.toggle('hidden', book !== null); ars.classList.toggle('hidden', book === null);
  if (book === null) {
    $('#ar-kick').textContent = 'Step 1 · Battlefield'; $('#ar-title').textContent = 'Which book?';
    books.innerHTML = BOOK_IDS.map((id, bi) => { const as = arenasOfBook(bi), th = bookCardArt(bi) || arenaThumb(as[0]), fs = FIGHTERS.filter(f => f.bookId === id).slice(0, 3);
      return `<button class="bk" data-bi="${bi}" data-nav><span class="bk-art" style="${th ? `background-image:url('${th}')` : ''}"></span><span class="bk-shade"></span><span class="bk-num">${bi + 1}</span>
        <span class="bk-faces">${fs.map(f => `<img alt="" src="${portraitFor(f)}">`).join('')}</span><span class="bk-name">${BOOK_TITLES[bi]}</span><span class="bk-sub">${as.length} arenas · ${FIGHTERS.filter(f => f.bookId === id).length} fighters</span></button>`; }).join('');
    $$('#ar-books .bk').forEach(c => c.onclick = () => { clickSfx(); toArena(+c.dataset.bi); });
  } else {
    $('#ar-kick').textContent = `Book ${book + 1}`; $('#ar-title').textContent = BOOK_TITLES[book];
    ars.innerHTML = arenasOfBook(book).map(a => { const th = arenaThumb(a);
      return `<button class="ar ${settings.arena === a.id ? 'on' : ''}" data-a="${a.id}" data-nav><span class="ar-art" style="${th ? `background-image:url('${th}')` : ''}"></span><span class="ar-shade"></span><span class="ar-name">${a.name}</span><span class="ar-blurb">${a.blurb}</span><span class="ar-go">Fight here →</span></button>`; }).join('');
    $$('#ar-arenas .ar').forEach(c => c.onclick = () => { clickSfx(); settings.arena = c.dataset.a; save(); toSelect(); });
  }
  setTimeout(() => { const t = $(book === null ? '#ar-books .bk' : '#ar-arenas .ar'); t && t.focus({ preventScroll: true }); }, 30);
}
$('#ar-back').onclick = () => { clickSfx(); if (arBook !== null) toArena(null); else toWelcome(); };

// ---- Fighter select (all 70) ----
function toSelect() {
  show('select'); hideAslan(); drawSteps();
  const books = ['all', ...BOOK_IDS];
  $('#sel-book').innerHTML = books.map(b => `<button data-b="${b}" data-nav class="${b === selBook ? 'on' : ''}">${b === 'all' ? 'All 70' : BOOK_SHORT[b]}</button>`).join('');
  $$('#sel-book button').forEach(b => b.onclick = () => { clickSfx(); selBook = b.dataset.b; toSelect(); });
  const list = FIGHTERS.filter(f => selBook === 'all' || f.bookId === selBook);
  if (!FIGHTERS.find(f => f.id === settings.fighter)) settings.fighter = FIGHTERS[0].id;
  $('#grid').innerHTML = list.map(f => `<div class="card ${f.id === settings.fighter ? 'on' : ''}" data-id="${f.id}" data-nav tabindex="0" role="button"><img alt="" data-id="${f.id}"><div>${f.name}</div></div>`).join('');
  $$('#grid .card').forEach(c => c.onclick = () => { clickSfx(); settings.fighter = c.dataset.id; save(); $$('#grid .card').forEach(x => x.classList.toggle('on', x === c)); selectInfo(); });
  const imgs = $$('#grid img'); let k = 0;
  const step = () => { for (let n = 0; n < 6 && k < imgs.length; n++, k++) { const f = FIGHTERS.find(x => x.id === imgs[k].dataset.id); imgs[k].src = portraitFor(f); } if (k < imgs.length && screen === 'select') requestAnimationFrame(step); };
  step();
  const ad = ARENAS.find(a => a.id === settings.arena) || ARENAS[0], th = arenaThumb(ad);
  $('#sel-arena-art').style.backgroundImage = th ? `url('${th}')` : ''; $('#sel-arena-name').textContent = ad.name;
  selectInfo(); setScene(previewScene); requestAnimationFrame(updatePreviewOffset);
  setTimeout(() => { const on = $('#grid .card.on'); on && on.scrollIntoView({ block: 'nearest' }); }, 30);
}
function selectInfo() {
  const f = FIGHTERS.find(x => x.id === settings.fighter);
  $('#si-name').textContent = f.name; $('#si-book').textContent = f.book; $('#si-bio').textContent = f.bio;
  $('#si-moves').innerHTML = ['main', 'combo1', 'combo2', 'power', 'signature', 'flying', 'recover'].map(s => `<tr class="${s === 'signature' ? 'sigrow' : ''}"><td>${IS_TOUCH ? SLOT_INFO[s].icon : SLOT_INFO[s].key} ${SLOT_INFO[s].label}</td><td>${f.moves[s].name}</td><td>${f.moves[s].desc}</td></tr>`).join('');
  setPreviewFighter(f);
}
$('#sel-back').onclick = () => { clickSfx(); toArena(Math.max(0, Math.floor(ARENAS.findIndex(a => a.id === settings.arena) / 2))); };
$('#sel-arena-change').onclick = $('#sel-back').onclick;
$('#btn-sel-next').onclick = () => { clickSfx(); toOpps(true); };

// ---- Opponents: how many (1-5), random or hand-picked ----
let oppRoll = [], opBook = 'all';
const clampN = (n) => Math.max(1, Math.min(5, +n || 5));
function oppIds(me, forced, n = clampN(settings.opps)) { // the opponent ids for this round (always exactly N, unique, never the player's fighter)
  const valid = new Set(FIGHTERS.map(f => f.id)); valid.delete(me);
  let ids = forced ? forced.filter(x => valid.has(x)) : settings.oppMode === 'pick' ? (settings.oppPick || []).filter(x => valid.has(x)) : oppRoll.filter(x => valid.has(x));
  ids = [...new Set(ids)].slice(0, n); const rest = [...valid].filter(x => !ids.includes(x)).sort(() => Math.random() - 0.5);
  while (ids.length < n && rest.length) ids.push(rest.pop()); return ids;
}
function toOpps(fresh) {
  show('opps'); hideAslan(); drawSteps(); setScene(previewScene); settings.opps = clampN(settings.opps); settings.oppMode ||= 'random'; settings.oppPick = (settings.oppPick || []).filter(x => x !== settings.fighter);
  if (fresh || oppRoll.length !== settings.opps || oppRoll.includes(settings.fighter)) { oppRoll = []; oppRoll = oppIds(settings.fighter); }
  renderOpps(); setTimeout(() => { const t = $('#op-mode button.on') || $('#op-mode button'); t && t.focus({ preventScroll: true }); }, 30);
}
function renderOpps() {
  const n = settings.opps, me = FIGHTERS.find(f => f.id === settings.fighter), pick = settings.oppMode === 'pick';
  $('#op-count').innerHTML = [1, 2, 3, 4, 5].map(i => `<button data-n="${i}" data-nav class="${i === n ? 'on' : ''}">${i}</button>`).join('');
  $$('#op-count button').forEach(b => b.onclick = () => { clickSfx(); settings.opps = +b.dataset.n; if (pick) settings.oppPick = settings.oppPick.slice(0, settings.opps); else oppRoll = oppIds(settings.fighter); save(); renderOpps(); });
  $('#op-total').textContent = `${n + 1} fighters in the arena (you + ${n})`;
  $$('#op-mode button').forEach(b => { b.classList.toggle('on', b.dataset.v === settings.oppMode); b.onclick = () => { clickSfx(); settings.oppMode = b.dataset.v; save(); if (settings.oppMode === 'random') oppRoll = oppIds(settings.fighter); renderOpps(); }; });
  $('#op-roll').classList.toggle('hidden', pick); $('#op-pick').classList.toggle('hidden', !pick);
  $('#op-me').innerHTML = `<img alt="" src="${portraitFor(me)}"><span>You: <b>${me.name.replace(/ \(.*\)/, '')}</b></span>`;
  const ready = pick ? settings.oppPick.length === n : true;
  if (!pick) {
    $('#op-roll').innerHTML = oppRoll.map(id => { const f = FIGHTERS.find(x => x.id === id); return `<div class="rc"><img alt="" src="${portraitFor(f)}"><div>${f.name.replace(/ \(.*\)/, '')}</div><small>${BOOK_SHORT[f.bookId]}</small></div>`; }).join('') + `<button class="shuffle" id="op-shuffle" data-nav>🎲<span>Shuffle</span></button>`;
    $('#op-shuffle').onclick = () => { clickSfx(); oppRoll = oppIds(settings.fighter, []); renderOpps(); };
    $('#op-status').textContent = `${n} random opponent${n > 1 ? 's' : ''} ready`;
  } else {
    const books = ['all', ...BOOK_IDS];
    $('#op-book').innerHTML = books.map(b => `<button data-b="${b}" data-nav class="${b === opBook ? 'on' : ''}">${b === 'all' ? 'All' : BOOK_SHORT[b]}</button>`).join('');
    $$('#op-book button').forEach(b => b.onclick = () => { clickSfx(); opBook = b.dataset.b; renderOpps(); });
    const list = FIGHTERS.filter(f => f.id !== me.id && (opBook === 'all' || f.bookId === opBook));
    $('#op-grid').innerHTML = list.map(f => { const k = settings.oppPick.indexOf(f.id); return `<div class="card ${k >= 0 ? 'on' : ''}" data-id="${f.id}" data-nav tabindex="0" role="button">${k >= 0 ? `<span class="badge">${k + 1}</span>` : ''}<img alt="" src="${portraitFor(f)}"><div>${f.name}</div></div>`; }).join('');
    $$('#op-grid .card').forEach(c => c.onclick = () => {
      const id = c.dataset.id, k = settings.oppPick.indexOf(id);
      if (k >= 0) settings.oppPick.splice(k, 1); else if (settings.oppPick.length < n) settings.oppPick.push(id); else { $('#op-status').textContent = `That's all ${n} - tap a chosen fighter to swap it out`; $('#op-status').classList.remove('flash'); void $('#op-status').offsetWidth; $('#op-status').classList.add('flash'); return; }
      clickSfx(); save(); const keep = $('#op-grid').scrollTop; renderOpps(); $('#op-grid').scrollTop = keep; const again = $(`#op-grid .card[data-id="${id}"]`); again && again.focus({ preventScroll: true });
    });
    const left = n - settings.oppPick.length; $('#op-status').textContent = left > 0 ? `Pick ${left} more (${settings.oppPick.length} of ${n} chosen)` : `All ${n} chosen - ready!`;
  }
  const fb = $('#btn-op-fight'); fb.disabled = !ready; fb.classList.toggle('dim', !ready);
}
$('#op-back').onclick = () => { clickSfx(); toSelect(); };
$('#btn-op-fight').onclick = () => { if ($('#btn-op-fight').disabled) return; clickSfx(); startRound(); };

// ---- keyboard / controller navigation for every pre-fight screen (arrows move between cards, Enter picks, Esc goes back) ----
const FLOW_SCREENS = ['welcome', 'arena', 'select', 'opps'];
addEventListener('keydown', e => {
  if (!FLOW_SCREENS.includes(screen)) return;
  document.body.classList.add('kb');
  if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); const back = { welcome: null, arena: '#ar-back', select: '#sel-back', opps: '#op-back' }[screen]; back && $(back).click(); return; }
  const dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
  if (dir) {
    e.preventDefault(); const els = $$(`#s-${screen} [data-nav]`).filter(x => x.offsetParent && !x.disabled); if (!els.length) return;
    let cur = els.includes(document.activeElement) ? document.activeElement : els.find(x => x.classList.contains('on')) || els[0];
    if (cur !== document.activeElement && !els.includes(document.activeElement)) { cur.focus({ preventScroll: false }); return; }
    const c = cur.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2; let best = null, bs = 1e9;
    for (const x of els) { if (x === cur) continue; const r = x.getBoundingClientRect(), dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy; const along = dx * dir[0] + dy * dir[1]; if (along < 4) continue; const side = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0]); const sc = along + side * 2.2; if (sc < bs) { bs = sc; best = x; } }
    if (best) { best.focus({ preventScroll: true }); best.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.matches('[data-nav]')) { e.preventDefault(); document.activeElement.click(); }
});
addEventListener('pointerdown', () => document.body.classList.remove('kb'), true);

// ---------- preview scene (title / math / select background) ----------
const previewScene = new THREE.Scene();
const previewBgColor = new THREE.Color(0x1b2440), previewFog = new THREE.Fog(0x1b2440, 12, 40); previewScene.background = previewBgColor; previewScene.fog = previewFog;
const lowpoly = new THREE.Group(); previewScene.add(lowpoly); // the low-poly stage (pedestal, lamp, snow, trees): hidden while the painted menu background is showing
previewScene.add(new THREE.HemisphereLight(0xcfe0ff, 0x203050, 1.2));
const pKey = new THREE.SpotLight(0xffe8b0, 60, 30, 0.5, 0.5); pKey.position.set(3, 9, 6); pKey.castShadow = true; previewScene.add(pKey);
const ped = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.5, 32), new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.6 })); ped.position.y = -0.25; ped.receiveShadow = true; lowpoly.add(ped);
const lamp = new THREE.Group(); { const m = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: .6, roughness: .4 }); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 5, 8), m); post.position.y = 2.5; lamp.add(post);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffe0a0, emissive: 0xffc060, emissiveIntensity: 2 })); glow.position.y = 5.2; lamp.add(glow); const pl = new THREE.PointLight(0xffc070, 20, 12); pl.position.y = 5.2; lamp.add(pl); }
lamp.position.set(-4, 0, -4); lowpoly.add(lamp);
const snowG = new THREE.BufferGeometry(); { const a = new Float32Array(600 * 3); for (let i = 0; i < 600; i++) { a[i * 3] = (Math.random() - .5) * 30; a[i * 3 + 1] = Math.random() * 14; a[i * 3 + 2] = (Math.random() - .5) * 20 - 3; } snowG.setAttribute('position', new THREE.BufferAttribute(a, 3)); }
lowpoly.add(new THREE.Points(snowG, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.8 })));
for (let i = 0; i < 18; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.9 + Math.random(), 4 + Math.random() * 3, 7), new THREE.MeshStandardMaterial({ color: 0x2a4a3a, flatShading: true })); const a = Math.PI * (0.9 + Math.random() * 1.2); t.position.set(Math.cos(a) * (9 + Math.random() * 6), 2, Math.sin(a) * 6 - 8); lowpoly.add(t); }
// soft contact shadow so the preview fighter does not float on the painted background
const menuBlob = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.1), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, fog: false, map: (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(64, 32, 0, 64, 32, 62); r.addColorStop(0, 'rgba(0,0,0,0.6)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.setTransform(1, 0, 0, 0.5, 0, 16); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })() })); menuBlob.rotation.x = -Math.PI / 2; menuBlob.position.y = 0.02; menuBlob.visible = false; previewScene.add(menuBlob);
let previewRig = null, previewBB = null, previewToken = 0;
function setPreviewFighter(f) {
  if (previewRig) previewScene.remove(previewRig.root); if (previewBB) { previewScene.remove(previewBB.root); previewBB = null; }
  previewRig = buildPlaceholder(f); previewRig.root.traverse(o => { if (o.isMesh) o.castShadow = true; }); previewScene.add(previewRig.root);
  const tok = ++previewToken; if (artPaths(f).side) makeBillboard({ ...f, art: { ...f.art, side: f.art.action || f.art.side } }, 3.6, { only: ['side'] }).then(bb => { if (bb && tok === previewToken) { previewBB = bb; previewRig.root.visible = false; previewScene.add(bb.root); applyPreviewVis(); } });
}
function updatePreviewOffset() {
  if (screen === 'select') { const L = $('.sel-left').getBoundingClientRect(), R = $('.sel-right').getBoundingClientRect(); const cx = (L.right + R.left) / 2; camera.setViewOffset(innerWidth, innerHeight, (innerWidth / 2 - cx), 0, innerWidth, innerHeight); }
  else camera.clearViewOffset();
}

// ---------- ROUND ----------
let world = null, player = null, arenaScene = null, activeScene = previewScene, roundOver = false, arenaDef = null, arena = null;
function setScene(s) { activeScene = s; if (s === previewScene) updatePreviewOffset(); syncMenuBg(); }
function disposeScene(s) { s?.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => { m.map?.dispose?.(); m.dispose(); }); }); }
const texLoader = new THREE.TextureLoader();
let roundTok = 0;
function startRound(forceArena, forceFighter, forceOpps) {
  const tok = ++roundTok; resetProgress(); window.__nmb.roundStart = performance.now(); window.__nmb.roundReady = null; window.__nmb.loadBytes = null;
  if (world) { world.fighters.forEach(f => f.dispose()); world.clearScene(); } if (fx) fx.dispose(); if (arenaScene) disposeScene(arenaScene);
  arenaScene = new THREE.Scene(); fx = new FX(arenaScene);
  arenaDef = forceArena ? ARENAS.find(a => a.id === forceArena) : settings.arena === 'random' ? ARENAS[Math.floor(Math.random() * ARENAS.length)] : ARENAS.find(a => a.id === settings.arena) || ARENAS[0];
  setArenaArt(MANIFEST); arena = buildArena(arenaDef.id, arenaScene); const arenaP = arena.loadArt(MANIFEST, texLoader).then(u => { if (u) console.info('[art] arena layers used:', arenaDef.id); }, () => {});
  if (renderer.shadowMap.enabled && quality.level >= 2) arena.sun.castShadow = false; else if (quality.level === 1) arena.sun.shadow.mapSize.set(1024, 1024);
  const lvl = AI_LEVELS[settings.diff];
  world = new World(arenaScene, arena, fx, {}); world.grade = arena.grade || null;
  const me = FIGHTERS.find(f => f.id === (forceFighter || settings.fighter));
  const oppList = Array.isArray(forceOpps) ? oppIds(me.id, forceOpps, Math.max(1, Math.min(5, forceOpps.length))) : typeof forceOpps === 'number' ? oppIds(me.id, [], clampN(forceOpps)) : forceFighter ? oppIds(me.id, [], 5) : oppIds(me.id, null);
  const pool = oppList.map(id => FIGHTERS.find(f => f.id === id));
  inputState.queue.length = 0; inputState.mx = inputState.my = 0;
  player = new Fighter(me, world, { isPlayer: true, lives: 3, power: gateBonus.power, hpMul: gateBonus.hpMul, controller: new LocalController(inputState) });
  world.fighters.push(player);
  pool.forEach(cfg => world.fighters.push(new Fighter(cfg, world, { controller: new AIController(lvl), lives: 2, dmgMul: lvl.dmgMul })));
  const order = world.fighters.slice().sort(() => Math.random() - 0.5); const sp = arena.spawns.slice(); const SPI = { 2: [1, 4], 3: [0, 2, 5], 4: [0, 2, 3, 5], 5: [0, 1, 3, 4, 5], 6: [0, 1, 2, 3, 4, 5] }[order.length] || [0, 1, 2, 3, 4, 5]; order.forEach((f, i) => { f.spawn(sp[SPI[i]].x, 0.01, 2.2); });
  player.invuln = 3; fx.setScale(renderer.domElement.height / (2 * Math.tan(FOV * Math.PI / 360)));
  camState.init = false; roundOver = false; hideAslan();
  // loading screen: only this arena's layers and these six fighters' poses are fetched (progress counts every texture queued above)
  $('#load-title').textContent = arenaDef.name; $('#load-sub').textContent = `Gathering ${world.fighters.length} fighters…`; $('#load-bar').style.width = '0%'; show('load');
  const tick = () => { if (tok !== roundTok || screen !== 'load') return; const p = progress.total ? progress.done / progress.total : 0; $('#load-bar').style.width = Math.round(p * 100) + '%'; $('#load-pct').textContent = progress.total ? `${progress.done} of ${progress.total}` : ''; requestAnimationFrame(tick); }; tick();
  const timeout = new Promise(res => setTimeout(res, 30000));
  Promise.race([Promise.all([arenaP, ...world.fighters.map(f => f.artPromise)]), timeout]).then(() => {
    if (tok !== roundTok) return;
    $('#load-bar').style.width = '100%'; fx.setScale(renderer.domElement.height / (2 * Math.tan(FOV * Math.PI / 360)));
    setScene(arenaScene); show('fight'); buildHUD(); buildTouch();
    banner(arenaDef.name, 2.2); setTimeout(() => { if (screen === 'fight' && !roundOver) { banner('FIGHT!', 1.0); sfx.go(); } }, 2300);
    aslan('arenaIntro', 5); startMusic(arena.music);
    window.__nmb.roundReady = performance.now(); window.__nmb.loadMs = Math.round(window.__nmb.roundReady - window.__nmb.roundStart); window.__nmb.loadTextures = progress.total;
  });
}
function endRound(win) {
  if (roundOver) return; roundOver = true;
  setTimeout(() => {
    show('end'); $('#end-title').textContent = win ? 'Victory!' : 'Defeat';
    const kos = player.stats.kos; $('#end-text').innerHTML = win ? `${player.cfg.name} is the last one standing in ${arenaDef.name}! Knockouts: ${kos}.` : `${player.cfg.name} is out of lives. Knockouts: ${kos}. Solve ${GATE.total} more problems to fight again.`;
    if (win) { sfx.win(); aslan('victory', 8); } else { sfx.lose(); aslan('defeat', 8); }
    settings.round++; settings.lastWin = win; save(); startMusic('mystic');
  }, 1600);
}
$('#btn-next-round').onclick = () => { sfx.click(); startMath(settings.lastWin ? 'betweenRounds' : 'playAgain'); };
$('#btn-menu').onclick = () => { sfx.click(); toTitle(); };

// ---------- HUD ----------
let bannerT = 0;
function banner(text, secs = 1.5) { const b = $('#banner'); b.textContent = text; b.classList.add('show'); clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove('show'), secs * 1000); }
let toastT = 0;
function toast(text, secs = 2) { $('#toast').textContent = text; clearTimeout(toastT); toastT = setTimeout(() => $('#toast').textContent = '', secs * 1000); }
const ML_SLOTS = ['main', 'combo1', 'combo2', 'power', 'signature', 'flying', 'jump', 'high', 'block', 'recover'];
function moveName(s) { const m = player.cfg.moves; return s === 'jump' ? 'Jump' : s === 'high' ? 'High Jump' : s === 'block' ? 'Block / Dodge' : m[s].name; }
const portraitUrl = (cfg) => MANIFEST.portraits?.[cfg.id] ? assetUrl(MANIFEST.portraits[cfg.id]) : null;  // art head crop made by sync-art.sh
const portraitFor = (cfg) => portraitUrl(cfg) || artUrl(cfg.art.action) || artUrl(cfg.art.side) || artUrl(cfg.art.front) || portrait(cfg);
function buildHUD() {
  const order = [player, ...world.fighters.filter(f => !f.isPlayer)];
  $('#hud-strip').innerHTML = order.map(f => `<div class="pc ${f.isPlayer ? 'me' : ''}" data-id="${f.id}"><div class="portrait" style="background-image:url('${portraitFor(f.cfg)}')"></div><div class="pi"><div class="n">${f.cfg.name.replace(/ \(.*\)/, '')}</div><div class="pct">0<small>%</small></div><div class="lv"></div>${f.isPlayer ? '<div class="bar pw"><i></i><span>POWER</span></div>' : ''}<div class="bar sg"><i></i><span>SIGNATURE</span></div></div></div>`).join('');
  $('#movelist').innerHTML = `<div class="t">${player.cfg.name.replace(/ \(.*\)/, '')} · moves${IS_TOUCH ? '' : ' (Tab = details)'}</div>` + ML_SLOTS.map(s => `<div class="r"><kbd>${IS_TOUCH ? SLOT_INFO[s].icon : SLOT_INFO[s].key}</kbd><span>${moveName(s)}</span></div>`).join('');
  $('#ml-table').innerHTML = ML_SLOTS.map(s => `<tr><td>${SLOT_INFO[s].key} · ${SLOT_INFO[s].touch}</td><td>${moveName(s)}</td><td>${['jump', 'high', 'block'].includes(s) ? SLOT_INFO[s].label : player.cfg.moves[s].desc}</td></tr>`).join('');
  $('#cam-hint').textContent = IS_TOUCH ? 'Stick: move · flick up to jump · hold down to drop through platforms' : 'A/D or ←/→ move · W/↑ or Space jump · S/↓ drop through · wheel zooms';
}
const hudCache = {};
function updateHUD() {
  for (const f of world.fighters) {
    const el = hudCache[f.id] ||= document.querySelector(`.pc[data-id="${f.id}"]`); if (!el) continue; const c = el._c ||= { pct: el.querySelector('.pct'), lv: el.querySelector('.lv'), pw: el.querySelector('.pw i'), pwb: el.querySelector('.pw'), sg: el.querySelector('.sg i'), sgb: el.querySelector('.sg'), last: -1, lastL: -1 };
    const p = Math.round(f.pct); if (p !== c.last) { c.pct.firstChild.nodeValue = p; c.pct.style.color = `hsl(${Math.max(0, 55 - p * 0.42)}, 95%, ${Math.max(52, 96 - p * 0.18)}%)`; if (c.last >= 0 && p > c.last) { c.pct.classList.remove('bump'); void c.pct.offsetWidth; c.pct.classList.add('bump'); } c.last = p; }
    const l = f.dead ? -1 : f.lives; if (l !== c.lastL) { c.lv.innerHTML = f.dead ? '<span class="out">OUT</span>' : '<i></i>'.repeat(Math.max(0, f.lives)) + '<i class="x"></i>'.repeat(Math.max(0, f.maxLives - f.lives)); c.lastL = l; }
    el.classList.toggle('out', f.dead); el.classList.toggle('ko', f.state === 'ko');
    if (c.pw) { c.pw.style.width = f.power + '%'; c.pwb.classList.toggle('full', f.power >= 100); }
    if (c.sg) { c.sg.style.width = f.sigMeter + '%'; const full = f.sigMeter >= 100; c.sgb.classList.toggle('full', full); el.classList.toggle('sigready', full); if (full !== c.sigFull) { c.sigFull = full; c.sgb.querySelector('span').textContent = full ? (f.isPlayer && !IS_TOUCH ? 'SIGNATURE · P' : 'SIGNATURE!') : 'SIGNATURE'; } }
  }
  const sb = document.querySelector('.tb[data-a="signature"]'); if (sb) { const full = player.sigMeter >= 100 && !player.dead; sb.classList.toggle('ready', full); sb.style.setProperty('--p', Math.round(Math.min(100, player.sigMeter)) + '%'); }
  const pb = document.querySelector('.tb[data-a="power"]'); if (pb) pb.classList.toggle('ready', player.power >= 100);
  const rb = document.querySelector('.tb[data-a="recover"]'); if (rb) rb.classList.toggle('pulse', !player.onGround && !player.recoverUsed && player.pos.y < -1);
}
let sigBannerT = 0;
function handleEvents() {
  for (const e of world.events) {
    if (e.type === 'toast') toast(e.text);
    if (e.type === 'ko') { if (e.f.isPlayer) banner('Knocked out!', 1.4); else toast(`${e.f.cfg.name} is knocked out${e.by ? ' by ' + e.by.cfg.name : ''}!`); }
    if (e.type === 'lifeLost' && e.f.isPlayer) toast(e.f.lives > 0 ? `You lost a life! ${e.f.lives} left.` : 'No lives left!', 2.5);
    if (e.type === 'out' && !e.f.isPlayer) toast(`${e.f.cfg.name} is out of the round!`, 2.2);
    if (e.type === 'signature') { const d = e.def, b = $('#sig-banner'); b.querySelector('.sn').textContent = d.name; b.querySelector('.sw').textContent = e.f.cfg.name.replace(/ \(.*\)/, ''); b.style.setProperty('--sc', '#' + d.c.toString(16).padStart(6, '0')); b.style.setProperty('--sc2', '#' + d.c2.toString(16).padStart(6, '0')); b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); clearTimeout(sigBannerT); sigBannerT = setTimeout(() => b.classList.remove('show'), 1700); }
    if (e.type === 'sigReady' && e.f.isPlayer) toast(IS_TOUCH ? 'SIGNATURE ready! Tap the glowing button.' : 'SIGNATURE ready! Press P.', 2.4);
    if (e.type === 'power' && e.f.isPlayer) banner(e.f.cfg.moves.power.name + '!', 1.2);
    if (e.type === 'stun' && e.f.isPlayer) toast(`${e.by.cfg.name} froze you!`, 1.4);
    if (e.type === 'respawn' && e.f.isPlayer) toast('Back in! You are protected for a moment.', 1.6);
  }
  world.events.length = 0;
  if (!roundOver) {
    if (player.dead) endRound(false);
    else if (world.fighters.every(f => f.isPlayer || f.dead)) { banner('VICTORY!', 2); endRound(true); }
  }
}

// ---------- camera: side view that pans and zooms to keep every fighter in frame ----------
const camState = { init: false, x: 0, y: 4, d: 30, zoomBias: 1, shx: 0, shy: 0 }; const tanH = Math.tan(FOV * Math.PI / 360);
function updateCamera(dt, realDt) {
  if (activeScene === previewScene) {
    const t = performance.now() / 1000;
    if (screen === 'select') { camera.position.set(0, IS_TOUCH ? 2.4 : 2.2, IS_TOUCH ? 10.5 : 7.2); camera.lookAt(0, IS_TOUCH ? 1.15 : 1.1, 0); if (previewRig) { previewRig.root.rotation.y = t * 0.6; animateRig(previewRig, { mode: 'idle', speed: 0 }, t); } if (previewBB) previewBB.root.position.y = Math.sin(t * 2) * 0.03; }
    else { camera.position.set(Math.sin(t * 0.05) * 2, 2.6, 9); camera.lookAt(0, 1.4, 0); if (previewRig) { previewRig.root.rotation.y = 0.4 + Math.sin(t * 0.4) * 0.3; animateRig(previewRig, { mode: 'idle', speed: 0 }, t); } if (previewBB) previewBB.root.position.y = Math.sin(t * 2) * 0.03; }
    const showF = !['welcome', 'arena', 'opps'].includes(screen); if (previewBB) previewBB.root.visible = showF; if (previewRig) previewRig.root.visible = showF && !previewBB; if (!showF) menuBlob.visible = false;
    const p = snowG.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) - dt * 0.8; if (y < 0) y = 14; p.setY(i, y); } p.needsUpdate = true;
    return;
  }
  const B = arena.blast, hw = arena.halfW; let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9, n = 0;
  const live = []; for (const f of world.fighters) { if (f.dead || f.state === 'ko') continue; n++; live.push({ f, x: Math.max(B.l + 8, Math.min(B.r - 8, f.pos.x)), y: Math.max(B.b + 4, Math.min(B.t - 4, f.pos.y)) }); }
  const extent = (list) => { let a = 1e9, b = -1e9, c = 1e9, e = -1e9; for (const o of list) { a = Math.min(a, o.x - o.f.radius); b = Math.max(b, o.x + o.f.radius); c = Math.min(c, o.y); e = Math.max(e, o.y + o.f.height); } return { minx: a, maxx: b, miny: c, maxy: e }; };
  if (n) ({ minx, maxx, miny, maxy } = extent(live)); else { minx = -6; maxx = 6; miny = 0; maxy = 4; }
  if (world.focusT > 0 && world.focus && !world.focus.dead) { world.focusT -= dt; const f = world.focus; if (world.cine || f.sigArmor) { minx = f.pos.x - 2.2; maxx = f.pos.x + 2.2; miny = f.pos.y - 0.2; maxy = f.pos.y + f.height + 0.3; } else { minx = f.pos.x - 6; maxx = f.pos.x + 6; miny = f.pos.y - 1; maxy = f.pos.y + f.height + 2; } }
  // framing: a 1.8 m fighter is ~22-25% of the screen height when fighters are close; it zooms out smoothly as they spread or jump high.
  // In the art arenas the zoom-out stops at WIDE_D (a 1.8 m fighter stays ~15% of the height): if everyone spread further than that, the frame follows the player and the nearest foes instead of all six.
  const tight = !!(world.cine || (world.focus?.sigArmor && world.focusT > 0)), aspect = camera.aspect, art = !!arena.artArena, pad = art ? 1.2 : 1.9, minW = tight ? 4.4 : art ? 10 : 13, minH = tight ? 3.4 : art ? 6.4 : 8, padH = tight ? 1.6 : art ? 3.8 : 5, WIDE_D = 16.5;
  const fit = (e) => { const w = Math.max(e.maxx - e.minx + pad * 2, minW), h = Math.max(e.maxy - e.miny + padH, minH); return Math.max(h / 2 / tanH, w / 2 / (tanH * aspect)); };
  let d = fit({ minx, maxx, miny, maxy }), fx0 = minx, fx1 = maxx, fy0 = miny, fy1 = maxy;
  if (art && d > WIDE_D && live.length > 3 && !(world.focusT > 0)) {
    const anchor = live.find(o => o.f.isPlayer) || live[0]; const near = live.slice().sort((p, q) => Math.abs(p.x - anchor.x) - Math.abs(q.x - anchor.x)).slice(0, 4); const e = extent(near);
    d = Math.max(fit(e), Math.min(d, WIDE_D)); ({ minx: fx0, maxx: fx1, miny: fy0, maxy: fy1 } = e); minx = fx0; maxx = fx1; miny = fy0; maxy = fy1;
  }
  const maxD = art ? 22 : Math.max(26, (hw + 6) / (tanH * aspect)) * 1.15; d = Math.min(maxD, Math.max(world.focusT > 0 ? (tight ? 4.6 : 9.4) : art ? 10.2 : 11.5, d));
  d *= camState.zoomBias;
  const tx = (minx + maxx) / 2, ty = art ? Math.max(0.52 * camState.d * tanH, (miny + maxy) / 2 + 0.5) : Math.max(2.4, (miny + maxy) / 2 + 0.6);
  if (!camState.init) { camState.x = tx; camState.y = ty; camState.d = d; camState.tx = tx; camState.ty = ty; camState.td = d; camState.init = true; }
  // follow with dead bands: tiny movements of the fighters (walking, running, landing, small hops) never move or zoom the camera; only real changes in where the group is do, and then smoothly
  if (Math.abs(tx - camState.tx) > 0.7) camState.tx = tx; if (Math.abs(ty - camState.ty) > 0.8) camState.ty = ty; if (Math.abs(d - camState.td) > 0.9 || world.focusT > 0) camState.td = d;
  const fast = world.cine || (world.focus?.sigArmor && world.focusT > 0), k = 1 - Math.exp(-realDt * (fast ? 7 : 2.4)), k2 = 1 - Math.exp(-realDt * (fast ? 6 : 2.2)); camState.x += (camState.tx - camState.x) * k; camState.y += (camState.ty - camState.y) * k; camState.d += (camState.td - camState.d) * k2;
  // juice: shake, zoom punch, small kick toward the hit
  const sh = world.shake, kx = world.kick.x, ky = world.kick.y; world.kick.x *= Math.exp(-realDt * 6); world.kick.y *= Math.exp(-realDt * 6);
  camState.shx = (Math.random() - 0.5) * sh * 0.8; camState.shy = (Math.random() - 0.5) * sh * 0.8;
  const dist = camState.d * (1 - 0.14 * world.punch), vis = dist * tanH;
  let cx = camState.x + camState.shx + kx * 0.5; const cy = camState.y - (art ? 0 : vis * 0.13) + camState.shy + ky * 0.3;
  if (art) { const lim = Math.max(0, (arena.artHalfW - vis * aspect) / 1.08); cx = Math.max(-lim, Math.min(lim, cx)); }
  camera.position.set(cx, cy + dist * 0.09, dist); camera.lookAt(cx, cy, 0); if (arena.updateCam) arena.updateCam(cx, cy, dist); camera.rotation.z += (Math.random() - 0.5) * sh * 0.01;
  $('#flash').style.opacity = world.flashScreen > 0 ? Math.min(0.22, world.flashScreen * 0.4) : 0;
}
canvas.addEventListener('wheel', e => { if (screen === 'fight') { camState.zoomBias = Math.max(0.8, Math.min(1.3, camState.zoomBias + e.deltaY * 0.0006)); e.preventDefault(); } }, { passive: false });

// ---------- keyboard ----------
const keys = {}; let upPrev = false;
addEventListener('keydown', e => {
  if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  tapAudio();
  if (screen === 'math') {
    if (/^\d$/.test(e.key)) padKey(e.key); else if (e.key === 'Backspace') padKey('back'); else if (e.key === 'Enter') { e.preventDefault(); padKey('enter'); }
    else if (e.code === 'Tab' || e.key === 'r' || e.key === 'R' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') padKey('switch'); else if (e.key === 'Escape') padKey('clear');
    return;
  }
  if (screen === 'moves' && (e.code === 'Tab' || e.code === 'Escape')) { show(prevScreen); if (prevScreen === 'fight') paused = false; return; }
  if (screen === 'pause' && e.code === 'Escape') { resume(); return; }
  if (FLOW_SCREENS.includes(screen)) { if (e.key === 'Enter' && !(document.activeElement && document.activeElement.matches('[data-nav]'))) { const b = document.querySelector(`#s-${screen} .go:not(.hidden):not(:disabled)`); b && b.click(); } return; }
  if (screen !== 'fight') { if (e.key === 'Enter') { const b = document.querySelector(`#s-${screen} .go:not(.hidden)`); b && b.click(); } return; }
  if (e.repeat) { keys[e.code] = true; return; }
  keys[e.code] = true;
  if (e.code === 'Escape') { pause(); return; }
  if (e.code === 'Tab') { prevScreen = 'fight'; show('moves'); paused = true; return; }
  const map = { KeyJ: 'main', KeyK: 'combo1', KeyL: 'combo2', KeyI: 'power', KeyP: 'signature', KeyU: 'flying', KeyR: 'recover' };
  if (map[e.code]) queueAction(map[e.code]);
  if (e.code === 'Space') queueAction(e.shiftKey ? 'high' : 'jump');
  if (e.code === 'KeyO') { if (Math.abs(moveVec().x) > 0.3) inputState.dodge = true; }
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
let prevScreen = 'fight', paused = false;
function queueAction(a) { if (player && !roundOver) inputState.press(a); }
const stick = { x: 0, y: 0, active: false };
function moveVec() {
  let ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0), iy = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
  if (stick.active) { ix = Math.abs(stick.x) < 0.18 ? 0 : stick.x; iy = stick.y; }
  return { x: ix, y: iy };
}
let touchBlock = false;
function pause() { if (screen !== 'fight') return; paused = true; show('pause'); $('#btn-mute').textContent = 'Sound: ' + (isMuted() ? 'Off' : 'On'); }
function resume() { paused = false; show('fight'); }
$('#btn-pause').onclick = () => pause();
$('#btn-resume').onclick = () => resume();
$('#btn-moves').onclick = () => { prevScreen = 'pause'; show('moves'); };
$('#btn-moves-close').onclick = () => { if (prevScreen === 'fight') { paused = false; show('fight'); } else show('pause'); };
$('#btn-quit').onclick = () => { paused = false; roundOver = true; startMath('playAgain'); };
function syncMute() { $('#btn-mute').textContent = 'Sound: ' + (isMuted() ? 'Off' : 'On'); $('#btn-mute-top').textContent = isMuted() ? '🔇' : '🔊'; }
$('#btn-mute').onclick = () => { setMuted(!isMuted()); syncMute(); };
$('#btn-mute-top').onclick = () => { unlockAudio(); setMuted(!isMuted()); syncMute(); };

// ---------- touch controls ----------
const TB = [ // [action, right, bottom, size]
  ['main', 18, 18, 112], ['combo1', 146, 8, 82], ['combo2', 136, 102, 82], ['flying', 46, 146, 82],
  ['power', 8, 242, 74], ['signature', 150, 288, 104], ['jump', 244, 8, 78], ['high', 244, 100, 74], ['block', 146, 194, 74], ['recover', 232, 186, 68],
];
function buildTouch() {
  $('#touch').classList.toggle('hidden', !IS_TOUCH); if (!IS_TOUCH) return;
  $('#tbtns').innerHTML = TB.map(([a, r, b, s]) => `<button class="tb" data-a="${a}" style="right:${r}px;bottom:${b}px;width:${s}px;height:${s}px"><b>${SLOT_INFO[a].icon}</b><small>${a === 'main' ? 'Main' : SLOT_INFO[a].label.replace('Jump / Flying Attack', 'Flying').replace('Block / Dodge', 'Block')}</small><em>${['jump', 'high', 'block'].includes(a) ? '' : player.cfg.moves[a].name}</em></button>`).join('');
  $$('#tbtns .tb').forEach(b => {
    const a = b.dataset.a;
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); b.setPointerCapture(e.pointerId); b.classList.add('down'); unlockAudio();
      if (a === 'block') { touchBlock = true; if (stick.active && Math.abs(stick.x) > 0.5) inputState.dodge = true; } else queueAction(a); });
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

// ---------- adaptive quality (keeps the frame rate steady on slower devices) ----------
const quality = { level: 0, acc: 0, n: 0, fps: 60, bad: 0, locked: params.get('quality') === 'high' };
function qualityTick(realDt) {
  quality.acc += realDt; quality.n++;
  if (quality.n >= 45) { quality.fps = quality.n / quality.acc; quality.acc = 0; quality.n = 0;
    if (!quality.locked && screen === 'fight' && !paused && quality.level < 3) { if (quality.fps < 26) quality.bad++; else quality.bad = 0;
      if (quality.bad >= 2) { quality.bad = 0; quality.level++; if (quality.level === 1) { pixelRatio = Math.min(pixelRatio, 1); resize(); if (arena) arena.sun.shadow.mapSize.set(1024, 1024), arena.sun.shadow.map?.dispose(), arena.sun.shadow.map = null; }
        else if (quality.level === 2) { pixelRatio = Math.min(pixelRatio, 0.75); resize(); if (arena) arena.sun.castShadow = false; arenaScene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => m.needsUpdate = true); }); }
        else { pixelRatio = 0.6; resize(); } console.info('[quality] level', quality.level, 'fps', quality.fps.toFixed(1)); } } }
}

// ---------- loop ----------
let last = performance.now(), acc = 0; const STEP = 1 / 60;
function loop(now) {
  requestAnimationFrame(loop);
  const realDt = Math.min(0.1, (now - last) / 1000); last = now; qualityTick(realDt);
  if (activeScene === arenaScene && world) {
    if (screen === 'fight' && !paused) {
      acc += realDt * (params.get('debug') === '1' ? (window.__nmb.timeScale ?? 1) : 1); let steps = 0;
      while (acc >= STEP && steps < 5) {
        const mv = moveVec(); inputState.mx = mv.x; inputState.my = mv.y; inputState.block = !!keys.KeyO || touchBlock;
        const up = mv.y > 0.7; if (up && !upPrev) inputState.press('jump'); upPrev = up; // flick/tap up = jump
        world.update(STEP); fx.update(STEP); handleEvents(); acc -= STEP; steps++;
      }
      if (acc > STEP * 5) acc = 0;
      updateHUD();
    }
  }
  updateCamera(realDt, realDt);
  renderer.render(activeScene, camera);
}

// ---------- test/debug hooks (read-only state; debug actions only with ?debug=1) ----------
window.__nmb = {
  get screen() { return screen; }, get math() { return M; }, get world() { return world; }, get player() { return player; }, FIGHTERS, ARENAS, settings, quality, audioState, audioLevel,
  state() { return { screen, round: settings.round, fps: +quality.fps.toFixed(1), q: quality.level, player: player && { name: player.cfg.name, pct: Math.round(player.pct), lives: player.lives, power: Math.round(player.power), state: player.state, dead: player.dead, kos: player.stats.kos, pos: player.pos.toArray().map(v => +v.toFixed(2)), onGround: player.onGround, face: player.face, art: !!player.bb },
    foes: world ? world.fighters.filter(f => !f.isPlayer).map(f => ({ name: f.cfg.name, pct: Math.round(f.pct), lives: f.lives, dead: f.dead, state: f.state, dmgDealt: Math.round(f.stats.dmg), pos: [+f.pos.x.toFixed(1), +f.pos.y.toFixed(1)], art: !!f.bb })) : [], arena: arenaDef?.id, cam: { x: +camState.x.toFixed(1), y: +camState.y.toFixed(1), d: +camState.d.toFixed(1) } }; },
};
if (params.get('debug') === '1') Object.assign(window.__nmb, {
  hurtPlayer(n) { player.invuln = 0; player.takeHit(null, { dmg: n, kb: 0, ang: 0, dir: 1 }, world); },
  koFoes() { world.fighters.forEach(f => { if (!f.isPlayer && !f.dead) { f.lives = 1; f.invuln = 0; f.pos.x = world.arena.blast.r + 5; f.lastHitBy = player; f.lastHitAt = world.time; } }); },
  koPlayer() { player.invuln = 0; player.pos.y = world.arena.blast.b - 3; },
  AIController, AI_LEVELS,
  camInfo() { return { x: camera.position.x, y: camera.position.y, z: camera.position.z, rz: camera.rotation.z, shake: world ? world.shake : 0, d: camState.d }; },
  setPower(v) { player.power = v; }, setSig(v, f) { (f || player).sigMeter = v; (f || player).sigReadyCue = v >= 100; }, doSig(f) { return (f || player).doAction('signature', world); }, noInvuln() { player.invuln = 0; }, setPct(f, v) { (f || player).pct = v; },
  toSelect() { toSelect(); }, toTitle() { toTitle(); }, toWelcome() { toWelcome(); }, toArena(b) { toArena(b); }, toOpps(fresh) { toOpps(fresh); }, get oppRoll() { return oppRoll; },
  frac() { const r = []; for (const f of world.fighters) { const a = new THREE.Vector3(f.pos.x, f.pos.y, f.pos.z), b = new THREE.Vector3(f.pos.x, f.pos.y + (f.artH || f.height), f.pos.z); a.project(camera); b.project(camera); r.push({ n: f.cfg.name, h: +f.height.toFixed(2), frac: +((b.y - a.y) / 2).toFixed(3), x: +a.x.toFixed(2) }); } return { d: +camState.d.toFixed(1), fighters: r }; },
  startRound(arenaId, fighterId, opps) { if (arenaId) settings.arena = arenaId; if (fighterId) settings.fighter = fighterId; startRound(undefined, undefined, opps); },
  sim(sec) { const n = Math.round(sec / STEP); for (let i = 0; i < n; i++) { const mv = moveVec(); inputState.mx = mv.x; inputState.my = mv.y; inputState.block = !!keys.KeyO || touchBlock; world.update(STEP); fx.update(STEP); handleEvents(); } updateHUD(); },
  freezeAI(v) { world.fighters.forEach(f => { if (!f.isPlayer) { f._ctl = f._ctl || f.controller; f.controller = v ? { kind: 'idle', sample(ff) { const i = ff.input; i.mx = 0; i.my = 0; i.block = false; i.actions.length = 0; } } : f._ctl; } }); },
  placeFoe(i, x, y) { const f = world.fighters.filter(f => !f.isPlayer)[i]; f.pos.set(x, y, f.laneZ); f.vx = f.vy = 0; return f.cfg.name; },
  setQuality(l) { quality.locked = true; },
  hideHud(v) { document.body.classList.toggle('nohud', v); },
});

// ---------- boot ----------
(async function boot() {
  try { const r = await fetch('art/manifest.json', { cache: 'no-store' }); if (r.ok) MANIFEST = await r.json(); } catch (e) {}
  // the hosted art is WebP with alpha (Safari / iPadOS 14+, Chrome, Firefox): say so plainly on an older browser instead of showing blank fighters
  if (MANIFEST.webp) { const ok = await new Promise(res => { const im = new Image(); im.onload = () => res(im.width === 1); im.onerror = () => res(false); im.src = 'data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA=='; }); if (!ok) { $('#loading').innerHTML = 'This game needs a newer browser (iPadOS 14 / Safari 14 or later) to show its painted art.'; return; } }
  setAssetMode(MANIFEST); setArtRegistry(MANIFEST); applyArtMap(FIGHTERS); attachSignatures(FIGHTERS);
  if (MANIFEST.menuBackground) { // painted menu background (title / select / math): optional, the 3D preview scene stays when the file is missing
    await new Promise(res => { const im = new Image(); const to = setTimeout(res, 6000); im.onload = () => { clearTimeout(to); $('#menu-bg').style.backgroundImage = `url('${assetUrl(MANIFEST.menuBackground)}')`; MENU_BG = true; res(); }; im.onerror = () => { clearTimeout(to); res(); }; im.src = assetUrl(MANIFEST.menuBackground); });
  }
  const ui = MANIFEST.ui || {};
  if (ui.welcomeBg) await new Promise(res => { const im = new Image(), to = setTimeout(res, 6000); im.onload = () => { clearTimeout(to); document.documentElement.style.setProperty('--welcome-bg', `url("${assetUrl(ui.welcomeBg)}")`); document.body.classList.add('has-welcome-bg'); res(); }; im.onerror = () => { clearTimeout(to); res(); }; im.src = assetUrl(ui.welcomeBg); });
  await loadSigArt(MANIFEST);
  if (MANIFEST.aslanPortrait) { const lion = document.querySelector('#aslan .lion'); if (lion) lion.innerHTML = `<img src="${assetUrl(MANIFEST.aslanPortrait)}" alt="Aslan" style="width:100%;height:100%;object-fit:cover;object-position:50% 12%;border-radius:50%;box-shadow:0 0 0 2px #e8b84a,0 2px 10px rgba(0,0,0,.5);background:radial-gradient(#f4d98a,#a8691f)">`; } // the artist's portrait replaces the code-drawn one when it exists syncMute();
  resize(); toTitle(); $('#loading').classList.add('hidden'); requestAnimationFrame(loop);
  if (IS_TOUCH) $('#title-hint').textContent = 'iPad: use the number pad for answers. In battle: joystick on the left, move buttons on the right.';
})();
