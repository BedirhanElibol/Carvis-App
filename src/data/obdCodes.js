/**
 * OBD-II Diagnostic Trouble Code (DTC) Database for Carvis
 */
export const obdCodesDatabase = [
  {
    code: "P0300",
    title: "Rastgele / Çoklu Silindir Ateşleme Kaçırma Arızası (Misfire)",
    category: "Motor & Ateşleme",
    riskLevel: "high", // 'high', 'medium', 'low'
    riskLabel: "Yüksek Risk - Motor Titremesi",
    canDrive: false,
    driveAdvice: "Motor ciddi zarar görebilir. Aracı zorlamadan en yakın servise götürün.",
    symptoms: ["Motor sarsıntılı çalışıyor", "Gaz yememe / güç kaybı", "Egzozdan çiğ yakıt kokusu"],
    possibleCauses: ["Buji veya buji kabloları aşınmış", "Ateşleme bobini arızalı", "Enjektör tıkalı", "Düşük silindir kompresyonu"],
    estimatedCost: { min: 850, max: 2800 },
    specialist: "Oto Elektrik & Motor Ustası"
  },
  {
    code: "P0301",
    title: "1. Silindir Ateşleme Kaçırma (Cylinder 1 Misfire)",
    category: "Motor & Ateşleme",
    riskLevel: "high",
    riskLabel: "Yüksek Risk",
    canDrive: false,
    driveAdvice: "1. silindirde ateşleme yok. Kısa mesafede servise başvurun.",
    symptoms: ["Rolantide sarsıntı", "Motor arıza lambası yanıp sönüyor"],
    possibleCauses: ["1. silindir bujisi arızalı", "1. silindir ateşleme bobini bozuk"],
    estimatedCost: { min: 600, max: 1800 },
    specialist: "Oto Elektrik & Motor Ustası"
  },
  {
    code: "P0171",
    title: "Sistem Çok Fakir Karışım (Bank 1 System Too Lean)",
    category: "Yakıt & Hava Karışımı",
    riskLevel: "medium",
    riskLabel: "Orta Risk - Fazla Hava Girdisi",
    canDrive: true,
    driveAdvice: "Düşük devirde kullanabilirsiniz. Uzun vadede supap erimesine yol açabilir.",
    symptoms: ["Performans düşüklüğü", "Geç çalışma", "Rolanti dalgalanması"],
    possibleCauses: ["MAFF (Hava akış metre) kirliliği", "Vakum hortumu kaçağı", "Yakıt pompası basınç düşüklüğü"],
    estimatedCost: { min: 500, max: 2200 },
    specialist: "Oto Enjeksiyon & Mekanik Ustası"
  },
  {
    code: "P0420",
    title: "Katalizör Sistemi Verimliliği Eşik Altında (Bank 1)",
    category: "Egzoz & Emisyon",
    riskLevel: "medium",
    riskLabel: "Orta Risk - Emisyon İhlali",
    canDrive: true,
    driveAdvice: "Sürüşe engel değildir ancak muayeneden geçmez ve yakıt tüketimini artırır.",
    symptoms: ["Egzoz kokusu", "Yakıt sarfiyatında artış", "Muayene emisyon hatası"],
    possibleCauses: ["Katalitik konvertör tıkanıklığı / yıpranması", "Oksijen (Lambda) sensörü arızası"],
    estimatedCost: { min: 1500, max: 7500 },
    specialist: "Egzoz & Emisyon Sistemleri Ustası"
  },
  {
    code: "P0100",
    title: "Kütle Hava Akış (MAF) Sensör Devre Arızası",
    category: "Sensör & Elektronik",
    riskLevel: "medium",
    riskLabel: "Orta Risk",
    canDrive: true,
    driveAdvice: "Araç koruma moduna geçebilir. Sensör temizliği veya değişimi gerekebilir.",
    symptoms: ["Siyah egzoz dumanı", "Ani hızlanmada tekleme"],
    possibleCauses: ["MAF sensör konnektörü oksitlenmiş", "MAF sensörü arızalı", "Hava filtresi aşırı kırı"],
    estimatedCost: { min: 450, max: 1950 },
    specialist: "Oto Elektrik & Elektronik Ustası"
  },
  {
    code: "P0700",
    title: "Şanzıman Kontrol Sistemi Arızası (TCM Malfunction)",
    category: "Şanzıman & Vites",
    riskLevel: "high",
    riskLabel: "Yüksek Risk - Şanzıman Koruma Modu",
    canDrive: false,
    driveAdvice: "Vites geçişleri kilitlenebilir. Aracı hemen durdurup çekici çağırın.",
    symptoms: ["Vitese geçmeme / vuruntu", "Şanzıman limpmode (koruma) girişi"],
    possibleCauses: ["Şanzıman yağı seviyesi/kalitesi bozuk", "Şanzıman beyni (TCM) arızası", "Selenoid valf hatası"],
    estimatedCost: { min: 2500, max: 14500 },
    specialist: "Otomatik Şanzıman & DSG Ustası"
  },
  {
    code: "P0401",
    title: "EGR Valfi Yetersiz Akış Arızası (Exhaust Gas Recirculation)",
    category: "Egzoz & DPF",
    riskLevel: "medium",
    riskLabel: "Orta Risk - Kurum Tıkanması",
    canDrive: true,
    driveAdvice: "EGR valfi kurum bağlamış olabilir. Temizlik yaptırmanız önerilir.",
    symptoms: ["Düşük devirde tekleme", "Egzozdan siyah duman", "Yakıt artışı"],
    possibleCauses: ["EGR valfi karbon birikintisiyle tıkalı", "EGR vakum hortumu kaçığı"],
    estimatedCost: { min: 700, max: 2400 },
    specialist: "Egzoz & DPF / Katalizör Ustası"
  },
  {
    code: "P0340",
    title: "Eksantrik Mili Pozisyon Sensörü Devre Arızası (Camshaft Sensor)",
    category: "Sensör & Motor",
    riskLevel: "high",
    riskLabel: "Yüksek Risk - Çalışmama Tehlikesi",
    canDrive: false,
    driveAdvice: "Motor durabilir ve tekrar çalışmayabilir. Servis kontrolü zorunludur.",
    symptoms: ["Marş basıyor ama motor çalışmıyor", "Motor aniden stop ediyor"],
    possibleCauses: ["Eksantrik sensörü bozuk", "Triger kayışı/zinciri sente atlamış"],
    estimatedCost: { min: 900, max: 3200 },
    specialist: "Oto Elektrik & Mekanik Ustası"
  },
  {
    code: "P0135",
    title: "Oksijen (Lambda) Sensörü Isıtıcı Devre Arızası (Bank 1 Sensor 1)",
    category: "Sensör & Emisyon",
    riskLevel: "low",
    riskLabel: "Düşük Risk",
    canDrive: true,
    driveAdvice: "Motor ısınana kadar biraz fazla yakıt yakabilir. Sürüşe engel değildir.",
    symptoms: ["İlk çalıştırmada yüksek yakıt tüketimi", "Motor arıza lambası sabit yanıyor"],
    possibleCauses: ["Oksijen sensörü rezistansı kopmuş", "Sensör kablo demeti zedelenmiş"],
    estimatedCost: { min: 650, max: 2100 },
    specialist: "Oto Elektrik & Egzoz Ustası"
  }
];

export const searchOBDCode = (query) => {
  if (!query) return [];
  const clean = query.trim().toUpperCase();
  return obdCodesDatabase.filter(
    item => item.code.includes(clean) || item.title.toUpperCase().includes(clean) || item.category.toUpperCase().includes(clean)
  );
};
