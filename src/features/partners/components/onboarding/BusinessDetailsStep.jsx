import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Phone, FileText } from "lucide-react";

const BusinessDetailsStep = ({
  businessName,
  setBusinessName,
  phone,
  setPhone,
  details,
  setDetails,
  handleBack,
  handleNext
}) => {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 relative z-10 text-center"
    >
      <div>
        <span className="text-[9px] font-black tracking-widest text-primary-400 uppercase">AŞAMA 2</span>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1 mb-2 font-sans">
          İşletme Bilgileri
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold max-w-md mx-auto leading-relaxed">
          Hizmetlerinizin yayına alınması için resmi ve iletişim bilgilerinizi giriniz.
        </p>
      </div>

      <div className="space-y-4 text-left max-w-md mx-auto">
        <div>
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">İşletme veya Ünvan Adı</label>
          <div className="bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl flex items-center px-4">
            <Briefcase size={16} className="text-slate-500 mr-2" />
            <input 
              type="text" 
              placeholder="Örn: Garaj Otomotiv Ltd. Şti."
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white w-full py-4 uppercase tracking-wider"
            />
          </div>
        </div>

        <div>
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Telefon Numarası</label>
          <div className="bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl flex items-center px-4">
            <Phone size={16} className="text-slate-500 mr-2" />
            <input 
              type="text" 
              placeholder="Örn: 0555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white w-full py-4 uppercase tracking-wider"
            />
          </div>
        </div>

        <div>
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Ek Hizmet Açıklaması</label>
          <div className="bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl flex items-center px-4">
            <FileText size={16} className="text-slate-500 mr-2" />
            <textarea 
              placeholder="Sunduğunuz marka ve uzmanlık servisleri hakkında kısa açıklama..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white w-full py-4 uppercase tracking-wider resize-none"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-between">
        <button 
          onClick={handleBack}
          className="px-8 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
        >
          GERİ DÖN
        </button>
        <button 
          onClick={handleNext}
          className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl active-scale"
        >
          DEVAM ET
        </button>
      </div>
    </motion.div>
  );
};

export default BusinessDetailsStep;
