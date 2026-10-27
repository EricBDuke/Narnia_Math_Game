// Re-shoot selected arenas: node tools/arena-shots.cjs creation aslanscountry ...
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
 const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
 await p.goto('http://127.0.0.1:8931/?debug=1'); await p.waitForTimeout(2000);
 for (const a of process.argv.slice(2)) { await p.evaluate((a) => window.__nmb.startRound(a, 'peter'), a); await p.waitForTimeout(4500); await p.screenshot({ path: `screenshots/desktop-arena-${a}.png` }); console.log('shot', a); }
 console.log('errors:', errs.length ? errs : 'none'); await b.close(); })();
