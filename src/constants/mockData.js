// =============================================================
// REFERENCE CONSTANTS (Non-mock, used for UI dropdowns & prompts)
// =============================================================

export const PART_CATEGORIES = [
  "Tümü",
  "Motor ve Mekanik (Kaput Altı)",
  "Dış Karoser, Kaporta & Gövde",
  "Yürüyen Aksam, Süspansiyon & Fren",
  "İç Aksam, Konfor & Kokpit",
  "Elektrik, Aydınlatma & Elektronik"
];

export const DETAILED_PARTS_TAXONOMY = [
  {
    id: "engine_mechanical",
    name: "Motor ve Mekanik (Kaput Altı)",
    subcategories: [
      {
        name: "Motor Bloğu ve Temel Bileşenler",
        items: ["Silindir Bloğu", "Silindir Kapağı", "Karter", "Motor Kulakları", "Pistonlar & Segmanlar", "Biyel Kolları", "Krank Mili", "Eksantrik Mili", "Subaplar & Subap Yayı/Fincanı"]
      },
      {
        name: "Yakıt ve Hava Emme Sistemi",
        items: ["Yakıt Pompası", "Enjektörler & Yakıt Kütüğü", "Yakıt Filtresi", "Turboşarj & Intercooler", "Hava Filtresi Kutusu", "Gaz Kelebeği", "Emme Manifoldu", "MAF Kütle Hava Akış Sensörü", "MAP Sensörü"]
      },
      {
        name: "Soğutma ve Egzoz Sistemi",
        items: ["Su Radyatörü & Termostat", "Devirdaim Su Pompası", "Genleşme Kabı & Fan Motoru", "Egzoz Manifoldu", "EGR Valfi", "Katalitik Konvertör", "DPF Partikül Filtresi", "Oksijen / Lambda Sensörü", "Egzoz Susturucuları"]
      },
      {
        name: "Şanzıman ve Aktarma",
        items: ["Manuel / Otomatik Şanzıman Kutusu", "Tork Konvertörü", "Mechatronic Şanzıman Beyni", "Baskı, Balata & Volant", "Debriyaj Rulmanı & Merkezi", "Şaft & Diferansiyel", "Aks Millere & Laleler/Körükler"]
      }
    ]
  },
  {
    id: "body_exterior",
    name: "Dış Karoser, Kaporta & Gövde",
    subcategories: [
      {
        name: "Ön ve Arka Gövde Aksamı",
        items: ["Ön / Arka Tamponlar", "Tampon Izgaraları & Lip/Difüzör", "Motor Kaputu", "Bagaj Kapağı", "Ön Panjur Izgara", "Çeki Demiri", "Amblem, Logo & Plakalıklar"]
      },
      {
        name: "Yan Gövde ve Camlar",
        items: ["Ön / Arka Çamurluklar & Davlumbazlar", "Kapı Sacları & Kilit Mekanizmaları", "Yan Aynalar (Cam, Kapak, Sinyal, Motor)", "Ön / Arka Cam (Rezistanslı)", "Yan Kapı & Kelebek Camları", "Cam Fitilleri & Marşpiyel", "Kapı Kolları & Tavan Çıtaları"]
      }
    ]
  },
  {
    id: "chassis_brakes",
    name: "Yürüyen Aksam, Süspansiyon & Fren",
    subcategories: [
      {
        name: "Süspansiyon ve Direksiyon",
        items: ["Amortisörler & Helezon Yaylar", "Amortisör Takozları & Bilyaları", "Salıncaklar", "Rot Başı & Rot Mili", "Z-Rot (Viraj Askı Rotu)", "Viraj Demir Uç Lastikleri", "Direksiyon Kutusu & Pompası", "Direksiyon Mafsalları"]
      },
      {
        name: "Fren ve Tekerlek Sistemi",
        items: ["Fren Diskleri", "Fren Balataları", "Fren Kaliperleri & Pimler", "Fren Merkez Silindiri & Westinghouse", "ABS Beyni & Sensörleri", "Çelik / Alüminyum Jantlar", "Poyra (Tekerlek) Bilyası", "Bijon Saplamaları & Lastikler"]
      }
    ]
  },
  {
    id: "interior_cockpit",
    name: "İç Aksam, Konfor & Kokpit",
    subcategories: [
      {
        name: "Döşeme ve Koltuklar",
        items: ["Ön / Arka Koltuklar & Kızaklar", "Koltuk Isıtma Pedleri", "Tavan Döşemesi & Taban Halısı", "Kapı İçi & Bagaj Pandizotları", "Bagaj Havuzu & Paspaslar", "Emniyet Kemerleri & Tokaları"]
      },
      {
        name: "Konsol ve Kumanda Elemanları",
        items: ["Torpido & Direksiyon Simidi", "Airbag Kapakları", "Vites Topuzu & Körüğü", "Gösterge Paneli (Kadran)", "Klima Kumanda Paneli", "Silecek & Sinyal Kolları", "Kolçak, Küllük & Bardaklık", "Güneşlik Siperlikler", "Cam Açma Düğmeleri & Ayna Joystick"]
      },
      {
        name: "Multimedya ve İklimlendirme",
        items: ["Teyp / Multimedya Ekranı", "Hoparlörler (Midrange/Tweeter)", "Navigasyon Modülü", "Klima Kompresörü", "Klima Radyatörü (Kondenser)", "Kalorifer Peteği", "Polen Filtresi & Havalandırma Menfezleri", "Kalorifer Fan Motoru"]
      }
    ]
  },
  {
    id: "electrical_electronics",
    name: "Elektrik, Aydınlatma & Elektronik",
    subcategories: [
      {
        name: "Aydınlatma ve Uyarı Sistemleri",
        items: ["Ön Farlar (LED/Xenon/Halojen)", "Far Camları & Far Beyinleri", "Arka Stop Lambaları", "Sis Farları & Sinyaller", "Gündüz LED'leri & Plaka Aydınlatması", "İç Tavan & Ambiyans Lambaları", "Korna"]
      },
      {
        name: "Güç Kaynağı ve Beyinler (ECU)",
        items: ["Akü", "Şarj Dinamosu & Marş Motoru", "Ateşleme Bobinleri & Bujiler", "Motor Beyni (ECU)", "BSI / Konfor Beyni", "Sigorta Kutusu & Röleler", "Krank & Kam Mili Sensörleri", "Vuruntu & Yağ Basınç Sensörü", "Park Sensörleri & Geri Görüş Kamerası", "Kör Nokta Uyarı Radarları"]
      }
    ]
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
      "Courier",
      "Custom",
      "Kuga",
      "Puma",
      "Mondeo",
      "Ranger",
    ],
  },
];
