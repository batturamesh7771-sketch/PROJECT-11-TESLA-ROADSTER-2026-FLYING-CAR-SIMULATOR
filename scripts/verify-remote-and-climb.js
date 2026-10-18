const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function runFullVerification() {
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

    // 1. Initial State: Car on Runway with Remote Flight Controller
    console.log('1. Capturing Initial State: Car resting on asphalt road with Remote Controller...');
    const file1 = path.join(outDir, 'verify-car-on-road-with-remote.png');
    await page.screenshot({ path: file1 });
    fs.copyFileSync(file1, path.join(artifactDir, 'verify-car-on-road-with-remote.png'));
    console.log('Saved verify-car-on-road-with-remote.png');

    // 2. Click AUTO LOOP button
    console.log('2. Clicking AUTO LOOP button to initiate flight cycle...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const autoBtn = btns.find((b) => b.textContent && b.textContent.includes('AUTO LOOP'));
      if (autoBtn) autoBtn.click();
    });

    // 3. Track progress through loop climb and apex
    let rampCaptured = false;
    let apexCaptured = false;

    console.log('3. Tracking car as it rockets down runway, climbs loop road, and reaches apex...');
    for (let s = 1; s <= 28; s++) {
      await new Promise((r) => setTimeout(r, 1000));
      const telemetry = await page.evaluate(() => {
        const txt = document.body.innerText;
        const speedMatch = txt.match(/SPEED[\s\n]+([0-9.]+)/);
        const altMatch = txt.match(/ALTITUDE[\s\n]+([0-9.]+)/);
        const modeMatch = txt.match(/MODE:\s*([^\n]+)/);
        return {
          speed: speedMatch ? speedMatch[1] : '0',
          alt: altMatch ? altMatch[1] : '0.0',
          mode: modeMatch ? modeMatch[1] : '',
        };
      });
      const altNum = parseFloat(telemetry.alt);
      console.log(`t = ${s}s | Speed: ${telemetry.speed} km/h | Alt: ${telemetry.alt} m | Mode: ${telemetry.mode}`);

      // Capture climbing the loop road (between 25m and 85m altitude)
      if (altNum >= 25.0 && altNum <= 95.0 && !rampCaptured) {
        rampCaptured = true;
        console.log(`>>> Capturing Car Climbing Loop Road at Alt = ${altNum}m...`);
        const fileRamp = path.join(outDir, 'verify-climbing-loop-road.png');
        await page.screenshot({ path: fileRamp });
        fs.copyFileSync(fileRamp, path.join(artifactDir, 'verify-climbing-loop-road.png'));
        console.log('Saved verify-climbing-loop-road.png');
      }

      // Capture Apex Hover (>= 145m altitude)
      if (altNum >= 145.0 && !apexCaptured) {
        apexCaptured = true;
        console.log(`>>> Capturing Car Hovering at Apex at Alt = ${altNum}m...`);
        const fileApex = path.join(outDir, 'verify-remote-flight-apex.png');
        await page.screenshot({ path: fileApex });
        fs.copyFileSync(fileApex, path.join(artifactDir, 'verify-remote-flight-apex.png'));
        console.log('Saved verify-remote-flight-apex.png');
      }
    }

  } finally {
    await browser.close();
  }
}

runFullVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
