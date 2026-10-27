const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
 const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => console.log(m.text()));
 await p.goto('http://127.0.0.1:8931/?debug=1'); await p.waitForTimeout(2000);
 await p.evaluate(() => window.__nmb.startRound('creation', 'peter')); await p.waitForTimeout(3000);
 console.log(await p.evaluate(() => { let n = 0, t = 0; window.__nmb.world.scene.traverse(o => { if (o.isMesh && o.material.transparent && o.material.opacity < 0.3) n++; if (o.isMesh) t++; }); return 'faded ' + n + ' of ' + t; }));
 await b.close(); })();
