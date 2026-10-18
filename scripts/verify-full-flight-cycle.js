const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testFullFlightCycle() {
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
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2500));

    // 1. Reset car to ground runway
    console.log('1. Resetting to ground (Key R)...');
    await page.keyboard.press('KeyR');
    await new Promise((r) => setTimeout(r, 1000));

    // 2. Drive along runway with wheels
    console.log('2. Accelerating with electric powertrain on asphalt (Key W)...');
    await page.keyboard.down('KeyW');
    await new Promise((r) => setTimeout(r, 2000));
    await page.keyboard.up('KeyW');

    // 3. Activate Hover Mode (Key V)
    console.log('3. Engaging Cold-Gas Active Hover & Balancing (Key V)...');
    await page.keyboard.press('KeyV');
    await new Promise((r) => setTimeout(r, 2500));

    const hoverFile = path.join(outDir, 'flight-cycle-hover-25m.png');
    await page.screenshot({ path: hoverFile });
    fs.copyFileSync(hoverFile, path.join(artifactDir, 'flight-cycle-hover-25m.png'));
    console.log('Saved flight-cycle-hover-25m.png');

    // 4. Initiate Smooth Landing (Key L)
    console.log('4. Initiating Smooth Landing Cushion (Key L)...');
    await page.keyboard.press('KeyL');
    await new Promise((r) => setTimeout(r, 3500));

    const landingFile = path.join(outDir, 'flight-cycle-touchdown.png');
    await page.screenshot({ path: landingFile });
    fs.copyFileSync(landingFile, path.join(artifactDir, 'flight-cycle-touchdown.png'));
    console.log('Saved flight-cycle-touchdown.png');

  } finally {
    await browser.close();
  }
}

testFullFlightCycle().catch((err) => {
  console.error('Flight cycle test failed:', err);
  process.exit(1);
});
