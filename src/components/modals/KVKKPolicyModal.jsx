import React from "react";
import * as Icons from "lucide-react";

const KVKKPolicyModal = ({ show, t, onAgree }) => {
  if (!show || !t) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary-100 text-primary-600 shadow-xl">
            <Icons.Gavel size={32} />
          </div>
          <h3 className="font-black text-xl text-slate-900 mb-2 font-sans">
            {t.kvkkTitle}
          </h3>
          <p className="text-slate-600 mb-4 text-sm font-sans">{t.kvkkMessage}</p>
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl max-h-40 overflow-y-auto text-left text-xs text-slate-700 mb-6 shadow-inner">
            <p className="font-bold mb-2 font-sans">
              Rapidsy KVKK Aydınlatma Metni (Özet)
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 font-sans">
              <li>Veri Sorumlusu: Rapidsy A.Ş.</li>
              <li>
                Toplanan Kişisel Veriler: Adınız, e-posta adresiniz, araç
                bilgileriniz (plaka, km, marka/model), konum verileriniz.
              </li>
              <li>
                Amaç: Hizmetlerin sunulması (parça satışı, usta randevusu, yapay
                zeka desteği), sipariş takibi ve araç bakım hatırlatmaları.
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
            className="w-full bg-primary-600 text-slate-900 dark:text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2 shadow-lg shadow-primary-600/50 font-sans"
          >
            <Icons.ClipboardCheck size={18} /> {t.kvkkAgree}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KVKKPolicyModal;
