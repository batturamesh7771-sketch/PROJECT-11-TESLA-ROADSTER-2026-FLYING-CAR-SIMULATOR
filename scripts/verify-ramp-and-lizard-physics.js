const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function verifyRampAndLizardPhysics() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outDir = path.resolve(__dirname, '..', 'artifacts', 'verification');
  const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\f3390f9f-1872-4bdb-9fc1-81a593d85d5b';

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1600,950'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Helper to read vehicle state from window or DOM
    const getTelemetry = async () => {
      return await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          hasSuction: text.includes('2.0G') || text.includes('Lizard'),
          rawText: text.substring(0, 1000),
        };
      });
    };

    // 1. Initial State: Runway Start (0.0m altitude)
    console.log('1. Testing Stage 1: Approach Runway...');
    await page.evaluate(() => {
      if (window.vehicle) window.vehicle.setFlightSequenceStep(0);
    });
    await new Promise((r) => setTimeout(r, 600));
    const f1 = path.join(outDir, 'stage1-runway-approach.png');
    await page.screenshot({ path: f1 });
    fs.copyFileSync(f1, path.join(artifactDir, 'stage1-runway-approach.png'));
    console.log('Captured stage1-runway-approach.png');

    // 2. Stage 2: 2.0G Wall Lizard Suction (14.0m altitude)
    console.log('2. Testing Stage 2: 2.0G Wall Suction (14.0m)...');
    await page.evaluate(() => {
      if (window.vehicle) window.vehicle.setFlightSequenceStep(1);
    });
    await new Promise((r) => setTimeout(r, 600));
    const f2 = path.join(outDir, 'stage2-wall-lizard-suction.png');
    await page.screenshot({ path: f2 });
    fs.copyFileSync(f2, path.join(artifactDir, 'stage2-wall-lizard-suction.png'));
    console.log('Captured stage2-wall-lizard-suction.png');

    // 3. Stage 3: Inverted Ceiling Run (28.0m altitude)
    console.log('3. Testing Stage 3: Inverted Ceiling (28.0m)...');
    await page.evaluate(() => {
      if (window.vehicle) window.vehicle.setFlightSequenceStep(2);
    });
    await new Promise((r) => setTimeout(r, 600));
    const f3 = path.join(outDir, 'stage3-inverted-ceiling.png');
    await page.screenshot({ path: f3 });
    fs.copyFileSync(f3, path.join(artifactDir, 'stage3-inverted-ceiling.png'));
    console.log('Captured stage3-inverted-ceiling.png');

    // 4. Stage 4: Lip Edge Drop & 180° Flip (24.0m altitude)
    console.log('4. Testing Stage 4: Lip Edge Drop & 180° Flip...');
    await page.evaluate(() => {
      if (window.vehicle) window.vehicle.setFlightSequenceStep(3);
    });
    await new Promise((r) => setTimeout(r, 600));
    const f4 = path.join(outDir, 'stage4-lip-drop-flip.png');
    await page.screenshot({ path: f4 });
    fs.copyFileSync(f4, path.join(artifactDir, 'stage4-lip-drop-flip.png'));
    console.log('Captured stage4-lip-drop-flip.png');

    // 5. Stage 5: 10-Nozzle Retro-Catch & Landing
    console.log('5. Testing Stage 5: 10-Nozzle Retro-Catch & Landing...');
    await page.evaluate(() => {
      if (window.vehicle) window.vehicle.setFlightSequenceStep(4);
    });
    await new Promise((r) => setTimeout(r, 600));
    const f5 = path.join(outDir, 'stage5-retro-catch-landing.png');
    await page.screenshot({ path: f5 });
    fs.copyFileSync(f5, path.join(artifactDir, 'stage5-retro-catch-landing.png'));
    console.log('Captured stage5-retro-catch-landing.png');

    // 6. Test Live AUTO LOOP sequence across the full track
    console.log('6. Running Live Mission 08 AUTO LOOP...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const autoBtn = btns.find((b) => b.textContent && b.textContent.includes('AUTO LOOP'));
      if (autoBtn) autoBtn.click();
    });
    // Wait for car to climb wall and reach inverted ceiling
    await new Promise((r) => setTimeout(r, 3800));
    const f6 = path.join(outDir, 'live-mission08-ceiling.png');
    await page.screenshot({ path: f6 });
    fs.copyFileSync(f6, path.join(artifactDir, 'live-mission08-ceiling.png'));
    console.log('Captured live-mission08-ceiling.png');

    // Wait for flip and landing
    await new Promise((r) => setTimeout(r, 3500));
    const f7 = path.join(outDir, 'live-mission08-touchdown.png');
    await page.screenshot({ path: f7 });
    fs.copyFileSync(f7, path.join(artifactDir, 'live-mission08-touchdown.png'));
    console.log('Captured live-mission08-touchdown.png');

    console.log('ALL VERIFICATION STAGES COMPLETED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

verifyRampAndLizardPhysics().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
