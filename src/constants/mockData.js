// =============================================================
// REFERENCE CONSTANTS (Non-mock, used for UI dropdowns & prompts)
// =============================================================

export const PART_CATEGORIES = [
  "Tümü",
  "Fren",
  "Yağ",
  "Filtre",
  "Motor",
  "Şanzıman",
  "Aksesuar",
  "Lastik",
];

export const CAR_DATA = [
  {
    brand: "Fiat",
    models: ["Egea", "Linea", "Doblo", "Fiorino", "500", "Panda", "Egea Cross"],
  },
  {
    brand: "Renault",
    models: [
      "Clio",
      "Megane",
      "Symbol",
      "Taliant",
      "Captur",
      "Kadjar",
      "Austral",
      "Twingo",
    ],
  },
  {
    brand: "Volkswagen",
    models: [
      "Passat",
      "Golf",
      "Polo",
      "Tiguan",
      "T-Roc",
      "Caddy",
      "Transporter",
      "Amarok",
    ],
  },
  {
    brand: "Ford",
    models: [
      "Focus",
      "Fiesta",
      "Puma",
      "Kuga",
      "Ranger",
      "Transit",
      "Tourneo Courier",
    ],
  },
  {
    brand: "Toyota",
    models: ["Corolla", "Yaris", "C-HR", "RAV4", "Hilux", "Proace", "Camry"],
  },
  {
    brand: "Honda",
    models: ["Civic", "CR-V", "HR-V", "Jazz", "City", "Accord"],
  },
  {
    brand: "Hyundai",
    models: [
      "i10",
      "i20",
      "i30",
      "Bayon",
      "Tucson",
      "Kona",
      "Elantra",
      "Staria",
    ],
  },
  {
    brand: "BMW",
    models: [
      "1 Serisi",
      "2 Serisi",
      "3 Serisi",
      "4 Serisi",
      "5 Serisi",
      "X1",
      "X3",
      "X5",
      "iX",
    ],
  },
  {
    brand: "Mercedes-Benz",
    models: [
      "A-Serisi",
      "C-Serisi",
      "E-Serisi",
      "S-Serisi",
      "CLA",
      "GLA",
      "GLC",
      "Vito",
    ],
  },
  { brand: "Audi", models: ["A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7"] },
  {
    brand: "Peugeot",
    models: ["208", "308", "2008", "3008", "408", "508", "5008", "Rifter"],
  },
  {
    brand: "Citroen",
    models: ["C3", "C4", "C5 Aircross", "C-Elysee", "Berlingo", "Ami"],
  },
  {
    brand: "Dacia",
    models: ["Duster", "Sandero", "Sandero Stepway", "Jogger", "Spring"],
  },
  {
    brand: "Opel",
    models: [
      "Corsa",
      "Astra",
      "Mokka",
      "Crossland",
      "Grandland",
      "Insignia",
      "Combo",
    ],
  },
  { brand: "Togg", models: ["T10X"] },
  { brand: "Tesla", models: ["Model Y", "Model 3", "Model S", "Model X"] },
];

export const OEM_CATALOG = [
  {
    id: 101,
    name: "Bosch Ön Fren Balata Seti",
    brand: "Bosch",
    category: "Fren Sistemi",
    price: 1250,
    image_url: "/src/assets/products/brake_pads.png",
    description: "Fiat Egea ve Renault Clio ile %100 uyumlu yüksek performanslı ön fren balata seti.",
    compatibility: [
      { brand: "Fiat", model: "Egea" },
      { brand: "Renault", model: "Clio" }
    ]
  },
  {
    id: 102,
    name: "Castrol Edge 5W-30 Motor Yağı 4L",
    brand: "Castrol",
    category: "Motor Parçaları",
    price: 1850,
    image_url: "/src/assets/products/engine_oil.png",
    description: "Volkswagen Golf ve Ford Focus için onaylı tam sentetik motor yağı.",
    compatibility: [
      { brand: "Volkswagen", model: "Golf" },
      { brand: "Ford", model: "Focus" }
    ]
  },
  {
    id: 103,
    name: "Mann Filtre Yağ Filtresi",
    brand: "Mann Filter",
    category: "Filtreler",
    price: 320,
    image_url: "/src/assets/products/car_battery.png",
    description: "Toyota Corolla ve Honda Civic uyumlu orijinal kalitede yağ filtresi.",
    compatibility: [
      { brand: "Toyota", model: "Corolla" },
      { brand: "Honda", model: "Civic" }
    ]
  },
  {
    id: 104,
    name: "Mutlu Akü 12V 72Ah SFB",
    brand: "Mutlu",
    category: "Elektrik",
    price: 3400,
    image_url: "/src/assets/products/car_battery.png",
    description: "Fiat Egea ve Dacia Duster uyumlu yüksek marş gücüne sahip akü.",
    compatibility: [
      { brand: "Fiat", model: "Egea" },
      { brand: "Dacia", model: "Duster" }
    ]
  }
];
