// =============================================================
// CARVIS FAIR PART PRICE WALL & BENCHMARK ENGINE (v1.0)
// Prevents mechanic part price inflation & empowers customer direct purchase
// =============================================================

import { getBuyBoxWinner } from './productUtils';

// Reference benchmark price dictionary for popular spare parts
export const PART_BENCHMARK_CATALOG = [
  { keywords: ["triger", "triger seti", "zamanlama kayışı"], minPrice: 1200, maxPrice: 1800, avgPrice: 1450 },
  { keywords: ["ön fren balatası", "fren balatası ön", "ön balata"], minPrice: 450, maxPrice: 850, avgPrice: 650 },
  { keywords: ["arka fren balatası", "fren balatası arka", "arka balata"], minPrice: 380, maxPrice: 720, avgPrice: 520 },
  { keywords: ["fren diski", "ön fren diski", "arka fren diski"], minPrice: 850, maxPrice: 1600, avgPrice: 1200 },
  { keywords: ["baskı balata", "debriyaj seti", "debriyaj baskı balata"], minPrice: 2200, maxPrice: 4200, avgPrice: 3100 },
  { keywords: ["volant", "sabit volant", "çift kütleli volant"], minPrice: 3500, maxPrice: 7500, avgPrice: 5200 },
  { keywords: ["şanzıman bilyesi", "debriyaj rulmanı", "prizdirek bilyası"], minPrice: 600, maxPrice: 1400, avgPrice: 950 },
  { keywords: ["amortisör", "ön amortisör", "arka amortisör"], minPrice: 1100, maxPrice: 2200, avgPrice: 1550 },
  { keywords: ["salıncak", "ön salıncak"], minPrice: 650, maxPrice: 1350, avgPrice: 950 },
  { keywords: ["rot başı", "rot mili", "z rot"], minPrice: 250, maxPrice: 550, avgPrice: 380 },
  { keywords: ["motor yağı", "yağ 5w30", "yağ 5w40", "castrol", "shell helix"], minPrice: 650, maxPrice: 1200, avgPrice: 890 },
  { keywords: ["yağ filtre", "hava filtre", "polen filtre", "filtre seti"], minPrice: 350, maxPrice: 750, avgPrice: 500 },
  { keywords: ["buji", "ateşleme bujisi", "kızdırma bujisi"], minPrice: 300, maxPrice: 900, avgPrice: 550 },
  { keywords: ["ateşleme bobini", "bobin"], minPrice: 750, maxPrice: 1650, avgPrice: 1150 },
  { keywords: ["devirdaim", "su pompası"], minPrice: 700, maxPrice: 1500, avgPrice: 1050 },
  { keywords: ["termostat"], minPrice: 350, maxPrice: 850, avgPrice: 550 },
  { keywords: ["radyatör", "su radyatörü"], minPrice: 1400, maxPrice: 2900, avgPrice: 2100 },
  { keywords: ["akü", "72ah akü", "60ah akü"], minPrice: 1800, maxPrice: 3500, avgPrice: 2400 },
  { keywords: ["şarj dinamosu", "alternatör"], minPrice: 2500, maxPrice: 5500, avgPrice: 3800 },
  { keywords: ["marş motoru"], minPrice: 2200, maxPrice: 4800, avgPrice: 3300 },
  { keywords: ["turbo", "turboşarj"], minPrice: 6500, maxPrice: 14500, avgPrice: 9800 },
  { keywords: ["enjektör"], minPrice: 3200, maxPrice: 7800, avgPrice: 5200 },
  { keywords: ["klima kompresörü"], minPrice: 4500, maxPrice: 9500, avgPrice: 6800 },
  { keywords: ["aks", "aks kafası"], minPrice: 950, maxPrice: 2400, avgPrice: 1600 }
];

/**
 * Calculates fair market retail price range for a part name and vehicle
 */
export const getPartMarketPriceRange = (partName = '', products = [], vehicle = null) => {
  if (!partName) return { min: 0, max: 0, avg: 0, foundInMarketplace: false };

  const cleanName = partName.toLowerCase().trim();

  // 1. First check if part exists in Carvis Live Marketplace products
  const matchingProducts = products.filter(p => {
    const pName = p.name?.toLowerCase() || '';
    const pCat = p.category?.toLowerCase() || '';
    return pName.includes(cleanName) || cleanName.includes(pName) || pCat.includes(cleanName);
  });

  if (matchingProducts.length > 0) {
    const prices = matchingProducts.map(p => {
      const winner = getBuyBoxWinner(p.offers);
      return winner?.price || p.price || 0;
    }).filter(pr => pr > 0);

    if (prices.length > 0) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      return {
        min,
        max: Math.max(max, Math.round(min * 1.25)),
        avg,
        foundInMarketplace: true,
        matchingProduct: matchingProducts[0]
      };
    }
  }

  // 2. Fallback to Benchmark Catalog
  const benchmark = PART_BENCHMARK_CATALOG.find(b =>
    b.keywords.some(kw => cleanName.includes(kw) || kw.includes(cleanName))
  );

  if (benchmark) {
    return {
      min: benchmark.minPrice,
      max: benchmark.maxPrice,
      avg: benchmark.avgPrice,
      foundInMarketplace: false
    };
  }

  // 3. Fallback heuristic if unknown part
  return {
    min: 500,
    max: 1500,
    avg: 900,
    foundInMarketplace: false
  };
};

/**
 * Validates mechanic part price against fair market ceiling
 */
export const validatePartPriceMarkup = (partName, mechanicPartPrice, products = [], vehicle = null) => {
  const numericPrice = Number(mechanicPartPrice) || 0;
  if (!partName || numericPrice <= 0) {
    return { isOverpriced: false, markupPercent: 0, fairMin: 0, fairMax: 0 };
  }

  const range = getPartMarketPriceRange(partName, products, vehicle);
  const fairMax = range.max;
  const fairMin = range.min;

  // Overpriced if mechanic price is > 15% above the market upper limit
  const threshold = fairMax * 1.15;
  const isOverpriced = numericPrice > threshold;
  const markupPercent = fairMax > 0 ? Math.round(((numericPrice - fairMax) / fairMax) * 100) : 0;
  const potentialSavings = Math.max(0, numericPrice - range.avg);

  return {
    isOverpriced,
    markupPercent: Math.max(0, markupPercent),
    fairMin,
    fairMax,
    fairAvg: range.avg,
    potentialSavings,
    foundInMarketplace: range.foundInMarketplace,
    matchingProduct: range.matchingProduct
  };
};

/**
 * Calculates Insurance Fair Market Compliance Index (0-100%) for insurance adjusters & anti-fraud audit
 */
export const calculateInsuranceFairMarketScore = (partsPrice = 0, laborPrice = 0, benchmarkMin = 0, benchmarkMax = 0) => {
  const partsNum = Number(partsPrice) || 0;
  const laborNum = Number(laborPrice) || 0;
  const total = partsNum + laborNum;

  if (total <= 0) return { score: 100, status: 'OPTIMAL', text: '%100 Piyasa Rayicine Uygun' };

  if (benchmarkMax > 0 && partsNum > benchmarkMax * 1.2) {
    const penalty = Math.min(40, Math.round(((partsNum - benchmarkMax) / benchmarkMax) * 50));
    const score = Math.max(50, 100 - penalty);
    return {
      score,
      status: 'OVERPRICED_WARNING',
      text: `%${score} Rayiç Derecesi (Parça Maliyeti Piyasa Tavanının Üzerinde)`
    };
  }

  return {
    score: 98,
    status: 'OPTIMAL',
    text: '%98 Tam Rayiç Uyumu (Sigorta Eksper Onayına Uygun)'
  };
};
