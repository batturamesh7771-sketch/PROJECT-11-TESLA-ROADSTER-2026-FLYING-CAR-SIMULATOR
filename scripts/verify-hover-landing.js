const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testHoverAndLanding() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outDir = path.resolve(__dirname, '..', 'artifacts', 'verification');
  const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\f3390f9f-1872-4bdb-9fc1-81a593d85d5b';

  console.log('Launching Edge from:', edgePath);
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1600,950',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 950 });
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });

    console.log('Waiting 3s for 3D physics to stabilize in active hover...');
    await new Promise((r) => setTimeout(r, 3000));

    // Capture 1: Active Hover & PID Balance
    const file1 = path.join(outDir, 'test-hover-balance.png');
    await page.screenshot({ path: file1, fullPage: false });
    fs.copyFileSync(file1, path.join(artifactDir, 'test-hover-balance.png'));
    console.log('Saved test-hover-balance.png');

    // Trigger Smooth Landing (Key L)
    console.log('Triggering Smooth Landing Sequence (Key L)...');
    await page.keyboard.press('KeyL');

    // Wait for descent and cushion touchdown
    console.log('Waiting 4s for smooth descent and touchdown...');
    await new Promise((r) => setTimeout(r, 4000));

    // Capture 2: Smooth Touchdown
    const file2 = path.join(outDir, 'test-smooth-landing.png');
    await page.screenshot({ path: file2, fullPage: false });
    fs.copyFileSync(file2, path.join(artifactDir, 'test-smooth-landing.png'));
    console.log('Saved test-smooth-landing.png');

    // Drive forward on ground (Key W for 2s)
    console.log('Driving forward on ground with wheels (Key W)...');
    await page.keyboard.down('KeyW');
    await new Promise((r) => setTimeout(r, 2000));
    await page.keyboard.up('KeyW');

    // Capture 3: Ground driving after landing
    const file3 = path.join(outDir, 'test-ground-drive.png');
    await page.screenshot({ path: file3, fullPage: false });
    fs.copyFileSync(file3, path.join(artifactDir, 'test-ground-drive.png'));
    console.log('Saved test-ground-drive.png');

  } finally {
    await browser.close();
  }
}

testHoverAndLanding().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
