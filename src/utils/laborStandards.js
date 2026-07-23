/**
 * Carvis OEM Labor Standards Engine v2.0
 * Dynamic OEM Labor Times with Age, Engine Type & Premium Brand Class Multipliers
 */

// Full Master OEM Labor Hours Matrix (Base Hours per vehicle segment)
export const OEM_LABOR_MATRIX = {
  // 1. MOTOR VE MEKANİK SİSTEMLER
  oil_change: { hatchback: 0.6, sedan: 0.8, suv: 1.0, commercial: 0.8, name: "Periyodik Yağ & Filtre Bakımı", category: "Motor & Mekanik" },
  timing_belt: { hatchback: 2.5, sedan: 3.2, suv: 4.0, commercial: 3.5, name: "Triger Kayışı / Seti Değişimi", category: "Motor & Mekanik" },
  engine_overhaul: { hatchback: 12.0, sedan: 14.0, suv: 16.0, commercial: 15.0, name: "Motor Rektifiye & Genel Revizyon", category: "Motor & Mekanik" },
  cylinder_head: { hatchback: 4.0, sedan: 5.0, suv: 6.0, commercial: 5.5, name: "Subap Ayarı & Silindir Kapak Contası", category: "Motor & Mekanik" },
  clutch: { hatchback: 3.5, sedan: 4.5, suv: 5.5, commercial: 4.5, name: "Debriyaj Baskı Balata Değişimi", category: "Şanzıman Ustası" },
  transmission_overhaul: { hatchback: 6.0, sedan: 7.5, suv: 9.0, commercial: 8.0, name: "Şanzıman Revizyonu & Mechatronic Tamiri", category: "Şanzıman Ustası" },
  injectors: { hatchback: 1.5, sedan: 2.0, suv: 2.5, commercial: 2.2, name: "Yakıt Pompası & Enjektör Bakımı", category: "Pompa & Enjektör" },
  dpf_egr: { hatchback: 2.0, sedan: 2.5, suv: 3.0, commercial: 2.8, name: "DPF Partikül Filtresi & EGR Temizliği", category: "Pompa & Enjektör" },

  // 2. ELEKTRİK VE ELEKTRONİK SİSTEMLER
  battery: { hatchback: 0.3, sedan: 0.4, suv: 0.5, commercial: 0.4, name: "Akü Değişimi & Kodlama", category: "Oto Elektrik" },
  alternator_starter: { hatchback: 1.5, sedan: 2.0, suv: 2.5, commercial: 2.0, name: "Şarj Dinamosu & Marş Motoru Tamiri", category: "Oto Elektrik" },
  wiring_lights: { hatchback: 1.0, sedan: 1.2, suv: 1.5, commercial: 1.2, name: "Tesisat, Far & Silecek Motoru Tamiri", category: "Oto Elektrik" },
  ecu_repair: { hatchback: 1.5, sedan: 2.0, suv: 2.5, commercial: 2.0, name: "Oto Beyin (ECU/ABS/Airbag) & Yazılım", category: "Oto Beyin & Elektronik" },

  // 3. GÖVDE VE DIŞ AKSAM
  body_repair: { hatchback: 3.0, sedan: 4.0, suv: 5.0, commercial: 4.5, name: "Kaporta Düzeltme & Parça Değişimi", category: "Kaporta" },
  chassis_alignment: { hatchback: 6.0, sedan: 8.0, suv: 10.0, commercial: 9.0, name: "Şasi Düzeltme & Çektirme İşlemi", category: "Kaporta" },
  panel_painting: { hatchback: 2.5, sedan: 3.0, suv: 3.5, commercial: 3.2, name: "Parça Başı Fırınlı Boya & Cila", category: "Oto Boya" },
  full_painting: { hatchback: 20.0, sedan: 24.0, suv: 28.0, commercial: 26.0, name: "Komple Fırınlı Boya Kabini", category: "Oto Boya" },
  pdr_dents: { hatchback: 1.0, sedan: 1.5, suv: 2.0, commercial: 1.8, name: "Boyasız Göçük Düzeltme (PDR)", category: "Göçük Düzeltme" },

  // 4. YÜRÜYEN AKSAM VE SÜSPANSİYON
  wheel_alignment: { hatchback: 0.5, sedan: 0.6, suv: 0.8, commercial: 0.7, name: "Rot-Balans & Direksiyon Ayarı", category: "Ön Düzem & Rot-Balans" },
  brakes: { hatchback: 0.8, sedan: 1.0, suv: 1.2, commercial: 1.1, name: "Ön Fren Balatası & Disk Değişimi", category: "Yürüyen Aksam" },
  suspension: { hatchback: 1.5, sedan: 1.8, suv: 2.2, commercial: 2.0, name: "Ön Amortisör & Salıncak Değişimi", category: "Yürüyen Aksam" },
  tire_change: { hatchback: 0.5, sedan: 0.6, suv: 0.8, commercial: 0.7, name: "Mevsimsel 4 Lastik Değişimi & Balans", category: "Lastikçi" },
  tire_repair: { hatchback: 0.3, sedan: 0.4, suv: 0.5, commercial: 0.4, name: "Lastik Patlak Tamiri & Jant Düzeltme", category: "Lastikçi" },

  // 5. İÇ AKSAM, KONFOR VE DİĞERLERİ
  upholstery_repair: { hatchback: 2.0, sedan: 2.5, suv: 3.0, commercial: 2.8, name: "Döşeme Yenileme (Koltuk / Tavan / Direksiyon)", category: "Oto Döşeme" },
  ac_service: { hatchback: 0.8, sedan: 1.0, suv: 1.2, commercial: 1.0, name: "Klima Gazı Dolumu & Kaçak Tespiti", category: "Oto Klima" },
  ac_compressor: { hatchback: 2.0, sedan: 2.5, suv: 3.0, commercial: 2.8, name: "Klima Kompresörü & Polen Filtresi", category: "Oto Klima" },
  exhaust_service: { hatchback: 1.0, sedan: 1.2, suv: 1.5, commercial: 1.4, name: "Egzoz Borusu & Susturucu / Katalizör Tamiri", category: "Egzoz" },
  glass_replacement: { hatchback: 1.5, sedan: 1.8, suv: 2.2, commercial: 2.0, name: "Ön Cam Değişimi & Cam Filmi", category: "Oto Cam" },

  // 6. YAKIT SİSTEMLERİ VE GÜVENLİK
  lpg_install: { hatchback: 4.0, sedan: 5.0, suv: 6.0, commercial: 5.5, name: "LPG Sistem Montajı & AFR Ayarı", category: "LPG / Otogaz" },
  lpg_maintenance: { hatchback: 0.5, sedan: 0.6, suv: 0.8, commercial: 0.7, name: "LPG Gaz Kaçağı & Regülatör Bakımı", category: "LPG / Otogaz" },
  key_copy_unlock: { hatchback: 0.4, sedan: 0.5, suv: 0.6, commercial: 0.5, name: "Kapı Açma & İmmobilizer Anahtar Kopyalama", category: "Oto Anahtar & Çilingir" },

  general: { hatchback: 1.0, sedan: 1.0, suv: 1.2, commercial: 1.2, name: "Genel Arıza Teşhisi & Kontrol", category: "Genel Bakım" }
};

/**
 * 1. Calculate Vehicle Age Multiplier
 * Older vehicles suffer from rusted bolts and stuck parts (korozyon/paslanma çarpanı)
 */
export const calculateAgeMultiplier = (year) => {
  const currentYear = new Date().getFullYear();
  const vehicleYear = parseInt(year) || currentYear - 3;
  const age = currentYear - vehicleYear;

  if (age <= 5) return 1.0;          // 0-5 Yaş: Yeni/Temiz araç
  if (age <= 12) return 1.10;        // 6-12 Yaş: Normal aşınma (+%10 süre)
  return 1.25;                       // 13+ Yaş: Korozyon & paslanmış cıvata faktörü (+%25 süre)
};

/**
 * 2. Calculate Engine Type / Capacity Multiplier
 * Complex engines (Turbo Diesel, V6/V8, Hybrid) require extra disassembly
 */
export const calculateEngineMultiplier = (vehicle) => {
  const engineCode = String(vehicle?.engine_code || "").toLowerCase();
  const model = String(vehicle?.model || "").toLowerCase();

  // V6 / V8 / Büyük Motorlar (3.0L+)
  if (engineCode.includes("3.0") || engineCode.includes("4.0") || engineCode.includes("v6") || engineCode.includes("v8")) {
    return 1.35; // +%35 Süre (Dar motor kompartımanı & Çift Silindir Kapağı)
  }

  // Elektrik / Hibrit (Yüksek Voltaj Güvenlik Protokolü)
  if (engineCode.includes("ev") || engineCode.includes("phev") || model.includes("electric") || model.includes("hybrid")) {
    return 1.25; // +%25 Süre (Voltaj kesme & Yalıtım protokolü)
  }

  // Turbo Dizel (DPF, Intercooler, Enjektör Karmaşıklığı)
  if (engineCode.includes("tdi") || engineCode.includes("dci") || engineCode.includes("multijet") || engineCode.includes("tdci") || engineCode.includes("hdi") || engineCode.includes("cdti") || engineCode.includes("crdi")) {
    return 1.15; // +%15 Süre
  }

  // Turbo Benzin (TSI, TFSI, Ecoboost, Puretech)
  if (engineCode.includes("tsi") || engineCode.includes("tfsi") || engineCode.includes("ecoboost") || engineCode.includes("t-gdi")) {
    return 1.10; // +%10 Süre
  }

  return 1.0; // Atmosferik standart benzinli motor
};

/**
 * 3. Calculate Brand Premium Class Multiplier
 * Premium German/Luxury vehicles have complex sensor layouts & specialized fasteners
 */
export const calculateBrandMultiplier = (brand) => {
  const brandLower = String(brand || "").toLowerCase();

  const premiumBrands = ["bmw", "mercedes", "audi", "porsche", "volvo", "land rover", "jaguar", "lexus", "maserati", "mini"];
  if (premiumBrands.some(b => brandLower.includes(b))) return 1.25; // +%25 Premium Söküm Çarpanı

  const midBrands = ["volkswagen", "ford", "toyota", "opel", "peugeot", "citroen", "skoda", "seat", "nissan", "honda", "mazda"];
  if (midBrands.some(b => brandLower.includes(b))) return 1.10; // +%10 Standart Çarpan

  return 1.0; // Ekonomi Segmenti (Fiat, Renault, Dacia, Hyundai, Kia)
};

/**
 * Detect vehicle segment (Hatchback, Sedan, SUV, Commercial)
 */
export const detectVehicleSegment = (vehicle) => {
  if (!vehicle) return "sedan";
  
  if (vehicle.is_commercial === true || vehicle.vehicle_type === "commercial") {
    return "commercial";
  }
  
  const modelLower = String(vehicle.model || "").toLowerCase();

  const commercialModels = ["doblo", "fiorino", "caddy", "transit", "transporter", "kangoo", "ducato", "crafter", "sprinter", "kamyonet", "taksi", "minibus"];
  if (commercialModels.some(m => modelLower.includes(m))) return "commercial";

  const suvModels = ["tucson", "sportage", "qashqai", "duster", "tiguan", "3008", "5008", "rav4", "crv", "suv", "x3", "x5"];
  if (suvModels.some(m => modelLower.includes(m))) return "suv";

  const hatchbackModels = ["polo", "clio", "fiesta", "corsa", "yaris", "i20", "208", "golf", "a3", "hatchback"];
  if (hatchbackModels.some(m => modelLower.includes(m))) return "hatchback";

  return "sedan";
};

/**
 * Match service request description to labor matrix category key
 */
export const matchServiceCategory = (demandTypeOrDesc) => {
  if (!demandTypeOrDesc) return "general";
  const str = String(demandTypeOrDesc).toLowerCase();

  // 1. Motor & Mekanik
  if (str.includes("rektifiye") || str.includes("revizyon") || str.includes("motor üfleme")) return "engine_overhaul";
  if (str.includes("subap") || str.includes("silindir") || str.includes("conta")) return "cylinder_head";
  if (str.includes("triger") || str.includes("kayış") || str.includes("zincir")) return "timing_belt";
  if (str.includes("yağ") || str.includes("filtre") || str.includes("periyodik")) return "oil_change";
  if (str.includes("şanzıman") || str.includes("mechatronic") || str.includes("vites geçiş")) return "transmission_overhaul";
  if (str.includes("debriyaj") || str.includes("baskı") || str.includes("kavrama")) return "clutch";
  if (str.includes("enjektör") || str.includes("dizel") || str.includes("pompa")) return "injectors";
  if (str.includes("dpf") || str.includes("partikül") || str.includes("egr")) return "dpf_egr";

  // 2. Elektrik & Elektronik
  if (str.includes("şarj dinamosu") || str.includes("marş")) return "alternator_starter";
  if (str.includes("akü") || str.includes("şarj")) return "battery";
  if (str.includes("ecu") || str.includes("beyin") || str.includes("yazılım") || str.includes("abs beyni")) return "ecu_repair";
  if (str.includes("elektrik") || str.includes("far") || str.includes("kriko") || str.includes("silecek")) return "wiring_lights";

  // 3. Gövde & Dış Aksam
  if (str.includes("şasi") || str.includes("çektirme")) return "chassis_alignment";
  if (str.includes("kaporta") || str.includes("çamurluk") || str.includes("kaput")) return "body_repair";
  if (str.includes("komple boya")) return "full_painting";
  if (str.includes("boya") || str.includes("fırınlı") || str.includes("cila")) return "panel_painting";
  if (str.includes("pdr") || str.includes("göçük") || str.includes("dolu")) return "pdr_dents";

  // 4. Yürüyen Aksam
  if (str.includes("rot") || str.includes("balans") || str.includes("direksiyon çekme")) return "wheel_alignment";
  if (str.includes("fren") || str.includes("balata") || str.includes("disk")) return "brakes";
  if (str.includes("amortisör") || str.includes("salıncak") || str.includes("süspansiyon")) return "suspension";
  if (str.includes("lastik değişim") || str.includes("mevsimsel")) return "tire_change";
  if (str.includes("lastik") || str.includes("patlak") || str.includes("jant")) return "tire_repair";

  // 5. İç Aksam & Konfor
  if (str.includes("döşeme") || str.includes("koltuk") || str.includes("tavan sarması") || str.includes("deri kaplama")) return "upholstery_repair";
  if (str.includes("klima kompresör")) return "ac_compressor";
  if (str.includes("klima") || str.includes("gaz dolum") || str.includes("polen")) return "ac_service";
  if (str.includes("egzoz") || str.includes("susturucu") || str.includes("katalitik") || str.includes("varex")) return "exhaust_service";
  if (str.includes("cam") || str.includes("ön cam") || str.includes("cam filmi")) return "glass_replacement";

  // 6. Yakıt & Güvenlik
  if (str.includes("lpg montaj") || str.includes("otogaz montaj")) return "lpg_install";
  if (str.includes("lpg") || str.includes("otogaz") || str.includes("afr")) return "lpg_maintenance";
  if (str.includes("anahtar") || str.includes("çilingir") || str.includes("kilit") || str.includes("immobilizer")) return "key_copy_unlock";

  return "general";
};

/**
 * Get Dynamically Adjusted OEM Standard Labor Hours
 * Combines Base Hours * Age Multiplier * Engine Multiplier * Brand Multiplier
 */
export const getOEMStandardHours = (demandTypeOrDesc, vehicle) => {
  const categoryKey = matchServiceCategory(demandTypeOrDesc);
  const segmentKey = detectVehicleSegment(vehicle);

  const category = OEM_LABOR_MATRIX[categoryKey] || OEM_LABOR_MATRIX.general;
  const baseHours = category[segmentKey] || category.sedan || 1.0;

  // Calculate dynamic multipliers
  const ageMult = calculateAgeMultiplier(vehicle?.year);
  const engineMult = calculateEngineMultiplier(vehicle);
  const brandMult = calculateBrandMultiplier(vehicle?.brand);

  const totalMultiplier = ageMult * engineMult * brandMult;
  const adjustedHours = parseFloat((baseHours * totalMultiplier).toFixed(2));

  return {
    categoryKey,
    segmentKey,
    categoryName: category.name,
    specialtyGroup: category.category,
    baseHours,
    adjustedHours,
    standardHours: adjustedHours,
    multipliers: {
      age: ageMult,
      engine: engineMult,
      brand: brandMult,
      total: parseFloat(totalMultiplier.toFixed(2))
    }
  };
};

/**
 * Calculate OEM Max Labor Price Ceiling
 */
export const calculateLaborCeiling = (demandTypeOrDesc, vehicle, hourlyLaborRate = 1000) => {
  const oemInfo = getOEMStandardHours(demandTypeOrDesc, vehicle);
  const hourlyRate = parseFloat(hourlyLaborRate) || 1000;
  const maxLaborCeiling = Math.round(oemInfo.adjustedHours * hourlyRate);

  return {
    ...oemInfo,
    hourlyLaborRate: hourlyRate,
    maxLaborCeiling
  };
};

/**
 * Validate quote price against OEM Labor Ceiling
 */
export const validateQuoteLaborPrice = (totalQuotePrice, demandTypeOrDesc, vehicle, hourlyLaborRate = 1000, partsCostEstimate = 0) => {
  const ceilingInfo = calculateLaborCeiling(demandTypeOrDesc, vehicle, hourlyLaborRate);
  const partsCost = parseFloat(partsCostEstimate) || 0;
  const laborPriceSubmitted = Math.max(0, parseFloat(totalQuotePrice) - partsCost);

  const isCompliant = laborPriceSubmitted <= ceilingInfo.maxLaborCeiling * 1.05;

  return {
    ...ceilingInfo,
    submittedPrice: parseFloat(totalQuotePrice),
    estimatedLaborPrice: laborPriceSubmitted,
    estimatedPartsPrice: partsCost,
    isCompliant,
    excessAmount: Math.max(0, laborPriceSubmitted - ceilingInfo.maxLaborCeiling)
  };
};
