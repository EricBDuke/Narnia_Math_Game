// Tiny synthesized sound effects (no audio files needed).
let ctx = null, muted = localStorage.getItem('nmb-muted') === '1';
export function unlockAudio() { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (ctx && ctx.state === 'suspended') ctx.resume(); }
export function setMuted(m) { muted = m; localStorage.setItem('nmb-muted', m ? '1' : '0'); }
export function isMuted() { return muted; }
function tone(freq, dur, type = 'sine', vol = 0.15, slide = 0) {
  if (!ctx || muted) return; const t = ctx.currentTime; const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur);
}
function noise(dur, vol = 0.2, hp = 800) {
  if (!ctx || muted) return; const t = ctx.currentTime; const len = Math.floor(ctx.sampleRate * dur); const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len); const s = ctx.createBufferSource(); s.buffer = b;
  const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; const g = ctx.createGain(); g.gain.value = vol; s.connect(f).connect(g).connect(ctx.destination); s.start(t);
}
export const sfx = {
  hit: () => { noise(0.12, 0.25, 600); tone(160, 0.12, 'square', 0.08, -80); },
  block: () => { tone(900, 0.08, 'triangle', 0.1); noise(0.05, 0.1, 3000); },
  whoosh: () => noise(0.15, 0.08, 2000),
  jump: () => tone(300, 0.15, 'sine', 0.1, 300),
  power: () => { tone(220, 0.5, 'sawtooth', 0.08, 440); tone(330, 0.5, 'triangle', 0.08, 660); },
  ko: () => { tone(300, 0.6, 'sawtooth', 0.1, -250); noise(0.3, 0.15, 300); },
  heal: () => { tone(660, 0.2, 'sine', 0.1); setTimeout(() => tone(990, 0.3, 'sine', 0.1), 120); },
  correct: () => { tone(660, 0.12, 'triangle', 0.12); setTimeout(() => tone(880, 0.2, 'triangle', 0.12), 110); },
  wrong: () => tone(200, 0.3, 'square', 0.08, -60),
  click: () => tone(500, 0.05, 'triangle', 0.06),
  win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.3, 'triangle', 0.12), i * 140)),
  lose: () => [392, 330, 262].forEach((f, i) => setTimeout(() => tone(f, 0.4, 'sine', 0.12), i * 200)),
};
