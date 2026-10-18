const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function captureModes() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outDir = path.resolve(__dirname, '..', 'artifacts', 'verification');
  const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\f3390f9f-1872-4bdb-9fc1-81a593d85d5b';
  
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

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

    console.log('Waiting 3s for 3D flight scene to initialize...');
    await new Promise((r) => setTimeout(r, 3000));

    // Capture standard workstation with panels
    const file1 = path.join(outDir, 'flight-lab-full-panels.png');
    await page.screenshot({ path: file1, fullPage: false });
    fs.copyFileSync(file1, path.join(artifactDir, 'flight-lab-full-panels.png'));
    console.log('Saved flight-lab-full-panels.png');

    // Press 'h' to toggle out all panels
    console.log('Toggling out all panels by pressing H key...');
    await page.keyboard.press('KeyH');
    await new Promise((r) => setTimeout(r, 1200));

    // Press 'Space' to fire rocket boosters
    console.log('Pressing Spacebar to activate Rocket Boosters (78 kN)...');
    await page.keyboard.press('Space');
    await new Promise((r) => setTimeout(r, 800));

    // Capture pure car testing view
    const file2 = path.join(outDir, 'pure-car-testing-fullview.png');
    await page.screenshot({ path: file2, fullPage: false });
    fs.copyFileSync(file2, path.join(artifactDir, 'pure-car-testing-fullview.png'));
    console.log('Saved pure-car-testing-fullview.png');

  } finally {
    await browser.close();
  }
}

captureModes().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
