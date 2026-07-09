import React, { useState } from "react";
import { ShieldCheck, UserCheck, HeartHandshake, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const TrustBadge = ({ 
  kycStatus = "verified", 
  hasInsurance = true, 
  language = "tr" 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (kycStatus !== "verified") return null;

  return (
    <div className="relative inline-block">
      <motion.div
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-sm select-none"
      >
        <ShieldCheck size={14} className="text-teal-500" />
        <span>{language === "tr" ? "Garantili & Onaylı" : "Guaranteed & Verified"}</span>
        <HelpCircle size={10} className="text-teal-400 opacity-60" />
      </motion.div>

      {/* Modern Glassmorphic Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 z-50 w-64 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-black/5 dark:border-white/5 shadow-2xl backdrop-blur-md text-left"
          >
            <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              {language === "tr" ? "RAPIDSY GÜVENCE DOĞRULAMASI" : "RAPIDSY TRUST VERIFICATION"}
            </h5>
            <p className="text-[10px] text-slate-500 font-semibold mb-3 leading-relaxed">
              {language === "tr"
                ? "Bu işletme Rapidsy'nin yasal, adli ve operasyonel denetimlerinden başarıyla geçmiştir."
                : "This business has successfully passed Rapidsy's legal, criminal, and operational audits."}
            </p>
            
            <div className="space-y-2 border-t border-black/5 dark:border-white/5 pt-2.5">
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                <UserCheck size={12} className="text-teal-500" />
                <span>{language === "tr" ? "Adli Sicil & Yeterlilik Onaylı" : "Criminal Record & Competence Verified"}</span>
              </div>
              {hasInsurance && (
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                  <HeartHandshake size={12} className="text-teal-500" />
                  <span>{language === "tr" ? "Zorunlu Mali Mesuliyet Sigortalı" : "Liability Insured"}</span>
                </div>
              )}
            </div>
            
            <div className="mt-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">
              {language === "tr" ? "100% GÜVENLİ HİZMET AĞI" : "100% SECURE SERVICE NETWORK"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
