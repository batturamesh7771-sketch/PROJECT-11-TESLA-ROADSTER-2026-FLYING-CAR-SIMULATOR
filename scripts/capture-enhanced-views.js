const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function captureEnhancedViews() {
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

    // Capture Chase Camera in Active Hover
    const file1 = path.join(outDir, 'chase-cam-hover-balance.png');
    await page.screenshot({ path: file1 });
    fs.copyFileSync(file1, path.join(artifactDir, 'chase-cam-hover-balance.png'));
    console.log('Saved chase-cam-hover-balance.png');

    // Toggle panels out to Pure Car Testing View
    await page.keyboard.press('KeyH');
    await new Promise((r) => setTimeout(r, 1000));

    const file2 = path.join(outDir, 'pure-testing-hover-controls.png');
    await page.screenshot({ path: file2 });
    fs.copyFileSync(file2, path.join(artifactDir, 'pure-testing-hover-controls.png'));
    console.log('Saved pure-testing-hover-controls.png');

  } finally {
    await browser.close();
  }
}

captureEnhancedViews().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
