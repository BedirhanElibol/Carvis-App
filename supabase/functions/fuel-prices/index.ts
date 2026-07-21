import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface FuelPriceResult {
  name: string;
  price: number;
}

interface OpetPrice {
  productShortName: string;
  amount: number;
}

interface OpetDistrict {
  districtName: string;
  prices: OpetPrice[];
}

interface POPrice {
  productName: string;
  amount: number;
}

const PROVINCE_CODES: Record<string, string> = {
  "adana": "01", "adiyaman": "02", "afyonkarahisar": "03", "afyon": "03", "agri": "04", "amasya": "05", "ankara": "06", "antalya": "07", "artvin": "08", "aydin": "09",
  "balikesir": "10", "bilecik": "11", "bingol": "12", "bitlis": "13", "bolu": "14", "burdur": "15", "bursa": "16", "canakkale": "17", "cankiri": "18", "corum": "19",
  "denizli": "20", "diyarbakir": "21", "edirne": "22", "elazig": "23", "erzincan": "24", "erzurum": "25", "eskisehir": "26", "gaziantep": "27", "giresun": "28", "gumushane": "29",
  "hakkari": "30", "hatay": "31", "isparta": "32", "mersin": "33", "istanbul": "34", "izmir": "35", "kars": "36", "kastamonu": "37", "kayseri": "38", "kirklareli": "39",
  "kirsehir": "40", "kocaeli": "41", "konya": "42", "kutahya": "43", "malatya": "44", "manisa": "45", "kahramanmaras": "46", "mardin": "47", "mugla": "48", "mus": "49",
  "nevsehir": "50", "nigde": "51", "ordu": "52", "rize": "53", "sakarya": "54", "samsun": "55", "siirt": "56", "sinop": "57", "sivas": "58", "tekirdag": "59",
  "tokat": "60", "trabzon": "61", "tunceli": "62", "sanliurfa": "63", "usak": "64", "van": "65", "yozgat": "66", "zonguldak": "67", "aksaray": "68", "bayburt": "69",
  "karaman": "70", "kirikkale": "71", "batman": "72", "sirnak": "73", "bartin": "74", "ardahan": "75", "igdir": "76", "yalova": "77", "karabuk": "78", "kilis": "79", "osmaniye": "80", "duzce": "81"
};

async function fetchOpetPrices(provinceCode: string): Promise<FuelPriceResult[] | null> {
  try {
    const res = await fetch(`https://api.opet.com.tr/api/fuelprices/prices?provinceCode=${provinceCode}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0 Safari/537.36", "Accept": "application/json" },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return null;
    const data = await res.json() as OpetDistrict[];
    if (!Array.isArray(data) || data.length === 0) return null;

    // Opet returns an array of districts. Find a representative one:
    const targetDistrict = data.find((d: OpetDistrict) => 
      d.districtName === "ALTINDAĞ" || 
      d.districtName === "KADIKÖY" || 
      d.districtName === "MERKEZ" || 
      d.districtName === "KONAK"
    ) || data[0];

    if (!targetDistrict || !targetDistrict.prices) return null;

    const benzinObj = targetDistrict.prices.find((p: OpetPrice) => p.productShortName === "KURS");
    const motorinObj = targetDistrict.prices.find((p: OpetPrice) => p.productShortName === "MT_ULT");

    if (!benzinObj || !motorinObj) return null;

    const benzin = benzinObj.amount;
    const motorin = motorinObj.amount;
    
    // Calculate LPG price using city-specific ratio
    let lpgRatio = 0.538;
    if (provinceCode === "34" || provinceCode === "01") lpgRatio = 0.5386; // Istanbul/Adana ratio
    else if (provinceCode === "06") lpgRatio = 0.5388; // Ankara ratio
    else if (provinceCode === "35") lpgRatio = 0.5278; // Izmir ratio
    
    const lpg = Math.round((benzin * lpgRatio) * 100) / 100;

    return [
      { name: "Kurşunsuz 95 (Benzin)", price: benzin },
      { name: "Motorin (Dizel)", price: motorin },
      { name: "Otogaz (LPG)", price: lpg }
    ];
  } catch (err) {
    console.error("fetchOpetPrices error:", err);
    return null;
  }
}

async function fetchPOPrices(provinceCode: string): Promise<FuelPriceResult[] | null> {
  try {
    const res = await fetch(`https://www.petrolofisi.com.tr/api/fuelprices/prices?provinceCode=${provinceCode}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return null;
    const data = await res.json() as POPrice[];
    const results: FuelPriceResult[] = [];
    const b = data.find((f: POPrice) => f.productName.includes("95"));
    const m = data.find((f: POPrice) => f.productName.includes("V/Max Diesel"));
    const l = data.find((f: POPrice) => f.productName.includes("POgaz"));
    if (b) results.push({ name: "Kurşunsuz 95 (Benzin)", price: b.amount });
    if (m) results.push({ name: "Motorin (Dizel)", price: m.amount });
    if (l) results.push({ name: "Otogaz (LPG)", price: l.amount });
    return results.length > 0 ? results : null;
  } catch { return null; }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  const url = new URL(req.url);
  const city = url.searchParams.get("city")?.toLowerCase() || "istanbul";
  const provinceCode = PROVINCE_CODES[city] || "34";

  // Aggregator Strategy: Try multiple sources to guarantee daily fresh data
  const sources = [
    { name: "opet", fn: () => fetchOpetPrices(provinceCode) },
    { name: "petrolofisi", fn: () => fetchPOPrices(provinceCode) }
  ];

  try {
    const fastestResult = await Promise.any(
      sources.map(async (source) => {
        const results = await source.fn();
        if (results) {
          return { source: source.name, results };
        }
        throw new Error(`${source.name} failed`);
      })
    );

    return new Response(
      JSON.stringify({ source: fastestResult.source, results: fastestResult.results, updatedAt: new Date().toISOString(), city }),
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    // Both sources failed, fall through to fallback
  }

  // Absolute last resort - 2026 calibrated fallback
  const fallback = [
    { name: "Kurşunsuz 95 (Benzin)", price: 64.76 },
    { name: "Motorin (Dizel)", price: 72.89 },
    { name: "Otogaz (LPG)", price: 35.56 },
  ];

  return new Response(
    JSON.stringify({ source: "fallback", results: fallback, updatedAt: new Date().toISOString(), city }),
    { headers: CORS_HEADERS }
  );
});
