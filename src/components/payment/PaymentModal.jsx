import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { useUI } from '../../context/UIContext';
import { X, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const PaymentModal = ({ isOpen, onClose, type = 'topup', orderId = null, fixedAmount = null, onSuccess }) => {
    const { initiatePayment, createOrder, wallet } = usePayment();
    const { showAlert, t } = useUI();

    // States
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [iframeToken, setIframeToken] = useState(null);
    const [step, setStep] = useState('input'); // input, processing, iframe, success

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setAmount('');
            setLoading(false);
            setIframeToken(null);
            setStep('input');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePaymentStart = async () => {
        const finalAmount = fixedAmount || parseFloat(amount);

        if (!finalAmount || finalAmount <= 0) {
            showAlert("Hata", "Lütfen geçerli bir tutar girin.", "warning");
            return;
        }

        setLoading(true);
        setStep('processing');

        try {
            let targetOrderId = orderId;

            // Eğer Top-up ise önce bir 'deposit' siparişi oluştur veya doğrudan ödeme başlat
            // Not: Edge Function genellikle bir orderID bekler.
            // Cüzdan yüklemesi için özel bir 'wallet_topup' tipi order oluşturabiliriz veya
            // Edge Function'a 'type: wallet' parametresi gönderebiliriz.
            // Şimdilik basitlik adına: Her yükleme bir 'sipariş' gibi davranacak ama 'quote'suz.
            // Ancak mevcut schema quote_id istiyor.

            // ÇÖZÜM: 'Top-up' için backend tarafında dummy quote kullanımı yerine
            // create-payment fonksiyonuna { amount, type: 'wallet_deposit' } göndereceğiz.
            // Edge Function bu durumu handle etmeli.

            // Eğer Edge Function sadece Order ID kabul ediyorsa, önce fake bir order yaratmalıyız.
            // Ancak biz modern bir yaklaşım izleyip, direkt Edge Function'a parametre geçelim.
            // Eğer backend desteklemiyorsa, burada hata alırız. Doc'a göre 'create-payment' { orderId } alıyor.
            // Demek ki Order tablosuna kayıt şart.

            if (type === 'topup') {
                // 1. Geçici bir Top-up kaydı oluştur (Backend desteği yoksa bu adım patlayabilir)
                // Alternatif: create-payment fonksiyonu 'amount' parametresini de kabul edecek şekilde güncellenmeli.
                // Biz şimdilik Order ID olmadan amount ile deneyeceğiz.

                const { data, error } = await supabase.functions.invoke('create-payment', {
                    body: {
                        amount: finalAmount,
                        paymentType: 'wallet_deposit',
                        userId: (await supabase.auth.getUser()).data.user.id
                    }
                });

                if (error) throw error;
                if (data?.token) {
                    setIframeToken(data.token);
                    setStep('iframe');
                } else {
                    throw new Error("PayTR Token alınamadı");
                }
            } else {
                // Normal Sipariş Ödemesi
                const { data, error } = await initiatePayment(orderId);
                if (error) throw error;

                if (data?.token) {
                    setIframeToken(data.token);
                    setStep('iframe');
                }
            }

        } catch (error) {
            console.error(error);
            showAlert("Ödeme Başlatılamadı", "Sistem şu an yanıt vermiyor servisi kontrol edin.", "error");
            setStep('input');
        } finally {
            setLoading(false);
        }
    };

    // PayTR iframe'i postMessage ile dinleyebiliriz veya callback bekleriz.
    // PayTR iframe embed scripti
    useEffect(() => {
        if (iframeToken) {
            // Iframe resize script
            const script = document.createElement("script");
            script.src = "https://www.paytr.com/js/iframeResizer.min.js";
            script.onload = () => {
                window.iFrameResize({}, '#paytriframe');
            };
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            }
        }
    }, [iframeToken]);

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        <CreditCard className="text-primary-500" />
                        {type === 'topup' ? 'Bakiye Yükle' : 'Ödeme Yap'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">

                    {step === 'input' && (
                        <div className="space-y-6">
                            {type === 'topup' ? (
                                <div>
                                    <label className="block text-slate-400 text-sm font-bold mb-2">Yüklenecek Tutar (₺)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-2xl font-black text-white focus:outline-none focus:border-primary-500 transition"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            autoFocus
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">TRY</span>
                                    </div>
                                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                        {[100, 250, 500, 1000].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setAmount(val)}
                                                className="px-4 py-2 bg-white/5 rounded-lg text-sm font-bold text-slate-300 hover:bg-white/10 whitespace-nowrap"
                                            >
                                                +{val} ₺
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-slate-400">Ödenecek Tutar</p>
                                    <h2 className="text-4xl font-black text-white mt-2">{fixedAmount?.toLocaleString()} ₺</h2>
                                </div>
                            )}

                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                                <ShieldCheck className="text-blue-400 shrink-0" size={20} />
                                <p className="text-xs text-blue-200">
                                    Ödemeniz PayTR güvencesiyle 256-bit SSL şifreleme ile korunmaktadır. Kart bilgileriniz asla kaydedilmez.
                                </p>
                            </div>

                            <button
                                onClick={handlePaymentStart}
                                disabled={loading || (type === 'topup' && !amount)}
                                className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-900/50 active-scale disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Devam Et'}
                            </button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Loader2 size={48} className="text-primary-500 animate-spin mb-4" />
                            <p className="text-white font-bold">PayTR Bağlantısı Kuruluyor...</p>
                        </div>
                    )}

                    {step === 'iframe' && iframeToken && (
                        <div className="w-full">
                            <iframe
                                src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                                id="paytriframe"
                                frameBorder="0"
                                scrolling="no"
                                style={{ width: '100%', minHeight: '600px' }}
                            ></iframe>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
