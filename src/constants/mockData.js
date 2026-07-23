// =============================================================
// REFERENCE CONSTANTS (Non-mock, used for UI dropdowns & prompts)
// =============================================================

export const PART_CATEGORIES = [
  "Tümü",
  "Bakım & Sıvı Grubu",
  "Fren & Güvenlik",
  "Motor & Mekanik",
  "Şanzıman & Aktarma",
  "Yürüyen Aksam & Süspansiyon",
  "Elektrik & Elektronik",
  "Gövde, Kaporta & Dış Aksam",
  "İç Aksam & Konfor",
  "Egzoz & Emisyon",
  "LPG & Otogaz",
  "Lastik & Jant",
  "Oto Bakım & Aksesuar"
];

export const DETAILED_PARTS_TAXONOMY = [
  {
    id: "maintenance",
    name: "Bakım & Sıvı Grubu",
    icon: "Droplet",
    subcategories: ["Motor Yağı", "Yağ Filtresi", "Hava Filtresi", "Polen / Kabin Filtresi", "Yakıt Filtresi", "Antifriz", "Fren Hidroliği", "Şanzıman Yağı"]
  },
  {
    id: "brakes",
    name: "Fren & Güvenlik",
    icon: "ShieldAlert",
    subcategories: ["Ön Fren Balatası", "Arka Fren Balatası", "Fren Diski (Ön/Arka)", "Fren Hortumu", "Fren Kaliperi", "ABS Sensörü", "Fren Ana Merkezi"]
  },
  {
    id: "engine",
    name: "Motor & Mekanik",
    icon: "Cog",
    subcategories: ["Triger Kayış Seti / Zincir", "V Kayışı & Gergiler", "Buji & Kızdırma Bujisi", "Ateşleme Bobini", "Enjektör & Yakıt Pompası", "Devirdaim / Su Pompası", "Turboşarj & Intercooler", "Conta & Kelepçe Setleri"]
  },
  {
    id: "transmission",
    name: "Şanzıman & Aktarma",
    icon: "GitCommit",
    subcategories: ["Baskı Balata Seti", "Volant", "Aks & Aks Kafası", "Şaft & Diferansiyel", "Otomatik Şanzıman Filtresi & Yağı", "Mechatronic Beyin"]
  },
  {
    id: "suspension",
    name: "Yürüyen Aksam & Süspansiyon",
    icon: "Activity",
    subcategories: ["Ön / Arka Amortisör", "Amortisör Takozu & Bilyası", "Salıncak", "Rot Başı & Rot Mili", "Z Rot (Askı Rotu)", "Porya Bilyası / Teker Rulmanı", "Helezon Yay"]
  },
  {
    id: "electronics",
    name: "Elektrik & Elektronik",
    icon: "Zap",
    subcategories: ["Akü (AGM/EFB/Standart)", "Şarj Dinamosu", "Marş Motoru", "Krank & Eksantrik Sensörleri", "Oksijen / Lambda Sensörü", "Farlar & Stop Lambaları", "Ampul & Xenon/LED"]
  },
  {
    id: "bodywork",
    name: "Gövde, Kaporta & Dış Aksam",
    icon: "Car",
    subcategories: ["Ön / Arka Tampon", "Çamurluk & Kaput", "Radyatör Izgarası", "Yan Aynalar & Dikiz Aynası", "Silecek Takımı & Motoru", "Kapı Fitilleri & Yalıtım"]
  },
  {
    id: "interior",
    name: "İç Aksam & Konfor",
    icon: "Armchair",
    subcategories: ["Klima Kompresörü", "Klima Radyatörü / Evaporatör", "Koltuk Kılıfı & Döşeme", "Oto Paspas Seti", "Bagaj Havuzu", "Multimedya & Park Sensörü"]
  },
  {
    id: "exhaust",
    name: "Egzoz & Emisyon",
    icon: "Wind",
    subcategories: ["Egzoz Susturucusu", "Katalitik Konvertör", "DPF Partikül Filtresi", "EGR Valfi", "Egzoz Esnek Borusu / Spiral"]
  },
  {
    id: "lpg",
    name: "LPG & Otogaz",
    icon: "Flame",
    subcategories: ["LPG Filtresi", "LPG Regülatörü / Beyni", "Gaz Enjektörleri", "AFR Sensörü", "LPG Solenoid Valfi"]
  },
  {
    id: "tires",
    name: "Lastik & Jant",
    icon: "Disc",
    subcategories: ["Yaz Lastiği", "Kış Lastiği", "4 Mevsim Lastik", "Alüminyum Jant Seti", "Sibop & Balans Takozları", "Bijon Cıvataları"]
  },
  {
    id: "accessories",
    name: "Oto Bakım & Aksesuar",
    icon: "Sparkles",
    subcategories: ["Seramik Kaplama & Cilalar", "Araç İçi Temizlik Ürünleri", "Trafik & İlkyardım Seti", "Yangın Söndürücü", "Oto Şampuanı & Torpido Sütü"]
  }
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
