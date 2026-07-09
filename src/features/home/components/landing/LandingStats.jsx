import React, { memo } from "react";


const LandingStats = memo(() => {
  return (
    <>
        {/* STATS / TRUST SIGNALS */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-24">
          <div className="bg-gradient-to-r from-white to-slate-50 dark:from-[#070b19] dark:to-[#0a1024] border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                  10k+
                </span>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-2">Aktif Araç</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-orange-400">
                  500+
                </span>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-2">Onaylı Usta & Servis</p>
              </div>

              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-500">
                  %99.8
                </span>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-2">Güvenli Ödeme</p>
              </div>

              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500">
                  24/7
                </span>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-2">Kesintisiz Destek</p>
              </div>
            </div>
          </div>
        </section>

    </>
  );
});

LandingStats.displayName = 'LandingStats';
export default LandingStats;
