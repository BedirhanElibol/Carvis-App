import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";

const ReviewsModal = ({ isOpen, onClose, targetId, orderId, targetName }) => {
  const { showAlert } = useUI();
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!currentUser) return showAlert("Hata", "Yorum yazmak için giriş yapmalısınız.", "error");
    if (!comment.trim()) return showAlert("Hata", "Lütfen bir yorum yazın.", "error");
    if (!orderId) return showAlert("Hata", "Yalnızca hizmet aldığınız partnerleri değerlendirebilirsiniz.", "error");

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert([{
        reviewer_id: currentUser.id,
        seller_id: targetId,
        order_id: orderId,
        rating,
        comment
      }]);

      if (error) {
        if (error.code === '23505') throw new Error("Bu işlem için daha önce yorum yapmışsınız.");
        throw error;
      }

      showAlert("Başarılı", "Değerlendirmeniz başarıyla iletildi!", "success");
      onClose();
    } catch (err) {
      console.error(err);
      showAlert("Hata", "Yorum kaydedilemedi.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/90 z-[100] flex items-end md:items-center justify-center p-4">
      <div className="bg-slate-50 dark:bg-slate-950 w-full max-w-md rounded-[3rem] border border-black/10 dark:border-white/10 overflow-hidden animate-slide-up relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-accent-600"></div>
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 dark:text-white transition">
          <X size={24} />
        </button>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-primary-500/10">
              <Star size={32} className="text-primary-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{targetName}</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Deneyiminizi Puanlayın</p>
          </div>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button 
                key={s} 
                onClick={() => setRating(s)}
                className={`p-3 rounded-2xl border transition-all active-scale ${s <= rating ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-600'}`}
              >
                <Star size={24} fill={s <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-2">Yorumunuz</p>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Hizmet veya ürün hakkında ne düşünüyorsunuz?"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[1.5rem] p-4 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500/50 transition-all min-h-[120px] resize-none"
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-500 py-4 rounded-2xl font-black text-xs text-slate-900 dark:text-white uppercase tracking-[0.2em] shadow-primary-900/20 active-scale disabled:opacity-50 transition-all"
          >
            {submitting ? "GÖNDERİLİYOR..." : "DEĞERLENDİRMEYİ YAYINLA"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;
