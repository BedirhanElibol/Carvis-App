import React from "react";
import { ShieldAlert, ShieldCheck, HeartHandshake } from "lucide-react";
import { AssuranceService } from "../../../services/AssuranceService";

const AssuranceOptIn = ({ 
  isChecked, 
  onChange, 
  orderTotal,
  language = "tr"
}) => {
  const fee = AssuranceService.calculateAssuranceFee(orderTotal);

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      isChecked 
        ? "bg-teal-500/10 border-teal-500/30 shadow-md shadow-teal-500/5" 
        : "bg-slate-50 dark:bg-slate-900/50 border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10"
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl border shrink-0 ${
          isChecked 
            ? "bg-teal-500 text-slate-900 dark:text-white border-teal-500/20" 
            : "bg-slate-200 dark:bg-slate-800 text-slate-500 border-black/5 dark:border-white/5"
        }`}>
          {isChecked ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                {language === "tr" ? "RAPIDSY GÜVENCESİ" : "RAPIDSY ASSURANCE"}
                <span className="text-[9px] font-black bg-teal-500 text-slate-900 dark:text-white px-1.5 py-0.5 rounded-md tracking-wider uppercase">
                  {language === "tr" ? "TAVSİYE EDİLEN" : "RECOMMENDED"}
                </span>
              </h4>
              <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                {language === "tr" 
                  ? "Çizilme, hasar, hatalı veya replika parça kullanımına karşı 100% koruma. Yasal süreç beklemeden anında nakit iade güvencesi."
                  : "100% protection against scratches, damage, faulty or replica parts. Instant cash refund without waiting for legal processes."}
              </p>
            </div>
            
            <div className="text-right shrink-0">
              <span className="text-xs font-black text-slate-900 dark:text-white block">+{fee} TL</span>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">
                {language === "tr" ? "PRİM BEDELİ" : "PREMIUM"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center gap-1 text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              <HeartHandshake size={12} />
              {language === "tr" ? "İşlem Güvence Kapsamında" : "Transaction Under Protection"}
            </div>
            
            <button
              onClick={onChange}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                isChecked
                  ? "bg-teal-500 text-slate-900 hover:bg-teal-400"
                  : "bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10"
              }`}
            >
              {isChecked 
                ? (language === "tr" ? "EKLENDİ" : "ADDED") 
                : (language === "tr" ? "GÜVENCE EKLE" : "ADD ASSURANCE")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssuranceOptIn;
