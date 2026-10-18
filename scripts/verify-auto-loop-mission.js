const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function verifyAutoLoopMission() {
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

    // 1. Initial State: Starting on the road
    console.log('1. Capturing Initial State on Runway...');
    const file1 = path.join(outDir, 'auto-loop-1-runway.png');
    await page.screenshot({ path: file1 });
    fs.copyFileSync(file1, path.join(artifactDir, 'auto-loop-1-runway.png'));
    console.log('Saved auto-loop-1-runway.png');

    // 2. Click AUTO LOOP button to trigger automated sequence
    console.log('2. Clicking AUTO LOOP button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const autoBtn = btns.find((b) => b.textContent && b.textContent.includes('AUTO LOOP'));
      if (autoBtn) autoBtn.click();
    });

    // Wait 4.5s for ramp climb
    console.log('Waiting 4.5s for rocket climb up the curved loop road...');
    await new Promise((r) => setTimeout(r, 4500));

    const file2 = path.join(outDir, 'auto-loop-2-climbing-ramp.png');
    await page.screenshot({ path: file2 });
    fs.copyFileSync(file2, path.join(artifactDir, 'auto-loop-2-climbing-ramp.png'));
    console.log('Saved auto-loop-2-climbing-ramp.png');

    // Wait 5.5s for apex mid-air flip & hover
    console.log('Waiting 5.5s for apex 152m flip and hover...');
    await new Promise((r) => setTimeout(r, 5500));

    const file3 = path.join(outDir, 'auto-loop-3-apex-hover.png');
    await page.screenshot({ path: file3 });
    fs.copyFileSync(file3, path.join(artifactDir, 'auto-loop-3-apex-hover.png'));
    console.log('Saved auto-loop-3-apex-hover.png');

  } finally {
    await browser.close();
  }
}

verifyAutoLoopMission().catch((err) => {
  console.error('Auto Loop Mission failed:', err);
  process.exit(1);
});
