/**
 * Comprehensive OBD-II (DTC) Diagnostic Trouble Code Dictionary
 * Reference: ISO 15031-6 / SAE J2012 Standard & ototamircibul.com.tr dictionary
 * 
 * Categories:
 * - P Codes (Powertrain: Engine, Transmission, Fuel, Emissions)
 * - C Codes (Chassis: ABS, ESP, Steering, Suspension)
 * - B Codes (Body: Airbag, AC, Doors, Lighting, Central Locking)
 * - U Codes (Network: CAN-Bus & ECU Communication)
 */

export const OBD2_CODES = [
  // --- POWERTRAIN (P0100 - P0199: AIR & FUEL MEASUREMENT) ---
  {
    code: "P0100",
    title: "Kütle Hava Akış (MAF) Sensör Devre Arızası",
    category: "Motor & Yakıt",
    severity: "Orta",
    symptoms: "Rölantide dalgalanma, gaz yememe, zengin/fakir karışım uyarısı, siyah egzoz dumanı.",
    rootCauses: "Kirlenmiş veya arızalı MAF sensörü, tesisat kablo kopukluğu, süzgeç tıkanıklığı.",
    solution: "MAF sensörünü özel kontak temizleyici spreyle temizleyin veya yenisiyle değiştirin.",
    estimatedCost: "₺750 - ₺2.800"
  },
  {
    code: "P0101",
    title: "MAF Sensör Devresi Menzil / Performans Sorunu",
    category: "Motor & Yakıt",
    severity: "Orta",
    symptoms: "Hızlanmada gecikme, yüksek yakıt tüketimi, Motor Arıza Işığı (Check Engine).",
    rootCauses: "Hava filtresi tıkanıklığı, emme manifoldunda hava kaçağı, kirli MAF sensörü.",
    solution: "Hava filtresini ve hortum kelepçelerini kontrol edin, kaçak duman testi yaptırın.",
    estimatedCost: "₺450 - ₺1.800"
  },
  {
    code: "P0102",
    title: "MAF Sensör Devresi Düşük Girdi",
    category: "Motor & Yakıt",
    severity: "Orta",
    symptoms: "Zor çalışma, rölantide stop etme, motor gücünün düşmesi.",
    rootCauses: "Sensör soketinde korozyon, şasiye kısa devre, sensör elementi arızası.",
    solution: "Soket voltajını multimetre ile ölçün, kablo demetini onarın.",
    estimatedCost: "₺600 - ₺2.200"
  },
  {
    code: "P0106",
    title: "MAP / Barometrik Basınç Sensör Performans Hatası",
    category: "Motor & Yakıt",
    severity: "Orta",
    symptoms: "Düzensiz rölanti, sert vites geçişleri (otomatik), egzoz patlatması.",
    rootCauses: "Vakum hortumu çatlağı, kirli MAP sensörü deliği, EGR valfi kaçırması.",
    solution: "Vakum hortumlarını değiştirin, MAP sensör portunu temizleyin.",
    estimatedCost: "₺500 - ₺1.600"
  },
  {
    code: "P0110",
    title: "Emiş Havası Sıcaklık (IAT) Sensör Devre Arızası",
    category: "Motor & Yakıt",
    severity: "Düşük",
    symptoms: "Soğuk havalarda zor çalışma, yüksek yakıt tüketimi.",
    rootCauses: "IAT sensör direnç arızası, kopuk tesisat.",
    solution: "IAT sensörünü multimetre direnç testinden geçirin, gerekiyorsa değiştirin.",
    estimatedCost: "₺350 - ₺1.200"
  },
  {
    code: "P0115",
    title: "Motor Soğutma Suyu Sıcaklık (ECT) Sensör Arızası",
    category: "Motor & Soğutma",
    severity: "Yüksek",
    symptoms: "Hararet göstergesi çalışmama, radyatör fanının aralıksız çalışması, aşırı yakıt.",
    rootCauses: "ECT sensör arızası, termostat açık kalması, soket oksitlenmesi.",
    solution: "ECT sıcaklık sensörünü ve soket pinlerini değiştirin, soğutma sıvısını tazeleyin.",
    estimatedCost: "₺450 - ₺1.500"
  },
  {
    code: "P0120",
    title: "Gaz Kelebeği / Pedal Pozisyon Sensör A Devre Arızası",
    category: "Motor & Yakıt",
    severity: "Yüksek",
    symptoms: "Aracın koruma moduna (Limp Mode) geçmesi, gaza basınca tepki vermeme.",
    rootCauses: "Gaz kelebeği potansiyometre aşınması, gaz pedalı konum sensör arızası.",
    solution: "Gaz kelebeğini adaptasyon cihazı ile kalibre edin veya yenisiyle değiştirin.",
    estimatedCost: "₺1.200 - ₺4.500"
  },
  {
    code: "P0130",
    title: "Oksijen (O2 / Lambda) Sensör Devre Arızası (Banka 1 Sensör 1)",
    category: "Emisyon & Egzoz",
    severity: "Orta",
    symptoms: "Egzoz kokusu, siyah duman, yakıt tüketiminde %25 artış.",
    rootCauses: "Katalizör öncesi O2 sensörünün kurum kaplaması veya ısıtıcı rezistans kopukluğu.",
    solution: "Katalizör önü Lambda sensörünü değiştirin.",
    estimatedCost: "₺1.100 - ₺3.800"
  },
  {
    code: "P0171",
    title: "Sistem Çok Fakir (Banka 1 - Aşırı Hava / Yetersiz Yakıt)",
    category: "Motor & Yakıt",
    severity: "Yüksek",
    symptoms: "Tekleme, vuruntu, hızlanırken boğulma, hararet yükselmesi.",
    rootCauses: "Vakum kaçağı, vakum hortumu yarılması, tıkalı enjektör, düşük yakıt pompası basıncı.",
    solution: "Duman makinesi ile kaçak araması yapın, yakıt filtresini ve pompasını test edin.",
    estimatedCost: "₺600 - ₺3.500"
  },
  {
    code: "P0172",
    title: "Sistem Çok Zengin (Banka 1 - Yetersiz Hava / Aşırı Yakıt)",
    category: "Motor & Yakıt",
    severity: "Yüksek",
    symptoms: "Keskin benzin/dizel kokusu, buji kararması, katalizör ısınması.",
    rootCauses: "İşeyen/kaçoran enjektör, tıkalı hava filtresi, yüksek yakıt basıncı regülatörü.",
    solution: "Enjektörleri tezgahta işeme testine sokun, hava filtresini yenileyin.",
    estimatedCost: "₺800 - ₺4.200"
  },

  // --- POWERTRAIN (P0200 - P0299: INJECTORS & TURBOCHARGER) ---
  {
    code: "P0201",
    title: "Enjektör Devre Arızası - Silindir 1",
    category: "Motor & Yakıt",
    severity: "Yüksek",
    symptoms: "Motorun 3 silindir çalışması (sarsıntı), güç kaybı, arıza ışığı.",
    rootCauses: "1. Silindir enjektör bobini yanması, kablo demeti sıyrığı.",
    solution: "Enjektör soket direnç testini yapın, enjektör tesisatını onarın.",
    estimatedCost: "₺1.200 - ₺5.500"
  },
  {
    code: "P0234",
    title: "Turboşarj / Süperşarj Aşırı Basınç (Overboost) Durumu",
    category: "Turbo & Motor",
    severity: "Kritik",
    symptoms: "Aracın aniden gücü kesmesi, motor korumaya geçmesi, yüksek ıslık sesi.",
    rootCauses: "Turbo wastegate selenoid valfi sıkışması, N75 valf arızası, VGT kanatçık kurum kilitlenmesi.",
    solution: "Turbo N75 selenoid valfini değiştirin, VGT mekanizmasını kurum temizliğine alın.",
    estimatedCost: "₺1.500 - ₺7.500"
  },
  {
    code: "P0299",
    title: "Turboşarj / Süperşarj Düşük Basınç (Underboost) Durumu",
    category: "Turbo & Motor",
    severity: "Yüksek",
    symptoms: "Yokuşta çekişten düşme, gaza basınca tepki vermeme, siyah/gri egzoz dumanı.",
    rootCauses: "Intercooler hortumu yarılması/çatlağı, turbo mil boşluğu, kaçıran hortum kelepçesi.",
    solution: "Intercooler basınç hortumlarını kontrol edin, yırtık hortumu yenileyin.",
    estimatedCost: "₺850 - ₺4.800"
  },

  // --- POWERTRAIN (P0300 - P0399: IGNITION & MISFIRE) ---
  {
    code: "P0300",
    title: "Rastgele / Çoklu Silindir Ateşleme Hatası (Tekleme)",
    category: "Ateşleme & Motor",
    severity: "Kritik",
    symptoms: "Motorun şiddetli sarsılması, Check Engine ışığının yanıp sönmesi (flashing).",
    rootCauses: "Aşınmış bujiler, arızalı ateşleme bobin kütlesi, düşük kompresyon.",
    solution: "Bujileri ve bobinleri takım halinde değiştirin.",
    estimatedCost: "₺950 - ₺3.200"
  },
  {
    code: "P0301",
    title: "Silindir 1 Ateşleme Hatası (Misfire Detected)",
    category: "Ateşleme & Motor",
    severity: "Yüksek",
    symptoms: "Rölantide titreme, hızlanmada silkeleme.",
    rootCauses: "1. Silindir bujisi yağlanması/kararması, 1. silindir bobin arızası.",
    solution: "1. Silindir bujisini ve bobinini yenileyin.",
    estimatedCost: "₺550 - ₺1.800"
  },
  {
    code: "P0302",
    title: "Silindir 2 Ateşleme Hatası (Misfire Detected)",
    category: "Ateşleme & Motor",
    severity: "Yüksek",
    symptoms: "Rölantide sarsıntı, motor sesinde bozulma.",
    rootCauses: "2. Silindir buji/bobin hatası, enjektör tıkanıklığı.",
    solution: "Bobini başka silindire kaydırıp arızanın yer değiştirip değiştirmediğini test edin.",
    estimatedCost: "₺550 - ₺1.800"
  },
  {
    code: "P0303",
    title: "Silindir 3 Ateşleme Hatası (Misfire Detected)",
    category: "Ateşleme & Motor",
    severity: "Yüksek",
    symptoms: "Gaz yemede duraksama, egzozda patlatma.",
    rootCauses: "3. Silindir bujisi, bobini veya subap kaçırması.",
    solution: "Buji ve bobini değiştirin, kompresyon testi yaptırın.",
    estimatedCost: "₺550 - ₺1.800"
  },
  {
    code: "P0304",
    title: "Silindir 4 Ateşleme Hatası (Misfire Detected)",
    category: "Ateşleme & Motor",
    severity: "Yüksek",
    symptoms: "Motor gücünde belirgin düşüş, titreme.",
    rootCauses: "4. Silindir bujisi veya bobin devresi kopukluğu.",
    solution: "Buji ve bobin değişimi.",
    estimatedCost: "₺550 - ₺1.800"
  },
  {
    code: "P0335",
    title: "Krank Mili Pozisyon Sensörü (CKP) A Devre Arızası",
    category: "Ateşleme & Sensörler",
    severity: "Kritik",
    symptoms: "Motorun hiç marş basıp çalışmaması, seyir halindeyken stop etme.",
    rootCauses: "Krank sensörünün aşırı ısınarak bozulması, okuyucu kasnak diş kırılması.",
    solution: "Krank mili pozisyon sensörünü değiştirin.",
    estimatedCost: "₺700 - ₺2.400"
  },
  {
    code: "P0340",
    title: "Eksantrik Mili Pozisyon Sensörü (CMP) A Devre Arızası",
    category: "Ateşleme & Sensörler",
    severity: "Yüksek",
    symptoms: "Geç marş alma, motor devir saatinin takılması, sente kayıklığı uyarısı.",
    rootCauses: "Eksantrik sensör hatası, triger kayışı/zincir uzaması veya sente kayması.",
    solution: "Eksantrik sensörünü değiştirin, triger sente ayarını kontrol ettirin.",
    estimatedCost: "₺750 - ₺3.800"
  },

  // --- POWERTRAIN (P0400 - P0499: EMISSIONS, DPF, EGR, CATALYST) ---
  {
    code: "P0401",
    title: "EGR Valfi Yetersiz Akış Tespiti",
    category: "Emisyon & EGR",
    severity: "Orta",
    symptoms: "Yüksek hızda motor şakırtısı (şakıldama), yakıt artışı.",
    rootCauses: "EGR valfinin ve borularının yoğun kurum ile tıkalı olması.",
    solution: "EGR valfini söküp ultrasonik yıkama ile temizleyin veya yenileyin.",
    estimatedCost: "₺600 - ₺3.200"
  },
  {
    code: "P0420",
    title: "Katalitik Konvertör Sistemi Verimliliği Eşik Altı (Banka 1)",
    category: "Emisyon & Egzoz",
    severity: "Orta",
    symptoms: "Egzozdan çürük yumurta/kükürt kokusu, yüksek emisyon değerleri.",
    rootCauses: "Ömrünü tamamlamış katalizör, seramik iç dağılması, arızalı O2 sensörü.",
    solution: "Katalizörü yenisiyle değiştirin veya temizleme sıvısı uygulayın.",
    estimatedCost: "₺2.500 - ₺14.000"
  },
  {
    code: "P0471",
    title: "Egzoz Basınç Sensörü A Menzil / Performans Sorunu (DPF)",
    category: "Dizel & DPF",
    severity: "Yüksek",
    symptoms: "Dizel Partikül Filtresi (DPF) doluluk uyarısı, rejenerasyon yapamama.",
    rootCauses: "DPF fark basınç sensörü hortumlarının tıkanması, DPF kurum doluluğu.",
    solution: "DPF fark basınç sensörünü temizleyin/değiştirin, zorunlu jenerasyon yaptırın.",
    estimatedCost: "₺850 - ₺3.600"
  },

  // --- POWERTRAIN (P0500 - P0699: SPEED, IDLE & ECU) ---
  {
    code: "P0500",
    title: "Araç Hız Sensörü (VSS) A Arızası",
    category: "Şanzıman & Sensörler",
    severity: "Orta",
    symptoms: "Kilometre saatinin çalışmaması, kadran ibresinin düşmesi, cruise control iptali.",
    rootCauses: "VSS şanzıman hız okuyucu sensör arızası, kablo demeti kopukluğu.",
    solution: "Hız sensörünü ve soket hatlarını yenileyin.",
    estimatedCost: "₺600 - ₺1.900"
  },
  {
    code: "P0606",
    title: "ECU / ECM İşlemci Arızası",
    category: "Elektronik & Beyin",
    severity: "Kritik",
    symptoms: "Motorun aniden kapanması, gösterge panelinde tüm ikazların yanması.",
    rootCauses: "Motor beynine (ECU) su girmesi, voltaj dalgalanması, yazılım çökmesi.",
    solution: "ECU resetleme, yazılım güncelleme veya oto beyin tamiri yapın.",
    estimatedCost: "₺2.500 - ₺12.000"
  },

  // --- POWERTRAIN (P0700 - P0999: AUTOMATIC TRANSMISSION) ---
  {
    code: "P0700",
    title: "Şanzıman Kontrol Sistemi Arızası (TCM Uyarısı)",
    category: "Otomatik Şanzıman",
    severity: "Yüksek",
    symptoms: "Şanzımanın vuruntulu geçmesi, tek viteste sabit kalması (Safe Mode).",
    rootCauses: "TCM şanzıman beyni arızası, şanzıman yağı eksikliği/bozulması.",
    solution: "TCM arıza hafızasını okuyun, şanzıman yağı ve filtresini değiştirin.",
    estimatedCost: "₺1.500 - ₺9.500"
  },
  {
    code: "P0730",
    title: "Yanlış Vites Oranı (Incorrect Gear Ratio)",
    category: "Otomatik Şanzıman",
    severity: "Kritik",
    symptoms: "Vitesin boşa düşmesi, gaza basınca aracın gitmemesi, kavrama kaçırma.",
    rootCauses: "Şanzıman balata aşınması, selenoid valf gövdesi (Mechatronic) basınç kaybı.",
    solution: "Mekatronik revizyonu yaptırın, türbin ve kavrama balatalarını yenileyin.",
    estimatedCost: "₺4.500 - ₺25.000"
  },

  // --- CHASSIS (C CODES: ABS, ESP, BRAKES & STEERING) ---
  {
    code: "C0035",
    title: "Sol Ön Tekerlek Hız Sensörü Devre Arızası (ABS)",
    category: "ABS & Şasi",
    severity: "Yüksek",
    symptoms: "ABS ve ESP ikaz lambalarının yanması, sert frenlemede kızaklama.",
    rootCauses: "ABS tekerlek sensörü kablo kopukluğu, poyra rulmanındaki okuyucu mıknatıs kirliliği.",
    solution: "Sol ön ABS tekerlek sensörünü temizleyin veya yenileyin.",
    estimatedCost: "₺650 - ₺2.100"
  },
  {
    code: "C0110",
    title: "ABS Pompa Motoru Devre Arızası",
    category: "ABS & Şasi",
    severity: "Kritik",
    symptoms: "ABS sisteminin tamamen devre dışı kalması, fren pedalının sertleşmesi.",
    rootCauses: "ABS kömürlerinin bitmesi, ABS beyninde hidrolik valf kilitlenmesi.",
    solution: "ABS beyin ve pompa revizyonu yaptırın.",
    estimatedCost: "₺2.800 - ₺11.000"
  },

  // --- BODY (B CODES: AIRBAG, CLIMATE & LIGHTING) ---
  {
    code: "B0001",
    title: "Sürücü Ön Hava Yastığı (Airbag) Tetikleme Devresi 1",
    category: "Güvenlik & Airbag",
    severity: "Kritik",
    symptoms: "Kırmızı Airbag ikaz lambasının aralıksız yanması.",
    rootCauses: "Direksiyon zemberek (clockspring) şerit kablo kopukluğu, Airbag soket gevşekliği.",
    solution: "Direksiyon zembereğini yenileyin, airbag soketini kontrol edin.",
    estimatedCost: "₺1.200 - ₺4.200"
  },
  {
    code: "B1000",
    title: "Klima / Otomatik İklimlendirme Kontrol Modülü Arızası",
    category: "Klima & Gövde",
    severity: "Düşük",
    symptoms: "Klimanın soğutmaması, sıcak/soğuk klape yönlendirme yapmaması.",
    rootCauses: "Klima klape motoru dişli sıyırması, klima panel kartı arızası.",
    solution: "Klape yönlendirme motorunu değiştirin veya klima gazı basıncını ölçtürün.",
    estimatedCost: "₺750 - ₺3.200"
  },

  // --- NETWORK (U CODES: CAN-BUS COMMUNICATION) ---
  {
    code: "U0100",
    title: "Motor Kontrol Modülü (ECM/ECU) İle İletişim Kaybı",
    category: "CAN-Bus & İletişim",
    severity: "Kritik",
    symptoms: "Gösterge panelinde CAN-Bus çizgileri (---), aracın marş basıp çalışmaması.",
    rootCauses: "CAN-Bus hattı şasi korozyonu, beynin besleme sigortasının atması.",
    solution: "Ana motor rölesini ve sigorta kutusunu kontrol edin, CAN şasi kablosunu temizleyin.",
    estimatedCost: "₺950 - ₺4.500"
  },
  {
    code: "U0101",
    title: "Şanzıman Kontrol Modülü (TCM) İle İletişim Kaybı",
    category: "CAN-Bus & İletişim",
    severity: "Kritik",
    symptoms: "Vites konumunun göstergede görünmemesi (PRNDL yanıp sönmesi).",
    rootCauses: "TCM şanzıman beynine giren ana soketin su alıp oksitlenmesi.",
    solution: "Şanzıman soketini kontak sprey ile temizleyin, pinleri sıkılaştırın.",
    estimatedCost: "₺1.100 - ₺5.200"
  },
  {
    code: "U0121",
    title: "ABS Kontrol Modülü İle İletişim Kaybı",
    category: "CAN-Bus & İletişim",
    severity: "Yüksek",
    symptoms: "ABS, ESP, Hız Göstergesi ve El Freni ikazlarının tümünün aynı anda yanması.",
    rootCauses: "ABS beyni soket korozyonu veya ABS sigortasının atması.",
    solution: "ABS sigortasını yenileyin, CAN-High / CAN-Low voltaj dalgalanmasını ölçün.",
    estimatedCost: "₺850 - ₺3.800"
  }
];

export function searchObd2Codes(query = "") {
  if (!query || query.trim() === "") return OBD2_CODES;
  const q = query.toLowerCase().trim();
  return OBD2_CODES.filter((item) =>
    item.code.toLowerCase().includes(q) ||
    item.title.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.symptoms.toLowerCase().includes(q) ||
    item.rootCauses.toLowerCase().includes(q)
  );
}
