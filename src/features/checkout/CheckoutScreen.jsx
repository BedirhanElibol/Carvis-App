import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, ChevronRight, CreditCard, Lock, MapPin, RefreshCw, ShieldCheck, ShoppingBag } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { useUI } from "../../context/UIContext";
import { useWallet } from "../../context/WalletContext";
import CheckoutCartStep from "./components/CheckoutCartStep";
import CheckoutAddressStep from "./components/CheckoutAddressStep";
import CheckoutPaymentStep from "./components/CheckoutPaymentStep";
import LegalViewModal from "../legal/LegalViewModal";

/**
 * CheckoutScreen Component
 * Multi-step checkout process: Cart -> Address -> Payment -> Success.
 */
const CheckoutScreen = () => {
  const navigate = useNavigate();
  const { showAlert } = useUI();
  const {
    cart,
    selectedAddress,
    checkout,
    isProcessingCheckout,
  } = useShop();
  const { balance } = useWallet();

  const [step, setStep] = useState(1); // 1: Cart, 2: Address, 3: Payment, 4: Success
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' or 'wallet'
  const [cardData, setCardData] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [installment, setInstallment] = useState(1);
  const [use3D, setUse3D] = useState(true);
  const [legalModal, setLegalModal] = useState({ open: false, type: "" });

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.selectedOffer?.price || item.price || 0),
    0
  );
  const shipping = subtotal > 500 ? 0 : 49.9;
  const total = subtotal + shipping;

  useEffect(() => {
    if (cart.length === 0 && step === 1) {
      // navigate('/market');
    }
  }, [cart, step]);

  const handleNext = () => {
    if (step === 1 && cart.length === 0)
      return showAlert("Uyarı", "Sepetiniz boş.", "warning");
    if (step === 2 && !selectedAddress)
      return showAlert("Uyarı", "Devam etmek için bir adres seçmelisiniz.", "warning");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
    else navigate(-1);
  };

  const handlePaymentSubmit = async () => {
    if (!cardData.number || !cardData.cvv || !cardData.expiry) {
      return showAlert("Hata", "Kart bilgileri eksik.", "error");
    }
    try {
      await checkout({
        useWallet: false,
        installment: installment,
      });
      setStep(4);
    } catch (err) {
      console.error(err);
    }
  };

  // Installment Options (Mock)
  const installmentOptions = [
    { count: 1, label: "Tek Çekim", monthly: total, total: total },
    {
      count: 3,
      label: "3 Taksit",
      monthly: (total * 1.05) / 3,
      total: total * 1.05,
    },
    {
      count: 6,
      label: "6 Taksit",
      monthly: (total * 1.1) / 6,
      total: total * 1.1,
    },
  ];

  const currentTotal =
    installmentOptions.find((i) => i.count === installment)?.total || total;

  if (step === 4) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 animate-fade-in relative z-50">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-50 dark:bg-slate-950 z-[-1]"></div>
        <div className="glass-card p-12 rounded-[3rem] text-center max-w-lg border border-black/5 dark:border-white/5 shadow-2xl">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-900/50">
            <CheckCircle size={48} className="text-slate-900 dark:text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Siparişiniz Alındı!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Sipariş numaranız:{" "}
            <span className="text-slate-900 dark:text-white font-bold">
              #CRV-{Math.floor(Math.random() * 10000)}
            </span>
            . Detayları profilinizden takip edebilirsiniz.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white py-4 rounded-xl font-bold transition-all"
          >
            Anasayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 animate-fade-in relative z-40">
      {/* Header / Stepper */}
      <div className="sticky top-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl z-50 border-b border-black/5 dark:border-white/5 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2 md:gap-4">
            <StepIndicator
              current={step}
              num={1}
              icon={ShoppingBag}
              label="Sepetim"
            />
            <div
              className={`w-8 h-px ${step > 1 ? "bg-primary-500" : "bg-slate-100 dark:bg-slate-800"}`}
            ></div>
            <StepIndicator
              current={step}
              num={2}
              icon={MapPin}
              label="Teslimat"
            />
            <div
              className={`w-8 h-px ${step > 2 ? "bg-primary-500" : "bg-slate-100 dark:bg-slate-800"}`}
            ></div>
            <StepIndicator
              current={step}
              num={3}
              icon={CreditCard}
              label="Ödeme"
            />
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && <CheckoutCartStep />}
          {step === 2 && <CheckoutAddressStep />}
          {step === 3 && (
            <CheckoutPaymentStep
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              cardData={cardData}
              setCardData={setCardData}
              installment={installment}
              setInstallment={setInstallment}
              installmentOptions={installmentOptions}
              total={total}
            />
          )}
        </div>

        {/* RIGHT CONTENT: SUMMARY */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-[2.5rem] border border-black/10 dark:border-white/10 sticky top-24 space-y-6">
            <h3 className="font-black text-xl text-slate-900 dark:text-white">Sipariş Özeti</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Ara Toplam</span>
                <span>{subtotal.toLocaleString()} ₺</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Kargo</span>
                <span className="text-green-500">
                  {shipping === 0 ? "Bedava" : `${shipping} ₺`}
                </span>
              </div>
              {installment > 1 && (
                <div className="flex justify-between text-sm text-yellow-500">
                  <span>Vade Farkı</span>
                  <span>
                    +
                    {(
                      installmentOptions.find((i) => i.count === installment).total - total
                    ).toLocaleString()}{" "}
                    ₺
                  </span>
                </div>
              )}
              <div className="h-px bg-black/10 dark:bg-white/10 my-2"></div>
              <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white">
                <span>Toplam</span>
                <span>{currentTotal.toLocaleString()} ₺</span>
              </div>
            </div>

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="w-full bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white font-bold py-4 rounded-xl shadow-xl transition-all active-scale flex items-center justify-center gap-2"
              >
                {step === 1 ? "Sepeti Onayla" : "Ödemeye Geç"}
                <ChevronRight size={18} />
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-black/5 dark:border-white/5 space-y-2">
                  <label className="flex gap-2 items-start cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-1" />
                    <span className="text-[10px] text-slate-500 leading-tight">
                      <span 
                        onClick={() => setLegalModal({ open: true, type: "MESAFELI_SATIS" })}
                        className="text-primary-500 underline cursor-pointer"
                      >
                        Ön Bilgilendirme
                      </span>{" "}
                      ve{" "}
                      <span 
                        onClick={() => setLegalModal({ open: true, type: "MESAFELI_SATIS" })}
                        className="text-primary-500 underline cursor-pointer"
                      >
                        Mesafeli Satış Sözleşmesi
                      </span>
                      'ni okudum, onaylıyorum.
                    </span>
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                      <ShieldCheck size={12} /> 3D Secure
                    </span>
                    <div
                      onClick={() => setUse3D(!use3D)}
                      className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${use3D ? "bg-primary-600" : "bg-slate-700"}`}
                    >
                      <div
                        className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${use3D ? "translate-x-4" : "translate-x-0"}`}
                      ></div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={isProcessingCheckout}
                  className="w-full bg-green-600 hover:bg-green-500 text-slate-900 dark:text-white font-bold py-4 rounded-xl shadow-xl transition-all active-scale flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingCheckout ? (
                    <RefreshCw className="animate-spin" />
                  ) : (
                    <Lock size={18} />
                  )}
                  <span className="flex-1 text-center">
                    Ödemeyi Tamamla
                  </span>
                  <span className="bg-black/20 px-2 py-0.5 rounded text-xs">
                    {currentTotal.toLocaleString()} ₺
                  </span>
                </button>
              </div>
            )}
            <div className="text-center">
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> Güvenli Alışveriş
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <LegalViewModal 
        isOpen={legalModal.open} 
        type={legalModal.type} 
        onClose={() => setLegalModal({ open: false, type: "" })} 
      />
    </div>
  );
};

const StepIndicator = ({ current, num, icon: Icon, label }) => {
  const isActive = current >= num;
  const isCurrent = current === num;
  return (
    <div
      className={`flex items-center gap-2 ${isActive ? "text-slate-900 dark:text-white" : "text-slate-600"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isActive ? "bg-primary-600 border-primary-500 text-slate-900 dark:text-white shadow-lg shadow-primary-900/50" : "bg-transparent border-slate-300 dark:border-slate-700"}`}
      >
        <Icon size={14} />
      </div>
      <span
        className={`text-xs font-bold hidden md:block ${isCurrent ? "text-primary-500" : ""}`}
      >
        {label}
      </span>
    </div>
  );
};

export default CheckoutScreen;
