import React, { useState, useEffect } from "react";
import { Clock, ShieldCheck, X } from "lucide-react";
 
import { motion, AnimatePresence } from "framer-motion";
import { EscrowService } from "../../services/EscrowService";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";

const ServiceApprovalModal = ({ isOpen, onClose, orderId, orderAmount }) => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReleasing, setIsReleasing] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      const fetchProof = async () => {
        setLoading(true);
        const { data } = await supabase
          .from("service_proofs")
          .select("*")
          .eq("order_id", orderId)
          .single();
        setProof(data);
        setLoading(false);
      };
      fetchProof();
    }
  }, [isOpen, orderId]);

  const handleApprove = async () => {
    setIsReleasing(true);
    const { success, error } = await EscrowService.releaseFunds(orderId, currentUser?.id);
    if (success) {
      showAlert("Başarılı", "Hizmet onaylandı ve ödeme serbest bırakıldı.", "success");
      onClose();
    } else {
      showAlert("Hata", error || "Onay işlemi başarısız.", "error");
    }
    setIsReleasing(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card w-full max-w-xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-8 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <ShieldCheck size={24} className="text-teal-400" />
                   </div>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Hizmet Onayı</h2>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:text-white transition-colors">
                   <X size={24} />
                </button>
             </div>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Harcama Tutarı: ₺{orderAmount}</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
             {loading ? (
                <div className="text-center py-20 opacity-50 uppercase text-[10px] font-black tracking-widest">Kanıtlar yükleniyor...</div>
             ) : !proof ? (
                <div className="text-center py-20 opacity-30">
                   <Clock size={48} className="mx-auto mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Ustanız henüz hizmet kanıtlarını yüklemedi.</p>
                </div>
             ) : (
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      {proof.photo_urls.map((url, i) => (
                         <img key={i} src={url} className="w-full h-48 object-cover rounded-2xl border border-black/10 dark:border-white/10" alt="Hizmet Kanıtı" />
                      ))}
                   </div>
                   <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Usta Notu</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">"{proof.description}"</p>
                   </div>
                </div>
             )}
          </div>

          {/* Footer */}
          <div className="p-8 bg-black/40 border-t border-black/5 dark:border-white/5">
             <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:bg-white/5 transition-all"
                >
                   Desteğe Başvur
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={!proof || isReleasing}
                  className="flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-emerald-500 hover:text-slate-900 dark:text-white transition-all disabled:opacity-30 disabled:grayscale active-scale"
                >
                   {isReleasing ? "İŞLENİYOR..." : "ONAYLA VE ÖDEMEYİ GÖNDER"}
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ServiceApprovalModal;
