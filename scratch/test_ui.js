const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting Chrome...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  console.log("Navigating to http://localhost:5173 ...");
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err) {
    console.log("Could not load page. Is dev server running?", err.message);
    await browser.close();
    process.exit(1);
  }

  // Find the toggle button
  const toggleBtnSelector = 'button[title*="Karanlık"], button[title*="Aydınlık"]';
  await page.waitForSelector(toggleBtnSelector, { timeout: 10000 }).catch(e => console.log("Toggle button not found"));

  console.log("--- BEFORE CLICK ---");
  let htmlClass = await page.evaluate(() => document.documentElement.className);
  let bodyClass = await page.evaluate(() => document.body.className);
  let bgColor = await page.evaluate(() => {
    const el = document.querySelector('.min-h-screen');
    return el ? window.getComputedStyle(el).backgroundColor : 'NOT_FOUND';
  });
  console.log('HTML Class:', htmlClass);
  console.log('Body Class:', bodyClass);
  console.log('LandingScreen Background Color:', bgColor);

  console.log("\nClicking toggle button...");
  await page.click(toggleBtnSelector);
  
  // Wait for React to re-render and animations to apply
  await new Promise(r => setTimeout(r, 2000));

  console.log("--- AFTER CLICK ---");
  htmlClass = await page.evaluate(() => document.documentElement.className);
  bodyClass = await page.evaluate(() => document.body.className);
  bgColor = await page.evaluate(() => {
    const el = document.querySelector('.min-h-screen');
    return el ? window.getComputedStyle(el).backgroundColor : 'NOT_FOUND';
  });
  console.log('HTML Class:', htmlClass);
  console.log('Body Class:', bodyClass);
  console.log('LandingScreen Background Color:', bgColor);

  await browser.close();
})();
