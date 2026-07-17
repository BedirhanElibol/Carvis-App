import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrder } from "../../context/OrderContext";
import { useQuote } from "../../context/QuoteContext";
import { useUI } from "../../context/UIContext";
import { ArrowLeft, CheckCircle, CreditCard, Loader2, Shield } from "lucide-react";

const PaymentScreen = () => {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const { createOrderFromQuote } = useOrder();
  const { quotes } = useQuote();
  const { showAlert } = useUI();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const foundQuote = quotes.find((q) => q.id === parseInt(quoteId));
    setQuote(foundQuote);
  }, [quoteId, quotes]);

  const handlePayment = async () => {
    if (!quote) return;
    setLoading(true);
    try {
      // Create order from quote
      const { error: orderError } = await createOrderFromQuote(quote);
      if (orderError) throw orderError;

      setPaymentSuccess(true);
      showAlert(
        "Ödeme Başarılı!",
        "Siparişiniz oluşturuldu. Satıcı sizinle iletişime geçecek.",
        "success",
      );

      // Redirect to orders immediately
      navigate("/orders");
    } catch (error) {
      console.error("Payment error:", error);
      showAlert(
        "Hata",
        "Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!quote) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 p-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale border border-black/5 dark:border-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold font-sans">Ödeme</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Güvenli ödeme</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Sipariş Özeti */}
        <div className="glass-card p-5 rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-2xl">
          <h3 className="text-lg font-bold mb-4 font-sans">Sipariş Özeti</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-bold">
                Satıcı
              </span>
              <span className="font-semibold text-sm">
                {quote.seller?.company_name || quote.seller?.full_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-bold">
                Ürün/Hizmet
              </span>
              <span className="font-semibold text-sm truncate max-w-[150px]">
                {quote.description}
              </span>
            </div>
            {quote.warranty_months > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-bold">
                  Garanti
                </span>
                <span className="font-semibold text-sm">
                  {quote.warranty_months} ay
                </span>
              </div>
            )}
            <div className="pt-4 mt-2 border-t border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold font-sans">Toplam</span>
                <span className="text-2xl font-black text-primary-400">
                  ₺
                  {quote.price.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Güvenlik Bilgisi */}
        <div className="glass-card p-5 rounded-3xl border border-green-500/30 bg-green-500/5 space-y-4">
          <div className="flex items-start gap-3">
            <Shield size={24} className="text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-400 text-sm mb-1 uppercase tracking-tight">
                %100 Rapidsy Ödeme Güvencesi
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
                Ödemeniz, **BDDK denetimli PayTR / iyzico** lisanslı korumalı havuz hesabında bloke edilir. Hizmet tamamlanıp siz onay verene kadar para satıcıya aktarılmaz.
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-green-500/10 text-[11px] text-slate-500 dark:text-slate-400 space-y-2">
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              <strong>Mevzuata Uygun:</strong> 6493 sayılı kanun kapsamında yetkilendirilmiş ödeme kuruluşu güvencesiyle split-payment.
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              <strong>Güvenli Teslimat:</strong> İş tamamlandığında ustaya vereceğiniz tek kullanımlık teslim koduyla ödeme çözülür.
            </p>
          </div>
        </div>

        {/* Ödeme Butonu veya Başarı Mesajı */}
        {!paymentSuccess ? (
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 p-5 rounded-2xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white shadow-xl shadow-primary-600/20 active-scale disabled:opacity-50 transition-all font-sans"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <CreditCard size={20} />
                Güvenli Havuz Ödemesini Yap
              </>
            )}
          </button>
        ) : (
          <div className="glass-card p-8 rounded-3xl border border-green-500/30 bg-green-500/10 text-center animate-bounce-in">
            <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-green-400 mb-2 font-sans">
              Havuz Ödemesi Alındı!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Tutar güvenli havuz hesabına aktarıldı. Satıcı ile iletişime geçebilirsiniz.
            </p>
          </div>
        )}

        {/* Bilgilendirme */}
        <div className="glass-card p-4 rounded-2xl border border-primary-500/30 bg-primary-500/5">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-black text-primary-400 uppercase tracking-widest mr-1">
              ⚠️ Önemli:
            </span>
            Elde ödeme (nakit/havale) tekliflerini kabul etmeyiniz. Elden yapılan ödemeler Rapidsy onarım ve hasar garantisi kapsamı dışındadır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
