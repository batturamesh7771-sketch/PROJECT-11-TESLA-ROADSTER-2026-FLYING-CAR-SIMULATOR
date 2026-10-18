const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function run() {
  const browserPath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  console.log('Using browser:', browserPath);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\f3390f9f-1872-4bdb-9fc1-81a593d85d5b';

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2500));

  // Switch to Theme 2: Heavy City Traffic Escape
  console.log('Switching to Theme 2: Heavy City Traffic Escape...');
  await page.evaluate(() => {
    if (window.vehicle) {
      window.vehicle.setTheme('THEME_2_TRAFFIC');
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Stage 1: American Multi-Lane Interstate Freeway & Gridlock
  console.log('Capturing Stage 1: American Multi-Lane Interstate Gridlock...');
  await page.evaluate(() => {
    window.vehicle.setFlightSequenceStep(0);
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'theme2-american-freeway-gridlock.png') });

  // 2. Stage 2: Vertical Liftoff with 10 Nozzle Plumes & Ground Blast Ring
  console.log('Capturing Stage 2: Vertical Liftoff with 10 Nozzles & Ground Blast Ring...');
  await page.evaluate(() => {
    window.vehicle.setFlightSequenceStep(1);
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'theme2-vertical-liftoff-plumes.png') });

  // 3. Stage 3: Flyover Semi Truck & Cybertruck in Traffic Cam
  console.log('Capturing Stage 3 in Traffic Cam angle...');
  await page.evaluate(() => {
    window.vehicle.setFlightSequenceStep(2);
    // Click Traffic Cam button
    const btns = Array.from(document.querySelectorAll('button'));
    const trafficCamBtn = btns.find(b => b.textContent && b.textContent.includes('Traffic Cam'));
    if (trafficCamBtn) trafficCamBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'theme2-flyover-semi-truck.png') });

  // 4. Stage 4: Gravity Drop & 10-Nozzle Retro-Catch
  console.log('Capturing Stage 4: Retro-Catch Landing...');
  await page.evaluate(() => {
    window.vehicle.setFlightSequenceStep(3);
    // Switch to chase cam to inspect alignment
    const btns = Array.from(document.querySelectorAll('button'));
    const chaseBtn = btns.find(b => b.textContent && b.textContent.includes('chase'));
    if (chaseBtn) chaseBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'theme2-retro-catch-landing.png') });

  // 5. Stage 5: Highway Touchdown & Open Cruise
  console.log('Capturing Stage 5: Open Highway Touchdown & Cruise...');
  await page.evaluate(() => {
    window.vehicle.setFlightSequenceStep(4);
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'theme2-open-highway-touchdown.png') });

  // 6. Return to Theme 1 to verify 100% Theme 1 preservation
  console.log('Verifying Theme 1 is 100% intact...');
  await page.evaluate(() => {
    window.vehicle.setTheme('THEME_1_RAMP');
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(artifactDir, 'theme1-fully-intact.png') });

  console.log('All upgraded visual overhaul screenshots captured successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
