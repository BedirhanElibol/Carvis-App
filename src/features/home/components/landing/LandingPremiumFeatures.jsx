import React, { memo } from "react";
import { TrendingUp, Fuel, Wrench, CheckCircle2, Layers, Star, Package, ShieldCheck, Navigation, User } from "lucide-react";

const LandingPremiumFeatures = memo(({t, language}) => {
  return (
    <>
        {/* PREMIUM FEATURE SHOWCASE (Ürün Tanıtım Bölümleri) */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-28 space-y-32 z-10 relative">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-blue-500">
              {language === "tr" ? "KAPSAMLI ÇÖZÜMLER" : "COMPREHENSIVE SOLUTIONS"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight uppercase">
              {language === "tr" ? "ARACINIZIN İHTİYAÇ DUYDUĞU TÜM DİJİTAL KONTROLLER" : "ALL THE DIGITAL CONTROLS YOUR VEHICLE NEEDS"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-4 text-sm md:text-base font-semibold leading-relaxed">
              {language === "tr" 
                ? "Yakıt ve gider takibinden yedek parça tedariğine, usta tekliflerinden servis randevularına kadar tüm ihtiyaçlarınızı tek bir panelden şeffafça yönetin."
                : "Manage all your needs from fuel & expense tracking to spare parts, mechanic quotes to service appointments transparently from a single dashboard."}
            </p>
          </div>

          {/* FEATURE 1: FUEL & EXPENSE TRACKING (Yakıt ve Gider Takip Sistemi) */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Graphic mockup of Fuel & Expenses */}
            <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
                <div>
                  <span className="text-[8px] font-black text-indigo-400 tracking-wider uppercase">CARVIS TELEMETRİ</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {language === "tr" ? "YAKIT VE GİDER KOKPİTİ" : "FUEL & EXPENSE COCKPIT"}
                  </h4>
                </div>
                <TrendingUp className="text-indigo-400" size={18} />
              </div>

              {/* Monthly Stats Row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-3 shadow-md text-left">
                  <span className="text-[8px] font-black text-slate-400 uppercase">{language === "tr" ? "AKARYAKIT" : "FUEL"}</span>
                  <div className="text-xs md:text-sm font-black text-slate-900 dark:text-white font-mono mt-1">₺4.250</div>
                </div>
                <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-3 shadow-md text-left">
                  <span className="text-[8px] font-black text-slate-400 uppercase">{language === "tr" ? "SERVİS / USTA" : "SERVICE"}</span>
                  <div className="text-xs md:text-sm font-black text-slate-900 dark:text-white font-mono mt-1">₺2.400</div>
                </div>
                <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-3 shadow-md text-left">
                  <span className="text-[8px] font-black text-slate-400 uppercase">{language === "tr" ? "TASARRUF" : "SAVINGS"}</span>
                  <div className="text-xs md:text-sm font-black text-teal-400 font-mono mt-1">₺1.120</div>
                </div>
              </div>

              {/* Chart Mockup */}
              <div className="bg-white/50 dark:bg-[#070b18]/50 border border-black/5 dark:border-white/10 rounded-2xl p-4 mb-6 shadow-inner text-left">
                <span className="text-[8px] font-black text-slate-400 uppercase mb-3 block">
                  {language === "tr" ? "AYLIK TÜKETİM TRENDİ (L/100KM)" : "MONTHLY CONSUMPTION TREND"}
                </span>
                <div className="flex items-end justify-between h-24 pt-4 gap-2">
                  {[45, 60, 30, 80, 50, 75, 40].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className={`w-full bg-gradient-to-t ${i === 3 ? 'from-indigo-600 to-indigo-400' : 'from-slate-300 to-slate-400 dark:from-slate-800 dark:to-blue-500'} rounded-t-md`} style={{ height: `${h}%` }}></div>
                      <span className="text-[8px] font-bold text-slate-400 font-mono">M{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Logs */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center p-2.5 bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Fuel className="text-slate-400" size={14} />
                    <span className="text-[10px] font-black text-slate-900 dark:text-white">Shell V-Power (Benzin)</span>
                  </div>
                  <span className="text-[10px] font-mono font-black text-slate-900 dark:text-white">₺2.150</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Wrench className="text-slate-400" size={14} />
                    <span className="text-[10px] font-black text-slate-900 dark:text-white">
                      {language === "tr" ? "Rot Balans Hizmeti" : "Wheel Alignment Service"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-black text-slate-900 dark:text-white">₺600</span>
                </div>
              </div>
            </div>

            {/* Right: Pitch copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 tracking-widest uppercase">
                {language === "tr" ? "ÜCRETSİZ PREMIUM HİZMET" : "FREE PREMIUM SERVICE"}
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
                {language === "tr" ? "DETAYLI YAKIT VE GİDER ANALİZ SİSTEMİ" : "ADVANCED FUEL & EXPENSE TRACKING"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                {language === "tr"
                  ? "Piyasada aylık abonelikle satılan gider takip yazılımlarını unutun. Carvis ile tüm akaryakıt fişlerinizi, servis ödemelerinizi ve kasko/sigorta masraflarınızı kaydedin. Ortalama yakıt tüketiminizi (L/100km) otomatik hesaplayarak bütçenizi kontrol altına alın."
                  : "Forget expensive expense managers sold on subscriptions. Record fuel logs, service fees, and insurance costs in Carvis. Track real-time fuel efficiency (L/100km) automatically and take control of your budget."}
              </p>
              <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Aylık/Yıllık Grafiksel Masraf Analiz Raporu" : "Monthly/Yearly Graphical Expense Analysis"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Plakaya Göre Tüketim ve Tasarruf Kıyaslaması" : "Consumption & Saving Benchmarks by Plate"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Trafik Sigortası ve Muayene Hatırlatma Bildirimleri" : "Insurance & Inspection Reminder Push Alerts"}</span>
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
                  <span className="text-[8px] font-black text-amber-500 tracking-wider uppercase">{language === "tr" ? "ŞEFFAF FİYATLANDIRMA" : "TRANSPARENT PRICING"}</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {language === "tr" ? "USTA TEKLİFLERİ & PARÇALAR" : "MECHANIC QUOTES & PARTS"}
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
                {language === "tr" ? "USTA TEKLİFLERİ VE GÜVENLİ FİYAT ANALİZİ" : "MECHANIC QUOTES & PRICE ANALYSIS"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                {language === "tr"
                  ? "Aracınızın tamiri veya periyodik bakımı için sanayide dükkan dükkan gezmeye son verin. Carvis ile usta talebi oluşturarak yakınınızdaki doğrulanmış özel servislerden anında şeffaf fiyat teklifleri toplayın. Fiyatları, müşteri puanlarını ve yakınlığı karşılaştırıp en uygun seçimi yapın. Ayrıca aracınızın marka ve modeline %100 uyumlu orijinal/OEM yedek parçaları tek tıkla listeleyin."
                  : "Stop wandering around mechanic shops for car maintenance or repairs. Create a request in Carvis to receive instant, transparent quotes from verified local mechanics. Compare prices, ratings, and proximity. Plus, list original/OEM spare parts 100% compatible with your car brand and model with a single click."}
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

          {/* FEATURE 3: DIGITAL VEHICLE PASSPORT (Dijital Servis Defteri ve Pasaport) */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Graphic mockup of Digital Passport */}
            <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-teal-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
                <div>
                  <span className="text-[8px] font-black text-teal-400 tracking-wider uppercase">{language === "tr" ? "KRONOLOJİK GEÇMİŞ" : "CHRONOLOGICAL HISTORY"}</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {language === "tr" ? "ARAÇ SERVİS PASAPORTU" : "VEHICLE SERVICE PASSPORT"}
                  </h4>
                </div>
                <ShieldCheck className="text-teal-400" size={18} />
              </div>

              {/* Timeline Items */}
              <div className="relative border-l border-black/10 dark:border-white/10 ml-3 pl-6 space-y-6 text-left">
                
                {/* Timeline entry 1 */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full bg-teal-400 border-4 border-white dark:border-[#040817] shadow-md"></span>
                  <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-3 shadow-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        42,500 KM • {language === "tr" ? "Disk & Balata Değişimi" : "Disc & Pad Replacement"}
                      </span>
                      <span className="text-[8px] font-black text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-full uppercase">{language === "tr" ? "Faturalı" : "Invoiced"}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold">{language === "tr" ? "Güven Oto Özel Servisi • Rapidsy Onaylı Parça" : "Guven Auto Service • Rapidsy Verified Parts"}</p>
                  </div>
                </div>

                {/* Timeline entry 2 */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full bg-teal-400 border-4 border-white dark:border-[#040817] shadow-md"></span>
                  <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-3 shadow-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        35,000 KM • {language === "tr" ? "10k Periyodik Bakım" : "10k Periodic Service"}
                      </span>
                      <span className="text-[8px] font-black text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-full uppercase">{language === "tr" ? "Faturalı" : "Invoiced"}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold">{language === "tr" ? "Mobil 1 Yetkili Servis • Castrol Edge Yağ" : "Mobil 1 Service • Castrol Edge Oil"}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Left: Pitch copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[9px] font-black text-teal-400 tracking-widest uppercase">
                {language === "tr" ? "KAYIT VE HİZMET ARŞİVİ" : "RECORD & SERVICE ARCHIVE"}
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
                {language === "tr" ? "DİJİTAL ARAÇ PASAPORTU VE GEÇMİŞİ" : "DIGITAL VEHICLE PASSPORT & HISTORY"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                {language === "tr"
                  ? "Aracınızın bakım geçmişini kaybolan kağıt faturalardan kurtarın. Rapidsy Dijital Araç Pasaportu, yapılan tüm servis işlemlerinizi, periyodik bakımlarınızı ve aldığınız parça değişimlerini kronolojik bir sırayla dijital arşivinizde tesciller. Aracınızın geçmişini tek ekrandan şeffafça kontrol edin."
                  : "Save your vehicle service history from lost paper receipts. Rapidsy Digital Vehicle Passport registers all completed repairs, periodic maintenance, and spare parts logs in a chronological digital archive. Check your vehicle's full logbook transparently from a single dashboard."}
              </p>
              <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Araç Kilometresine Bağlı Gider Grafikleri" : "Mileage & KM-Based Expense Distribution Graphs"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Geçmiş Servis ve Bakım Detayları Kaydı" : "Completed Service & Maintenance History Logging"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Tek Tıkla Dijital Araç Pasaportu Özeti" : "One-Click Digital Vehicle Passport Summary"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* FEATURE 4: TOW & VALET (Yol Yardım, Çekici ve Kapıdan Kapıya Vale) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            {/* Left: Graphic mockup of Valet Stepper */}
            <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-orange-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
                <div>
                  <span className="text-[8px] font-black text-orange-400 tracking-wider uppercase">{language === "tr" ? "ADIM ADIM DURUM" : "STEP BY STEP STATUS"}</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {language === "tr" ? "VALE HİZMET SÜREÇLERİ" : "VALET SERVICE PROGRESS"}
                  </h4>
                </div>
                <Navigation className="text-orange-400 animate-pulse" size={18} />
              </div>

              {/* Status Stepper Mockup */}
              <div className="bg-white/50 dark:bg-[#070b18]/50 border border-black/5 dark:border-white/10 rounded-2xl p-5 mb-4 text-left">
                <span className="text-[8px] font-black text-slate-400 uppercase mb-3.5 block">
                  {language === "tr" ? "VALE HİZMET ADIMLARI" : "VALET STATUS STEPS"}
                </span>
                <div className="space-y-4">
                  {[
                    { step: "1", title: language === "tr" ? "Talep oluşturuldu" : "Request created", active: true },
                    { step: "2", title: language === "tr" ? "Vale yönlendirildi (Ahmet Y.)" : "Valet dispatched (Ahmet Y.)", active: true, badge: "#4890" },
                    { step: "3", title: language === "tr" ? "Araç teslim alındı" : "Vehicle picked up", active: false },
                    { step: "4", title: language === "tr" ? "Güvenli alana park edildi" : "Parked in secure area", active: false }
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${s.active ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-white/5 text-slate-400'}`}>
                        {s.step}
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <span className={`text-[10px] font-bold ${s.active ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400'}`}>{s.title}</span>
                        {s.badge && <span className="text-[8px] font-mono font-black bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-md">{s.badge}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking card info */}
              <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <User size={16} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-slate-900 dark:text-white">Ahmet Y.</h5>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{language === "tr" ? "Rapidsy Vale Görevlisi" : "Rapidsy Valet Agent"}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[9px] font-black uppercase rounded-lg text-slate-600 dark:text-slate-300">
                    {language === "tr" ? "ARA" : "CALL"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Pitch copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-black text-orange-400 tracking-widest uppercase">
                {language === "tr" ? "KONFOR VE GÜVENLİK" : "COMFORT & EMERGENCY"}
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
                {language === "tr" ? "GÜVENLİ VALE TALEBİ VE ACİL YOL YARDIM" : "SECURE VALET REQUEST & ROAD ASSISTANCE"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                {language === "tr"
                  ? "İş günlerinizde veya acil durumlarda Rapidsy yanınızda. Aracınızın bakımı, muayenesi veya park ihtiyacı mı var? İstediğiniz paketi (Standart, VIP veya Gece Modu) seçerek anında vale talebi oluşturun. Valeniz atandığında benzersiz doğrulama kodunuz ile anahtarınızı güvenle teslim edin ve süreci adım adım takip edin. Yolda kaldığınızda ise acil çekici yol yardım butonunu kullanın."
                  : "In busy workdays or emergencies, Rapidsy is by your side. Select your preferred package (Standard, VIP, or Night mode) to book a valet for periodic maintenance, inspection, or parking. Get a unique verification code to safely hand over your key, and track each milestone step by step. Use the emergency road assistance button if you break down."}
              </p>
              <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Doğrulama Kodu ile Güvenli Anahtar Teslimi" : "Secure Key Handover via Verification Code"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Adım Adım Vale Durum Takibi ve İptal Edebilme" : "Step-by-Step Valet Status Tracking & Cancellation"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Acil Durumlarda SOS Çekici Çağrı Butonu" : "SOS Towing Dispatch for Roadside Emergencies"}</span>
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
