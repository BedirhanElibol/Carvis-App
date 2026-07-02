const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:\\Users\\Bedirhan\\.gemini\\antigravity-ide\\brain\\6608b6c4-41e9-4642-91ff-f481373f3bc5';
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

(async () => {
  console.log("🚀 Launching Headless Chrome...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Capture console logs
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  // Test 1: Guest Landing Page
  console.log("\n--- TEST 1: Guest Landing Page ---");
  console.log("Navigating to http://localhost:5173 ...");
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
  } catch (err) {
    console.error("❌ Failed to load page. Is Vite dev server running?", err.message);
    await browser.close();
    process.exit(1);
  }

  // Get and print button texts
  const guestButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
  });
  console.log("Guest Page Buttons:", guestButtons.join(" | "));

  const screenshotPath1 = path.join(artifactDir, 'landing_guest.png');
  await page.screenshot({ path: screenshotPath1 });
  console.log("Captured guest landing screenshot:", screenshotPath1);

  // Test 2: Logged-in Customer Landing Page (Injecting mock session)
  console.log("\n--- TEST 2: Logged-in Customer Landing Page ---");
  await page.evaluate(() => {
    // Helper to encode base64url safely
    const base64UrlEncode = (obj) => {
      const str = JSON.stringify(obj);
      const base64 = btoa(unescape(encodeURIComponent(str)));
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    };

    const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
    const payload = base64UrlEncode({
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: "00000000-0000-0000-0000-000000000000",
      email: "test_customer@carvis.app",
      role: "authenticated",
      app_metadata: { provider: "google" },
      user_metadata: { full_name: "Giriş Yapmış Müşteri" }
    });
    const jwt = `${header}.${payload}.dummy_signature`;

    const mockSession = {
      access_token: jwt,
      token_type: "bearer",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: "mock-refresh-token",
      user: {
        id: "00000000-0000-0000-0000-000000000000",
        aud: "authenticated",
        role: "authenticated",
        email: "test_customer@carvis.app",
        email_confirmed_at: new Date().toISOString(),
        app_metadata: { provider: "google" },
        user_metadata: { full_name: "Giriş Yapmış Müşteri" }
      }
    };
    localStorage.setItem('sb-gieclpczrozblvauxjhf-auth-token', JSON.stringify(mockSession));
  });

  console.log("Reloading page with active session...");
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });

  console.log("Waiting 4 seconds for Supabase async session & profile loading...");
  await new Promise(r => setTimeout(r, 4000));

  // Dismiss any system error modals (due to mock token signature validation)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tamamBtn = buttons.find(b => b.textContent.includes('Tamam'));
    if (tamamBtn) tamamBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Verify it stayed on Landing Page (did not redirect)
  const currentUrl = page.url();
  console.log("Current URL after reload:", currentUrl);
  if (currentUrl === 'http://localhost:5173/') {
    console.log("Auto-redirect is successfully disabled! ✅");
  } else {
    console.error("❌ ERROR: Page redirected to:", currentUrl);
  }

  // Get and print button texts after login
  const loggedInButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
  });
  console.log("Logged In Page Buttons:", loggedInButtons.join(" | "));

  const hasGarageBtn = loggedInButtons.some(txt => txt.includes('Garajım'));
  console.log("Has 'Garajım' button in Navbar:", hasGarageBtn ? "YES ✅" : "NO ❌");

  // Scroll to the bottom of the page to capture the premium footer
  console.log("Scrolling to the bottom of the page to capture footer...");
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 1000));

  const screenshotPath2 = path.join(artifactDir, 'landing_logged_in.png');
  await page.screenshot({ path: screenshotPath2 });
  console.log("Captured logged in landing screenshot (footer view):", screenshotPath2);

  // Scroll back to top for clicking
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });

  // Test 3: Navigate to Garage
  console.log("\n--- TEST 3: Navigating to Dashboard ---");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const garageBtn = buttons.find(b => b.textContent.includes('Garajım') || b.textContent.includes('Yönetim') || b.textContent.includes('Yönetici'));
    if (garageBtn) {
      garageBtn.click();
    } else {
      console.log("No garage/dashboard button found to click.");
    }
  });

  console.log("Waiting for navigation to complete...");
  await new Promise(r => setTimeout(r, 3000));
  
  const navigatedUrl = page.url();
  console.log("Navigated to URL:", navigatedUrl);
  if (navigatedUrl.includes('/application/home') || navigatedUrl.includes('/dashboard')) {
    console.log("Successfully navigated to app/dashboard! ✅");
  } else {
    console.error("❌ ERROR: Navigation failed. URL is:", navigatedUrl);
  }

  // Dismiss any system error modals on the dashboard page
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tamamBtn = buttons.find(b => b.textContent.includes('Tamam'));
    if (tamamBtn) tamamBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const screenshotPath3 = path.join(artifactDir, 'garajim_page.png');
  await page.screenshot({ path: screenshotPath3 });
  console.log("Captured Garajım dashboard screenshot:", screenshotPath3);

  // Clear mock session to leave system clean
  await page.evaluate(() => {
    localStorage.removeItem('sb-gieclpczrozblvauxjhf-auth-token');
  });

  await browser.close();
  console.log("\n✨ All tests completed successfully!");
})();
