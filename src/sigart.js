// Painted signature art (delivered by Narnia Game Art): 8 effect sprites (512x512, alpha), the name-banner frame and the iPad button emblem.
// Everything is optional: when a file is missing the code-drawn effects in signature.js still play.
import * as THREE from 'three';
import { assetUrl } from './assets.js';

export const SA = { tex: {}, banner: null, button: null, ready: false };
// which painted sprite best fits each effect motif of the 70 signature moves (and whether it is added to the picture or drawn normally)
const MOTIF_SPRITE = { roar: 'roar', frost: 'frost', blades: 'blades', quake: 'earth', volley: 'blades', wind: 'wind', fire: 'fire', star: 'star', nature: 'magic', shadow: 'magic', sea: 'wind' };
const ADDITIVE = new Set(['star', 'fire', 'roar']);
export const spriteFor = (motif) => MOTIF_SPRITE[motif] || 'star';

export function loadSigArt(manifest) {
  const sg = manifest?.ui?.sig; if (!sg) return Promise.resolve();
  const loader = new THREE.TextureLoader(), jobs = [];
  for (const [name, path] of Object.entries(sg.fx || {})) jobs.push(new Promise(res => loader.load(assetUrl(path), t => { t.colorSpace = THREE.SRGBColorSpace; SA.tex[name] = t; res(); }, undefined, () => res())));
  const css = (key, v) => document.documentElement.style.setProperty(key, `url("${assetUrl(v).replace(/"/g, '%22').replace(/'/g, '%27')}")`);
  if (sg.banner) { css('--sig-frame', sg.banner); SA.banner = sg.banner; document.body.classList.add('sig-frame'); }
  if (sg.button) { css('--sig-btn', sg.button); SA.button = sg.button; document.body.classList.add('sig-art'); }
  return Promise.all(jobs).then(() => { SA.ready = Object.keys(SA.tex).length > 0; });
}

const tint = (hex, k) => new THREE.Color(0xffffff).lerp(new THREE.Color(hex), k);
// a painted sprite in the arena: grows, spins and fades. o: { size, grow (end scale / start scale), spin (radians over its life), life, opacity, colour, k (tint strength), z, delay, ease }
export function spriteFx(fx, name, x, y, z, o = {}) {
  const tex = SA.tex[name]; if (!tex || !fx) return null;
  const add = o.add ?? ADDITIVE.has(name), size = o.size || 6, life = o.life || 0.6, g = o.grow ?? 1.6, spin = o.spin ?? 0.8, op = o.opacity ?? 1, s0 = o.s0 ?? 0.35, rot0 = o.rot ?? Math.random() * 6.28;
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: tint(o.color ?? 0xffffff, o.k ?? 0.3), transparent: true, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false, depthTest: false, fog: false, opacity: 0 }));
  m.position.set(x, y, z + (o.z ?? 0.9)); m.renderOrder = 31; m.scale.setScalar(size * s0); m.material.rotation = rot0; fx.scene.add(m);
  const it = { obj: m, t: -(o.delay || 0), life, size, upd: (it, k) => { if (it.t < 0) return; const e = 1 - Math.pow(1 - k, 3); m.scale.setScalar(size * (s0 + (g - s0) * e)); m.material.rotation = rot0 + spin * k; m.material.opacity = op * (k < 0.12 ? k / 0.12 : Math.pow(1 - (k - 0.12) / 0.88, o.fade ?? 1.3)); } };
  fx.items.push(it); return it;
}
// a sprite that lives as long as the windup: follows its fighter, grows with the charge, is removed when the strike begins
export function windSprite(fx, f, name, o = {}) {
  const tex = SA.tex[name]; if (!tex || !fx) return null;
  const add = ADDITIVE.has(name), m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: tint(o.color ?? 0xffffff, 0.3), transparent: true, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false, depthTest: false, fog: false, opacity: 0 }));
  m.renderOrder = 22; fx.scene.add(m); const rot0 = Math.random() * 6.28;
  const it = { obj: m, t: 0, life: 5, size: 1, upd: (it) => { const p = f.sigWind || 0; m.position.set(f.pos.x, f.center, f.pos.z - 0.3); m.scale.setScalar((o.size || 7) * (0.3 + 0.8 * p)); m.material.rotation = rot0 + it.t * (o.spin || 1.2); m.material.opacity = Math.min(1, p * 2.2) * (o.opacity ?? 0.75) * (it.fadeOut ?? 1); if (it.fadeOut !== undefined) { it.fadeOut -= 0.12; if (it.fadeOut <= 0) it.life = 0; } } };
  fx.items.push(it); return it;
}
