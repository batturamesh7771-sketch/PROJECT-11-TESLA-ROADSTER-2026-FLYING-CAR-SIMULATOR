const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function verifyBallisticFlipAndGravity() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outDir = path.resolve(__dirname, '..', 'artifacts', 'verification');
  const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\f3390f9f-1872-4bdb-9fc1-81a593d85d5b';

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
    await new Promise((r) => setTimeout(r, 2500));

    // 1. Initial State: Resting on road
    console.log('1. Capturing Initial Ground State...');
    const file1 = path.join(outDir, 'flip-1-ground-ready.png');
    await page.screenshot({ path: file1 });
    fs.copyFileSync(file1, path.join(artifactDir, 'flip-1-ground-ready.png'));
    console.log('Saved flip-1-ground-ready.png');

    // 2. Trigger 3D FLIP (Press 'KeyF' or click button)
    console.log('2. Triggering 3D FLIP (F)...');
    await page.keyboard.press('KeyF');

    // Track trajectory through the 4 phases
    let popCaptured = false;
    let invertedCaptured = false;
    let landingCaptured = false;
    let touchdownCaptured = false;

    console.log('Tracking 4-phase ballistic flip trajectory and Newtonian gravity...');
    for (let i = 1; i <= 35; i++) {
      await new Promise((r) => setTimeout(r, 200)); // 200ms step
      const telemetry = await page.evaluate(() => {
        const txt = document.body.innerText;
        const altMatch = txt.match(/ALTITUDE[\s\n]+([0-9.]+)/);
        const speedMatch = txt.match(/SPEED[\s\n]+([0-9.]+)/);
        const thrustMatch = txt.match(/THRUST[\s\n]+([0-9.]+)/);
        const copvMatch = txt.match(/COPV GAS[\s\n]+([0-9.]+)/);
        const pitchMatch = txt.match(/PITCH:\s*([0-9.-]+)/);
        const modeMatch = txt.match(/MODE:\s*([^\n]+)/);
        return {
          alt: altMatch ? altMatch[1] : '0.0',
          speed: speedMatch ? speedMatch[1] : '0',
          thrust: thrustMatch ? thrustMatch[1] : '0',
          copv: copvMatch ? copvMatch[1] : '0',
          pitch: pitchMatch ? pitchMatch[1] : '0',
          mode: modeMatch ? modeMatch[1] : '',
        };
      });

      const alt = parseFloat(telemetry.alt);
      const pitch = parseFloat(telemetry.pitch);
      console.log(`t = ${(i * 0.2).toFixed(1)}s | Alt: ${alt}m | Pitch: ${pitch}° | Thrust: ${telemetry.thrust}kN | COPV: ${telemetry.copv}psi | Mode: ${telemetry.mode}`);

      // Capture Phase 1: Launch Pop
      if (alt >= 4.0 && alt <= 9.0 && !popCaptured) {
        popCaptured = true;
        console.log('>>> Capturing Phase 1 (Launch Pop)...');
        const fPop = path.join(outDir, 'flip-2-launch-pop.png');
        await page.screenshot({ path: fPop });
        fs.copyFileSync(fPop, path.join(artifactDir, 'flip-2-launch-pop.png'));
        console.log('Saved flip-2-launch-pop.png');
      }

      // Capture Phase 2: Inverted Free-Fall (Pitch between 140° and 220°, lift cut to 0 kN)
      if (pitch >= 120.0 && pitch <= 240.0 && !invertedCaptured) {
        invertedCaptured = true;
        console.log('>>> Capturing Phase 2 (Inverted Free-Fall, Main Lift Cut)...');
        const fInv = path.join(outDir, 'flip-3-inverted-freefall.png');
        await page.screenshot({ path: fInv });
        fs.copyFileSync(fInv, path.join(artifactDir, 'flip-3-inverted-freefall.png'));
        console.log('Saved flip-3-inverted-freefall.png');
      }

      // Capture Phase 4: Landing Catch
      if (telemetry.mode.includes('Catch') || (popCaptured && pitch < 40.0 && alt > 1.5 && alt < 8.0 && !landingCaptured)) {
        landingCaptured = true;
        console.log('>>> Capturing Phase 4 (Retro-Burn Landing Catch)...');
        const fLand = path.join(outDir, 'flip-4-landing-catch.png');
        await page.screenshot({ path: fLand });
        fs.copyFileSync(fLand, path.join(artifactDir, 'flip-4-landing-catch.png'));
        console.log('Saved flip-4-landing-catch.png');
      }

      // Capture Touchdown Complete
      if (popCaptured && alt <= 0.1 && i > 12 && !touchdownCaptured) {
        touchdownCaptured = true;
        console.log('>>> Capturing Touchdown Complete on Asphalt...');
        const fTouch = path.join(outDir, 'flip-5-touchdown-complete.png');
        await page.screenshot({ path: fTouch });
        fs.copyFileSync(fTouch, path.join(artifactDir, 'flip-5-touchdown-complete.png'));
        console.log('Saved flip-5-touchdown-complete.png');
      }
    }

  } finally {
    await browser.close();
  }
}

verifyBallisticFlipAndGravity().catch((err) => {
  console.error('Flip verification failed:', err);
  process.exit(1);
});
