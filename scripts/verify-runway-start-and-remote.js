const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function verifyRunwayAndRemote() {
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
    await new Promise((r) => setTimeout(r, 3000));

    // 1. Initial State: Car ON THE ROAD runway with Driver Remote Controller
    console.log('1. Capturing Initial State: Car ON THE ASPHALT ROAD with Remote Controller HUD...');
    const file1 = path.join(outDir, 'verify-car-on-road-with-remote.png');
    await page.screenshot({ path: file1 });
    fs.copyFileSync(file1, path.join(artifactDir, 'verify-car-on-road-with-remote.png'));
    console.log('Saved verify-car-on-road-with-remote.png');

    // 2. Drive forward and climb the curved loop road (Hold Key W for 3.5 seconds)
    console.log('2. Driving forward along runway and climbing curved loop road...');
    await page.keyboard.down('KeyW');
    await new Promise((r) => setTimeout(r, 3800));
    await page.keyboard.up('KeyW');

    const file2 = path.join(outDir, 'verify-climbing-loop-road.png');
    await page.screenshot({ path: file2 });
    fs.copyFileSync(file2, path.join(artifactDir, 'verify-climbing-loop-road.png'));
    console.log('Saved verify-climbing-loop-road.png');

    // 3. Fire rocket thrusters & climb to loop apex (Spacebar for 2s)
    console.log('3. Firing Cold-Gas Thruster Boost up loop road...');
    await page.keyboard.down('Space');
    await page.keyboard.down('KeyW');
    await new Promise((r) => setTimeout(r, 2500));
    await page.keyboard.up('Space');
    await page.keyboard.up('KeyW');

    const file3 = path.join(outDir, 'verify-remote-flight-apex.png');
    await page.screenshot({ path: file3 });
    fs.copyFileSync(file3, path.join(artifactDir, 'verify-remote-flight-apex.png'));
    console.log('Saved verify-remote-flight-apex.png');

  } finally {
    await browser.close();
  }
}

verifyRunwayAndRemote().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
