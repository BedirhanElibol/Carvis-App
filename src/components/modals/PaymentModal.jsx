import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useUI } from "../../context/UIContext";

const PaymentModal = ({
  show,
  onClose,
  amount,
  onSuccess,
  title = "Ödeme Yap",
}) => {
  const { showAlert } = useUI();
  const [step, setStep] = useState("card"); // card, processing, success
  const [cardData, setCardData] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  if (!show) return null;

  const handlePayment = async (e) => {
    e.preventDefault();
    setStep("processing");
    // Simulate PayTR / Iyzico delay
    setTimeout(() => {
      setStep("success");
      // Auto close after success
      setTimeout(() => {
        onSuccess();
        onClose();
        showAlert("Ödeme Başarılı", "İşleminiz güvenle tamamlandı.", "success");
        setStep("card"); // Reset for next time
      }, 2000);
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/90 backdrop-blur-md z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
        >
          <Icons.X size={18} />
        </button>

        {step === "card" && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-500 border border-primary-500/20">
                <Icons.CreditCard size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-sans">{title}</h2>
              <p className="text-3xl font-black text-slate-900 dark:text-white font-sans">
                {amount?.toLocaleString()} ₺
              </p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 block mb-1 font-sans">
                  Kart Sahibi
                </label>
                <input
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 transition-colors uppercase font-sans"
                  placeholder="AD SOYAD"
                  value={cardData.holder}
                  onChange={(e) =>
                    setCardData({
                      ...cardData,
                      holder: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 block mb-1 font-sans">
                  Kart Numarası
                </label>
                <div className="relative">
                  <input
                    required
                    maxLength={19}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 transition-colors font-mono"
                    placeholder="0000 0000 0000 0000"
                    value={cardData.number}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        number: formatCardNumber(e.target.value),
                      })
                    }
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-6 h-4 bg-black/10 dark:bg-white/10 rounded-sm"></div>
                    <div className="w-6 h-4 bg-black/10 dark:bg-white/10 rounded-sm"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 block mb-1">
                    SKT
                  </label>
                  <input
                    required
                    maxLength={5}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 transition-colors text-center"
                    placeholder="AA/YY"
                    value={cardData.expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length >= 2)
                        val = val.slice(0, 2) + "/" + val.slice(2, 4);
                      setCardData({ ...cardData, expiry: val });
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 block mb-1 font-sans">
                    CVV
                  </label>
                  <input
                    required
                    type="password"
                    maxLength={3}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 transition-colors text-center"
                    placeholder="***"
                    value={cardData.cvv}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        cvv: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white font-bold py-4 rounded-xl shadow-xl shadow-primary-900/50 active-scale flex items-center justify-center gap-2 transition-all font-sans"
                >
                  <Icons.ShieldCheck size={18} /> Güvenli Öde
                </button>
                <p className="text-center text-[10px] text-slate-500 mt-3 flex items-center justify-center gap-1">
                  <Icons.ShieldCheck size={10} /> 256-bit SSL ile korunmaktadır
                </p>
              </div>
            </form>
          </div>
        )}

        {step === "processing" && (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mb-6 relative">
              <Icons.Loader2
                size={40}
                className="text-primary-500 animate-spin"
              />
              <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Ödeme İşleniyor
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Lütfen bekleyiniz, bankanızla iletişim kuruluyor...
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-900/50 animate-in zoom-in">
              <Icons.CheckCircle size={40} className="text-slate-900 dark:text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-sans">
              Ödeme Başarılı!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              İşleminiz onaylandı. Teşekkür ederiz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
