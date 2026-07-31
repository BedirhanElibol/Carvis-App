import fs from 'fs';
import { CAR_DATABASE } from '../constants/carDatabase.js';

const carDbPath = './src/constants/carDatabase.js';
let carDb = JSON.parse(JSON.stringify(CAR_DATABASE));

const brandMap = {};
carDb.forEach(b => {
  brandMap[b.brand] = b;
});

// Complete Global & Local Brand & Model Registry
const newGlobalBrands = [
  {
    brand: "Saab",
    series: [
      {
        name: "9-3",
        years: "1998-2014",
        models: [
          { name: "1.9 TiD / TTiD 120/150/180", engine_code: "Z19DTH", fuel: "Dizel", hp: 150, cc: 1910, cylinders: 4, transmission: "6-Manuel / Sentronic", trims: ["Linear", "Vector", "Aero"] },
          { name: "2.0 Turbo / Aero 175/210", engine_code: "B207R", fuel: "Benzin", hp: 210, cc: 1998, cylinders: 4, transmission: "5/6-Manuel / Sentronic", trims: ["Vector", "Aero", "Turbo X"] },
          { name: "1.8t 150", engine_code: "B207E", fuel: "Benzin", hp: 150, cc: 1998, cylinders: 4, transmission: "5-Manuel", trims: ["Linear"] }
        ]
      },
      {
        name: "9-5",
        years: "1997-2012",
        models: [
          { name: "2.0t / 2.3t / Aero 150/185/250", engine_code: "B235R", fuel: "Benzin", hp: 250, cc: 2290, cylinders: 4, transmission: "5-Manuel / Sentronic", trims: ["Vector", "Aero"] },
          { name: "3.0 TiD V6 176", engine_code: "D308L", fuel: "Dizel", hp: 176, cc: 2958, cylinders: 6, transmission: "5-Otomatik", trims: ["Vector", "Griffin"] }
        ]
      }
    ]
  },
  {
    brand: "Infiniti",
    series: [
      {
        name: "FX / QX70",
        years: "2003-2017",
        models: [
          { name: "FX35 3.5 V6 280", engine_code: "VQ35DE", fuel: "Benzin", hp: 280, cc: 3498, cylinders: 6, transmission: "5-Otomatik AWD", trims: ["Base", "Premium"] },
          { name: "FX30d / QX70d 3.0 V6 Dizel 238", engine_code: "V9X", fuel: "Dizel", hp: 238, cc: 2993, cylinders: 6, transmission: "7-Otomatik AWD", trims: ["GT", "S Premium"] },
          { name: "FX45 / FX50 4.5 V8 / 5.0 V8 320/390", engine_code: "VK50VE", fuel: "Benzin", hp: 390, cc: 5026, cylinders: 8, transmission: "7-Otomatik AWD", trims: ["S Premium"] }
        ]
      },
      {
        name: "Q50 / Q30 / G37",
        years: "2007-2024",
        models: [
          { name: "Q50 2.0t 211", engine_code: "M274 Mercedes", fuel: "Benzin", hp: 211, cc: 1991, cylinders: 4, transmission: "7G-Tronic", trims: ["Premium", "Sport"] },
          { name: "Q50 2.2d 170", engine_code: "OM651 Mercedes", fuel: "Dizel", hp: 170, cc: 2143, cylinders: 4, transmission: "7G-Tronic", trims: ["Premium"] }
        ]
      }
    ]
  },
  {
    brand: "Lamborghini",
    series: [
      {
        name: "Huracán / Gallardo",
        years: "2003-2024",
        models: [
          { name: "Huracán LP610-4 / STO 5.2 V10 610/640", engine_code: "5.2 V10 FSI", fuel: "Benzin", hp: 640, cc: 5204, cylinders: 10, transmission: "7-Dual Clutch LDF", trims: ["LP610-4", "EVO", "STO", "Tecnica"] },
          { name: "Gallardo LP560-4 5.2 V10 560", engine_code: "5.2 V10", fuel: "Benzin", hp: 560, cc: 5204, cylinders: 10, transmission: "6-E-Gear", trims: ["LP560-4", "Superleggera"] }
        ]
      },
      {
        name: "Urus",
        years: "2018-2024",
        models: [
          { name: "4.0 V8 Twin-Turbo 650/666 (Performante / S)", engine_code: "4.0 V8 TT", fuel: "Benzin", hp: 666, cc: 3996, cylinders: 8, transmission: "8-Otomatik AWD", trims: ["Base", "Urus S", "Performante"] }
        ]
      },
      {
        name: "Aventador / Revuelto",
        years: "2011-2024",
        models: [
          { name: "Aventador LP700-4 / SVJ 6.5 V12 700/770", engine_code: "L539 V12", fuel: "Benzin", hp: 770, cc: 6498, cylinders: 12, transmission: "7-ISR Otomatik", trims: ["LP700-4", "SV", "SVJ", "Ultimae"] }
        ]
      }
    ]
  },
  {
    brand: "Rolls-Royce",
    series: [
      {
        name: "Phantom / Ghost / Wraith / Cullinan",
        years: "2003-2024",
        models: [
          { name: "Ghost 6.6 V12 Twin-Turbo 570/600", engine_code: "N74 V12", fuel: "Benzin", hp: 570, cc: 6592, cylinders: 12, transmission: "8-ZF Otomatik", trims: ["Ghost", "Black Badge"] },
          { name: "Cullinan 6.75 V12 Twin-Turbo 571/600", engine_code: "N74 V12", fuel: "Benzin", hp: 600, cc: 6750, cylinders: 12, transmission: "8-ZF Otomatik AWD", trims: ["Cullinan", "Black Badge"] },
          { name: "Phantom 6.75 V12 460/571", engine_code: "N74 V12", fuel: "Benzin", hp: 571, cc: 6750, cylinders: 12, transmission: "8-ZF Otomatik", trims: ["Phantom", "Extended Wheelbase"] }
        ]
      }
    ]
  },
  {
    brand: "Cadillac",
    series: [
      {
        name: "Escalade / CTS / ATS",
        years: "2002-2024",
        models: [
          { name: "Escalade 6.2 V8 409/426", engine_code: "L86 V8", fuel: "Benzin", hp: 426, cc: 6162, cylinders: 8, transmission: "6/10-Otomatik AWD", trims: ["Luxury", "Platinum", "Sport"] },
          { name: "CTS 2.0 Turbo / 3.6 V6 276/325", engine_code: "LTG 2.0T", fuel: "Benzin", hp: 276, cc: 1998, cylinders: 4, transmission: "6/8-Otomatik", trims: ["Performance", "Luxury"] }
        ]
      }
    ]
  },
  {
    brand: "Dodge / RAM",
    series: [
      {
        name: "Challenger / Charger / Durango / RAM 1500",
        years: "2006-2024",
        models: [
          { name: "Challenger / Charger 5.7 V8 / 6.4 V8 SRT 375/485", engine_code: "5.7 / 6.4 HEMI", fuel: "Benzin", hp: 485, cc: 6417, cylinders: 8, transmission: "8-TorqueFlite", trims: ["R/T", "Scat Pack", "SRT 392"] },
          { name: "Challenger Hellcat 6.2 Supercharged V8 707/797", engine_code: "6.2 HEMI Hellcat", fuel: "Benzin", hp: 797, cc: 6166, cylinders: 8, transmission: "8-TorqueFlite", trims: ["SRT Hellcat", "Redeye", "Demon"] },
          { name: "RAM 1500 5.7 V8 HEMI / TRX 395/702", engine_code: "5.7 / 6.2 HEMI", fuel: "Benzin", hp: 702, cc: 6166, cylinders: 8, transmission: "8-Otomatik 4x4", trims: ["Laramie", "Limited", "TRX"] }
        ]
      }
    ]
  },
  {
    brand: "Smart",
    series: [
      {
        name: "Fortwo / Forfour / #1 / #3",
        years: "1998-2024",
        models: [
          { name: "Fortwo 0.8 CDI / 1.0 71/84 Brabus", engine_code: "M132", fuel: "Benzin / Dizel", hp: 84, cc: 999, cylinders: 3, transmission: "5-Softouch", trims: ["Passion", "Pulse", "Brabus"] },
          { name: "Smart #1 EV 272 / Brabus 428", engine_code: "Smart EV Dual", fuel: "Elektrik", hp: 428, cc: 0, cylinders: 0, transmission: "Otomatik", trims: ["Pro+", "Premium", "Brabus"] }
        ]
      }
    ]
  },
  {
    brand: "Hummer",
    series: [
      {
        name: "H1 / H2 / H3 / EV",
        years: "1992-2024",
        models: [
          { name: "H2 6.0 V8 / 6.2 V8 325/393", engine_code: "Vortec 6000", fuel: "Benzin", hp: 393, cc: 6162, cylinders: 8, transmission: "4/6-Otomatik 4x4", trims: ["Base", "Adventure"] },
          { name: "H3 3.5 / 3.7 / 5.3 V8 220/242/305", engine_code: "Vortec 3700", fuel: "Benzin", hp: 242, cc: 3653, cylinders: 5, transmission: "4-Otomatik 4x4", trims: ["Base", "Adventure"] }
        ]
      }
    ]
  },
  {
    brand: "Rover",
    series: [
      {
        name: "200 / 400 / 600 / 75",
        years: "1995-2005",
        models: [
          { name: "75 2.0 CDT / 2.0 V6 116/150", engine_code: "BMW M47R / KV6", fuel: "Dizel / Benzin", hp: 150, cc: 1997, cylinders: 6, transmission: "5-Manuel / 5-Otomatik", trims: ["Classic", "Club", "Connoisseur"] },
          { name: "200 / 214 / 216 1.4 / 1.6 K-Series 103/111", engine_code: "K-Series 16V", fuel: "Benzin", hp: 103, cc: 1396, cylinders: 4, transmission: "5-Manuel", trims: ["Si", "SLi"] }
        ]
      }
    ]
  },
  {
    brand: "Ticari Ağır Vasıta & Otobüs (Scania / MAN / Otokar / Karsan / Temsa)",
    series: [
      {
        name: "Scania R / S Series (Çekici)",
        years: "2004-2024",
        models: [
          { name: "R450 / R500 / S500 V8 / DC13 450/500", engine_code: "DC13 148", fuel: "Dizel", hp: 500, cc: 12742, cylinders: 6, transmission: "Opticruise Otomatik", trims: ["Highline", "Streamline"] },
          { name: "R730 V8 730 Euro 6", engine_code: "DC16 103 V8", fuel: "Dizel", hp: 730, cc: 16353, cylinders: 8, transmission: "Opticruise Otomatik", trims: ["Topline V8"] }
        ]
      },
      {
        name: "MAN TGX / TGS (Çekici)",
        years: "2007-2024",
        models: [
          { name: "TGX 18.470 / 18.510 D2676 470/510", engine_code: "D2676 Euro 6", fuel: "Dizel", hp: 510, cc: 12419, cylinders: 6, transmission: "MAN TipMatic", trims: ["GX Cab", "XLX"] }
        ]
      },
      {
        name: "Otokar Sultan / Navigo / Kent (Minibüs & Otobüs)",
        years: "2005-2024",
        models: [
          { name: "Sultan Maxi / Mega / City 145/175", engine_code: "Cummins ISB4.5", fuel: "Dizel", hp: 175, cc: 4500, cylinders: 4, transmission: "6-Manuel / Allison Otomatik", trims: ["Maxi", "Mega"] }
        ]
      },
      {
        name: "Karsan Jest / Atak (Minibüs & Halk Otobüsü)",
        years: "2013-2024",
        models: [
          { name: "Jest + / e-JEST 3.0 F1A 170 / EV 170", engine_code: "FPT F1A 3.0", fuel: "Dizel / Elektrik", hp: 170, cc: 2998, cylinders: 4, transmission: "6-Manuel / Otomatik", trims: ["Dolmuş / Şehir İçi"] }
        ]
      }
    ]
  }
];

// Add missing global brands
newGlobalBrands.forEach(nb => {
  if (!brandMap[nb.brand]) {
    carDb.push(nb);
    brandMap[nb.brand] = nb;
  } else {
    nb.series.forEach(ns => {
      brandMap[nb.brand].series.push(ns);
    });
  }
});

// Save updated database
const updatedFileContent = `export const CAR_DATABASE = ${JSON.stringify(carDb, null, 2)};\n`;
fs.writeFileSync(carDbPath, updatedFileContent, 'utf8');

console.log(`Global CAR_DATABASE updated! Total Brands: ${carDb.length}`);
