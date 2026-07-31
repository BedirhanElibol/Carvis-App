const fs = require('fs');

const carDbPath = './src/constants/carDatabase.js';
const rawContent = fs.readFileSync(carDbPath, 'utf8');
const jsonStr = rawContent.replace('export const CAR_DATABASE = ', '').trim();

// Parse Database
let carDb = [];
try {
  carDb = eval(jsonStr);
} catch (e) {
  console.error("Parse Error:", e);
  process.exit(1);
}

// Map for quick access
const brandMap = {};
carDb.forEach(b => {
  brandMap[b.brand] = b;
});

// Extra Legend Models to Add
const extraModels = {
  "BMW": [
    {
      name: "3 Serisi (E36 / E46 / E90 / F30 / G20)",
      years: "1990-2024",
      models: [
        { name: "316i / 318i (E36/E46)", engine_code: "M43B16 / N42B20", fuel: "Benzin", hp: 115, cc: 1895, cylinders: 4, transmission: "Manuel / Otomatik", trims: ["Standard", "M Tech"] },
        { name: "320i E46 2.2 170", engine_code: "M54B22", fuel: "Benzin", hp: 170, cc: 2171, cylinders: 6, transmission: "5-Steptronic", trims: ["Standard", "M Tech II"] },
        { name: "320d E90 163/177/184", engine_code: "M47D20 / N47D20", fuel: "Dizel", hp: 184, cc: 1995, cylinders: 4, transmission: "6-Manuel / Steptronic", trims: ["Standard", "M Sport"] },
        { name: "320i EfficientDynamics F30 170", engine_code: "N13B16", fuel: "Benzin", hp: 170, cc: 1598, cylinders: 4, transmission: "8-ZF Otomatik", trims: ["Modern", "Luxury", "Sport", "M Sport"] },
        { name: "320i G20 1.6 Turbo 170", engine_code: "B48B16", fuel: "Benzin", hp: 170, cc: 1598, cylinders: 4, transmission: "8-ZF Otomatik", trims: ["Sport Line", "Luxury Line", "M Sport", "Edition M Sport"] },
        { name: "M3 E36/E46/E92/F80/G80 (286/343/420/431/510)", engine_code: "S50 / S54 / S65 / S55 / S58", fuel: "Benzin", hp: 510, cc: 2993, cylinders: 6, transmission: "Drivelogic / M DCT", trims: ["M3", "M3 Competition"] }
      ]
    },
    {
      name: "5 Serisi (E39 / E60 / F10 / G30 / G60)",
      years: "1995-2024",
      models: [
        { name: "520i E39 150/170", engine_code: "M52B20 / M54B22", fuel: "Benzin", hp: 170, cc: 2171, cylinders: 6, transmission: "5-Steptronic", trims: ["Exclusive", "M Tech"] },
        { name: "520d E60 / F10 / G30 177/184/190", engine_code: "N47D20 / B47D20", fuel: "Dizel", hp: 190, cc: 1995, cylinders: 4, transmission: "8-ZF Otomatik", trims: ["Comfort", "Executive", "M Sport"] },
        { name: "520i F10 1.6 Turbo 170", engine_code: "N20B16", fuel: "Benzin", hp: 170, cc: 1598, cylinders: 4, transmission: "8-ZF Otomatik", trims: ["Comfort", "Luxury Line", "M Sport"] },
        { name: "520i G30 1.6 Turbo 170", engine_code: "B48B16", fuel: "Benzin", hp: 170, cc: 1598, cylinders: 4, transmission: "8-ZF Otomatik", trims: ["Executive Line", "Special Edition M Sport"] },
        { name: "M5 E39/E60/F10/F90 (400/507/560/600)", engine_code: "S62 / S85 V10 / S63 V8", fuel: "Benzin", hp: 600, cc: 4395, cylinders: 8, transmission: "M Steptronic xDrive", trims: ["M5", "M5 Competition"] }
      ]
    }
  ],
  "Mercedes-Benz": [
    {
      name: "E Serisi (W124 / W210 / W211 / W212 / W213 / W214)",
      years: "1984-2024",
      models: [
        { name: "200E / E200 W124 (M102/M111 118/136)", engine_code: "M111.960", fuel: "Benzin", hp: 136, cc: 1998, cylinders: 4, transmission: "5-Manuel / 4-Otomatik", trims: ["E200", "E200 Kompressor"] },
        { name: "E200 Kompressor W210 / W211 (163/184)", engine_code: "M271.940", fuel: "Benzin", hp: 184, cc: 1796, cylinders: 4, transmission: "5-G-Tronic", trims: ["Classic", "Elegance", "Avantgarde"] },
        { name: "E220 CDI / d W211 / W212 / W213 (170/194)", engine_code: "OM651 / OM654", fuel: "Dizel", hp: 194, cc: 1950, cylinders: 4, transmission: "7G-Tronic / 9G-Tronic", trims: ["Elegance", "Avantgarde", "AMG Line"] },
        { name: "E180 W212 / W213 1.6 Turbo 156", engine_code: "M274.910", fuel: "Benzin", hp: 156, cc: 1595, cylinders: 4, transmission: "7G-Tronic / 9G-Tronic", trims: ["Edition E", "Exclusive", "AMG Line"] },
        { name: "E200d W213 1.6/2.0 Dizel 160/194", engine_code: "OM654", fuel: "Dizel", hp: 194, cc: 1950, cylinders: 4, transmission: "9G-Tronic", trims: ["Exclusive", "AMG Line"] }
      ]
    },
    {
      name: "C Serisi (W201 190E / W202 / W203 / W204 / W205 / W206)",
      years: "1982-2024",
      models: [
        { name: "190E W201 1.8/2.0 (109/122)", engine_code: "M102.962", fuel: "Benzin", hp: 122, cc: 1996, cylinders: 4, transmission: "5-Manuel / 4-Otomatik", trims: ["190E", "190E 2.3-16", "Evo II"] },
        { name: "C180 Kompressor W203 / W204 (143/156)", engine_code: "M271.946", fuel: "Benzin", hp: 156, cc: 1796, cylinders: 4, transmission: "5G-Tronic / 7G-Tronic", trims: ["Classic", "Elegance", "Fascination", "AMG"] },
        { name: "C180 W205 1.6 Turbo 156", engine_code: "M274.910", fuel: "Benzin", hp: 156, cc: 1595, cylinders: 4, transmission: "7G-Tronic / 9G-Tronic", trims: ["Style", "Avantgarde", "Exclusive", "AMG Line"] },
        { name: "C200d W205 1.6 Dizel 136 / 2.0 Dizel 160", engine_code: "OM626 / OM654", fuel: "Dizel", hp: 160, cc: 1598, cylinders: 4, transmission: "9G-Tronic", trims: ["Comfort", "Avantgarde", "AMG Line"] },
        { name: "C63 AMG W204/W205 V8 6.2/4.0 (457/510)", engine_code: "M156 V8 / M177 V8", fuel: "Benzin", hp: 510, cc: 3982, cylinders: 8, transmission: "AMG SPEEDSHIFT MCT", trims: ["C63 AMG", "C63 S AMG"] }
      ]
    }
  ],
  "Volkswagen": [
    {
      name: "Bora / Jetta",
      years: "1998-2018",
      models: [
        { name: "1.6 SR / 1.6 16V Bora 100/105", engine_code: "AKL / BCB", fuel: "Benzin", hp: 105, cc: 1598, cylinders: 4, transmission: "5-Manuel / 4-Otomatik", trims: ["Basic", "Comfortline", "Highline", "Pacific"] },
        { name: "1.9 TDI Bora 90/110/130", engine_code: "ALH / ASZ", fuel: "Dizel", hp: 130, cc: 1896, cylinders: 4, transmission: "5/6-Manuel", trims: ["Comfortline", "Highline"] },
        { name: "1.4 TSI Jetta Mk5/Mk6 122/140/150", engine_code: "CAXA / CAVA", fuel: "Benzin", hp: 150, cc: 1395, cylinders: 4, transmission: "6-Manuel / 7-DSG", trims: ["Trendline", "Comfortline", "Highline"] },
        { name: "1.6 TDI Jetta Mk6 105", engine_code: "CAYC", fuel: "Dizel", hp: 105, cc: 1598, cylinders: 4, transmission: "5-Manuel / 7-DSG", trims: ["Trendline", "Comfortline", "Highline"] }
      ]
    },
    {
      name: "Passat (B5 / B5.5 / B6 / B7 / B8 / Pro)",
      years: "1996-2024",
      models: [
        { name: "1.8 T B5 / B5.5 150", engine_code: "AEB / AWT", fuel: "Benzin", hp: 150, cc: 1781, cylinders: 4, transmission: "5-Manuel / Tiptronic", trims: ["Basic", "Comfortline", "Highline"] },
        { name: "1.9 TDI B5 / B5.5 110/130", engine_code: "AFN / AVF", fuel: "Dizel", hp: 130, cc: 1896, cylinders: 4, transmission: "5/6-Manuel / Tiptronic", trims: ["Comfortline", "Highline"] },
        { name: "1.6 FSI / 2.0 TDI B6 115/140", engine_code: "BLF / BKP", fuel: "Dizel", hp: 140, cc: 1968, cylinders: 4, transmission: "6-Manuel / 6-DSG", trims: ["Trendline", "Comfortline", "Highline"] },
        { name: "1.4 TSI B7 / B8 122/125/150 Act", engine_code: "CAXA / CZDA", fuel: "Benzin", hp: 150, cc: 1395, cylinders: 4, transmission: "6-Manuel / 7-DSG", trims: ["Trendline", "Comfortline", "Highline", "Impression", "Business", "Elegance"] },
        { name: "1.6 TDI B7 / B8 105/120", engine_code: "CAYC / DCXA", fuel: "Dizel", hp: 120, cc: 1598, cylinders: 4, transmission: "7-DSG", trims: ["Comfortline", "Highline", "Elegance"] },
        { name: "2.0 TDI B8 150/190/240 BiTDI", engine_code: "CRLB / CUAA", fuel: "Dizel", hp: 240, cc: 1968, cylinders: 4, transmission: "7-DSG 4Motion", trims: ["Highline", "Elegance"] }
      ]
    },
    {
      name: "Scirocco",
      years: "2008-2017",
      models: [
        { name: "1.4 TSI 122/160", engine_code: "CAXA / CAVD", fuel: "Benzin", hp: 160, cc: 1390, cylinders: 4, transmission: "6-Manuel / 7-DSG", trims: ["Sportline", "Chrome Edition"] },
        { name: "2.0 TSI Scirocco R 265", engine_code: "CDLA", fuel: "Benzin", hp: 265, cc: 1984, cylinders: 4, transmission: "6-DSG", trims: ["R"] }
      ]
    }
  ],
  "Renault": [
    {
      name: "Toros / R12 / Broadway / Fairway (R9/R11/R19)",
      years: "1975-2000",
      models: [
        { name: "1.4 Broadway R9 68", engine_code: "C1J 1400", fuel: "Benzin / LPG", hp: 68, cc: 1397, cylinders: 4, transmission: "4/5-Manuel", trims: ["GTE", "RL", "RN", "RNi"] },
        { name: "1.4 Toros R12 SW/Sedan 60", engine_code: "C1J Toros", fuel: "Benzin / LPG", hp: 60, cc: 1397, cylinders: 4, transmission: "4/5-Manuel", trims: ["Toros"] },
        { name: "1.6 R19 Europa 90/107", engine_code: "K7M / F3P", fuel: "Benzin / LPG", hp: 90, cc: 1598, cylinders: 4, transmission: "5-Manuel", trims: ["RT", "RNA", "RNE"] }
      ]
    },
    {
      name: "Laguna / Talisman / Latitude",
      years: "1994-2022",
      models: [
        { name: "1.6 16V / 2.0 RXT Laguna I & II 107/140", engine_code: "K4M / F4R", fuel: "Benzin", hp: 140, cc: 1998, cylinders: 4, transmission: "5-Manuel / 4-Otomatik", trims: ["RXT", "Privilege", "Dynamique"] },
        { name: "1.5 dCi / 1.6 dCi Talisman 110/130/160 Bi-Turbo", engine_code: "K9K / R9M", fuel: "Dizel", hp: 160, cc: 1598, cylinders: 4, transmission: "6/7-EDC Otomatik", trims: ["Touch", "Icon"] }
      ]
    }
  ],
  "Fiat": [
    {
      name: "Uno / Tipo / Tempra / Palio / Albea / Marea",
      years: "1988-2012",
      models: [
        { name: "1.4 / 1.6 SX ie Tipo / Tempra 78/90", engine_code: "160A1000", fuel: "Benzin / LPG", hp: 90, cc: 1581, cylinders: 4, transmission: "5-Manuel", trims: ["S", "SX", "SX AK", "SLX"] },
        { name: "1.3 Multijet / 1.4 Fire Palio / Albea 70/77", engine_code: "188A9000", fuel: "Dizel / Benzin", hp: 70, cc: 1248, cylinders: 4, transmission: "5-Manuel", trims: ["Sole", "Dynamic"] },
        { name: "2.0 20V Marea / Coupe 154", engine_code: "182A1000", fuel: "Benzin", hp: 154, cc: 1998, cylinders: 5, transmission: "5-Manuel", trims: ["HLX", "20V Turbo"] }
      ]
    }
  ],
  "Ford": [
    {
      name: "Escort / Taunus / Sierra / Fusion",
      years: "1980-2012",
      models: [
        { name: "1.6 CLX / CL Escort 90", engine_code: "Zetec-E 1.6", fuel: "Benzin / LPG", hp: 90, cc: 1597, cylinders: 4, transmission: "5-Manuel", trims: ["CL", "CLX", "Ghia"] },
        { name: "1.4 TDCi / 1.6 Fusion 68/100", engine_code: "DV4TD", fuel: "Dizel", hp: 68, cc: 1399, cylinders: 4, transmission: "5-Manuel / Durashift", trims: ["Comfort", "Lux"] },
        { name: "2.0 Taunus GTS / Sierra Cosworth", engine_code: "Pinto 2.0 / YBJ", fuel: "Benzin", hp: 100, cc: 1993, cylinders: 4, transmission: "4/5-Manuel", trims: ["GTS", "Cosworth"] }
      ]
    }
  ],
  "Opel": [
    {
      name: "Vectra (A / B / C) / Omega",
      years: "1988-2009",
      models: [
        { name: "2.0 GLS / CD Vectra A & B 115/136", engine_code: "C20NE / X20XEV", fuel: "Benzin / LPG", hp: 136, cc: 1998, cylinders: 4, transmission: "5-Manuel / 4-Otomatik", trims: ["GLS", "CD", "CDX"] },
        { name: "1.6 16V / 1.9 CDTI Vectra C 105/150", engine_code: "Z16XE / Z19DTH", fuel: "Dizel / Benzin", hp: 150, cc: 1910, cylinders: 4, transmission: "6-Manuel / 6-Autotronic", trims: ["Comfort", "Elegance", "Cosmo"] }
      ]
    },
    {
      name: "Astra (F / G / H / J / K / L)",
      years: "1991-2024",
      models: [
        { name: "1.6 16V Astra G 100/103 (GTC / Sedan / HB)", engine_code: "X16XEL / Z16XE", fuel: "Benzin / LPG", hp: 100, cc: 1598, cylinders: 4, transmission: "5-Manuel / 4-Otomatik", trims: ["GL", "CD", "Elegance", "Edition"] },
        { name: "1.3 CDTI / 1.6 Twinport Astra H 90/105", engine_code: "Z13DTH", fuel: "Dizel", hp: 90, cc: 1248, cylinders: 4, transmission: "6-Manuel / Easytronic", trims: ["Essentia", "Enjoy", "Cosmo"] },
        { name: "1.4 Turbo / 1.6 CDTI Astra J / K 140/136", engine_code: "A14NET / B16DTH", fuel: "Benzin / Dizel", hp: 140, cc: 1364, cylinders: 4, transmission: "6-Manuel / 6-Otomatik", trims: ["Edition", "Design", "Dynamic", "Excellence"] }
      ]
    }
  ],
  "Honda": [
    {
      name: "Civic (EG / EK / ES7 / FD6 / FB7 / FC5 / FE)",
      years: "1992-2024",
      models: [
        { name: "1.6 i-VTEC / VTEC FD6 / FB7 125", engine_code: "R16A1", fuel: "Benzin / LPG (Eco)", hp: 125, cc: 1598, cylinders: 4, transmission: "5-Manuel / 5-Otomatik", trims: ["Dream", "Premium", "Elegance", "Executive"] },
        { name: "1.5 VTEC Turbo FC5 182", engine_code: "L15B7", fuel: "Benzin", hp: 182, cc: 1498, cylinders: 4, transmission: "6-Manuel / CVT", trims: ["Elegance", "Executive", "RS"] },
        { name: "2.0 Type-R EP3 / FN2 / FK2 / FK8 / FL5 (200/310/320/329)", engine_code: "K20A2 / K20C1", fuel: "Benzin", hp: 320, cc: 1996, cylinders: 4, transmission: "6-Manuel", trims: ["Type-R", "Type-R GT"] }
      ]
    }
  ],
  "Toyota": [
    {
      name: "Corolla (AE101 Efsane Kasa / E120 / E140 / E180 / E210)",
      years: "1993-2024",
      models: [
        { name: "1.6 Gli / XE / XL AE101 114 (Efsane Kasa)", engine_code: "4A-FE", fuel: "Benzin / LPG", hp: 114, cc: 1587, cylinders: 4, transmission: "5-Manuel / 4-Otomatik", trims: ["XL", "XE", "GLi", "Special Edition"] },
        { name: "1.4 D-4D E120 / E140 / E180 90", engine_code: "1ND-TV", fuel: "Dizel", hp: 90, cc: 1364, cylinders: 4, transmission: "5/6-Manuel / M-M Multidrive", trims: ["Terra", "Sol", "Class", "Comfort", "Premium"] },
        { name: "1.8 Hybrid E210 122/140", engine_code: "2ZR-FXE", fuel: "Hibrit", hp: 140, cc: 1798, cylinders: 4, transmission: "e-CVT", trims: ["Vision", "Dream", "Flame", "Passion X-Pack"] },
        { name: "Supra A80 / A90 (3.0 Twin-Turbo / 3.0 B58 330/340/387)", engine_code: "2JZ-GTE / B58", fuel: "Benzin", hp: 387, cc: 2998, cylinders: 6, transmission: "6-Manuel / 8-ZF Otomatik", trims: ["GR Supra"] }
      ]
    }
  ],
  "Peugeot": [
    {
      name: "106 / 205 / 206 / 306 / 307 / 406 / 407",
      years: "1991-2011",
      models: [
        { name: "1.6 GTI / S16 106 120", engine_code: "TU5J4", fuel: "Benzin", hp: 120, cc: 1587, cylinders: 4, transmission: "5-Manuel", trims: ["GTI"] },
        { name: "1.4 HDi / 1.6 HDi 206 / 307 68/110", engine_code: "DV4TD / DV6TED4", fuel: "Dizel", hp: 110, cc: 1560, cylinders: 4, transmission: "5-Manuel", trims: ["XR", "XT", "Feline", "Premium"] },
        { name: "2.0 HDi / 2.0 16V 406 / 407 110/136/140", engine_code: "DW10ATED", fuel: "Dizel", hp: 140, cc: 1997, cylinders: 4, transmission: "5-Manuel / 4/6-Otomatik", trims: ["ST", "SV", "Executive"] }
      ]
    }
  ]
};

// Merge process
Object.keys(extraModels).forEach(brand => {
  if (brandMap[brand]) {
    const existingBrand = brandMap[brand];
    extraModels[brand].forEach(newSeries => {
      // Check if series already exists
      const foundSeries = existingBrand.series.find(s => s.name.toLowerCase().includes(newSeries.name.split(' ')[0].toLowerCase()));
      if (foundSeries) {
        // Merge models inside existing series
        newSeries.models.forEach(m => {
          if (!foundSeries.models.some(exM => exM.name === m.name)) {
            foundSeries.models.push(m);
          }
        });
      } else {
        // Push as new series
        existingBrand.series.push(newSeries);
      }
    });
  }
});

// Output formatted file
const newFileContent = `export const CAR_DATABASE = ${JSON.stringify(carDb, null, 2)};\n`;
fs.writeFileSync(carDbPath, newFileContent, 'utf8');

console.log("CAR_DATABASE successfully enriched with legendary Turkish car models!");
