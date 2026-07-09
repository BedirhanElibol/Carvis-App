const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Hedef Şehirler (Türkiye'nin 81 ili)
const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

// Hedef İş Kolları
const CATEGORIES = [
  "Oto Tamir", "Oto Sanayi", "Oto Yedek Parça", 
  "Oto Aksesuar", "Vale Hizmeti", "Oto Elektrik", 
  "Kaporta Boya", "Oto Lastik", "Oto Yıkama ve Detay"
];

const CSV_PATH = path.join(__dirname, 'contacts.csv');

// Kayıtlı numaraları hafızada tutacağız ki aynı numarayı iki kez kaydetmeyelim
const existingPhones = new Set();

// Bekleme fonksiyonu (Spam koruması)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function loadExistingContacts() {
  return new Promise((resolve) => {
    if (!fs.existsSync(CSV_PATH)) {
      resolve();
      return;
    }
    
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        if (row.telefon) existingPhones.add(row.telefon);
      })
      .on('end', () => {
        console.log(`📦 Önceden kayıtlı ${existingPhones.size} numara hafızaya alındı.`);
        resolve();
      });
  });
}

async function scrapeQuery(browser, query) {
  console.log(`\n🔎 Aranıyor: "${query}"`);
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch {
    console.log(`⚠️ Hata: Sayfa yüklenemedi (${query}) - Atlanıyor.`);
    await page.close();
    return 0;
  }

  console.log("Harita kaydırılıyor (Scroll)... Lütfen bekleyin.");

  await page.evaluate(async () => {
    return new Promise((resolve) => {
      const wrapper = document.querySelector('div[role="feed"]');
      if (!wrapper) {
        resolve();
        return;
      }

      let distance = 1000;
      let scrolls = 0;
      let maxScrolls = 25; // Kaydırma sayısını artırdık

      const timer = setInterval(() => {
        wrapper.scrollBy(0, distance);
        scrolls++;

        if (scrolls >= maxScrolls) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });

  const results = await page.evaluate(() => {
    const items = [];
    const elements = document.querySelectorAll('a[href*="/maps/place/"]');
    const phoneRegex = /(?:0|\+90|90)?[ (-]?([2-5]\d{2})[ -)]?(\d{3})[ -]?(\d{2})[ -]?(\d{2})/;

    elements.forEach((el) => {
      const name = el.getAttribute('aria-label');
      if (!name) return;
      
      const parentCard = el.parentElement ? el.parentElement.parentElement : null;
      const cardText = parentCard ? parentCard.innerText : "";
      const match = cardText.match(phoneRegex);
      
      if (match) {
        let phone = match[0].replace(/\D/g, '');
        if (phone.length === 10) phone = '0' + phone;
        if (phone.length === 12 && phone.startsWith('90')) phone = '0' + phone.substring(2);

        items.push({ name: name.replace(/,/g, ''), phone: phone });
      }
    });
    
    return items;
  });

  await page.close();

  let newContactsAdded = 0;
  let csvContent = "";

  if (!fs.existsSync(CSV_PATH) || fs.readFileSync(CSV_PATH, 'utf8').trim() === '') {
    csvContent = "isim,telefon\n";
  }

  results.forEach(item => {
    if (!existingPhones.has(item.phone)) {
      csvContent += `${item.name},${item.phone}\n`;
      existingPhones.add(item.phone);
      newContactsAdded++;
    }
  });

  if (newContactsAdded > 0) {
    fs.appendFileSync(CSV_PATH, csvContent, 'utf8');
    console.log(`✅ ${newContactsAdded} YENİ numara bulundu ve CSV'ye kaydedildi!`);
  } else {
    console.log("⚠️ Yeni numara bulunamadı (Hepsi zaten kayıtlı veya listede yok).");
  }

  return newContactsAdded;
}

async function runBulkScraper() {
  console.log("==========================================");
  console.log("🚀 DEV TÜRKİYE SCRAPER BAŞLATILIYOR...");
  console.log("==========================================\n");

  await loadExistingContacts();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let totalNewAdded = 0;
  let totalSearches = CITIES.length * CATEGORIES.length;
  let currentSearch = 0;

  for (let city of CITIES) {
    const promises = CATEGORIES.map(async (cat) => {
      currentSearch++;
      const query = `${city} ${cat}`;
      console.log(`\n--- İlerleme: [${currentSearch} / ${totalSearches}] ---`);
      
      const added = await scrapeQuery(browser, query);
      return added;
    });

    const results = await Promise.all(promises);
    totalNewAdded += results.reduce((acc, added) => acc + added, 0);

    // Spam yememek için aramalar arası bekleme (şehirler arası)
    if (currentSearch < totalSearches) {
      const waitTime = Math.floor(Math.random() * (15000 - 8000 + 1)) + 8000; // 8 - 15 saniye arası
      console.log(`⏳ Google'ı şüphelendirmemek için bekleniyor... (${Math.round(waitTime/1000)} sn)`);
      await sleep(waitTime);
    }
  }

  await browser.close();
  console.log("\n==========================================");
  console.log("🎉 TÜM İŞLEMLER TAMAMLANDI!");
  console.log(`Toplam ${totalNewAdded} YENİ numara rehberinize eklendi!`);
  console.log("==========================================");
}

runBulkScraper().catch(err => {
  console.error("Beklenmeyen bir hata oluştu:", err);
});
