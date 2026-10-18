const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function verifyRealtimeUI() {
  const artifactDir = path.resolve('C:/Users/user/.gemini/antigravity/brain/f3390f9f-1872-4bdb-9fc1-81a593d85d5b');
  console.log('Artifacts will be saved to:', artifactDir);

  const browserPath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  console.log('Using browser:', browserPath);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1600,1000',
      '--use-gl=angle',
      '--use-angle=swiftshader',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000 });
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2500));

    // 1. Capture Main Mission Control Dashboard (Home) with Left Status, Right Oscilloscope & Live Panels
    console.log('Capturing Screen 1: Real-Time Mission Control Dashboard (Home)...');
    await page.screenshot({
      path: path.join(artifactDir, 'realtime-ui-dashboard-home.png'),
    });

    // 2. Open Top Nav: [Vehicle] (Digital Twin & Architecture Explorer)
    console.log('Opening [Vehicle] Digital Twin Modal...');
    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('header nav button'));
      const vehicleBtn = navButtons.find((b) => b.textContent.includes('Vehicle'));
      if (vehicleBtn) vehicleBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(artifactDir, 'realtime-ui-modal-vehicle.png'),
    });

    // 3. Open Top Nav: [Simulation] (Real-Time Physics Solver & Math Equations)
    console.log('Opening [Simulation] Math Solver Modal...');
    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('header nav button'));
      const simBtn = navButtons.find((b) => b.textContent.includes('Simulation'));
      if (simBtn) simBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(artifactDir, 'realtime-ui-modal-simulation.png'),
    });

    // 4. Open Top Nav: [Testing] (Mission Control Battery M-01 to M-09)
    console.log('Opening [Testing] Mission Control Battery Modal...');
    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('header nav button'));
      const testBtn = navButtons.find((b) => b.textContent.includes('Testing'));
      if (testBtn) testBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(artifactDir, 'realtime-ui-modal-testing.png'),
    });

    // 5. Open Top Nav: [AI Autonomy] (FSD Neural Planner & FSM Graph)
    console.log('Opening [AI Autonomy] Neural Planner Modal...');
    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('header nav button'));
      const autoBtn = navButtons.find((b) => b.textContent.includes('AI Autonomy'));
      if (autoBtn) autoBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(artifactDir, 'realtime-ui-modal-autonomy.png'),
    });

    // 6. Open Top Nav: [Reports] (Session Telemetry Summary & Historical Runs)
    console.log('Opening [Reports] Telemetry Summary Modal...');
    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('header nav button'));
      const repBtn = navButtons.find((b) => b.textContent.includes('Reports'));
      if (repBtn) repBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(artifactDir, 'realtime-ui-modal-reports.png'),
    });

    // 7. Open Top Nav: [Settings] (Audio Synth, Units, FX)
    console.log('Opening [Settings] Configuration Modal...');
    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('header nav button'));
      const setBtn = navButtons.find((b) => b.textContent.includes('Settings'));
      if (setBtn) setBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(artifactDir, 'realtime-ui-modal-settings.png'),
    });

    // Return to Home
    console.log('Returning to Home and firing Cold-Gas BOOST to verify live telemetry spikes...');
    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('header nav button'));
      const homeBtn = navButtons.find((b) => b.textContent.includes('Home'));
      if (homeBtn) homeBtn.click();

      // Trigger Boost
      if (window.vehicle) {
        window.vehicle.triggerRocketBoost(3500);
      }
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Capture Active Thrust Boost Telemetry Spike on Canvas Oscilloscope
    await page.screenshot({
      path: path.join(artifactDir, 'realtime-ui-thrust-boost-live.png'),
    });

    console.log('All real-time UI & Navigation overhaul screenshots captured successfully!');
  } catch (err) {
    console.error('Puppeteer verification error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyRealtimeUI();
