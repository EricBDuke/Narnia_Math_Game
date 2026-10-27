// Full headless playthrough: node tools/playtest.cjs [desktop|ipad] [baseUrl]
const { chromium, devices } = require('playwright');
const mode = process.argv[2] || 'desktop'; const base = process.argv[3] || 'http://127.0.0.1:8931/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctxOpts = mode === 'ipad' ? { viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' } : { viewport: { width: 1280, height: 800 } };
  const ctx = await b.newContext(ctxOpts); const p = await ctx.newPage();
  const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  const S = (n) => p.screenshot({ path: `screenshots/${mode}-${n}.png` });
  const st = () => p.evaluate(() => window.__nmb.state());
  const log = (...a) => console.log(`[${mode}]`, ...a);
  const tap = async (sel) => { if (mode === 'ipad') await p.tap(sel); else await p.click(sel); };
  await p.goto(base + '?debug=1'); await p.waitForFunction(() => window.__nmb && window.__nmb.screen === 'title', null, { timeout: 20000 });
  await p.evaluate(() => localStorage.clear());
  await tap('#diff button[data-v="hard"]'); if (mode === 'ipad') await tap('#pool button[data-v="all"]'); else await tap('#pool button[data-v="starters"]'); await tap('#mode button[data-v="mixed"]');
  await tap('#btn-start'); await sleep(400);
  log('screen', (await st()).screen);
  // solve 10 problems; get #3 wrong on purpose
  for (let i = 0; i < 10; i++) {
    const pr = await p.evaluate(() => { const m = window.__nmb.math; return m.set[m.i]; });
    let ans = pr.kind === 'mul' ? String(pr.answer) : String(pr.q), rem = pr.kind === 'div' ? String(pr.r) : null;
    if (i === 2) ans = String(Number(ans) + 1);
    if (mode === 'ipad') {
      for (const d of ans) await p.tap(`#pad button[data-k="${d}"]`);
      if (rem !== null) { await p.tap('#f-rem'); for (const d of rem) await p.tap(`#pad button[data-k="${d}"]`); }
      if (i === 0) await S('math-gate');
      await p.tap('#pad button[data-k="enter"]');
    } else {
      await p.keyboard.type(ans); if (rem !== null) { await p.keyboard.press('Enter'); await p.keyboard.type(rem); }
      if (i === 0) await S('math-gate');
      await p.keyboard.press('Enter');
    }
    await sleep(150);
    const fb = await p.textContent('#m-feedback'); if (i === 2 || i === 0) { log('problem', i + 1, pr.text, '->', fb); if (i === 2) await S('math-wrong'); }
    if (mode === 'ipad') await p.tap('#btn-next'); else await p.keyboard.press('Enter');
    await sleep(120);
  }
  log('after math:', (await st()).screen, await p.textContent('#mr-title'));
  await S('math-result');
  await tap('#btn-to-select'); await sleep(1500);
  await tap('.card[data-id="reepicheep"]'); await sleep(300);
  await tap('#arena-pick button[data-a="dawntreader"]');
  await sleep(mode === 'ipad' ? 6000 : 1200); await S('select');
  await tap('#btn-fight'); await sleep(3500);
  let s = await st(); log('fight start', s.arena, s.player, 'foes', s.foes.map(f => f.name).join(', '));
  await S('fight-start');
  // use every move
  const press = async (k, hold = 120) => { await p.keyboard.down(k); await sleep(hold); await p.keyboard.up(k); await sleep(500); };
  if (mode === 'desktop') {
    await p.keyboard.down('KeyW'); await sleep(700); await p.keyboard.up('KeyW');
    for (const k of ['KeyJ', 'KeyK', 'KeyL', 'KeyU', 'Space']) { await press(k); }
    await p.keyboard.down('Shift'); await press('Space'); await p.keyboard.up('Shift');
    await p.evaluate(() => window.__nmb.setPower(100)); await press('KeyI');
    await press('KeyO', 800); await p.keyboard.down('KeyD'); await press('KeyO'); await p.keyboard.up('KeyD');
    await press('KeyR'); await press('KeyQ', 600);
    await p.keyboard.press('Tab'); await sleep(400); await S('movelist'); log('tab ->', (await st()).screen); await p.keyboard.press('Tab'); await sleep(200);
    await p.keyboard.press('Escape'); await sleep(300); log('esc ->', (await st()).screen); await S('pause'); await p.keyboard.press('Escape'); await sleep(200);
  } else {
    const tb = async (a, hold = 120) => { const el = await p.$(`.tb[data-a="${a}"]`); const bx = await el.boundingBox(); await p.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(500); };
    // joystick drag via CDP touch events
    const cdp = await ctx.newCDPSession(p); const sb = await (await p.$('#stick')).boundingBox(); const cx = sb.x + sb.width / 2, cy = sb.y + sb.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 1 }] });
    for (let k = 1; k <= 6; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + k * 10, y: cy - k * 8, id: 1 }] }); await sleep(60); }
    await sleep(600); const moved = await st(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); log('joystick moved player to', moved.player.pos);
    for (const a of ['main', 'combo1', 'combo2', 'flying', 'jump', 'high', 'recover']) await tb(a);
    await p.evaluate(() => window.__nmb.setPower(100)); await tb('power'); await tb('block');
    // camera drag on empty area
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 600, y: 400, id: 2 }] });
    for (let k = 1; k <= 5; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 600 - k * 30, y: 400, id: 2 }] }); await sleep(40); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await tb2(p, '#btn-pause'); log('pause ->', (await st()).screen); await S('pause'); await tb2(p, '#btn-resume');
  }
  s = await st(); log('after moves', s.player, 'player kos', s.player.kos);
  await sleep(9000); await S('fight-mid');
  s = await st(); log('AI fighting:', s.foes.map(f => `${f.name} hp${f.hp} L${f.lives} dealt${f.dmgDealt}`).join(' | '));
  // lose a life
  const livesBefore = (await st()).player.lives; await p.evaluate(() => { window.__nmb.noInvuln(); window.__nmb.hurtPlayer(999); }); await p.waitForFunction((lb) => window.__nmb.player.lives === lb - 1 && window.__nmb.player.state !== 'ko', livesBefore, { timeout: 30000 }); s = await st(); log('lives before', livesBefore); log('after KO: lives', s.player.lives, 'state', s.player.state);
  // win round
  await p.evaluate(() => window.__nmb.koFoes()); await p.waitForFunction(() => window.__nmb.screen === 'end', null, { timeout: 30000 }); await sleep(800); s = await st(); log('after koFoes:', s.screen, await p.textContent('#end-title'));
  await S('end-victory');
  await tap('#btn-next-round'); await sleep(500); log('next round ->', (await st()).screen, 'round', (await st()).round);
  // defeat path
  await p.evaluate(() => window.__nmb.startRound('castle', 'peter')); await sleep(2500);
  for (let k = 0; k < 3; k++) { await p.evaluate(() => { window.__nmb.noInvuln(); window.__nmb.hurtPlayer(999); }); await p.waitForFunction((k) => { const pl = window.__nmb.player; return pl.lives === 2 - k && (pl.dead || pl.state !== 'ko'); }, k, { timeout: 30000 }); }
  await p.waitForFunction(() => window.__nmb.screen === 'end', null, { timeout: 30000 }); await sleep(600); await S('end-defeat'); s = await st(); log('defeat path:', s.screen, await p.textContent('#end-title'));
  // arena screenshots
  for (const a of (mode === 'ipad' ? ['castle', 'stonetable', 'dawntreader', 'underland'] : await p.evaluate(() => window.__nmb.ARENAS.map(a => a.id)))) {
    await p.evaluate((a) => window.__nmb.startRound(a), a); await sleep(4500); await S('arena-' + a); log('arena', a, 'ok', (await st()).foes.length + 1, 'fighters');
  }
  log('console errors:', errs.length ? errs : 'none');
  await b.close();
})();
async function tb2(p, sel) { const bx = await (await p.$(sel)).boundingBox(); await p.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); await new Promise(r => setTimeout(r, 400)); }
