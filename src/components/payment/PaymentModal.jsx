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
      throw new Error("Bakiye y�kleme kayd� olu�turulamad�.");
    }
  };

  const handlePaymentStart = async () => {
    if (!finalAmount || Number.isNaN(finalAmount) || finalAmount <= 0) {
      showAlert("Hata", "L�tfen ge�erli bir tutar girin.", "warning");
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
        throw new Error(data?.error || "�deme do�rulanamad�.");

      if (type === "topup") {
        await completeTopUp(finalAmount);
        showAlert(
          "Bakiye G�ncellendi",
          `${formatCurrency(finalAmount)} c�zdan�n�za eklendi.`,
          "success",
        );
      }

      if (typeof onSuccess === "function") {
        await onSuccess(data);
      } else if (type !== "topup") {
        showAlert(
          "�deme Ba�ar�l�",
          `${formatCurrency(finalAmount)} tutar�ndaki i�lem tamamland�.`,
          "success",
        );
      }

      setPaymentResult(data);
      setStep("success");
    } catch (error) {
      console.error("Payment start error:", error);
      showAlert(
        "�deme Ba�lat�lamad�",
        error.message || "Sistem �u an yan�t vermiyor, l�tfen tekrar deneyin.",
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
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-slate-100 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <Icons.CreditCard className="text-primary-500" />
            {type === "topup" ? "Bakiye Y�kle" : "�deme Yap"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/10 dark:bg-white/10 rounded-full transition text-slate-900 dark:text-white"
          >
            <Icons.X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {step === "input" && (
            <div className="space-y-6">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-sm font-bold mb-2">
                  {type === "topup" ? "Y�klenecek Tutar (?)" : "��lem Tutar�"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl p-4 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition"
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
                      className="px-4 py-2 bg-black/5 dark:bg-white/5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:bg-white/10 whitespace-nowrap"
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
                  �demeniz sim�le g�venli �deme katman�ndan ge�er. �retime
                  ��karken bu alan ger�ek sa�lay�c�ya ba�lanmaya haz�rd�r.
                </p>
              </div>

              <button
                onClick={handlePaymentStart}
                disabled={loading || !finalAmount || finalAmount <= 0}
                className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-900/50 active-scale disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <p className="text-slate-900 dark:text-white font-bold">�deme do�rulan�yor...</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
                ��lem kayd� ve g�venlik kontrol� tamamlan�yor.
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-5 py-4 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Icons.CheckCircle2 size={42} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  ��lem Tamamland�
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  {type === "topup"
                    ? `${formatCurrency(finalAmount)} bakiyenize i�lendi.`
                    : `${formatCurrency(finalAmount)} tutar�ndaki �deme ba�ar�yla al�nd�.`}
                </p>
              </div>
              <div className="rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 text-left space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">��lem No</span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    {paymentResult?.transactionId || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">��lem Tipi</span>
                  <span className="text-slate-900 dark:text-white font-bold">
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
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white font-bold"
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
