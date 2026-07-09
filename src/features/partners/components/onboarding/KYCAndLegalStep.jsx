import React from "react";
import { ShieldCheck, Upload, FileText, Lock } from "lucide-react";
import { motion } from "framer-motion";

const KYCAndLegalStep = ({
  insurancePolicyNumber,
  setInsurancePolicyNumber,
  insuranceExpiryDate,
  setInsuranceExpiryDate,
  criminalRecordFile,
  setCriminalRecordFile,
  competenceCertFile,
  setCompetenceCertFile,
  handleBack,
  handleNext
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <ShieldCheck size={32} className="text-red-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Hukuki ve Mesleki Doğrulama (KYC)</h3>
        <p className="text-slate-500 text-sm mt-2 font-medium">Platform güvenliğini ve Tüketici Haklarını (6502) korumak adına aşağıdaki belgelerin yüklenmesi yasal olarak zorunludur.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Belge Yükleme Alanları */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">Zorunlu Evraklar</h4>
          
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Adli Sicil Kaydı (E-Devlet)</label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center relative hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <Upload size={20} className="mx-auto text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Belge Yükle (.pdf, .jpg)</span>
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setCriminalRecordFile(e.target.files[0])}
              />
              {criminalRecordFile && <p className="text-[10px] text-teal-500 font-bold mt-2">{criminalRecordFile.name} seçildi.</p>}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Mesleki Yeterlilik Belgesi</label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center relative hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <Upload size={20} className="mx-auto text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Belge Yükle (.pdf, .jpg)</span>
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setCompetenceCertFile(e.target.files[0])}
              />
              {competenceCertFile && <p className="text-[10px] text-teal-500 font-bold mt-2">{competenceCertFile.name} seçildi.</p>}
            </div>
          </div>
        </div>

        {/* Sigorta Beyanı */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">Mali Mesuliyet Sigortası</h4>
          
          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3">
            <Lock className="text-orange-500 shrink-0 mt-0.5" size={16} />
            <p className="text-[10px] text-orange-700 dark:text-orange-400 font-medium leading-relaxed">
              Müşteri araçlarına veya şahıslara verilebilecek zararlara karşı Zorunlu Mali Mesuliyet Sigortası poliçe numaranızı girmeniz gerekmektedir. Poliçesi olmayan servisler sisteme kabul edilmemektedir.
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Poliçe Numarası</label>
            <input 
              type="text" 
              placeholder="Örn: 123456789"
              value={insurancePolicyNumber}
              onChange={(e) => setInsurancePolicyNumber(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Geçerlilik Bitiş Tarihi</label>
            <input 
              type="date" 
              value={insuranceExpiryDate}
              onChange={(e) => setInsuranceExpiryDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6 mt-8 border-t border-black/5 dark:border-white/5">
        <button 
          onClick={handleBack}
          className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
        >
          GERİ DÖN
        </button>
        <button 
          onClick={handleNext}
          disabled={!insurancePolicyNumber || !insuranceExpiryDate || !criminalRecordFile || !competenceCertFile}
          className="flex-1 py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-600/20 transition-all"
        >
          ONAYLA VE DEVAM ET
        </button>
      </div>
    </motion.div>
  );
};

export default KYCAndLegalStep;
