import React from "react";
import { CreditCard } from "lucide-react";

const CheckoutPaymentStep = ({
  paymentMethod,
  setPaymentMethod,
  cardData,
  setCardData,
  installment,
  setInstallment,
  installmentOptions,
  total,
}) => {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Visual Card Wrapper */}
      <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 mb-1 block">
                Kart Numarası
              </label>
              <div className="relative">
                <input
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 font-mono tracking-wide"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.number}
                  onChange={(e) =>
                    setCardData({ ...cardData, number: e.target.value })
                  }
                />
                <CreditCard
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 mb-1 block">
                  SKT
                </label>
                <input
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 text-center"
                  placeholder="AA/YY"
                  value={cardData.expiry}
                  onChange={(e) =>
                    setCardData({ ...cardData, expiry: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 mb-1 block">
                  CVV
                </label>
                <input
                  type="password"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 text-center"
                  placeholder="***"
                  value={cardData.cvv}
                  onChange={(e) =>
                    setCardData({ ...cardData, cvv: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 mb-1 block">
                Kart Sahibi
              </label>
              <input
                className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none focus:border-primary-500 uppercase"
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
          </div>
          {/* Installment Table */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="p-3 text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                    Taksit
                  </th>
                  <th className="p-3 text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold text-right">
                    Aylık
                  </th>
                  <th className="p-3 text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold text-right">
                    Toplam
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {installmentOptions.map((opt) => (
                  <tr
                    key={opt.count}
                    onClick={() => setInstallment(opt.count)}
                    className={`cursor-pointer transition-colors ${installment === opt.count ? "bg-primary-500/10" : "hover:bg-black/5 dark:bg-white/5"}`}
                  >
                    <td className="p-3 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {installment === opt.count && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                      )}
                      {opt.label}
                    </td>
                    <td className="p-3 text-xs text-slate-600 dark:text-slate-300 text-right">
                      {opt.monthly.toLocaleString()} ₺
                    </td>
                    <td className="p-3 text-xs font-bold text-slate-900 dark:text-white text-right">
                      {opt.total.toLocaleString()} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CheckoutPaymentStep;
