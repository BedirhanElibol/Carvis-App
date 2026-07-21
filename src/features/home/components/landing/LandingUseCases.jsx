import React from "react";
import { Wrench, Shield, Car, Truck, Package, Sparkles, MapPin } from "lucide-react";

const LandingUseCases = ({ language, fuelPrices, fuelCity, isLoadingFuel }) => {
  return (
    <section className="w-full bg-slate-50 dark:bg-transparent transition-colors duration-500 py-24 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-3xl md:text-[40px] font-bold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            {language === "tr" 
              ? "Tüm İhtiyaçlarınız İçin Geniş İş Ortağı Ağı" 
              : "Wide Partner Network for All Your Needs"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl leading-relaxed">
            {language === "tr" 
              ? "Sadece tamir değil; oto yıkamadan yedek parçaya, otoparktan sigortaya kadar aracınızın tüm ihtiyaçlarını güvenilir partnerlerimizle tek platformdan yönetin." 
              : "Not just repairs; manage all your vehicle's needs from car wash to spare parts, parking to insurance with our reliable partners on a single platform."}
          </p>
        </div>

        {/* Bento Grid (6 Items, 4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Card 1: Oto Servis (Span 2) */}
          <div className="md:col-span-2 bg-white dark:bg-[#0f1423] border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-500/30 shadow-sm dark:shadow-none transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 dark:bg-blue-500/10 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <Wrench size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {language === "tr" ? "Yetkili & Özel Servisler" : "Authorized & Private Services"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                {language === "tr" 
                  ? "Bölgenizdeki en yüksek puanlı, referanslı ve sertifikalı mekanik ustaları. Motor revizyonundan periyodik bakıma kadar her branşta uzmanlar." 
                  : "Top-rated, referenced and certified mechanics in your area. Experts in every branch from engine overhaul to periodic maintenance."}
              </p>
            </div>
            
            <div className="mt-8 flex gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium relative z-10 flex-wrap">
              <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5 whitespace-nowrap">Motor Mekanik</span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5 whitespace-nowrap">Kaporta Boya</span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5 whitespace-nowrap">Oto Elektrik</span>
            </div>
          </div>

          {/* Card 2: Oto Yıkama (Span 1) */}
          <div className="col-span-1 bg-white dark:bg-[#0f1423] border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-cyan-300 dark:hover:border-cyan-500/30 shadow-sm dark:shadow-none transition-colors">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-100 dark:bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {language === "tr" ? "Oto Yıkama & Kuaför" : "Car Wash & Detailing"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === "tr" 
                ? "Anlaşmalı kuaför noktalarında sıra beklemeden hızlı randevu ve detaylı temizlik hizmetleri." 
                : "Quick appointments and detailing services at contracted locations without waiting."}
            </p>
          </div>

          {/* Card 3: Yedek Parça (Span 1) */}
          <div className="col-span-1 bg-white dark:bg-[#0f1423] border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-500/30 shadow-sm dark:shadow-none transition-colors">
            <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-100 dark:bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
              <Package size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {language === "tr" ? "Garantili Yedek Parça" : "Guaranteed Spare Parts"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === "tr" 
                ? "Şase numaranızla tam uyumlu orijinal (OEM) ve muadil yedek parça tedarik ağı." 
                : "Original (OEM) and aftermarket spare part supply network fully compatible with your VIN."}
            </p>
          </div>

          {/* Card 4: Akaryakıt (Span 2) */}
          <div className="md:col-span-2 bg-white dark:bg-[#0f1423] border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-yellow-300 dark:hover:border-yellow-500/30 shadow-sm dark:shadow-none transition-colors">
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-yellow-100 dark:bg-yellow-500/10 rounded-full blur-[80px] -ml-10 -mt-10 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                  <Sparkles size={24} />
                </div>
                {/* Live Indicator */}
                {!isLoadingFuel && fuelPrices?.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    Canlı Piyasa
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {language === "tr" ? "Akaryakıt & Elektrikli Şarj" : "Fuel & EV Charging"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    {language === "tr" 
                      ? "Bölgenizdeki güncel pompa fiyatlarını anlık takip edin. Anlaşmalı istasyonlarda indirimli mobil ödeme kolaylığı ve akıllı şarj rotası planlama." 
                      : "Track live pump prices in your area. Discounted mobile payments at contracted stations and smart EV route planning."}
                  </p>
                </div>

                {/* Live Fuel Table */}
                <div className="bg-slate-50 dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                    <span>{fuelCity?.toUpperCase() || "İSTANBUL"} FİYATLARI</span>
                  </div>
                  {isLoadingFuel ? (
                    <div className="animate-pulse flex flex-col gap-3">
                      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-5/6"></div>
                      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-4/6"></div>
                    </div>
                  ) : fuelPrices && fuelPrices.length > 0 ? (
                    <div className="space-y-3">
                      {fuelPrices.slice(0, 3).map((station, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-800 dark:text-white truncate w-1/3">{station.marka || "İstasyon"}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">{station.benzin || "-"}₺ <span className="text-[10px] text-slate-500">BNZ</span></span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">{station.motorin || "-"}₺ <span className="text-[10px] text-slate-500">MOT</span></span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm">Fiyatlar yüklenemedi.</div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Card 5: Akıllı Otopark (Span 1) */}
          <div className="col-span-1 bg-white dark:bg-[#0f1423] border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-500/30 shadow-sm dark:shadow-none transition-colors">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-100 dark:bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {language === "tr" ? "Akıllı Otopark" : "Smart Parking"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === "tr" 
                ? "Şehir içi anlaşmalı özel otoparklar, doluluk oranları ve entegre mobil ödeme çözümleri." 
                : "Contracted private parking lots, real-time occupancy tracking, and integrated mobile payments."}
            </p>
          </div>

          {/* Card 6: Sigorta ve Kuaför (Span 1) */}
          <div className="col-span-1 bg-white dark:bg-[#0f1423] border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-pink-300 dark:hover:border-pink-500/30 shadow-sm dark:shadow-none transition-colors">
            <div className="absolute top-1/2 right-0 w-40 h-40 bg-pink-100 dark:bg-pink-500/10 rounded-full blur-[60px] -translate-y-1/2 pointer-events-none"></div>
            <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {language === "tr" ? "Sigorta & Kasko" : "Insurance"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === "tr" 
                ? "Hasar anında eksper entegrasyonu ve anlaşmalı sigorta acenteleri ile anında teklif." 
                : "Instant quotes with contracted insurance agencies and appraiser integration during damages."}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default LandingUseCases;
