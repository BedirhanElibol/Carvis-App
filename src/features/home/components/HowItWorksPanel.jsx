import React, { memo } from "react";
import { Activity, FileText, ShieldCheck } from "lucide-react";

const HowItWorksPanel = memo(({ t }) => {
  return (
    <div className="bg-white dark:bg-[#0a0f24]/60 border border-black/5 dark:border-white/5 rounded-[2.5rem] p-6.5 space-y-6 relative overflow-hidden backdrop-blur-md shadow-xl">
      <div className="text-center max-w-sm mx-auto">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-400">{t.howItWorks}</span>
        <h3 className="text-base font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">{t.howItWorks3Steps}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div className="hidden md:block absolute top-7 left-[15%] right-[15%] h-0.5 bg-white dark:bg-white/5 shadow-sm pointer-events-none z-0"></div>
        {[
          { step: "01", title: t.reportIssue, desc: t.reportIssueDesc, icon: Activity, color: "from-cyan-500 to-orange-500" },
          { step: "02", title: t.collectQuotes, desc: t.collectQuotesDesc, icon: FileText, color: "from-blue-500 to-cyan-500" },
          { step: "03", title: t.bookAndPay, desc: t.bookAndPayDesc, icon: ShieldCheck, color: "from-cyan-500 to-emerald-500" }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center relative z-10 space-y-3 group">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-slate-900 dark:text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
              <item.icon size={24} />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-black text-cyan-400 tracking-widest block uppercase">ADIM {item.step}</span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-[200px] mx-auto">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

HowItWorksPanel.displayName = 'HowItWorksPanel';
export default HowItWorksPanel;
