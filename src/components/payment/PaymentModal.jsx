import React, { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { supabase } from "../../supabaseClient";
import { usePayment } from "../../context/PaymentContext";
import { useWallet } from "../../context/WalletContext";
import { useUI } from "../../context/UIContext";

const QUICK_AMOUNTS = [100, 250, 500, 1000];

const formatCurrency = (value) =>
  `?${Number(value || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;

const PaymentModal = ({
  isOpen,
  onClose,
  type = "topup",
  orderId = null,
  fixedAmount = null,
  onSuccess,
}) => {
  const { initiatePayment } = usePayment();
  const { addFunds } = useWallet();
  const { showAlert } = useUI();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("input");
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setLoading(false);
      setStep("input");
      setPaymentResult(null);
      return;
    }

    if (fixedAmount) {
      setAmount(String(fixedAmount));
    }
  }, [fixedAmount, isOpen]);

  const finalAmount = useMemo(() => {
    if (fixedAmount) return Number(fixedAmount);
    return Number(amount);
  }, [amount, fixedAmount]);

  if (!isOpen) return null;

  const completeTopUp = async (value) => {
    const topUpSucceeded = await addFunds(value);
    if (!topUpSucceeded) {
      throw new Error("Bakiye yükleme kaydý oluþturulamadý.");
    }
  };

  const handlePaymentStart = async () => {
    if (!finalAmount || Number.isNaN(finalAmount) || finalAmount <= 0) {
      showAlert("Hata", "Lütfen geçerli bir tutar girin.", "warning");
      return;
    }

    setLoading(true);
    setStep("processing");

    try {
      let data;
      let error;

      if (type === "topup") {
        ({ data, error } = await supabase.functions.invoke("create-payment", {
          body: {
            amount: finalAmount,
            paymentType: "wallet_deposit",
          },
        }));
      } else if (orderId) {
        ({ data, error } = await initiatePayment(orderId));
      } else {
        ({ data, error } = await supabase.functions.invoke("create-payment", {
          body: {
            amount: finalAmount,
            paymentType: "partner_pos",
          },
        }));
      }

      if (error) throw error;
      if (!data?.success)
        throw new Error(data?.error || "Ödeme doðrulanamadý.");

      if (type === "topup") {
        await completeTopUp(finalAmount);
        showAlert(
          "Bakiye Güncellendi",
          `${formatCurrency(finalAmount)} cüzdanýnýza eklendi.`,
          "success",
        );
      }

      if (typeof onSuccess === "function") {
        await onSuccess(data);
      } else if (type !== "topup") {
        showAlert(
          "Ödeme Baþarýlý",
          `${formatCurrency(finalAmount)} tutarýndaki iþlem tamamlandý.`,
          "success",
        );
      }

      setPaymentResult(data);
      setStep("success");
    } catch (error) {
      console.error("Payment start error:", error);
      showAlert(
        "Ödeme Baþlatýlamadý",
        error.message || "Sistem þu an yanýt vermiyor, lütfen tekrar deneyin.",
        "error",
      );
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Icons.CreditCard className="text-primary-500" />
            {type === "topup" ? "Bakiye Yükle" : "Ödeme Yap"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition text-white"
          >
            <Icons.X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {step === "input" && (
            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">
                  {type === "topup" ? "Yüklenecek Tutar (?)" : "Ýþlem Tutarý"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-2xl font-black text-white focus:outline-none focus:border-primary-500 transition"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    disabled={Boolean(fixedAmount)}
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    TRY
                  </span>
                </div>
              </div>

              {type === "topup" && !fixedAmount && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {QUICK_AMOUNTS.map((value) => (
                    <button
                      key={value}
                      onClick={() => setAmount(String(value))}
                      className="px-4 py-2 bg-white/5 rounded-lg text-sm font-bold text-slate-300 hover:bg-white/10 whitespace-nowrap"
                    >
                      +{value} ?
                    </button>
                  ))}
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                <Icons.ShieldCheck
                  className="text-blue-400 shrink-0"
                  size={20}
                />
                <p className="text-xs text-blue-200">
                  Ödemeniz simüle güvenli ödeme katmanýndan geçer. Üretime
                  çýkarken bu alan gerçek saðlayýcýya baðlanmaya hazýrdýr.
                </p>
              </div>

              <button
                onClick={handlePaymentStart}
                disabled={loading || !finalAmount || finalAmount <= 0}
                className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-900/50 active-scale disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Icons.Loader2 className="animate-spin" />
                ) : (
                  "Devam Et"
                )}
              </button>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-10">
              <Icons.Loader2
                size={48}
                className="text-primary-500 animate-spin mb-4"
              />
              <p className="text-white font-bold">Ödeme doðrulanýyor...</p>
              <p className="text-sm text-slate-400 mt-2 text-center">
                Ýþlem kaydý ve güvenlik kontrolü tamamlanýyor.
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-5 py-4 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Icons.CheckCircle2 size={42} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white">
                  Ýþlem Tamamlandý
                </h4>
                <p className="text-sm text-slate-400 mt-2">
                  {type === "topup"
                    ? `${formatCurrency(finalAmount)} bakiyenize iþlendi.`
                    : `${formatCurrency(finalAmount)} tutarýndaki ödeme baþarýyla alýndý.`}
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-left space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Ýþlem No</span>
                  <span className="text-white font-bold">
                    {paymentResult?.transactionId || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Ýþlem Tipi</span>
                  <span className="text-white font-bold">
                    {paymentResult?.paymentType || type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Tutar</span>
                  <span className="text-emerald-400 font-black">
                    {formatCurrency(paymentResult?.amount || finalAmount)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold"
              >
                Kapat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
