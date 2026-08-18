import React, { memo } from "react";


const LandingStats = memo(() => {
  return (
    <>
        {/* STATS / TRUST SIGNALS */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-24">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 md:p-12 shadow-sm relative overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">
                  10.000+
                </span>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-2">Aktif Araç</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400">
                  500+
                </span>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-2">Onaylı Usta & Servis</p>
              </div>

              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-blue-600 dark:text-blue-400">
                  %99.8
                </span>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-2">Güvenli Ödeme</p>
              </div>

              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">
                  7/24
                </span>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-2">Kesintisiz Destek</p>
              </div>
            </div>
          </div>
        </section>

    </>
  );
});

LandingStats.displayName = 'LandingStats';
export default LandingStats;
