import React, { memo } from "react";
import { ShieldCheck, CheckCircle2, FileText } from "lucide-react";

const FeatureEscrow = memo(({ language }) => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-16">
      {/* Left: Graphic mockup of Escrow & Payment */}
      <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
          <div>
            <span className="text-[8px] font-black text-indigo-400 tracking-wider uppercase">RAPIDSY GÜVENCESİ</span>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {language === "tr" ? "%100 GÜVENLİ HAVUZ ÖDEMESİ" : "100% SECURE ESCROW PAYMENT"}
            </h4>
          </div>
          <ShieldCheck className="text-indigo-400" size={18} />
        </div>

        {/* Escrow Status Mockup */}
        <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-md text-left mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-black text-slate-400 uppercase">{language === "tr" ? "HİZMET BEDELİ (BLOKEDE)" : "SERVICE FEE (IN ESCROW)"}</span>
            <span className="text-[8px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full uppercase">{language === "tr" ? "Güvenli Havuzda" : "In Secure Escrow"}</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mb-2">₺4.250</div>
          <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full w-[60%] animate-pulse"></div>
          </div>
          <p className="text-[9px] text-slate-500 font-bold mt-2">{language === "tr" ? "Siz aracı teslim alıp onaylayana kadar para ustaya aktarılmaz." : "Funds are not released to the mechanic until you inspect and approve."}</p>
        </div>

        {/* Legal Documents Mockup */}
        <div className="space-y-2 text-left">
          <div className="flex justify-between items-center p-2.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={14} />
              <span className="text-[10px] font-black text-slate-900 dark:text-white">{language === "tr" ? "Rapidsy Onarım Garantisi (6 Ay)" : "Rapidsy Repair Warranty (6 Months)"}</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-500 uppercase">{language === "tr" ? "Aktif" : "Active"}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-xl opacity-80">
            <div className="flex items-center gap-2">
              <FileText className="text-slate-400" size={14} />
              <span className="text-[10px] font-black text-slate-900 dark:text-white">
                {language === "tr" ? "Dijital Hizmet Sözleşmesi" : "Digital Service Contract"}
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase">{language === "tr" ? "İmzalandı" : "Signed"}</span>
          </div>
        </div>
      </div>

      {/* Right: Pitch copy */}
      <div className="w-full lg:w-1/2 space-y-6 text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 tracking-widest uppercase">
          {language === "tr" ? "FİNANSAL RİSK YÖNETİMİ" : "FINANCIAL RISK MANAGEMENT"}
        </span>
        <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
          {language === "tr" ? "UÇTAN UCA KORUMALI HAVUZ (ESCROW) SİSTEMİ" : "END-TO-END PROTECTED ESCROW SYSTEM"}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
          {language === "tr"
            ? "Operasyonel süreçlerinizde finansal güvenliği şansa bırakmayın. Onaylanan servis tekliflerindeki bakiye, iş teslim edilip dijital onayınız verilene kadar Rapidsy kurumsal havuz hesabında güvence altına alınır. Süreç şeffaftır, sürpriz faturalandırma engellenir."
            : "Do not leave financial security to chance in your operational processes. The balance for approved service quotes is secured in the Rapidsy corporate escrow account until the job is delivered and your digital approval is given. The process is transparent, preventing unexpected billing."}
        </p>
        <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
            <span>{language === "tr" ? "Kurumsal Standartlarda Escrow Ödeme Altyapısı" : "Enterprise-Grade Escrow Payment Infrastructure"}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
            <span>{language === "tr" ? "Sözleşmeli ve Garantili Hizmet Ağı" : "Contracted and Guaranteed Service Network"}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
            <span>{language === "tr" ? "Dijital Doğrulama (PIN/QR) İle Mutabakat" : "Digital Verification (PIN/QR) Reconciliation"}</span>
          </li>
        </ul>
      </div>
    </div>
  );
});

FeatureEscrow.displayName = 'FeatureEscrow';
export default FeatureEscrow;
