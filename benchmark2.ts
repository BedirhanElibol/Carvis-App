const CITIES = [
  { code: "01", name: "Adana" }, { code: "02", name: "Adıyaman" }, { code: "03", name: "Afyonkarahisar" },
  { code: "04", name: "Ağrı" }, { code: "05", name: "Amasya" }, { code: "06", name: "Ankara" },
  { code: "07", name: "Antalya" }, { code: "08", name: "Artvin" }, { code: "09", name: "Aydın" },
  { code: "10", name: "Balıkesir" }
];

async function fetchCity(city) {
  try {
    const response = await fetch(`https://api.opet.com.tr/api/fuelprices/prices?provinceCode=${city.code}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (err) {
    return null;
  }
}

async function runSequential() {
  const start = performance.now();
  for (const city of CITIES) {
    await fetchCity(city);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const end = performance.now();
  console.log(`Sequential time (10 cities): ${(end - start).toFixed(2)} ms`);
}

async function runConcurrent() {
  const start = performance.now();
  const promises = CITIES.map(city => fetchCity(city));
  await Promise.allSettled(promises);
  const end = performance.now();
  console.log(`Concurrent time (10 cities): ${(end - start).toFixed(2)} ms`);
}

async function main() {
  console.log("Running sequential benchmark...");
  await runSequential();
  console.log("\nRunning concurrent benchmark...");
  await runConcurrent();
}

main();
