import React, { useState } from "react";
import { AlertCircle, ShieldCheck, HeartHandshake, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DisputeService } from "../../../services/DisputeService";

const DisputeCenterModal = ({ 
  isOpen, 
  onClose, 
  orderId, 
  customerId, 
  sellerId, 
  sellerName = "İşletme", 
  onDisputeOpened 
}) => {
  const [reasonCategory, setReasonCategory] = useState("poor_quality");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await DisputeService.openDispute({
      orderId,
      customerId,
      sellerId,
      reasonCategory,
      description: description || "Müşteri kusurlu hizmet bildiriminde bulundu.",
      evidenceUrl: null
    });

    setIsSubmitting(false);

    if (!error) {
      if (onDisputeOpened) onDisputeOpened(data);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        <motion.div 
          initial={{ scale: 0.97, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.97, opacity: 0 }} 
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl overflow-hidden p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertCircle className="text-amber-600 dark:text-amber-400" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Kusurlu Hizmet Bildirimi</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Rapidsy Güvence Sistemi Aktif</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Hizmetle ilgili bir aksaklık veya kusur yaşadıysanız buradan hemen bize bildirebilirsiniz. <strong>Ödemeniz siz onaylayana kadar havuzda bekletilecektir.</strong>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Karşılaştığınız Sorun</label>
              <select 
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white outline-none"
              >
                <option value="poor_quality">Hizmet kalitesi beklentinin altında</option>
                <option value="damage">Araçta çizik veya fiziksel hasar var</option>
                <option value="wrong_part">Yanlış veya kalitesiz parça takıldı</option>
                <option value="other">Diğer operasyonel aksaklıklar</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Kısa Açıklama (İsteğe Bağlı)</label>
              <textarea 
                rows="3"
                placeholder="Destek ekibimiz için kısa bir not yazabilirsiniz..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-xl p-4 text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="bg-teal-500/10 border border-teal-500/20 p-3.5 rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" size={16} />
              <span className="text-[10px] text-teal-800 dark:text-teal-400 font-bold leading-normal">
                Bildiriminizle birlikte ödemeniz derhal dondurulacak ve Rapidsy Güvence Ekibi usta ile iletişime geçerek süreci çözecektir.
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase transition-colors"
              >
                İptal
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/10"
              >
                {isSubmitting ? "KİLİTLENİYOR..." : "KUSUR BİLDİR & ÖDEMEYİ TUT"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DisputeCenterModal;
