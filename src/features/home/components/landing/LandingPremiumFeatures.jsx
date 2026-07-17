import React, { memo } from "react";
import { TrendingUp, Fuel, Wrench, CheckCircle2, Layers, Star, Package, ShieldCheck, Navigation, User, HardDrive, Battery, Zap, FileText } from "lucide-react";

const LandingPremiumFeatures = memo(({t, language}) => {
  return (
    <>
        {/* PREMIUM FEATURE SHOWCASE (Ürün Tanıtım Bölümleri) */}
        <section id="premium-features" className="w-full max-w-7xl mx-auto px-6 mb-28 space-y-32 z-10 relative">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-blue-500">
              {language === "tr" ? "GÜVENLİ LİMANINIZ" : "YOUR SECURE HARBOR"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight uppercase">
              {language === "tr" ? "SÜRPRİZLERE YER YOK, %100 KONTROL SİZDE" : "NO SURPRISES, 100% IN YOUR CONTROL"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-4 text-sm md:text-base font-semibold leading-relaxed">
              {language === "tr" 
                ? "Sanayi stresi bitti. Doğrulanmış ustalar, güvenli ödeme altyapısı ve onaylı işlemler ile en temel ihtiyacınız olan 'güven' problemini kökünden çözüyoruz."
                : "Mechanic stress is over. We solve your fundamental need for 'trust' from the ground up with verified mechanics, secure payment guarantees, and approved repairs."}
            </p>
          </div>
 
          {/* FEATURE 1: SECURE PAYMENT & LEGAL GUARANTEE (Güvenli Ödeme ve Garanti) */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Graphic mockup of Escrow & Payment */}
            <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
                <div>
                  <span className="text-[8px] font-black text-indigo-400 tracking-wider uppercase">BDDK LİSANSLI HAVUZ HESABI</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {language === "tr" ? "PAYTR / İYZİCO KORUMALI ALTYAPI" : "BDDK LICENSE ESCROW POWERED BY PAYTR"}
                  </h4>
                </div>
                <ShieldCheck className="text-indigo-400" size={18} />
              </div>
 
              {/* Escrow Status Mockup */}
              <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-md text-left mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase">{language === "tr" ? "BDDK LİSANSLI HAVUZ (BLOKE)" : "BDDK LICENSED BLOCKED ESCROW"}</span>
                  <span className="text-[8px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase">{language === "tr" ? "Yasal Güvencede" : "Legally Secured"}</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mb-2">₺4.250</div>
                <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full"></div>
                </div>
                <p className="text-[9px] text-slate-500 font-bold mt-2">{language === "tr" ? "Mevzuat gereği paranız Rapidsy havuzunda değil, lisanslı ödeme kuruluşu blokeli hesabında korunur." : "Funds are held in a licensed partner payment gateway pool per central bank regulations."}</p>
              </div>
 
              {/* Legal Documents Mockup */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center p-2.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={14} />
                    <span className="text-[10px] font-black text-slate-900 dark:text-white">{language === "tr" ? "₺50.000 Rapidsy Hasar Güvencesi" : "₺50,000 Repair Warranty & Insurance"}</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-500 uppercase">{language === "tr" ? "Yalnızca Havuzda Geçerli" : "Escrow Only"}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-xl opacity-80">
                  <div className="flex items-center gap-2">
                    <FileText className="text-slate-400" size={14} />
                    <span className="text-[10px] font-black text-slate-900 dark:text-white">
                      {language === "tr" ? "Anında Esnaf Hak Ediş Transferi" : "Instant Payout upon PIN Release"}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase">{language === "tr" ? "Aynı Gün" : "Same Day"}</span>
                </div>
              </div>
            </div>
 
            {/* Right: Pitch copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 tracking-widest uppercase">
                {language === "tr" ? "MEVZUATA UYGUN GÜVEN ALTYAPISI" : "REGULATORY COMPLIANT TRUST PLATFORM"}
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
                {language === "tr" ? "BDDK UYUMLU PAYTR/İYZİCO HAVUZ ALTYAPISI" : "BDDK-COMPLIANT SECURE ESCROW INFRASTRUCTURE"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                {language === "tr"
                  ? "Türkiye Cumhuriyet Merkez Bankası (TCMB) ve BDDK mevzuatlarına uygun olarak geliştirilen pazaryeri split-payment (paylaşımlı ödeme) modeli sayesinde, paranız usta işi teslim edip siz onay kodu verene kadar PayTR/iyzico nezdindeki korumalı hesaplarda bloke edilir. Sanayi esnafına iş teslimi sonrası hak edişi aynı gün aktarılır, usta nakit akışı kaybı yaşamaz."
                  : "We use a TCMB and BDDK compliant marketplace split-payment model. Funds are legally held by PayTR/iyzico licensed escrow accounts. Once the repair is verified via check-out PIN, funds are instantly routed to the merchant to ensure smooth cash flow."}
              </p>
              <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Elden Ödemelere Karşı Koruma: Nakit işlemlerde Rapidsy Onarım Garantisi geçersizdir" : "Bypass Prevention: Rapidsy Repair Warranty is invalid for cash deals"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Ustalara Özel Teşvik: Platform cirosuna göre bankalardan anında düşük faizli esnaf kredisi" : "Esnaf Loan program: Turn platform turnover into low-interest commercial loans"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Tek Tıkla PIN Doğrulama: Hızlı ve yasal mutabakat süreci" : "One-Click PIN Verification: Quick legal reconciliation"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* FEATURE 2: MECHANICS & PARTS (Usta Bulma, Teklif Karşılaştırma ve Yedek Parça) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            {/* Right: Graphic mockup of quotes and compatible parts */}
            <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
                <div>
                  <span className="text-[8px] font-black text-amber-500 tracking-wider uppercase">{language === "tr" ? "ŞEFFAF FİYAT TAHMİNİ & ONAY" : "TRANSPARENT ESTIMATES & APPROVAL"}</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {language === "tr" ? "USTA TEKLİFLERİ & ŞEFFAF KEŞİF" : "MECHANIC QUOTES & DISCOVERY"}
                  </h4>
                </div>
                <Layers className="text-amber-500" size={18} />
              </div>

              {/* Service Request Card */}
              <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 mb-4 shadow-md text-left">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">{language === "tr" ? "FİYAT TEKLİFİ ALINAN HİZMET" : "REQUESTED SERVICE"}</span>
                <div className="flex justify-between items-center">
                  <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase">Fiat Egea • 10.000 KM Bakımı</h5>
                  <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">{language === "tr" ? "3 Teklif" : "3 Quotes"}</span>
                </div>
              </div>

              {/* Quotes Comparison list */}
              <div className="space-y-2 mb-4 text-left">
                <div className="flex justify-between items-center p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div>
                    <span className="text-[9px] font-black text-slate-900 dark:text-white">Maslak Pro Servis</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={10} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-[8px] font-bold text-slate-500">4.9 (124 yorum)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit ml-auto mb-1">{language === "tr" ? "En İyi Teklif" : "Best Offer"}</span>
                    <span className="text-xs font-mono font-black text-teal-400">₺2.100</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-xl opacity-75">
                  <div>
                    <span className="text-[9px] font-black text-slate-900 dark:text-white">Ostim Yıldız Otomotiv</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={10} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-[8px] font-bold text-slate-500">4.8 (82 yorum)</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-slate-900 dark:text-white">₺2.400</span>
                </div>
              </div>

              {/* Compatible Parts check */}
              <div className="p-3 bg-white/50 dark:bg-[#070b18]/50 border border-black/5 dark:border-white/10 rounded-xl flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <Package className="text-slate-400" size={16} />
                  <div>
                    <span className="text-[9px] font-black text-slate-900 dark:text-white">{language === "tr" ? "Fil Filtre Bakım Seti" : "Fil Filter Service Kit"}</span>
                    <p className="text-[8px] text-slate-500 font-bold">{language === "tr" ? "Aracınızla %100 Uyumlu OEM Parça" : "100% Compatible OEM Part"}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-slate-900 dark:text-white">₺980</span>
              </div>
            </div>

            {/* Left: Pitch copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 tracking-widest uppercase">
                {language === "tr" ? "AKILLI PAZARYERİ VE SEÇİM" : "SMART MARKETPLACE & MATCH"}
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
                {language === "tr" ? "USTA TEKLİFLERİ VE ONAYLI İŞLEM SÜRECİ" : "MECHANIC QUOTES & APPROVED REPAIRS"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                {language === "tr"
                  ? "Aracınızın tamiri için dükkan dükkan gezmeyin. Rapidsy ile usta talebi oluşturarak yakınınızdaki servislerden şeffaf fiyat tahminleri toplayın. Araç başında çıkan ekstra masraflar, sizin dijital onayınız olmadan işleme alınmaz. Fiyatları, müşteri puanlarını karşılaştırın ve kontrolü elinizde tutun."
                  : "Stop wandering around mechanic shops. Create a request to receive transparent estimated quotes from local mechanics. Extra costs discovered during inspection will not proceed without your digital approval. Compare ratings and keep control."}
              </p>
              <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Doğrulanmış Servislerden Rekabetçi Fiyat Teklifleri" : "Competitive Price Quotes from Verified Mechanics"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Araca Özel %100 Uyumlu Yedek Parça Listeleme" : "100% Compatible Spare Parts Listed per Vehicle"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Şeffaf Puan ve Yorumlarla Karşılaştırmalı Fiyat Analizi" : "Price Analysis with Transparent Ratings & Reviews"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* FEATURE 3: VERIFIED REVIEWS & RATINGS (Doğrulanmış Yorumlar) */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Graphic mockup of Verified Reviews */}
            <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-teal-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
                <div>
                  <span className="text-[8px] font-black text-teal-400 tracking-wider uppercase">{language === "tr" ? "SADECE GERÇEK DENEYİMLER" : "ONLY REAL EXPERIENCES"}</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {language === "tr" ? "DOĞRULANMIŞ USTA YORUMLARI" : "VERIFIED MECHANIC REVIEWS"}
                  </h4>
                </div>
                <Star className="text-teal-400" size={18} />
              </div>

              {/* Reviews Mockup */}
              <div className="space-y-4 text-left">
                {/* Review 1 */}
                <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-md relative">
                  <span className="absolute top-0 right-0 bg-teal-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg rounded-tr-xl">
                    {language === "tr" ? "Doğrulanmış Müşteri" : "Verified Customer"}
                  </span>
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium mb-2">
                    {language === "tr" 
                      ? "Sanayide her gidişimde ekstra masraf çıkıyordu. Rapidsy üzerinden Maslak Pro'ya gittim, baştan ne dedilerse havuzdan o çekildi. Harika sistem." 
                      : "I used to get extra charges every time I visited a shop. Used Maslak Pro via Rapidsy, escrow paid exactly what was agreed upfront. Great system."}
                  </p>
                  <span className="text-[8px] font-black text-slate-400 uppercase">— Ahmet K. (Fiat Egea Sahibi)</span>
                </div>

                {/* Review 2 */}
                <div className="bg-white/50 dark:bg-[#070b18]/50 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-inner relative opacity-90">
                  <span className="absolute top-0 right-0 bg-teal-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg rounded-tr-xl">
                    {language === "tr" ? "Doğrulanmış Müşteri" : "Verified Customer"}
                  </span>
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium mb-2">
                    {language === "tr" 
                      ? "Kadın bir sürücü olarak sanayiye gitmekten çekiniyordum. Rapidsy puanlarına bakarak seçim yaptım, çok saygılı ve dürüst hizmet aldım." 
                      : "As a woman driver, I hesitated going to mechanics. Chose based on Rapidsy ratings, received very respectful and honest service."}
                  </p>
                  <span className="text-[8px] font-black text-slate-400 uppercase">— Ayşe Y. (Renault Clio Sahibi)</span>
                </div>
              </div>
            </div>

            {/* Left: Pitch copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[9px] font-black text-teal-400 tracking-widest uppercase">
                {language === "tr" ? "SAHTE YORUMLARA YER YOK" : "NO FAKE REVIEWS"}
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
                {language === "tr" ? "USTANIZI GERÇEK MÜŞTERİ DENEYİMLERİYLE SEÇİN" : "CHOOSE YOUR MECHANIC BASED ON REAL EXPERIENCES"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                {language === "tr"
                  ? "Google Haritalar'daki sahte, satın alınmış usta yorumlarına güvenmeyin. Rapidsy'deki bir ustaya yorum yapabilmek için o ustanın Rapidsy üzerinden gerçekten hizmet vermiş ve havuz ödemesinin gerçekleşmiş olması gerekir. Sadece %100 doğrulanmış, faturası kesilmiş hizmetlerin yorumlarını okursunuz."
                  : "Don't trust fake purchased reviews on Google Maps. To review a mechanic on Rapidsy, the service must be completed and paid through our escrow system. You only read 100% verified, invoiced real experiences."}
              </p>
              <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Sadece İşlem Yaptırmış Müşterilerin Gerçek Yorumları" : "Only Real Reviews from Customers Who Completed Services"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Kalite Standartlarını Karşılamayan Ustaların Sistemden Çıkarılması" : "Removal of Mechanics Who Fail Quality Standards"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Araba Modeline Göre Filtrelenebilen Şeffaf Deneyimler" : "Transparent Experiences Filterable by Car Model"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* FEATURE 4: RAPIDSY ENTERPRISE (BIG DATA & EV ECOSYSTEM) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            {/* Left: Graphic mockup of EV Battery SoH and Big Data Dashboard */}
            <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
                <div>
                  <span className="text-[8px] font-black text-blue-500 tracking-wider uppercase">{language === "tr" ? "BÜYÜK VERİ & FİLO YÖNETİMİ" : "BIG DATA & FLEET MANAGEMENT"}</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {language === "tr" ? "RAPIDSY ENTERPRISE & EV" : "RAPIDSY ENTERPRISE & EV"}
                  </h4>
                </div>
                <HardDrive className="text-blue-500" size={18} />
              </div>

              {/* EV Battery Status Mockup */}
              <div className="bg-white/50 dark:bg-[#070b18]/50 border border-black/5 dark:border-white/10 rounded-2xl p-5 mb-4 text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[8px] font-black text-slate-400 uppercase">
                    {language === "tr" ? "EV BATARYA SAĞLIĞI (SoH)" : "EV BATTERY HEALTH (SoH)"}
                  </span>
                  <Zap size={14} className="text-blue-500" />
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">%94.2</span>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest">{language === "tr" ? "KUSURSUZ" : "PERFECT"}</span>
                </div>
                <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-[94.2%]"></div>
                </div>
                <p className="text-[9px] text-slate-500 font-bold mt-2">
                  {language === "tr" ? "Telemetri verisine göre hücresel degredasyon (kayıp) normal sınırlar içindedir." : "Cellular degradation is within normal limits based on telemetry data."}
                </p>
              </div>

              {/* Fleet & Big Data Prediction card */}
              <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 flex items-start justify-between text-left">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <TrendingUp size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase mb-1">
                      {language === "tr" ? "ÖNLEYİCİ BAKIM TAHMİNİ (AI)" : "PREDICTIVE MAINTENANCE (AI)"}
                    </h5>
                    <p className="text-[9px] text-slate-500 font-medium">
                      {language === "tr" 
                        ? "Bölgenizdeki 14.200 Fiat Egea verisine dayanarak, 2.500 KM içinde triger seti değişimi öngörülmektedir." 
                        : "Based on 14,200 fleet data points, a timing belt replacement is predicted within 2,500 KM."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Pitch copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-500 tracking-widest uppercase">
                {language === "tr" ? "OTOMOTİV VERİ EKOSİSTEMİ" : "AUTOMOTIVE DATA ECOSYSTEM"}
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
                {language === "tr" ? "GELECEĞİN BÜYÜK VERİSİ VE EV ALTYAPISI" : "BIG DATA & EV INFRASTRUCTURE OF THE FUTURE"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                {language === "tr"
                  ? "Rapidsy sadece bir tamir aracı değil, kasko firmaları ve kurumsal filolar için devasa bir veri analiz platformudur. Kullanıcıların kilometre, arıza ve lokasyon verileri kullanılarak 'Önleyici Bakım (Predictive Maintenance)' algoritmaları çalıştırılır. Üstelik elektrikli araçların (EV) yaygınlaşmasıyla birlikte, Batarya Sağlık (SoH) skorlarınızı canlı telemetri üzerinden takip edebileceğiniz ilk akıllı ekosistemdir."
                  : "Rapidsy is not just a repair tool; it's a massive data analysis platform for insurance companies and corporate fleets. Using mileage, breakdown, and location data, 'Predictive Maintenance' algorithms are constantly running. Furthermore, as EVs take over, Rapidsy is the first smart ecosystem allowing you to monitor your Battery State of Health (SoH) scores via live telemetry."}
              </p>
              <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Sigorta ve Filolar için Veri API'leri" : "Data APIs for Insurance and Fleets"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Elektrikli Araç (EV) Batarya Degredasyon Takibi" : "Electric Vehicle (EV) Battery Degradation Tracking"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Makine Öğrenimi (ML) ile Önleyici Bakım Uyarıları" : "Predictive Maintenance Alerts powered by ML"}</span>
                </li>
              </ul>
            </div>
          </div>

        </section>

    </>
  );
});

LandingPremiumFeatures.displayName = 'LandingPremiumFeatures';
export default LandingPremiumFeatures;
