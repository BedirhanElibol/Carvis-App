import React, { useState } from "react";
import * as Icons from "lucide-react";
import LegalViewModal from "../../features/legal/LegalViewModal";

const Footer = () => {
  const [legalModal, setLegalModal] = useState({ open: false, type: "" });

  const currentYear = new Date().getFullYear();

  const openLegal = (type) => {
    setLegalModal({ open: true, type });
  };

  return (
    <footer className="mt-12 mb-24 px-6 pb-12 border-t border-black/5 dark:border-white/5 pt-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Brand & Mission */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4 max-w-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Icons.Car size={18} className="text-slate-900 dark:text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
                RAPIDSY <span className="text-primary-500">PRO</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Otomotiv dünyasının dijitalleşen yüzü. Güvenli ticaret, akıllı diagnostik ve şeffaf hizmet anlayışı ile her an yanınızda.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8 md:gap-16">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-sans">Kurumsal</h4>
              <ul className="space-y-2">
                <li><button onClick={() => openLegal("UYELIK_SOZLESMESI")} className="text-xs text-slate-500 hover:text-primary-400 transition-colors cursor-pointer font-sans">Hakkımızda</button></li>
                <li><button onClick={() => openLegal("UYELIK_SOZLESMESI")} className="text-xs text-slate-500 hover:text-primary-400 transition-colors cursor-pointer font-sans">Kullanım Koşulları</button></li>
                <li><button onClick={() => openLegal("KVKK_AYDINLATMA")} className="text-xs text-slate-500 hover:text-primary-400 transition-colors cursor-pointer font-sans">Güvenlik</button></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-sans">Legal</h4>
              <ul className="space-y-2">
                <li><button onClick={() => openLegal("KVKK_AYDINLATMA")} className="text-xs text-slate-500 hover:text-primary-400 transition-colors cursor-pointer font-sans">KVKK Aydınlatma</button></li>
                <li><button onClick={() => openLegal("MESAFELI_SATIS")} className="text-xs text-slate-500 hover:text-primary-400 transition-colors cursor-pointer font-sans">Satış Sözleşmesi</button></li>
                <li><button onClick={() => openLegal("UYELIK_SOZLESMESI")} className="text-xs text-slate-500 hover:text-primary-400 transition-colors cursor-pointer font-sans">Üye İlişkileri</button></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-slate-600 font-sans">
            &copy; {currentYear} Rapidsy Teknoloji A.Ş. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-6">
            <Icons.Instagram size={16} className="text-slate-600 hover:text-primary-400 cursor-pointer transition-colors" />
            <Icons.Twitter size={16} className="text-slate-600 hover:text-primary-400 cursor-pointer transition-colors" />
            <Icons.Linkedin size={16} className="text-slate-600 hover:text-primary-400 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>

      <LegalViewModal 
        isOpen={legalModal.open} 
        type={legalModal.type} 
        onClose={() => setLegalModal({ open: false, type: "" })} 
      />
    </footer>
  );
};

export default Footer;
