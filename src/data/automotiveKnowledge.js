export const AUTOMOTIVE_KNOWLEDGE = {
    // 1. Gösterge Paneli İkaz Işıklari (Evrensel)
    warning_lights: [
        {
            keywords: ["motor arıza", "check engine", "sarı motor", "musluk işareti", "motor lambası"],
            title: "Motor Arıza Lambası (Check Engine)",
            severity: "low", // low, medium, urgent
            response: "Motor arıza lambası (sarı musluk/motor simgesi) egzoz emisyon sistemi, ateşleme veya yakıt sisteminde bir sorun olduğunu belirtir. Araç çalışmaya devam edebilir ancak çekiş düşebilir. **Yapılması gereken:** En kısa sürede bilgisayarlı arıza tespiti (OBD) yaptırmanız gerekir. Ciddi bir sorun olmayabilir (oksijen sensörü vb.) ancak ihmal edilirse katalizör arızasına yol açabilir."
        },
        {
            keywords: ["yağ lambası", "yağ basınç", "kırmızı yağ", "çaydanlık"],
            title: "Yağ Basınç İkazı",
            severity: "urgent",
            response: "⚠️ **KRİTİK UYARI:** Kırmızı yağ lambası, motor yağ basıncının düştüğünü gösterir. **ARACI DERHAL DURDURUN.** Motoru stop edin. Yağ seviyesini kontrol edin. Eğer yağ tam ise yağ pompası arızalı olabilir. Bu şekilde yola devam etmek motorda kalıcı hasara (yatak sarma) neden olur. Çekici çağırın."
        },
        {
            keywords: ["akü lambası", "şarj lambası", "pil işareti"],
            title: "Akü/Şarj Sistemi İkazı",
            severity: "medium",
            response: "Akü lambası yanıyorsa alternatör (şarj dinamosu) aküyü şarj etmiyor demektir. Araç aküdeki enerji bitene kadar (genelde 20-30 dk) çalışır, sonra stop eder. Klimayı ve radyoyu kapatıp en yakın servise gidin. V Kayışı kopmuş da olabilir."
        },
        {
            keywords: ["hararet", "sıcaklık", "derece", "kırmızı termometre"],
            title: "Hararet İkazı",
            severity: "urgent",
            response: "⚠️ **KRİTİK UYARI:** Hararet göstergesi yükseldi veya kırmızı lamba yandıysa motor aşırı ısınmıştır. **ARACI DURDURUN VE MOTORU KAPATIN.** Kaputu açıp bekleyin, ancak **ASLA RADYATÖR KAPAĞINI AÇMAYIN** (basınçlı sıcak su yanıklara yol açar). Su eksiltme veya fan arızası olabilir."
        },
        {
            keywords: ["lastik basınç", "ünlem", "sarı parantez", "lastik havası"],
            title: "Lastik Basınç Sensörü (TPMS)",
            severity: "low",
            response: "Bir veya birden fazla lastiğin havası inmiş. En yakın benzinlikte lastik havalarını kontrol edin. Eğer lastik sağlamsa sensör arızası olabilir."
        }
    ],

    // 2. Periyodik Bakım Bilgileri (Genel)
    maintenance: [
        {
            keywords: ["ne zaman bakım", "bakım aralığı", "yağ değişimi ne zaman", "kaç km bakım"],
            response: "Genel kural olarak benzinli araçlar her **10.000 - 15.000 km**'de veya **yılda bir**, dizel araçlar ise **10.000 - 15.000 km**'de bir bakıma girmelidir. Ağır bakım (Triger seti vb.) genellikle 4 yıl veya 60.000 - 90.000 km aralığında yapılır. Aracınızın tam modeline göre bu süreler değişebilir."
        },
        {
            keywords: ["ağır bakım", "triger", "triger seti"],
            response: "Ağır bakım, aracın hayati parçalarının değiştiği bakımdır. Genellikle **60.000 km - 90.000 km** arasında veya **4. yılda** yapılır. İçeriği: Triger kayışı/zinciri, V kayışı, devirdaim pompası, bujiler (benzinli) ve tüm filtre/sıvıların değişimini kapsar."
        }
    ],

    // 3. Genel Sorunlar (Sık Sorulanlar)
    common_issues: [
        {
            keywords: ["siyah duman", "egzoz siyah", "kara duman"],
            response: "Siyah duman genellikle **zengin karışım** (yakıtın tam yanamaması) işaretidir. Sebepleri: Kirli hava filtresi, arızalı enjektörler, tıkalı DPF (dizel) veya turbo hortumunda kaçak olabilir. Yakıt tüketiminiz artmış olabilir."
        },
        {
            keywords: ["mavi duman", "egzoz mavi", "yağ yakma"],
            response: "Mavi duman motorun **yağ yaktığını** gösterir. Piston segmanları, sübap lastikleri veya turbo mili aşınmış olabilir. Yağ seviyesini sık sık kontrol edin ve servise gösterin."
        },
        {
            keywords: ["beyaz duman", "egzoz beyaz"],
            response: "Beyaz duman (motor ısındıktan sonra devam ediyorsa) yanma odasına **su/antifriz karıştığını** gösterir. Silindir kapak contası yanmış olabilir. Hararet durumunu kontrol edin."
        },
        {
            keywords: ["ses geliyor", "titreme", "direksiyon titriyor"],
            response: "Aracı görmeden kesin konuşmak zor olsa da; **Hızlanırken titreme:** Aks veya rot balans, **Fren yaparken titreme:** Fren diskleri eğilmiş olabilir, **Rölantide titreme:** Motor kulağı veya ateşleme sorunu olabilir."
        }
    ]
};

/**
 * Basit metin tabanlı arama fonksiyonu
 */
export const searchKnowledgeBase = (query) => {
    const normalize = (text) => text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const q = normalize(query);

    // Tüm kategorileri tara
    const allCategories = [...AUTOMOTIVE_KNOWLEDGE.warning_lights, ...AUTOMOTIVE_KNOWLEDGE.maintenance, ...AUTOMOTIVE_KNOWLEDGE.common_issues];

    // 1. Tam eşleşme veya güçlü keyword eşleşmesi (Puanlama sistemi)
    let bestMatch = null;
    let maxScore = 0;

    for (const item of allCategories) {
        let score = 0;

        // Keyword kontrolü
        for (const keyword of item.keywords) {
            const k = normalize(keyword);
            if (q.includes(k)) {
                score += k.length; // Uzun keyword eşleşmesi daha değerlidir
            }
        }

        if (score > maxScore) {
            maxScore = score;
            bestMatch = item;
        }
    }

    // Eşik değer (Çok alakasız eşleşmeleri elemek için)
    if (bestMatch && maxScore >= 4) { // En az 4 karakterlik bir keyword tutmalı
        return {
            found: true,
            title: bestMatch.title || "Bilgi Bankası Sonucu",
            text: bestMatch.response,
            source: "local_db"
        };
    }

    return { found: false };
};
