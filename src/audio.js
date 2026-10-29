// Procedural audio (Web Audio API only, no files): sound effects + a simple orchestral/ambient music loop per arena style.
// Nothing starts until unlockAudio() is called from a user tap/keypress (iPad rule).
let ctx = null, master = null, sfxBus = null, musBus = null, verb = null, verbSend = null, analyser = null, noiseBuf = null;
let muted = localStorage.getItem('nmb-muted') === '1';
export function unlockAudio() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9;
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.2;
      analyser = ctx.createAnalyser(); analyser.fftSize = 512;
      master.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.85; sfxBus.connect(master);
      musBus = ctx.createGain(); musBus.gain.value = 0.5; musBus.connect(master);
      verb = ctx.createConvolver(); verb.buffer = impulse(2.4, 2.6); verbSend = ctx.createGain(); verbSend.gain.value = 1; verbSend.connect(verb); const vg = ctx.createGain(); vg.gain.value = 0.55; verb.connect(vg); vg.connect(master);
      const len = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ctx = null; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  if (ctx && pendingMusic) { const s = pendingMusic; pendingMusic = null; startMusic(s); }
}
function impulse(sec, decay) { const n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, n, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }
export function setMuted(m) { muted = m; localStorage.setItem('nmb-muted', m ? '1' : '0'); if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05); }
export function isMuted() { return muted; }
export function audioState() { return { started: !!ctx, state: ctx?.state, muted, music: curStyle, level: audioLevel() }; }
export function audioLevel() { if (!analyser) return 0; const a = new Uint8Array(analyser.fftSize); analyser.getByteTimeDomainData(a); let m = 0; for (const v of a) m = Math.max(m, Math.abs(v - 128)); return m / 128; }
const ok = () => ctx && ctx.state === 'running' && !muted;

// ---------- building blocks ----------
function env(g, t, a, d, vol, hold = 0) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + a); if (hold) g.gain.setValueAtTime(vol, t + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + d); }
function out(node, bus, send = 0) { node.connect(bus || sfxBus); if (send) { const s = ctx.createGain(); s.gain.value = send; node.connect(s); s.connect(verbSend); } }
function tone(freq, dur, type = 'sine', vol = 0.15, slide = 0, delay = 0, send = 0.15, bus) {
  if (!ok()) return; const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(25, freq + slide), t + dur);
  env(g, t, 0.006, dur, vol); o.connect(g); out(g, bus, send); o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, vol = 0.2, f0 = 800, type = 'highpass', f1 = 0, q = 1, delay = 0, send = 0.1, attack = 0.004) {
  if (!ok()) return; const t = ctx.currentTime + delay, s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ctx.createGain(); env(g, t, attack, dur, vol); s.connect(f); f.connect(g); out(g, null, send); s.start(t, Math.random()); s.stop(t + dur + 0.1);
}
function metal(base, dur, vol, delay = 0) { [1, 2.76, 5.4, 8.93, 11.34].forEach((m, i) => tone(base * m, dur / (1 + i * 0.5), 'sine', vol / (1 + i * 0.7), 0, delay, 0.25)); }

export const sfx = {
  click: () => { tone(620, 0.06, 'triangle', 0.07, 200); tone(1240, 0.05, 'sine', 0.03); },
  whoosh: (p = 1) => { noise(0.2, 0.1 * p, 500, 'bandpass', 2600, 1.2, 0, 0.1, 0.05); },
  slash: (i = 1) => { noise(0.16, 0.12, 1800, 'bandpass', 5200, 2, 0, 0.12, 0.02); tone(880 * (0.9 + i * 0.1), 0.12, 'sawtooth', 0.025, -400); },
  clang: (v = 1) => { noise(0.05, 0.12 * v, 3500); metal(520 + Math.random() * 120, 0.55, 0.07 * v); },
  hit: (dmg = 8) => { const v = Math.min(1.6, 0.6 + dmg / 14); noise(0.12, 0.22 * v, 700, 'lowpass', 150, 0.8, 0, 0.1); tone(150, 0.14, 'sine', 0.3 * v, -90); tone(300, 0.07, 'square', 0.05 * v, -150); if (dmg > 8) metal(330, 0.35, 0.045 * v); },
  comboA: () => { noise(0.08, 0.16, 3800); metal(980 + Math.random() * 80, 0.35, 0.07); tone(1320, 0.16, 'sine', 0.06, 500); tone(1980, 0.2, 'triangle', 0.035, -300, 0.04); },
  comboB: () => { noise(0.26, 0.26, 900, 'lowpass', 160, 0.8, 0, 0.14); tone(120, 0.32, 'square', 0.1, -70); metal(300, 0.5, 0.09); tone(520, 0.2, 'sawtooth', 0.04, -240, 0.03); },
  comboC: () => { noise(0.45, 0.42, 500, 'lowpass', 70, 0.7, 0, 0.22); tone(80, 0.6, 'sine', 0.5, -40); metal(220, 1.0, 0.11); [0, 0.07, 0.14, 0.21, 0.28].forEach((d, i) => tone(520 * Math.pow(1.26, i), 0.5, 'triangle', 0.05, 40, d + 0.05)); },
  bigHit: () => { noise(0.35, 0.4, 500, 'lowpass', 80, 0.7, 0, 0.2); tone(95, 0.4, 'sine', 0.5, -60); metal(240, 0.9, 0.1); tone(60, 0.6, 'sine', 0.35, -20, 0.02); },
  thud: () => { tone(110, 0.2, 'sine', 0.3, -70); noise(0.1, 0.15, 400, 'lowpass', 100); },
  land: () => { noise(0.08, 0.1, 500, 'lowpass', 120); tone(90, 0.1, 'sine', 0.12, -40); },
  block: () => { metal(740, 0.3, 0.07); noise(0.05, 0.1, 4000); },
  jump: () => { tone(320, 0.16, 'sine', 0.09, 340); noise(0.1, 0.04, 2500, 'bandpass', 4000, 1); },
  arrow: () => { tone(260, 0.12, 'triangle', 0.1, 520); noise(0.14, 0.07, 3000, 'bandpass', 6000, 3); },
  magic: () => { [0, 4, 7, 12, 16].forEach((s, i) => tone(660 * Math.pow(2, s / 12), 0.5, 'sine', 0.05, 0, i * 0.045, 0.5)); noise(0.5, 0.03, 4000, 'highpass', 9000, 1, 0, 0.4, 0.1); },
  shimmer: () => { [0, 7, 12, 19, 24].forEach((s, i) => tone(520 * Math.pow(2, s / 12), 0.9, 'sine', 0.045, 0, i * 0.08, 0.7)); },
  ice: () => { metal(1400, 0.5, 0.05); noise(0.25, 0.1, 6000, 'highpass'); tone(2400, 0.2, 'sine', 0.04, -900); },
  fire: () => { noise(0.45, 0.16, 900, 'bandpass', 300, 0.8, 0, 0.1, 0.05); },
  roar: (p = 1) => { if (!ok()) return; const t = ctx.currentTime; const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter(); o.type = 'sawtooth'; o2.type = 'square'; o.frequency.setValueAtTime(140 * p, t); o.frequency.exponentialRampToValueAtTime(70 * p, t + 0.9); o2.frequency.setValueAtTime(70 * p, t); o2.frequency.exponentialRampToValueAtTime(36 * p, t + 0.9);
    f.type = 'bandpass'; f.Q.value = 3; f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(900, t + 0.25); f.frequency.linearRampToValueAtTime(380, t + 0.9); f2.type = 'lowpass'; f2.frequency.value = 1500;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 26; lg.gain.value = 0.35; lfo.connect(lg); lg.connect(g.gain);
    env(g, t, 0.08, 0.8, 0.5, 0.15); o.connect(f); o2.connect(f); f.connect(f2); f2.connect(g); out(g, null, 0.35); o.start(t); o2.start(t); lfo.start(t); o.stop(t + 1.2); o2.stop(t + 1.2); lfo.stop(t + 1.2); noise(0.7, 0.08, 400, 'bandpass', 900, 1.5, 0.05, 0.2, 0.1); },
  power: () => { [0, 7, 12].forEach((s, i) => tone(220 * Math.pow(2, s / 12), 0.7, 'sawtooth', 0.06, 440, i * 0.05, 0.4)); noise(0.7, 0.12, 300, 'bandpass', 3000, 1.5, 0, 0.3, 0.3); sfx.shimmer(); },
  ko: () => { tone(80, 1.3, 'sine', 0.55, -45); noise(0.9, 0.45, 800, 'lowpass', 60, 0.6, 0, 0.5); metal(180, 1.6, 0.13); tone(48, 1.4, 'triangle', 0.3, -12, 0.03); },
  heal: () => { [0, 4, 7, 12].forEach((s, i) => tone(523 * Math.pow(2, s / 12), 0.5, 'triangle', 0.07, 0, i * 0.09, 0.5)); },
  respawn: () => { [0, 7, 12].forEach((s, i) => tone(392 * Math.pow(2, s / 12), 0.6, 'sine', 0.06, 0, i * 0.07, 0.6)); },
  recover: () => { tone(300, 0.35, 'sine', 0.1, 700); noise(0.3, 0.07, 1500, 'bandpass', 5000, 1.5); },
  combo: (n = 1) => { tone(520 * Math.pow(1.122, n), 0.14, 'triangle', 0.08, 120); },
  correct: () => { tone(660, 0.14, 'triangle', 0.12, 0, 0, 0.3); tone(880, 0.22, 'triangle', 0.12, 0, 0.1, 0.3); },
  wrong: () => { tone(220, 0.32, 'sawtooth', 0.07, -70); tone(165, 0.32, 'square', 0.04, -40, 0.02); },
  win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.55, 'triangle', 0.1, 0, i * 0.14, 0.5)); [262, 392].forEach(f => tone(f, 1.2, 'sawtooth', 0.04, 0, 0.2, 0.5)); },
  lose: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.7, 'sine', 0.11, 0, i * 0.22, 0.6)); },
  countdown: () => tone(440, 0.18, 'square', 0.06),
  go: () => { tone(880, 0.35, 'square', 0.07); metal(440, 0.7, 0.07); },
};

// ---------- music ----------
const STYLES = {
  epic:  { bpm: 82, root: 50, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 3, 4], pad: 'strings', mel: 'brass', perc: 'timp', bar: 4 },
  dark:  { bpm: 58, root: 43, scale: [0, 1, 3, 5, 7, 8, 10], prog: [0, 0, 1, 5], pad: 'drone', mel: 'bell', perc: 'sparse', bar: 4 },
  mystic:{ bpm: 68, root: 52, scale: [0, 2, 4, 6, 7, 9, 11], prog: [0, 1, 4, 0], pad: 'choir', mel: 'bell', perc: 'none', bar: 4 },
  warm:  { bpm: 96, root: 55, scale: [0, 2, 4, 7, 9], prog: [0, 3, 4, 0], pad: 'strings', mel: 'flute', perc: 'soft', bar: 4 },
  golden:{ bpm: 74, root: 57, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 3, 4, 3], pad: 'choir', mel: 'harp', perc: 'none', bar: 4 },
  cold:  { bpm: 66, root: 46, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 3, 5, 4], pad: 'choir', mel: 'glass', perc: 'sparse', bar: 4 },
  sea:   { bpm: 118, root: 52, scale: [0, 2, 4, 5, 7, 9, 10], prog: [0, 3, 0, 4], pad: 'strings', mel: 'fiddle', perc: 'drum', bar: 6 },
  eastern:{ bpm: 100, root: 50, scale: [0, 1, 4, 5, 7, 8, 10], prog: [0, 0, 1, 0], pad: 'drone', mel: 'flute', perc: 'drum', bar: 4 },
};
let curStyle = null, timer = null, nextBar = 0, barIdx = 0, melody = [], pendingMusic = null;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function degNote(S, deg, oct = 0) { const n = S.scale.length; const o = Math.floor(deg / n), i = ((deg % n) + n) % n; return S.root + S.scale[i] + 12 * (o + oct); }
function mtone(freq, t, dur, type, vol, send, extra) {
  const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = freq; let node = o;
  if (extra?.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(extra.lp, t); if (extra.lp2) f.frequency.linearRampToValueAtTime(extra.lp2, t + dur * 0.7); o.connect(f); node = f; }
  if (extra?.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = extra.vib; lg.gain.value = freq * 0.006; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.5); }
  if (extra?.detune) o.detune.value = extra.detune;
  const a = extra?.a ?? 0.01; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.setValueAtTime(vol, t + Math.max(a, dur * (extra?.hold ?? 0.3))); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  node.connect(g); out(g, musBus, send); o.start(t); o.stop(t + dur + 0.1);
}
function padChord(S, root, t, dur) {
  const notes = [root - 12, root, root + (S.scale.length === 5 ? 4 : 3 + (S.scale.includes(4) ? 1 : 0)), root + 7].map((n, i) => n);
  const third = S.scale.includes(4) && !S.scale.includes(3) ? 4 : 3; const ch = [root, root + third, root + 7];
  for (const n of ch) {
    if (S.pad === 'strings') [-6, 6].forEach(dt => mtone(mtof(n), t, dur, 'sawtooth', 0.022, 0.4, { lp: 700, lp2: 1300, a: dur * 0.35, detune: dt, hold: 0.8 }));
    else if (S.pad === 'choir') { [0, 8].forEach(dt => mtone(mtof(n + 12), t, dur, 'sawtooth', 0.012, 0.6, { lp: 1100, a: dur * 0.4, detune: dt, vib: 5, hold: 0.8 })); mtone(mtof(n), t, dur, 'sine', 0.03, 0.5, { a: dur * 0.3, hold: 0.8 }); }
    else mtone(mtof(n - 12), t, dur, 'sawtooth', 0.025, 0.3, { lp: 380, a: dur * 0.4, hold: 0.85 });
  }
  mtone(mtof(root - 24), t, dur, 'sine', 0.09, 0.1, { a: 0.3, hold: 0.7 });
}
function melNote(S, n, t, dur, v) {
  const f = mtof(n);
  switch (S.mel) {
    case 'brass': mtone(f, t, dur, 'sawtooth', 0.04 * v, 0.35, { lp: 500, lp2: 2200, a: 0.06, hold: 0.5 }); break;
    case 'bell': mtone(f * 2, t, dur * 2.4, 'sine', 0.05 * v, 0.9, { a: 0.005, hold: 0 }); mtone(f * 5.4, t, dur * 0.8, 'sine', 0.012 * v, 0.9, { a: 0.003, hold: 0 }); break;
    case 'glass': mtone(f * 2, t, dur * 2, 'triangle', 0.04 * v, 0.9, { a: 0.004, hold: 0 }); mtone(f * 4.01, t, dur * 1.2, 'sine', 0.015 * v, 0.9, { a: 0.003, hold: 0 }); break;
    case 'flute': mtone(f * 2, t, dur, 'sine', 0.06 * v, 0.5, { a: 0.07, vib: 5.5, hold: 0.6 }); break;
    case 'harp': mtone(f * 2, t, dur * 2, 'triangle', 0.06 * v, 0.6, { a: 0.004, hold: 0 }); break;
    case 'fiddle': mtone(f * 2, t, dur, 'sawtooth', 0.03 * v, 0.3, { lp: 1800, a: 0.04, vib: 6, hold: 0.7 }); break;
  }
}
function schedBar(S, bi, t) {
  const spb = 60 / S.bpm, beats = S.bar, dur = spb * beats, chordDeg = S.prog[bi % S.prog.length], root = degNote(S, chordDeg);
  padChord(S, root, t, dur * 1.02);
  // bass + percussion
  for (let b = 0; b < beats; b++) {
    const tb = t + b * spb;
    if (S.perc === 'timp') { if (b === 0 || (b === 2 && bi % 2)) { tone(95, 0.6, 'sine', 0.25, -50, tb - ctx.currentTime, 0.4, musBus); noise(0.08, 0.1, 300, 'lowpass', 120, 1, tb - ctx.currentTime, 0.2); } if (b === 3 && bi % 4 === 3) for (let k = 0; k < 4; k++) tone(110, 0.2, 'sine', 0.12, -40, tb - ctx.currentTime + k * spb / 4, 0.3, musBus); }
    else if (S.perc === 'drum') { const hit = S.bar === 6 ? (b === 0 || b === 3) : (b === 0 || b === 2); if (hit) { tone(85, 0.35, 'sine', 0.28, -45, tb - ctx.currentTime, 0.2, musBus); noise(0.06, 0.1, 200, 'lowpass', 100, 1, tb - ctx.currentTime, 0.1); } else noise(0.05, 0.05, 6000, 'highpass', 0, 1, tb - ctx.currentTime, 0.1); }
    else if (S.perc === 'sparse' && b === 0 && bi % 2 === 0) { tone(70, 0.9, 'sine', 0.22, -30, tb - ctx.currentTime, 0.5, musBus); }
    else if (S.perc === 'soft' && (b === 0 || b === 2)) { tone(100, 0.2, 'sine', 0.1, -40, tb - ctx.currentTime, 0.2, musBus); }
    if (S.perc !== 'none' || S.pad === 'strings') { if (b % 2 === 0 || S.perc === 'drum') mtone(mtof(root - 12), tb, spb * 0.8, 'triangle', 0.06, 0.15, { a: 0.01, hold: 0.2 }); }
  }
  // melody from the pre-generated pattern (8 bars)
  const pat = melody[bi % melody.length] || [];
  for (const [bt, deg, ln, v] of pat) melNote(S, degNote(S, deg + chordDeg, 1), t + bt * spb, Math.max(0.2, ln * spb), v);
}
function genMelody(S, seed) {
  const r = rng(seed), out = []; let deg = 2;
  for (let b = 0; b < 8; b++) { const pat = []; let beat = 0; const sparse = S.mel === 'bell' || S.mel === 'glass';
    while (beat < S.bar) { const ln = r() < 0.5 ? 1 : r() < 0.6 ? 2 : 0.5; if (r() < (sparse ? 0.55 : 0.18)) { beat += ln; continue; }
      deg += Math.round((r() - 0.5) * 4); deg = Math.max(-2, Math.min(7, deg)); pat.push([beat, deg, ln * 1.1, 0.7 + r() * 0.5]); beat += ln; }
    out.push(pat); }
  return out;
}
export function startMusic(style) {
  if (!ctx) { pendingMusic = style; return; }
  if (style === curStyle && timer) return;
  stopMusic(); const S = STYLES[style] || STYLES.mystic; curStyle = style; melody = genMelody(S, style.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7)); barIdx = 0; nextBar = ctx.currentTime + 0.15;
  const pump = () => { if (!ctx || curStyle !== style) return; while (nextBar < ctx.currentTime + 0.8) { if (ctx.state === 'running' && !document.hidden) schedBar(S, barIdx, nextBar); barIdx++; nextBar += 60 / S.bpm * S.bar; } };
  pump(); timer = setInterval(pump, 200);
}
export function stopMusic() { clearInterval(timer); timer = null; curStyle = null; }
export function currentMusic() { return curStyle; }
