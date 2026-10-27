const { chromium } = require('playwright');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8931/?debug=1'); await sleep(2000);
  await p.evaluate(() => window.__nmb.startRound('castle', 'peter')); await sleep(2500);
  for (let k = 0; k < 3; k++) { await p.evaluate(() => { window.__nmb.noInvuln(); window.__nmb.hurtPlayer(999); }); for (let j=0;j<4;j++){ await sleep(1000); console.log(k, j, JSON.stringify((await p.evaluate(() => window.__nmb.state())).player)); } }
  await sleep(2500); console.log(await p.evaluate(() => window.__nmb.screen), await p.textContent('#end-title'));
  await b.close();
})();
