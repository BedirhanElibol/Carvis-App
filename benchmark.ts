const CITIES = [
  { code: "01", name: "Adana" }, { code: "02", name: "Adıyaman" }, { code: "03", name: "Afyonkarahisar" },
  { code: "04", name: "Ağrı" }, { code: "05", name: "Amasya" }, { code: "06", name: "Ankara" },
  { code: "07", name: "Antalya" }, { code: "08", name: "Artvin" }, { code: "09", name: "Aydın" },
  { code: "10", name: "Balıkesir" }, { code: "11", name: "Bilecik" }, { code: "12", name: "Bingöl" },
  { code: "13", name: "Bitlis" }, { code: "14", name: "Bolu" }, { code: "15", name: "Burdur" },
  { code: "16", name: "Bursa" }, { code: "17", name: "Çanakkale" }, { code: "18", name: "Çankırı" },
  { code: "19", name: "Çorum" }, { code: "20", name: "Denizli" }, { code: "21", name: "Diyarbakır" },
  { code: "22", name: "Edirne" }, { code: "23", name: "Elazığ" }, { code: "24", name: "Erzincan" },
  { code: "25", name: "Erzurum" }, { code: "26", name: "Eskişehir" }, { code: "27", name: "Gaziantep" },
  { code: "28", name: "Giresun" }, { code: "29", name: "Gümüşhane" }, { code: "30", name: "Hakkari" },
  { code: "31", name: "Hatay" }, { code: "32", name: "Isparta" }, { code: "33", name: "Mersin" },
  { code: "34", name: "İstanbul" }, { code: "35", name: "İzmir" }, { code: "36", name: "Kars" },
  { code: "37", name: "Kastamonu" }, { code: "38", name: "Kayseri" }, { code: "39", name: "Kırklareli" },
  { code: "40", name: "Kırşehir" }, { code: "41", name: "Kocaeli" }, { code: "42", name: "Konya" },
  { code: "43", name: "Kütahya" }, { code: "44", name: "Malatya" }, { code: "45", name: "Manisa" },
  { code: "46", name: "Kahramanmaraş" }, { code: "47", name: "Mardin" }, { code: "48", name: "Muğla" },
  { code: "49", name: "Muş" }, { code: "50", name: "Nevşehir" }, { code: "51", name: "Niğde" },
  { code: "52", name: "Ordu" }, { code: "53", name: "Rize" }, { code: "54", name: "Sakarya" },
  { code: "55", name: "Samsun" }, { code: "56", name: "Siirt" }, { code: "57", name: "Sinop" },
  { code: "58", name: "Sivas" }, { code: "59", name: "Tekirdağ" }, { code: "60", name: "Tokat" },
  { code: "61", name: "Trabzon" }, { code: "62", name: "Tunceli" }, { code: "63", name: "Şanlıurfa" },
  { code: "64", name: "Uşak" }, { code: "65", name: "Van" }, { code: "66", name: "Yozgat" },
  { code: "67", name: "Zonguldak" }, { code: "68", name: "Aksaray" }, { code: "69", name: "Bayburt" },
  { code: "70", name: "Karaman" }, { code: "71", name: "Kırıkkale" }, { code: "72", name: "Batman" },
  { code: "73", name: "Şırnak" }, { code: "74", name: "Bartın" }, { code: "75", name: "Ardahan" },
  { code: "76", name: "Iğdır" }, { code: "77", name: "Yalova" }, { code: "78", name: "Karabük" },
  { code: "79", name: "Kilis" }, { code: "80", name: "Osmaniye" }, { code: "81", name: "Düzce" }
];

async function fetchCity(city) {
  try {
    const response = await fetch(`https://api.opet.com.tr/api/fuelprices/prices?provinceCode=${city.code}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }
    
    const targetDistrict = data.find((d) => 
      d.districtName === "ALTINDAĞ" || 
      d.districtName === "KADIKÖY" || 
      d.districtName === "MERKEZ" || 
      d.districtName === "KONAK"
    ) || data[0];

    if (!targetDistrict || !targetDistrict.prices) return null;

    const benzinObj = targetDistrict.prices.find((p) => p.productShortName === "KURS");
    const motorinObj = targetDistrict.prices.find((p) => p.productShortName === "MT_ULT");

    if (!benzinObj || !motorinObj) return null;

    const benzin = benzinObj.amount;
    const motorin = motorinObj.amount;
    
    let lpgObj = targetDistrict.prices.find((p) => p.productShortName === "LPG" || p.productName.includes("LPG") || p.productName.includes("Otogaz"));
    
    let lpg = 0;
    if (lpgObj) {
        lpg = lpgObj.amount;
    } else {
        let lpgRatio = 0.538;
        if (city.code === "34" || city.code === "01") lpgRatio = 0.5386;
        else if (city.code === "06") lpgRatio = 0.5388;
        else if (city.code === "35") lpgRatio = 0.5278;
        lpg = Math.round((benzin * lpgRatio) * 100) / 100;
    }

    return {
      province_code: city.code,
      city_name: city.name,
      benzin: benzin,
      motorin: motorin,
      lpg: lpg,
      last_fetched_at: new Date().toISOString()
    };
  } catch (err) {
    return null;
  }
}

async function runSequential() {
  const allPrices = [];
  const start = performance.now();
  for (const city of CITIES) {
    const price = await fetchCity(city);
    if (price) allPrices.push(price);
  }
  const end = performance.now();
  console.log(`Sequential time: ${(end - start).toFixed(2)} ms`);
  console.log(`Prices collected: ${allPrices.length}`);
}

async function runConcurrent() {
  const start = performance.now();
  const promises = CITIES.map(city => fetchCity(city));
  const results = await Promise.allSettled(promises);
  const allPrices = results
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value);
  const end = performance.now();
  console.log(`Concurrent time: ${(end - start).toFixed(2)} ms`);
  console.log(`Prices collected: ${allPrices.length}`);
}

async function main() {
  console.log("Running sequential benchmark...");
  await runSequential();
  console.log("\nRunning concurrent benchmark...");
  await runConcurrent();
}

main();
