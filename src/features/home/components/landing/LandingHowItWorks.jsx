import React, { memo } from "react";
import { Search, FileText, CheckCircle } from "lucide-react";

const LandingHowItWorks = memo(({t}) => {
  return (
    <>
        {/* HOW RAPIDSY WORKS (3-Step Stepper) */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-28">
          <div className="bg-white/60 dark:bg-[#0a0f24]/60 border border-black/5 dark:border-white/5 rounded-[3rem] p-10 md:p-16 space-y-12 relative overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-400">{t.howItWorks}</span>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-3 uppercase tracking-tight">{t.howItWorks3Steps}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mt-12">
              <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-0.5 bg-black/10 dark:bg-white/10 pointer-events-none z-0"></div>
              {[
                { step: "01", title: t.step1Title, desc: t.step1Desc, icon: Search, color: "from-teal-500 to-blue-500" },
                { step: "02", title: t.step2Title, desc: t.step2Desc, icon: FileText, color: "from-orange-500 to-red-500" },
                { step: "03", title: t.step3Title, desc: t.step3Desc, icon: CheckCircle, color: "from-blue-500 to-indigo-500" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center relative z-10 group">
                  <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${item.color} text-slate-900 dark:text-white flex items-center justify-center shadow-2xl group-hover:-translate-y-2 transition-transform duration-300 mb-6 border border-slate-200 dark:border-white/10`}>
                    <item.icon size={32} />
                  </div>
                  <div className="space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm text-[9px] font-mono font-black text-slate-600 dark:text-slate-300 tracking-widest uppercase">{t.stepLabel} {item.step}</span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-[260px] mx-auto">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

    </>
  );
});

LandingHowItWorks.displayName = 'LandingHowItWorks';
export default LandingHowItWorks;
