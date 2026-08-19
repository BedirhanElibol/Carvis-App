import React from "react";
import { ClipboardCheck, Gavel } from "lucide-react";

const KVKKPolicyModal = ({ show, t, onAgree }) => {
  if (!show || !t) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-sm rounded-xl p-6 scale-100 animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <Gavel size={32} />
          </div>
          <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2 font-sans">
            {t.kvkkTitle}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm font-sans">{t.kvkkMessage}</p>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 p-4 rounded-xl max-h-40 overflow-y-auto text-left text-xs text-slate-700 dark:text-slate-300 mb-6 shadow-inner">
            <p className="font-bold mb-2 font-sans text-slate-900 dark:text-white">
              Carvis KVKK Aydınlatma Metni (Özet)
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 font-sans leading-relaxed">
              <li>Veri Sorumlusu: Carvis A.Ş.</li>
              <li>
                Toplanan Kişisel Veriler: Adınız, e-posta adresiniz, araç
                bilgileriniz (plaka, km, marka/model), konum verileriniz.
              </li>
              <li>
                Amaç: Hizmetlerin sunulması (parça satışı, usta randevusu,
                gider takibi), sipariş takibi ve araç bakım hatırlatmaları.
              </li>
              <li>
                Aktarım: Siparişlerinizi tamamlamak amacıyla partner
                satıcılarımıza ve servis sağlayıcılara (kargo, ödeme)
                aktarılabilir.
              </li>
              <li>
                Haklarınız: Verilerinize erişme, düzeltme, silme ve işlenip
                işlenmediğini öğrenme hakkınız bulunmaktadır. Silme talepleriniz
                için destek ekibimize başvurunuz.
              </li>
              <li>
                Bu metni onaylayarak, yukarıdaki şartlara uygun olarak
                verilerinizin işlenmesini kabul etmiş olursunuz.
              </li>
            </ul>
          </div>
          <button
            onClick={onAgree}
            className="w-full bg-primary-600 hover:bg-primary-500 text-slate-950 font-black py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 font-sans"
          >
            <ClipboardCheck size={18} /> {t.kvkkAgree}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KVKKPolicyModal;
