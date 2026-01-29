import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import { useQuote } from '../../context/QuoteContext';
import { useUI } from '../../context/UIContext';
import { ArrowLeft, CreditCard, Shield, Lock, CheckCircle } from 'lucide-react';

const PaymentScreen = () => {
    const { quoteId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { createOrderFromQuote } = useOrder();
    const { quotes } = useQuote();
    const { showAlert } = useUI();

    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        const foundQuote = quotes.find(q => q.id === parseInt(quoteId));
        setQuote(foundQuote);
    }, [quoteId, quotes]);

    const handlePayment = async () => {
        if (!quote) return;

        setLoading(true);

        try {
            // Simulated payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create order from quote
            const { data: order, error: orderError } = await createOrderFromQuote(quote);

            if (orderError) throw orderError;

            setPaymentSuccess(true);
            showAlert('Ödeme Başarılı!', 'Siparişiniz oluşturuldu. Satıcı sizinle iletişime geçecek.', 'success');

            // Redirect to orders after 2 seconds
            setTimeout(() => {
                navigate('/orders');
            }, 2000);

        } catch (error) {
            console.error('Payment error:', error);
            showAlert('Hata', 'Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!quote) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Ödeme</h1>
                        <p className="text-xs text-slate-400">Güvenli ödeme</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                {/* Sipariş Özeti */}
                <div className="glass-card p-5 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-bold mb-4">Sipariş Özeti</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Satıcı</span>
                            <span className="font-semibold">
                                {quote.seller?.company_name || quote.seller?.full_name}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Ürün/Hizmet</span>
                            <span className="font-semibold">{quote.description?.substring(0, 30)}...</span>
                        </div>
                        {quote.warranty_months > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Garanti</span>
                                <span className="font-semibold">{quote.warranty_months} ay</span>
                            </div>
                        )}
                        <div className="pt-3 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold">Toplam</span>
                                <span className="text-2xl font-black text-primary-400">
                                    ₺{quote.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Güvenlik Bilgisi */}
                <div className="glass-card p-4 rounded-2xl border border-green-500/30 bg-green-500/5">
                    <div className="flex items-start gap-3">
                        <Shield size={24} className="text-green-400 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-green-400 mb-1">Güvenli Ödeme</p>
                            <p className="text-xs text-slate-300">
                                Ödemeniz PayTR güvencesi altında 256-bit SSL şifreleme ile korunmaktadır.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ödeme Butonu veya Başarı Mesajı */}
                {!paymentSuccess ? (
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-primary-500 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white active-scale disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <CreditCard size={20} />
                                Simülasyon Ödeme Yap
                            </>
                        )}
                    </button>
                ) : (
                    <div className="glass-card p-6 rounded-2xl border border-green-500/30 bg-green-500/10 text-center">
                        <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-green-400 mb-2">Ödeme Başarılı!</h3>
                        <p className="text-sm text-slate-300">Siparişiniz oluşturuldu. Siparişler sayfasına yönlendiriliyorsunuz...</p>
                    </div>
                )}

                {/* Bilgilendirme */}
                <div className="glass-card p-4 rounded-2xl border border-primary-500/30 bg-primary-500/5">
                    <p className="text-sm text-slate-300">
                        <span className="font-bold text-primary-400">💡 Not:</span> Ödeme tamamlandıktan sonra satıcı ile iletişime geçebilir ve teslimat detaylarını görüşebilirsiniz.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentScreen;
