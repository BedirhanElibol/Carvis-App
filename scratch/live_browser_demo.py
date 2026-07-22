import sys
import time

# Reconfigure stdout for utf-8 on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def run_visual_demo():
    print("Google Chrome baslatiliyor (Gorsel Mod)...")
    with sync_playwright() as p:
        # Launch real Chrome browser window on the user's desktop screen
        browser = p.chromium.launch(headless=False, args=["--start-maximized"])
        context = browser.new_context(no_viewport=True)
        page = context.new_page()

        print("1. Ana Sayfa Yukleniyor...")
        page.goto("http://localhost:5173/", wait_until="networkidle")
        time.sleep(2.5)

        print("2. Musteri Kokpitine Geciliyor...")
        page.goto("http://localhost:5173/application/home", wait_until="networkidle")
        time.sleep(3)

        print("3. Oto Tamirciler Ekranı...")
        page.goto("http://localhost:5173/app/mechanics", wait_until="networkidle")
        time.sleep(2.5)

        print("4. Yedek Parca Katalogu...")
        page.goto("http://localhost:5173/app/parts", wait_until="networkidle")
        time.sleep(2.5)

        print("5. Sigorta & Kasko Ekranı...")
        page.goto("http://localhost:5173/app/insurance", wait_until="networkidle")
        time.sleep(2.5)

        print("6. Canli Akaryakit Fiyatlari...")
        page.goto("http://localhost:5173/app/fuel", wait_until="networkidle")
        time.sleep(2.5)

        print("7. Kurumsal Partner Portali Giris Ekrani...")
        page.goto("http://localhost:5173/partner-login", wait_until="networkidle")
        time.sleep(3)

        print("Canli Gorsel Test Tamamlandi!")
        time.sleep(1)
        browser.close()

if __name__ == "__main__":
    run_visual_demo()
