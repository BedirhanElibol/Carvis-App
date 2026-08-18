import React from "react";
import { Cpu, Repeat, Zap } from "lucide-react";

const LandingFeatures = ({ language }) => {
  return (
    <section className="w-full bg-slate-50 dark:bg-[#0a0f1c] transition-colors duration-500 py-20 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Asymmetrical Hierarchical Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Hero Feature Card (Spans 7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 md:p-10 flex flex-col justify-between shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-6">
                <Cpu size={14} />
                <span>{language === "tr" ? "Şeffaf Hesaplama" : "Transparent Pricing"}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {language === "tr" ? "Sürpriz maliyet yok. Parça ve işçilik net ayrıştırılır." : "No surprises. Parts and labor strictly separated."}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                {language === "tr" 
                  ? "Aracınızın tamirinde orijinal OEM parça fiyatları ve standart fabrika işçilik süreleri ayrı ayrı hesaplanır. Onayınız olmadan hiçbir ek ücret talep edilemez." 
                  : "Original OEM part prices and standard factory labor hours are calculated separately. No extra charges without your explicit approval."}
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> OEM Fabrika Süreleri</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Piyasa Fiyat Tavanı</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Havuz Güvenceli Ödeme</span>
            </div>
          </div>

          {/* Secondary Stacked Feature Cards (Spans 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 flex-1 flex flex-col justify-center shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <Zap size={18} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {language === "tr" ? "Anında Teklif & Usta Eşleşmesi" : "Instant Quote & Mechanic Match"}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {language === "tr"
                  ? "Arıza bildiriminiz anında çevrenizdeki doğrulanmış uzman servislere iletilir ve dakikalar içinde fiyat teklifleri gelir."
                  : "Your issue description reaches verified expert shops nearby instantly, bringing back competitive bids in minutes."}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 flex-1 flex flex-col justify-center shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Repeat size={18} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {language === "tr" ? "Uçtan Uca Canlı Takip" : "End-to-End Live Tracking"}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {language === "tr"
                  ? "Vale alımından servis aşamasına, parça değişim fotoğraflarından teslime kadar tüm süreci mobil uygulamanızdan anlık izleyebilirsiniz."
                  : "Track everything from valet pickup to parts replacement proof photos and final delivery right from your mobile app."}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default LandingFeatures;
