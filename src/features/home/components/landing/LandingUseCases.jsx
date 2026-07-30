import React from "react";
import { 
  Wrench, ShieldCheck, Car, PackageCheck, Sparkles, MapPin, 
  FileSearch, Fuel, Zap, Droplets, ArrowUpRight, CheckCircle2 
} from "lucide-react";

const LandingUseCases = ({ language, fuelPrices, fuelCity, isLoadingFuel }) => {
  return (
    <section className="w-full bg-slate-50 dark:bg-transparent transition-colors duration-500 py-24 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="mb-16 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold uppercase tracking-widest mb-4">
            ⚡ RAPIDSY EKOSİSTEMİ
          </div>
          <h2 className="text-3xl md:text-[44px] font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            {language === "tr" 
              ? "Tüm Aracınızın İhtiyaçları İçin Tek Platform" 
              : "Single Platform for All Your Vehicle Needs"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl leading-relaxed font-normal">
            {language === "tr" 
              ? "Sanayi sürprizlerini geride bırakın. Yetkili servislerden yedek parçaya, mobil ekspertizden dijital araç pasaportuna kadar şeffaf hizmet alın." 
              : "Leave garage surprises behind. Get transparent services from authorized mechanics to spare parts, mobile inspection to digital vehicle passport."}
          </p>
        </div>

        {/* Bento Grid (6 Premium Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Card 1: Yetkili & Özel Servisler (Span 2) */}
          <div className="md:col-span-2 bg-white dark:bg-[#0c1224] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="relative z-10">
              {/* Vibrant Glowing Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 group-hover:scale-110 transition-transform">
                <Wrench size={26} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight font-sans">
                {language === "tr" ? "Yetkili & Özel Servisler" : "Authorized & Private Services"}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-md font-medium text-sm sm:text-base">
                {language === "tr" 
                  ? "Bölgenizdeki en yüksek puanlı, sertifikalı tamirciler ve ustalar. Motor revizyonundan periyodik bakıma kadar anında teklif toplayın." 
                  : "Top-rated, certified mechanics in your area. Collect instant quotes for everything from engine overhaul to periodic maintenance."}
              </p>
            </div>
            
            <div className="mt-8 flex gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-bold relative z-10 flex-wrap">
              <span className="px-3.5 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">Motor & Mekanik</span>
              <span className="px-3.5 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">Kaporta Boya</span>
              <span className="px-3.5 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">Oto Elektrik</span>
            </div>
          </div>

          {/* Card 2: Oto Yıkama & Detaylı Kuaför (Span 1) */}
          <div className="col-span-1 bg-white dark:bg-[#0c1224] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/50 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500/15 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-6 group-hover:scale-110 transition-transform">
                <Droplets size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight font-sans">
                {language === "tr" ? "Oto Yıkama & Kuaför" : "Car Wash & Detailing"}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium">
                {language === "tr" 
                  ? "Sıra beklemeden randevulu iç-dış detaylı temizlik, seramik kaplama ve kuaför hizmetleri." 
                  : "Book detailing, ceramic coating, and interior cleaning without waiting in lines."}
              </p>
            </div>
          </div>

          {/* Card 3: Garantili Yedek Parça (Span 1) */}
          <div className="col-span-1 bg-white dark:bg-[#0c1224] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/50 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300">
            <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500/15 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 group-hover:scale-110 transition-transform">
                <PackageCheck size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight font-sans">
                {language === "tr" ? "Garantili Yedek Parça" : "Guaranteed Spare Parts"}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium">
                {language === "tr" 
                  ? "Şase numarası ile %100 birebir uyumlu orijinal (OEM) ve garantili muadil yedek parça siparişi." 
                  : "100% VIN-matched original (OEM) and guaranteed aftermarket spare parts order."}
              </p>
            </div>
          </div>

          {/* Card 4: Akaryakıt & Elektrikli Şarj (Span 2) */}
          <div className="md:col-span-2 bg-white dark:bg-[#0c1224] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/50 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300">
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-500/15 rounded-full blur-[80px] -ml-10 -mt-10 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Zap size={26} />
                </div>

                {!isLoadingFuel && fuelPrices?.length > 0 && (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    CANLI PİYASA
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight font-sans">
                    {language === "tr" ? "Akaryakıt & Şarj" : "Fuel & EV Charging"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium">
                    {language === "tr" 
                      ? "Çevrenizdeki akaryakıt pompa fiyatlarını ve elektrikli araç şarj istasyonlarını canlı takip edin." 
                      : "Track live fuel pump prices and EV charging stations around your current location."}
                  </p>
                </div>

                {/* Live Fuel Table Box */}
                <div className="bg-slate-100 dark:bg-[#070b16] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col justify-center shadow-inner">
                  <div className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                    <span>{fuelCity?.toUpperCase() || "İSTANBUL"} CANLI FİYATLAR</span>
                  </div>
                  {isLoadingFuel ? (
                    <div className="animate-pulse flex flex-col gap-2.5">
                      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-5/6"></div>
                    </div>
                  ) : fuelPrices && fuelPrices.length > 0 ? (
                    <div className="space-y-2.5">
                      {fuelPrices.slice(0, 3).map((station, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-mono font-bold">
                          <span className="text-slate-800 dark:text-white truncate w-1/3 font-sans">{station.marka || "İstasyon"}</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{station.benzin || "-"}₺ <span className="text-[9px] text-slate-500">BNZ</span></span>
                          <span className="text-blue-600 dark:text-blue-400">{station.motorin || "-"}₺ <span className="text-[9px] text-slate-500">MOT</span></span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs">Canlı veri hazır.</div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Card 5: Mobil Ekspertiz (Span 1) */}
          <div className="col-span-1 bg-white dark:bg-[#0c1224] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/15 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6 group-hover:scale-110 transition-transform">
                <FileSearch size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight font-sans">
                {language === "tr" ? "Mobil Ekspertiz" : "Mobile Appraisal"}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium">
                {language === "tr" 
                  ? "İkinci el araç alımında adrese gelen 101 nokta garantili ekspertiz ve detaylı durum raporları." 
                  : "On-site 101 point inspection and condition reports delivered to your location."}
              </p>
            </div>
          </div>

          {/* Card 6: Dijital Araç Pasaportu (Span 1 - Sigorta YERİNE) */}
          <div className="col-span-1 bg-white dark:bg-[#0c1224] border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group hover:border-teal-500/50 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300">
            <div className="absolute top-1/2 right-0 w-40 h-40 bg-teal-500/15 rounded-full blur-[60px] -translate-y-1/2 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-teal-500/30 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight font-sans">
                {language === "tr" ? "Dijital Araç Pasaportu" : "Digital Car Passport"}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium">
                {language === "tr" 
                  ? "Aracınızın resmi bakım geçmişi, parça değişimleri ve EGM/Tramer onaylı QR doğrulaması." 
                  : "Official maintenance logbook, parts replacements history, and QR-verified vehicle passport."}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default LandingUseCases;
