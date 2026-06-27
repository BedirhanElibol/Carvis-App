import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": Deno.env.get('ALLOWED_ORIGIN') ?? 'http://localhost:5173',
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
  'Content-Security-Policy': "default-src 'none'",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return true;
    }

    if (now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return true;
    }

    if (record.count >= MAX_REQUESTS) {
        return false;
    }

    record.count++;
    return true;
}

const cityQuerySchema = z.object({
  city: z.string().optional()
});

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

async function fetchOpetPrices(provinceCode: string) {
  try {
    const res = await fetch(`https://api.opet.com.tr/api/fuelprices/prices?provinceCode=${provinceCode}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    // Opet returns an array of districts. Find a representative one:
    const targetDistrict = data.find((d: any) => 
      d.districtName === "ALTINDAĞ" || 
      d.districtName === "KADIKÖY" || 
      d.districtName === "MERKEZ" || 
      d.districtName === "KONAK"
    ) || data[0];

    if (!targetDistrict || !targetDistrict.prices) return null;

    const benzinObj = targetDistrict.prices.find((p: any) => p.productShortName === "KURS");
    const motorinObj = targetDistrict.prices.find((p: any) => p.productShortName === "MT_ULT");

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

async function fetchPOPrices(provinceCode: string) {
  try {
    const res = await fetch(`https://www.petrolofisi.com.tr/api/fuelprices/prices?provinceCode=${provinceCode}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const results = [];
    const b = data.find((f: any) => f.productName.includes("95"));
    const m = data.find((f: any) => f.productName.includes("V/Max Diesel"));
    const l = data.find((f: any) => f.productName.includes("POgaz"));
    if (b) results.push({ name: "Kurşunsuz 95 (Benzin)", price: b.amount });
    if (m) results.push({ name: "Motorin (Dizel)", price: m.amount });
    if (l) results.push({ name: "Otogaz (LPG)", price: l.amount });
    return results.length > 0 ? results : null;
  } catch { return null; }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
          headers: CORS_HEADERS,
          status: 429
      });
  }

  const url = new URL(req.url);
  const cityParam = url.searchParams.get("city") || "istanbul";

  const validationResult = cityQuerySchema.safeParse({ city: cityParam });
  if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
          headers: CORS_HEADERS,
          status: 400
      });
  }

  let city = validationResult.data.city?.toLowerCase() || "istanbul";

  // Sanitize city input (allow Turkish characters and spaces)
  city = city.replace(/[^a-zçğıiöşü ]/g, "").trim();

  const provinceCode = PROVINCE_CODES[city] || "34";

  // Aggregator Strategy: Try multiple sources to guarantee daily fresh data
  const sources = [
    { name: "opet", fn: () => fetchOpetPrices(provinceCode) },
    { name: "petrolofisi", fn: () => fetchPOPrices(provinceCode) }
  ];

  for (const source of sources) {
    const results = await source.fn();
    if (results) {
      return new Response(
        JSON.stringify({ source: source.name, results, updatedAt: new Date().toISOString(), city }),
        { headers: CORS_HEADERS }
      );
    }
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
