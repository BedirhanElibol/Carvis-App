import React, { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";

const DeleteAccountModal = ({ show, onClose, showAlert }) => {
  const { handleLogout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const EXPECTED_TEXT = "HESABIMI SIL";

  if (!show) return null;

  const handleDelete = async () => {
    if (confirmText !== EXPECTED_TEXT) return;

    setLoading(true);
    try {
      // 1. Delete user record in public.profiles (triggers cascade or manual logic)
      // Note: In Supabase, deleting from public.profiles doesn't delete from auth.users.
      // We usually need a service-role edge function to delete auth.users.
      // For now, we will mark as deleted or use the RPC if available.
      
      const { error } = await supabase.rpc('request_account_deletion');
      
      if (error) throw error;

      showAlert(
        "Hesabınız Silindi",
        "Kişisel verileriniz KVKK kapsamında silinmek üzere işaretlendi. Oturumunuz kapatılıyor.",
        "success"
      );
      
      setTimeout(() => {
        handleLogout();
        onClose();
      }, 2000);

    } catch (_err) {
      showAlert("Hata", "Hesap silme işlemi sırasında bir sorun oluştu. Lütfen destekle iletişime geçin.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden p-8 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500 border border-red-500/20 shadow-lg">
            <Trash2 size={40} />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">
            HESABINI SİLMEK İSTEDİĞİNE EMİN MİSİN?
          </h2>
          
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8 text-left">
            <h4 className="text-red-500 font-bold text-xs uppercase mb-2 flex items-center gap-2">
              <AlertTriangle size={14} /> Bu İşlem Geri Alınamaz!
            </h4>
            <ul className="text-[10px] text-red-400 space-y-1 font-medium">
              <li>• Tüm araç bilgileriniz ve bakım geçmişiniz silinir.</li>
              <li>• Aktif siparişleriniz ve cüzdan bakiyeniz iptal edilir.</li>
              <li>• KVKK kapsamında verileriniz kalıcı olarak temizlenir.</li>
            </ul>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-4 uppercase tracking-widest">
            Onaylamak için aşağıya <span className="text-red-500 font-black">"{EXPECTED_TEXT}"</span> yazın:
          </p>

          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder={EXPECTED_TEXT}
            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 p-4 rounded-2xl mb-6 text-center font-black text-slate-900 dark:text-white outline-none focus:border-red-500 transition-all uppercase"
          />

          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              onClick={onClose}
              className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active-scale"
            >
              Vazgeç
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== EXPECTED_TEXT}
              className="p-4 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-500 shadow-xl shadow-red-900/20 transition-all active-scale disabled:opacity-30 disabled:grayscale"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "HESABIMI SİL"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
