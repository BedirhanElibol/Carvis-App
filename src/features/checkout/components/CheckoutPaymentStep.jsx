import React from "react";
import * as Icons from "lucide-react";
import { useWallet } from "../../../context/WalletContext";
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
  const { balance } = useWallet();
  return (
    <div className="space-y-6 animate-slide-up">
      {" "}
      <div className="flex gap-4 mb-4">
        {" "}
        <button
          onClick={() => setPaymentMethod("card")}
          className={`flex-1 p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all active-scale ${paymentMethod === "card" ? "bg-primary-600/20 border-primary-500 text-white" : "glass-card border-white/5 text-slate-400"}`}
        >
          {" "}
          <Icons.CreditCard size={24} />{" "}
          <span className="text-xs font-bold">Kredi Kartı</span>{" "}
        </button>{" "}
        <button
          onClick={() => setPaymentMethod("wallet")}
          className={`flex-1 p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all active-scale ${paymentMethod === "wallet" ? "bg-primary-600/20 border-primary-500 text-white" : "glass-card border-white/5 text-slate-400"}`}
        >
          {" "}
          <Icons.Wallet size={24} />{" "}
          <span className="text-xs font-bold">Rapidsy Cüzdan</span>{" "}
        </button>{" "}
      </div>{" "}
      {/* Visual Card Wrapper */}{" "}
      <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/50">
        {" "}
        {paymentMethod === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {" "}
            {/* Form */}{" "}
            <div className="space-y-4">
              {" "}
              <div>
                {" "}
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                  Kart Numarası
                </label>{" "}
                <div className="relative">
                  {" "}
                  <input
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-500 font-mono tracking-wide"
                    placeholder="0000 0000 0000 0000"
                    value={cardData.number}
                    onChange={(e) =>
                      setCardData({ ...cardData, number: e.target.value })
                    }
                  />{" "}
                  <Icons.CreditCard
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-4">
                {" "}
                <div>
                  {" "}
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                    SKT
                  </label>{" "}
                  <input
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-500 text-center"
                    placeholder="AA/YY"
                    value={cardData.expiry}
                    onChange={(e) =>
                      setCardData({ ...cardData, expiry: e.target.value })
                    }
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                    CVV
                  </label>{" "}
                  <input
                    type="password"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-500 text-center"
                    placeholder="***"
                    value={cardData.cvv}
                    onChange={(e) =>
                      setCardData({ ...cardData, cvv: e.target.value })
                    }
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                  Kart Sahibi
                </label>{" "}
                <input
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-500 uppercase"
                  placeholder="AD SOYAD"
                  value={cardData.holder}
                  onChange={(e) =>
                    setCardData({
                      ...cardData,
                      holder: e.target.value.toUpperCase(),
                    })
                  }
                />{" "}
              </div>{" "}
            </div>{" "}
            {/* Installment Table */}{" "}
            <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-hidden">
              {" "}
              <table className="w-full text-left">
                {" "}
                <thead className="bg-white/5">
                  {" "}
                  <tr>
                    {" "}
                    <th className="p-3 text-[10px] text-slate-400 uppercase font-bold">
                      Taksit
                    </th>{" "}
                    <th className="p-3 text-[10px] text-slate-400 uppercase font-bold text-right">
                      Aylık
                    </th>{" "}
                    <th className="p-3 text-[10px] text-slate-400 uppercase font-bold text-right">
                      Toplam
                    </th>{" "}
                  </tr>{" "}
                </thead>{" "}
                <tbody className="divide-y divide-white/5">
                  {" "}
                  {installmentOptions.map((opt) => (
                    <tr
                      key={opt.count}
                      onClick={() => setInstallment(opt.count)}
                      className={`cursor-pointer transition-colors ${installment === opt.count ? "bg-primary-500/10" : "hover:bg-white/5"}`}
                    >
                      {" "}
                      <td className="p-3 text-xs font-bold text-white flex items-center gap-2">
                        {" "}
                        {installment === opt.count && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                        )}{" "}
                        {opt.label}{" "}
                      </td>{" "}
                      <td className="p-3 text-xs text-slate-300 text-right">
                        {opt.monthly.toLocaleString()} ₺
                      </td>{" "}
                      <td className="p-3 text-xs font-bold text-white text-right">
                        {opt.total.toLocaleString()} ₺
                      </td>{" "}
                    </tr>
                  ))}{" "}
                </tbody>{" "}
              </table>{" "}
            </div>{" "}
          </div>
        ) : (
          <div className="text-center py-8">
            {" "}
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg">
              {" "}
              <Icons.Wallet size={32} className="text-primary-400" />{" "}
            </div>{" "}
            <h3 className="text-white font-bold text-lg mb-2">
              Cüzdan Bakiyeniz
            </h3>{" "}
            <p className="text-3xl font-black text-white tracking-tighter mb-4">
              ₺{balance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </p>{" "}
            {balance < total ? (
              <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-sm font-bold border border-red-500/20">
                {" "}
                Bakiye yetersiz! Lütfen cüzdanınıza para yükleyin veya Kredi
                Kartı ile ödeyin.{" "}
              </div>
            ) : (
              <div className="bg-green-500/10 text-green-400 p-3 rounded-xl text-sm font-bold border border-green-500/20">
                {" "}
                Tutar Escrow (Bloke) yöntemiyle güvenceye alınacaktır.{" "}
              </div>
            )}{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};
export default CheckoutPaymentStep;
