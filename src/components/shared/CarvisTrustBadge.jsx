import React from "react";
import { ShieldCheck } from "lucide-react";

const RapidsyTrustBadge = ({ className = "" }) => {
  return (
    <div className={`bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-4 flex gap-4 items-start ${className}`}>
      <div className="bg-emerald-500/20 p-2 rounded-xl shrink-0 mt-0.5">
        <ShieldCheck size={24} className="text-emerald-500" />
      </div>
      <div>
        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          Rapidsy Trust <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">HASAR GARANTİSİ</span>
        </h4>
        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Bu işlem, Rapidsy üzerinden tamamlandığında <strong className="text-emerald-600 dark:text-emerald-400">1.000.000 TL'ye kadar hasar koruması ve sigorta</strong> altındadır.
          <br/>
          <span className="text-red-500/80">Platform dışı (nakit, doğrudan havale) anlaşmalar Rapidsy Güvencesi'ni geçersiz kılar ve tüm risk müşteriye ait olur.</span>
        </p>
      </div>
    </div>
  );
};

export default RapidsyTrustBadge;
