import React, { useState } from "react";
import { CheckCircle, ChevronRight, CreditCard, Info, Loader2, X } from "lucide-react";
import { useUI } from "../../context/UIContext";

const AdvancedPaymentModal = ({
  show,
  onClose,
  amount,
  onSuccess,
  title = "Ödeme Yap",
}) => {
  const { showAlert } = useUI();
  const [step, setStep] = useState("payment"); // payment, processing, success
  const [use3D, setUse3D] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState("new");
  const [installment, setInstallment] = useState(1); // 1 = Tek Çekim

  // Mock Saved Cards
  const savedCards = [
    {
      id: "1",
      alias: "Enpara Kredi Kartım",
      number: "5400 **** **** 1290",
      brand: "mastercard",
    },
    {
      id: "2",
      alias: "İş Bankası Maaş",
      number: "4543 **** **** 9012",
      brand: "visa",
    },
  ];

  const [cardData, setCardData] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  // Determine Card Brand for visual
  const getCardBrand = (num) => {
    if (num.startsWith("4")) return "Visa";
    if (num.startsWith("5")) return "Mastercard";
    if (num.startsWith("9")) return "Troy";
    return "Kart";
  };

  const handlePayment = async () => {
    setStep("processing");
    // Simulate payment gateway delay
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onSuccess();
        onClose();
        showAlert(
          "Sipariş Alındı",
          "Ödemeniz başarıyla tamamlandı.",
          "success",
        );
        setStep("payment");
      }, 2500);
    }, 2000);
  };

  if (!show) return null;

  const totalAmount = amount || 0;

  // Mock Installment Rates
  const installmentOptions = [
    { count: 1, label: "Tek Çekim", monthly: totalAmount, total: totalAmount },
    {
      count: 3,
      label: "3 Taksit",
      monthly: (totalAmount * 1.05) / 3,
      total: totalAmount * 1.05,
    },
    {
      count: 6,
      label: "6 Taksit",
      monthly: (totalAmount * 1.1) / 6,
      total: totalAmount * 1.1,
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-5xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-2xl overflow-hidden relative flex flex-col md:flex-row text-slate-900 dark:text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <X size={18} />
        </button>

        {step === "payment" ? (
          <>
            {/* LEFT COLUMN: Payment Methods */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 font-sans">
                <CreditCard className="text-primary-600" /> Ödeme
                Seçenekleri
              </h2>

              {/* Saved Cards Header */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 font-sans">
                  Kayıtlı Kartlarım
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  <button
                    onClick={() => setSelectedCardId("new")}
                    className={`min-w-[140px] p-3 rounded-lg border-2 text-left transition-all ${
                      selectedCardId === "new"
                        ? "border-primary-600 bg-primary-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-primary-600">
                      <IDIcon />
                    </div>
                    <p className="text-xs font-bold text-slate-800 font-sans">
                      Başka Kart ile Öde
                    </p>
                  </button>

                  {savedCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`min-w-[140px] p-3 rounded-lg border-2 text-left transition-all relative ${
                        selectedCardId === card.id
                          ? "border-primary-600 bg-primary-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-[10px] uppercase text-slate-500 font-sans">
                          {card.brand}
                        </span>
                        {selectedCardId === card.id && (
                          <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                            <CheckCircle
                              size={10}
                              className="text-slate-900 dark:text-white"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 mb-0.5 font-sans">
                        {card.alias}
                      </p>
                      <p className="text-[10px] text-slate-500 tracking-wider">
                        ●●●● {card.number.slice(-4)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Form */}
              <div
                className={`transition-all duration-300 ${
                  selectedCardId !== "new"
                    ? "opacity-50 pointer-events-none grayscale"
                    : ""
                }`}
              >
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 p-6 rounded-xl relative overflow-hidden">
                  {/* Card Visual (Simple) */}
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CreditCard size={120} />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                        Kart Numarası
                      </label>
                      <div className="relative group">
                        <input
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all font-mono"
                          placeholder="0000 0000 0000 0000"
                          value={cardData.number}
                          onChange={(e) =>
                            setCardData({ ...cardData, number: e.target.value })
                          }
                          disabled={selectedCardId !== "new"}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {getCardBrand(cardData.number)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5 font-sans">
                          Son Kullanma Tarihi
                        </label>
                        <input
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all text-center"
                          placeholder="AA / YY"
                          value={cardData.expiry}
                          onChange={(e) =>
                            setCardData({ ...cardData, expiry: e.target.value })
                          }
                          disabled={selectedCardId !== "new"}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5 flex items-center gap-1">
                          CVV{" "}
                          <Info size={12} className="text-slate-500 dark:text-slate-400" />
                        </label>
                        <input
                          type="password"
                          maxLength={3}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all text-center"
                          placeholder="***"
                          value={cardData.cvv}
                          onChange={(e) =>
                            setCardData({ ...cardData, cvv: e.target.value })
                          }
                          disabled={selectedCardId !== "new"}
                        />
                      </div>
                    </div>
                    {selectedCardId === "new" && (
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium group-hover:text-primary-600 transition-colors">
                          Kartımı sonraki alışverişler için Masterpass'e kaydet.
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Installment Table */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3">
                  Taksit Seçenekleri
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase px-4 py-2">
                          Taksit Sayısı
                        </th>
                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase px-4 py-2">
                          Aylık Ödeme
                        </th>
                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase px-4 py-2">
                          Toplam
                        </th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {installmentOptions.map((opt) => (
                        <tr
                          key={opt.count}
                          onClick={() => setInstallment(opt.count)}
                          className={`cursor-pointer transition-colors border-b last:border-0 border-slate-100 ${
                            installment === opt.count
                              ? "bg-primary-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-4 py-3 text-xs font-bold text-slate-700 flex items-center gap-2">
                            {opt.label}{" "}
                            {opt.count > 1 && opt.total === totalAmount && (
                              <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                VADE FARKSIZ
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-slate-600 text-right">
                            {opt.monthly.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            TL
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-slate-800 text-right">
                            {opt.total.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            TL
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                installment === opt.count
                                  ? "border-primary-600 bg-primary-600"
                                  : "border-slate-300"
                              }`}
                            >
                              {installment === opt.count && (
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Summary & Action */}
            <div className="w-full md:w-80 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4">
                  Sipariş Özeti
                </h3>
                <div className="bg-white border border-slate-200 rounded-lg p-3 mb-4 flex items-start gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center shrink-0">
                    <Package size={20} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-2">
                      {title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Standart Teslimat
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Ürün Toplamı</span>
                    <span>{totalAmount.toLocaleString()} TL</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Kargo</span>
                    <span className="text-green-600 font-bold">Bedava</span>
                  </div>
                  <div className="h-px bg-slate-200 my-2"></div>
                  <div className="flex justify-between text-primary-600 font-bold text-base">
                    <span>Toplam</span>
                    <span>
                      {installmentOptions
                        .find((i) => i.count === installment)
                        .total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                      TL
                    </span>
                  </div>
                </div>

                {/* Contracts */}
                <div className="space-y-3 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      defaultChecked
                    />
                    <span className="text-[10px] text-slate-500 leading-tight">
                      <span className="font-bold underline text-primary-600">
                        Ön Bilgilendirme Koşulları
                      </span>
                      'nı ve{" "}
                      <span className="font-bold underline text-primary-600">
                        Mesafeli Satış Sözleşmesi
                      </span>
                      'ni okudum, onaylıyorum.
                    </span>
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-center gap-3">
                  <div
                    className={`w-10 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                      use3D ? "bg-primary-600" : "bg-slate-300"
                    }`}
                    onClick={() => setUse3D(!use3D)}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                        use3D ? "translate-x-4" : "translate-x-0"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      3D Secure ile Öde
                    </p>
                    <p className="text-[9px] text-slate-500">
                      Güvenli ödeme için SMS onayı alınır.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="w-full bg-primary-600 hover:bg-primary-700 text-slate-900 dark:text-white text-sm font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-between px-6 font-sans"
              >
                <span>Ödemeyi Tamamla</span>
                <ChevronRight size={18} />
              </button>

              <div className="flex justify-center gap-2 mt-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                <CardsLogo />
              </div>
            </div>
          </>
        ) : step === "processing" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white min-h-[400px]">
            <Loader2
              size={48}
              className="text-primary-600 animate-spin mb-4"
            />
            <h3 className="text-xl font-bold text-slate-800">
              Ödemeniz İşleniyor
            </h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs text-center">
              Banka onayı bekleniyor, lütfen pencereyi kapatmayınız...
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white min-h-[400px]">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 font-sans">
              Teşekkürler!
            </h3>
            <p className="text-slate-500 text-sm text-center mb-8">
              Siparişiniz başarıyla alındı. Sipariş numaranız:{" "}
              <span className="font-bold text-slate-900">
                #CRV-{Math.floor(Math.random() * 10000)}
              </span>
            </p>
            <button
              onClick={onClose}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-8 py-3 rounded-xl font-bold text-sm"
            >
              Alışverişe Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Icons components for cleaner JSX
const IDIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
    <circle cx="12" cy="5" r="3"></circle>
    <path d="M12 8v3"></path>
  </svg>
);

const Package = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const CardsLogo = () => (
  <div className="flex gap-2">
    <div className="h-4 w-8 bg-slate-200 rounded"></div>
    <div className="h-4 w-8 bg-slate-200 rounded"></div>
    <div className="h-4 w-8 bg-slate-200 rounded"></div>
  </div>
);

export default AdvancedPaymentModal;
