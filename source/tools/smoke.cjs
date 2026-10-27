const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('console', m => { if (m.type() === 'error' || m.type()==='warning') errs.push(m.type()+': '+m.text()); }); p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('http://localhost:8931/?debug=1'); await p.waitForTimeout(2500);
  console.log(await p.evaluate(() => window.__nmb && window.__nmb.screen));
  await p.screenshot({ path: 'screenshots/_smoke_title.png' });
  console.log(errs.join('\n'));
  await b.close();
})();
