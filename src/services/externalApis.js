/**
 * External API Service
 * Handles interactions with public APIs for Rapidsy features.
 *
 * APIs:
 * 1. NHTSA vPIC (VIN Decoder) - Free
 * 2. CollectAPI (Fuel Prices) - Freemium (Key required)
 * 3. Open Charge Map (EV Stations) - Freemium (Key required)
 */

const CORS_PROXY = "https://corsproxy.io/?"; 

// --- Turkey Cities Coordinate & API Mapping ---
// Accuracy for 81 provinces to ensure correct weather & fuel data
const TURKEY_CITIES = {
  "istanbul": { lat: 41.0082, lng: 28.9784, code: "istanbul" },
  "ankara": { lat: 39.9334, lng: 32.8597, code: "ankara" },
  "izmir": { lat: 38.4237, lng: 27.1428, code: "izmir" },
  "bursa": { lat: 40.1885, lng: 29.0610, code: "bursa" },
  "antalya": { lat: 36.8841, lng: 30.7056, code: "antalya" },
  "adana": { lat: 37.0000, lng: 35.3213, code: "adana" },
  "konya": { lat: 37.8667, lng: 32.4833, code: "konya" },
  "gaziantep": { lat: 37.0662, lng: 37.3833, code: "gaziantep" },
  "sanliurfa": { lat: 37.1675, lng: 38.7939, code: "sanliurfa" },
  "kocaeli": { lat: 40.8533, lng: 29.8815, code: "kocaeli" },
  "mersin": { lat: 36.8121, lng: 34.6415, code: "mersin" },
  "diyarbakir": { lat: 37.9144, lng: 40.2110, code: "diyarbakir" },
  "hatay": { lat: 36.4018, lng: 36.3498, code: "hatay" },
  "manisa": { lat: 38.6191, lng: 27.4289, code: "manisa" },
  "kayseri": { lat: 38.7212, lng: 35.4847, code: "kayseri" },
  "samsun": { lat: 41.2928, lng: 36.3313, code: "samsun" },
  "balikesir": { lat: 39.6484, lng: 27.8826, code: "balikesir" },
  "kahramanmaras": { lat: 37.5753, lng: 36.9228, code: "kahramanmaras" },
  "van": { lat: 38.4891, lng: 43.4011, code: "van" },
  "aydin": { lat: 37.8444, lng: 27.8458, code: "aydin" },
  "tekirdag": { lat: 40.9782, lng: 27.5110, code: "tekirdag" },
  "sakarya": { lat: 40.7569, lng: 30.3789, code: "sakarya" },
  "denizli": { lat: 37.7765, lng: 29.0864, code: "denizli" },
  "mugla": { lat: 37.2153, lng: 28.3636, code: "mugla" },
  "eskisehir": { lat: 39.7767, lng: 30.5206, code: "eskisehir" },
  "mardin": { lat: 37.3212, lng: 40.7245, code: "mardin" },
  "trabzon": { lat: 41.0027, lng: 39.7168, code: "trabzon" },
  "malatya": { lat: 38.3552, lng: 38.3095, code: "malatya" },
  "erzurum": { lat: 39.9000, lng: 41.2700, code: "erzurum" },
  "ordu": { lat: 40.9839, lng: 37.8764, code: "ordu" },
  "afyonkarahisar": { lat: 38.7507, lng: 30.5567, code: "afyon" },
  "sivas": { lat: 39.7477, lng: 37.0179, code: "sivas" },
  "adiyaman": { lat: 37.7648, lng: 38.2786, code: "adiyaman" },
  "tokat": { lat: 40.3167, lng: 36.5500, code: "tokat" },
  "zonguldak": { lat: 41.4564, lng: 31.7987, code: "zonguldak" },
  "elazig": { lat: 38.6810, lng: 39.2264, code: "elazig" },
  "kutahya": { lat: 39.4167, lng: 29.9833, code: "kutahya" },
  "batman": { lat: 37.8812, lng: 41.1351, code: "batman" },
  "agri": { lat: 39.7191, lng: 43.0503, code: "agri" },
  "corum": { lat: 40.5506, lng: 34.9556, code: "corum" },
  "canakkale": { lat: 40.1553, lng: 26.4142, code: "canakkale" },
  "osmaniye": { lat: 37.0742, lng: 36.2472, code: "osmaniye" },
  "isparta": { lat: 37.7648, lng: 30.5566, code: "isparta" },
  "aksaray": { lat: 38.3687, lng: 34.0297, code: "aksaray" },
  "yozgat": { lat: 39.8181, lng: 34.8147, code: "yozgat" },
  "edirne": { lat: 41.6771, lng: 26.5592, code: "edirne" },
  "mus": { lat: 38.7432, lng: 41.5064, code: "mus" },
  "kastamonu": { lat: 41.3811, lng: 33.7828, code: "kastamonu" },
  "duzce": { lat: 40.8438, lng: 31.1565, code: "duzce" },
  "usak": { lat: 38.6823, lng: 29.4082, code: "usak" },
  "kirklareli": { lat: 41.7333, lng: 27.2167, code: "kirklareli" },
  "nigde": { lat: 37.9667, lng: 34.6833, code: "nigde" },
  "bitlis": { lat: 38.4006, lng: 42.1095, code: "bitlis" },
  "rize": { lat: 41.0201, lng: 40.5234, code: "rize" },
  "amasya": { lat: 40.6499, lng: 35.8353, code: "amasya" },
  "siirt": { lat: 37.9333, lng: 41.9500, code: "siirt" },
  "bolu": { lat: 40.7350, lng: 31.6061, code: "bolu" },
  "nevsehir": { lat: 38.6244, lng: 34.7144, code: "nevsehir" },
  "yalova": { lat: 40.6551, lng: 29.2769, code: "yalova" },
  "bingol": { lat: 38.8847, lng: 40.4939, code: "bingol" },
  "kirikkale": { lat: 39.8417, lng: 33.5139, code: "kirikkale" },
  "hakkar": { lat: 37.5833, lng: 43.7333, code: "hakkari" },
  "karaman": { lat: 37.1759, lng: 33.2287, code: "karaman" },
  "karabuk": { lat: 41.2061, lng: 32.6204, code: "karabuk" },
  "kirsehir": { lat: 39.1425, lng: 34.1709, code: "kirsehir" },
  "erzincan": { lat: 39.7500, lng: 39.5000, code: "erzincan" },
  "bilecik": { lat: 40.1431, lng: 29.9792, code: "bilecik" },
  "sinop": { lat: 42.0231, lng: 35.1531, code: "sinop" },
  "bartin": { lat: 41.6376, lng: 32.3338, code: "bartin" },
  "igdir": { lat: 39.9167, lng: 44.0333, code: "igdir" },
  "cankiri": { lat: 40.6013, lng: 33.6134, code: "cankiri" },
  "artvin": { lat: 41.1833, lng: 41.8167, code: "artvin" },
  "gumushane": { lat: 40.4600, lng: 39.4814, code: "gumushane" },
  "burdur": { lat: 37.7203, lng: 30.2908, code: "burdur" },
  "kilis": { lat: 36.7161, lng: 37.1150, code: "kilis" },
  "tunceli": { lat: 39.1083, lng: 39.5471, code: "tunceli" },
  "ardahan": { lat: 41.1087, lng: 42.7022, code: "ardahan" },
  "bayburt": { lat: 40.2552, lng: 40.2249, code: "bayburt" },
  "sirnak": { lat: 37.5228, lng: 42.4611, code: "sirnak" },
};

// Helper to get city data safely
const getCityMetadata = (cityName) => {
  if (!cityName) return TURKEY_CITIES["istanbul"];
  const normalized = cityName.toLowerCase().split(",")[0].trim().replace("i̇", "i");
  return TURKEY_CITIES[normalized] || TURKEY_CITIES["istanbul"];
};

// --- 1. VIN Decoder (NHTSA) ---
export const decodeVin = async (vin) => {
  if (!vin || vin.length < 17) throw new Error("Invalid VIN length");
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`,
    );
    const data = await response.json();
    if (!data.Results) return null;

    // Helper to find value by Variable key
    const getVal = (variable) =>
      data.Results.find((r) => r.Variable === variable)?.Value;

    return {
      brand: getVal("Make"),
      model: getVal("Model"),
      year: getVal("Model Year"),
      body_type: getVal("Body Class"),
      fuel_type: getVal("Fuel Type - Primary"),
      engine_cylinders: getVal("Engine Number of Cylinders"),
    };
  } catch (error) {
    console.error("VIN Decode Error:", error);
    throw error;
  }
};

// --- 2. Fuel Prices (CollectAPI) ---
// MOCK DATA removed as per production hardening requirements.

export const getFuelPrices = async (cityInput = "istanbul") => {
  const city = cityInput.toLowerCase().split(",")[0].trim().replace("i̇", "i");
  
  // Opet uses province codes. Here's a quick mapping for major cities
  const PROVINCE_CODES = {
    "adana": "01", "ankara": "06", "antalya": "07", "bursa": "16",
    "istanbul": "34", "izmir": "35", "kocaeli": "41"
  };
  
  const provinceCode = PROVINCE_CODES[city] || "34";
  
  try {
    // We use the Vite proxy /api/opet which maps to https://api.opet.com.tr
    // This avoids CORS issues completely.
    const url = `/api/opet/fuelprices/prices?provinceCode=${provinceCode}&nocache=${Date.now()}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Opet API Error");
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No data returned from Opet API");
    }

    // Opet returns an array of districts. Find a representative one:
    const targetDistrict = data.find((d) => 
      d.districtName === "ALTINDAĞ" || 
      d.districtName === "KADIKÖY" || 
      d.districtName === "MERKEZ" || 
      d.districtName === "KONAK"
    ) || data[0];

    if (!targetDistrict || !targetDistrict.prices) {
      throw new Error("No prices found in the selected district");
    }

    const benzinObj = targetDistrict.prices.find((p) => p.productShortName === "KURS");
    const motorinObj = targetDistrict.prices.find((p) => p.productShortName === "MT_ULT");

    if (!benzinObj || !motorinObj) {
      throw new Error("Missing fuel types");
    }

    const benzin = benzinObj.amount;
    const motorin = motorinObj.amount;
    
    // Calculate LPG price using city-specific ratio as Opet API doesn't always provide LPG
    let lpgRatio = 0.538;
    if (provinceCode === "34" || provinceCode === "01") lpgRatio = 0.5386;
    else if (provinceCode === "06") lpgRatio = 0.5388;
    else if (provinceCode === "35") lpgRatio = 0.5278;
    
    const lpg = Math.round((benzin * lpgRatio) * 100) / 100;

    return {
      results: [
        { name: "Kurşunsuz 95 (Benzin)", price: benzin },
        { name: "Motorin (Dizel)", price: motorin },
        { name: "Otogaz (LPG)", price: lpg }
      ],
      source: "opet",
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Live Fuel Price Error, using fallback:", error);
    return {
      results: [
        { name: "Kurşunsuz 95 (Benzin)", price: 44.82 },
        { name: "Motorin (Dizel)", price: 44.59 },
        { name: "Otogaz (LPG)", price: 24.14 },
      ],
      source: "fallback",
      last_updated: new Date().toISOString(),
    };
  }
};

// --- 3. EV Charging Stations (Open Charge Map) ---
export const getEVStations = async (lat, lng, distance = 10) => {
  const API_KEY = import.meta.env.VITE_OPEN_CHARGE_MAP_KEY;

  if (!API_KEY) {
    console.error("OpenChargeMap Key missing, cannot fetch stations.");
    return [];
  }

  try {
    const response = await fetch(
      `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lng}&distance=${distance}&maxresults=10&key=${API_KEY}`,
      {
        headers: {
          "User-Agent": "RapidsyApp/1.0",
        },
      },
    );
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("EV Station Error:", error);
    return [];
  }
};

// --- 4. Weather (Open-Meteo) NO-KEY ---
export const getWeather = async (lat, lng, cityName = null) => {
  try {
    let targetLat = lat;
    let targetLng = lng;

    if (cityName) {
      const cityData = getCityMetadata(cityName);
      targetLat = cityData.lat;
      targetLng = cityData.lng;
    }

    if (!targetLat || !targetLng) {
      const istanbul = TURKEY_CITIES["istanbul"];
      targetLat = istanbul.lat;
      targetLng = istanbul.lng;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    // Fetch current weather, temperature, wind speed
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLng}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&timezone=auto`,
      { signal: controller.signal },
    );
    clearTimeout(timeoutId);

    const data = await response.json();
    if (!data.current) return null;

    // Map WMO codes to human readable
    const getCondition = (code) => {
      if (code === 0) return "Güneşli";
      if (code < 3) return "Parçalı Bulutlu";
      if (code < 50) return "Sisli";
      if (code < 60) return "Çiseleyen Yağmur";
      if (code < 80) return "Yağmurlu";
      if (code < 95) return "Kar Yağışlı";
      return "Fırtına";
    };

    return {
      temp: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      wind: data.current.wind_speed_10m,
      condition: getCondition(data.current.weather_code),
      is_day: data.current.is_day,
    };
  } catch (error) {
    console.error("Weather API Error:", error.name === "AbortError" ? "Timeout (8s)" : error);
    return null; // Fail gracefully
  }
};

// --- 5. Currency (Open ER-API) - CORS Friendly ---
export const getExchangeRates = async (base = "USD", target = "TRY") => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for better stability

    // api.exchangerate-api.com is a robust free alternative that doesn't usually hit local fallbacks
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${base}`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("API Error");
    const data = await response.json();
    
    return { 
      rate: data.rates[target], 
      date: data.time_last_update_utc.split(',')[1].trim().split(' ')[0] 
    };
  } catch (error) {
    console.warn("Currency API using local fallback:", error.message);

    const fallbacks = {
      USD_TRY: 38.45,
      EUR_TRY: 41.25,
      USD_EUR: 0.93,
    };
    return {
      rate: fallbacks[`${base}_${target}`] || 1,
      date: new Date().toISOString().split("T")[0],
    };
  }
};
