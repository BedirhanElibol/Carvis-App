import React, { useState } from "react";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Modern, micro-sized inline legal banner for checkout.
 * Securely links to the details without throwing a massive popup blocking the transaction.
 */
export const LegalCheckoutBanner = ({ 
  isChecked, 
  onChange, 
  sellerName = "İşletme", 
  language = "tr" 
}) => {
  const [showFullModal, setShowFullModal] = useState(false);

  return (
    <div className="space-y-2 mt-4">
      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <input 
          type="checkbox" 
          checked={isChecked} 
          onChange={onChange} 
          className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500" 
        />
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-normal">
          {language === "tr" ? (
            <>
              Ödemeyi tamamlayarak, hizmeti doğrudan <strong>{sellerName}</strong> firmasından aldığımı, Rapidsy'nin sadece aracı platform olduğunu belirten{" "}
              <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); setShowFullModal(true); }}
                className="text-primary-600 dark:text-primary-400 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                Mesafeli Satış Sözleşmesi <ArrowUpRight size={10} />
              </button>{" "}
              ve KVKK Şartlarını onaylıyorum.
            </>
          ) : (
            <>
              By placing this order, I agree to the{" "}
              <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); setShowFullModal(true); }}
                className="text-primary-600 dark:text-primary-400 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                Distance Selling Contract <ArrowUpRight size={10} />
              </button>{" "}
              and privacy rules, acknowledging that <strong>{sellerName}</strong> is the sole service provider.
            </>
          )}
        </span>
      </label>

      {/* Tiny Backdrop modal only if user manually wants to read details */}
      <AnimatePresence>
        {showFullModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowFullModal(false)}
              className="absolute inset-0 bg-slate-900/60"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl overflow-hidden p-6 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="text-teal-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {language === "tr" ? "Mesafeli Satış Sözleşmesi & Ön Bilgilendirme" : "Distance Selling Contract"}
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed space-y-4">
                <p><strong>1. TARAFLAR VE HUKUKİ BEYAN</strong></p>
                <p>İşbu sözleşme, Hizmet Alan (Müşteri) ile Hizmet Veren ({sellerName}) arasında kurulmuştur. Rapidsy (Aracı Hizmet Sağlayıcı), 6502 sayılı kanun kapsamında yalnızca teknik altyapı sunan aracı bir platform olup sözleşmenin veya verilecek hizmetin tarafı değildir. Hizmet kusurlarından doğrudan {sellerName} sorumludur.</p>
                <p><strong>2. KVKK VE LOKASYON İŞLEME</strong></p>
                <p>Hizmetin seyyar veya yerinde ifa edilmesi kapsamında anlık lokasyon veriniz, usta-müşteri mesajlaşmaları ve plaka verileriniz Rapidsy tarafından güvenlik ve denetim amacıyla işlenmektedir.</p>
              </div>

              <button 
                onClick={() => setShowFullModal(false)} 
                className="mt-4 w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {language === "tr" ? "Kapat" : "Close"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default LegalCheckoutBanner;
