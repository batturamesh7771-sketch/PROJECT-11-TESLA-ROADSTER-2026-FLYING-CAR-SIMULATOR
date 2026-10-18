const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testFullLoopClimb() {
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
    console.log('Navigating to simulation...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Click AUTO LOOP
    console.log('Clicking AUTO LOOP button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const autoBtn = btns.find((b) => b.textContent && b.textContent.includes('AUTO LOOP'));
      if (autoBtn) autoBtn.click();
    });

    let climbedCaptured = false;
    let apexCaptured = false;

    console.log('Tracking trajectory through ramp climb and apex hover...');
    for (let s = 1; s <= 24; s++) {
      await new Promise((r) => setTimeout(r, 1000));
      const telemetry = await page.evaluate(() => {
        const txt = document.body.innerText;
        const speedMatch = txt.match(/SPEED[\s\n]+([0-9.]+)/);
        const altMatch = txt.match(/ALTITUDE[\s\n]+([0-9.]+)/);
        const thrustMatch = txt.match(/THRUST[\s\n]+([0-9.]+)/);
        const modeMatch = txt.match(/MODE:\s*([^\n]+)/);
        return {
          speed: speedMatch ? speedMatch[1] : 'N/A',
          alt: altMatch ? altMatch[1] : '0.0',
          thrust: thrustMatch ? thrustMatch[1] : 'N/A',
          mode: modeMatch ? modeMatch[1] : 'N/A',
        };
      });
      console.log(`t = ${s}s | Speed: ${telemetry.speed} km/h | Alt: ${telemetry.alt} m | Mode: ${telemetry.mode}`);

      const altNum = parseFloat(telemetry.alt);

      // Capture climbing ramp mid-way
      if (altNum >= 25.0 && altNum <= 110.0 && !climbedCaptured) {
        climbedCaptured = true;
        console.log(`>>> Capturing Climbing Ramp at Alt = ${altNum}m...`);
        const fileRamp = path.join(outDir, 'verify-climbing-loop-road.png');
        await page.screenshot({ path: fileRamp });
        fs.copyFileSync(fileRamp, path.join(artifactDir, 'verify-climbing-loop-road.png'));
        console.log('Saved verify-climbing-loop-road.png');
      }

      // Capture apex hover
      if (altNum >= 140.0 && !apexCaptured) {
        apexCaptured = true;
        console.log(`>>> Capturing Apex Hover at Alt = ${altNum}m...`);
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

testFullLoopClimb().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
