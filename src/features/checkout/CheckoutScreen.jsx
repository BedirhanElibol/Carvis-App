import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin, CreditCard, ShoppingBag, CheckCircle, Plus, Trash2, ArrowLeft, ShieldCheck, Info, Lock } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useUI } from '../../context/UIContext';
import { useGarage } from '../../context/GarageContext';
import AdvancedPaymentModal from '../../components/modals/AdvancedPaymentModal';

// Re-using the payment UI logic but adapting for full page
const CheckoutScreen = () => {
    const navigate = useNavigate();
    const { t, showAlert } = useUI();
    const { cart, removeFromCart, addresses, selectedAddress, setSelectedAddress, checkout, isProcessingCheckout } = useShop();
    
    const [step, setStep] = useState(1); // 1: Cart, 2: Address, 3: Payment, 4: Success
    const [cardData, setCardData] = useState({ holder: '', number: '', expiry: '', cvv: '' });
    const [installment, setInstallment] = useState(1);
    const [use3D, setUse3D] = useState(true);

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.selectedOffer?.price || item.price || 0), 0);
    const shipping = subtotal > 500 ? 0 : 49.90;
    const total = subtotal + shipping;
    
    useEffect(() => {
        if (cart.length === 0 && step === 1) {
            // navigate('/market'); // Optional: Redirect if empty
        }
    }, [cart]);

    const handleNext = () => {
        if (step === 1 && cart.length === 0) return showAlert("Uyarı", "Sepetiniz boş.", "warning");
        if (step === 2 && !selectedAddress) return showAlert("Uyarı", "Devam etmek için bir adres seçmelisiniz.", "warning");
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(prev => prev - 1);
        else navigate(-1);
    };

    const handlePaymentSubmit = async () => {
        if (!cardData.number || !cardData.cvv || !cardData.expiry) return showAlert("Hata", "Kart bilgileri eksik.", "error");
        
        await checkout(); // Trigger context checkout
        setStep(4); // Move to Success
    };

    // Installment Options (Mock)
    const installmentOptions = [
        { count: 1, label: 'Tek Çekim', monthly: total, total: total },
        { count: 3, label: '3 Taksit', monthly: (total * 1.05) / 3, total: total * 1.05 },
        { count: 6, label: '6 Taksit', monthly: (total * 1.10) / 6, total: total * 1.10 },
    ];

    if (step === 4) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 animate-fade-in relative z-50">
                 <div className="absolute top-0 left-0 w-full h-full bg-slate-950 z-[-1]"></div>
                <div className="glass-card p-12 rounded-[3rem] text-center max-w-lg border border-white/5 shadow-2xl">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-900/50">
                        <CheckCircle size={48} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white italic mb-2">Siparişiniz Alındı!</h1>
                    <p className="text-slate-400 mb-8">Sipariş numaranız: <span className="text-white font-bold">#CRV-{Math.floor(Math.random() * 10000)}</span>. Detayları profilinizden takip edebilirsiniz.</p>
                    <button onClick={() => navigate('/')} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold transition-all">
                        Anasayfaya Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-32 animate-fade-in relative z-40">
            {/* Header / Stepper */}
            <div className="sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50 border-b border-white/5 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={handleBack} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2 md:gap-4">
                        <StepIndicator current={step} num={1} icon={ShoppingBag} label="Sepetim" />
                        <div className={`w-8 h-px ${step > 1 ? 'bg-primary-500' : 'bg-slate-800'}`}></div>
                        <StepIndicator current={step} num={2} icon={MapPin} label="Teslimat" />
                        <div className={`w-8 h-px ${step > 2 ? 'bg-primary-500' : 'bg-slate-800'}`}></div>
                        <StepIndicator current={step} num={3} icon={CreditCard} label="Ödeme" />
                    </div>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT CONTENT */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* STEP 1: CART */}
                    {step === 1 && (
                        <div className="space-y-4 animate-slide-up">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShoppingBag className="text-primary-500" /> Sepetim ({cart.length} Ürün)
                            </h2>
                            {cart.length === 0 ? (
                                <div className="glass-card p-12 text-center rounded-[2rem] border border-white/5">
                                    <ShoppingBag size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
                                    <p className="text-slate-400 font-medium">Sepetinizde ürün bulunmuyor.</p>
                                    <button onClick={() => navigate('/market')} className="mt-4 text-primary-400 font-bold hover:underline">Alışverişe Başla</button>
                                </div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={idx} className="glass-card p-4 rounded-3xl border border-white/5 flex gap-4 items-center">
                                        <div className="w-24 h-24 bg-slate-900 rounded-2xl overflow-hidden border border-white/5 shrink-0">
                                            <img src={item.img || item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-primary-500 font-bold uppercase tracking-wider mb-1">{item.brand || item.shopName}</p>
                                            <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">{item.name}</h3>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-800/50 w-fit px-2 py-1 rounded-lg">
                                                <CheckCircle size={10} /> Tahmini Teslimat: Yarın
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white mb-2">{(item.selectedOffer?.price || item.price).toLocaleString()} ₺</p>
                                            <button onClick={() => removeFromCart(idx)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors ml-auto">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* STEP 2: ADDRESS */}
                    {step === 2 && (
                        <div className="space-y-4 animate-slide-up">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <MapPin className="text-primary-500" /> Teslimat Adresi
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map(addr => (
                                    <div 
                                        key={addr.id} 
                                        onClick={() => setSelectedAddress(addr)}
                                        className={`glass-card p-5 rounded-3xl border cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-primary-500 bg-primary-600/10' : 'border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white flex items-center gap-2">
                                                {addr.title}
                                                {selectedAddress?.id === addr.id && <CheckCircle size={16} className="text-primary-500" />}
                                            </h4>
                                            <button className="text-slate-500 hover:text-white"><Trash2 size={14} /></button>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed mb-3 h-10 line-clamp-2">{addr.fullAddress}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{addr.city} / {addr.district}</p>
                                    </div>
                                ))}
                                <button className="glass-card p-5 rounded-3xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                                    <Plus size={24} />
                                    <span className="text-xs font-bold">Yeni Adres Ekle</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PAYMENT (Integrated UI) */}
                    {step === 3 && (
                        <div className="space-y-6 animate-slide-up">
                             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <CreditCard className="text-primary-500" /> Kart Bilgileri
                            </h2>
                            
                            {/* Visual Card Wrapper */}
                            <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    {/* Form */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Kart Numarası</label>
                                            <div className="relative">
                                                <input 
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-500 font-mono tracking-wide" 
                                                    placeholder="0000 0000 0000 0000"
                                                    value={cardData.number}
                                                    onChange={e => setCardData({...cardData, number: e.target.value})}
                                                />
                                                <CreditCard size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">SKT</label>
                                                <input 
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-500 text-center" 
                                                    placeholder="AA/YY"
                                                    value={cardData.expiry}
                                                    onChange={e => setCardData({...cardData, expiry: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">CVV</label>
                                                <input 
                                                    type="password"
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-500 text-center" 
                                                    placeholder="***"
                                                    value={cardData.cvv}
                                                    onChange={e => setCardData({...cardData, cvv: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Kart Sahibi</label>
                                            <input 
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary-500 uppercase" 
                                                placeholder="AD SOYAD"
                                                value={cardData.holder}
                                                onChange={e => setCardData({...cardData, holder: e.target.value.toUpperCase()})}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Installment Table */}
                                    <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5">
                                                <tr>
                                                    <th className="p-3 text-[10px] text-slate-400 uppercase font-bold">Taksit</th>
                                                    <th className="p-3 text-[10px] text-slate-400 uppercase font-bold text-right">Aylık</th>
                                                    <th className="p-3 text-[10px] text-slate-400 uppercase font-bold text-right">Toplam</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {installmentOptions.map(opt => (
                                                    <tr 
                                                        key={opt.count} 
                                                        onClick={() => setInstallment(opt.count)}
                                                        className={`cursor-pointer transition-colors ${installment === opt.count ? 'bg-primary-500/10' : 'hover:bg-white/5'}`}
                                                    >
                                                        <td className="p-3 text-xs font-bold text-white flex items-center gap-2">
                                                            {installment === opt.count && <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>}
                                                            {opt.label}
                                                        </td>
                                                        <td className="p-3 text-xs text-slate-300 text-right">{opt.monthly.toLocaleString()} ₺</td>
                                                        <td className="p-3 text-xs font-bold text-white text-right">{opt.total.toLocaleString()} ₺</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT CONTENT: SUMMARY */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 sticky top-24 space-y-6">
                        <h3 className="font-black text-xl text-white italic">Sipariş Özeti</h3>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Ara Toplam</span>
                                <span>{subtotal.toLocaleString()} ₺</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Kargo</span>
                                <span className="text-green-500">{shipping === 0 ? 'Bedava' : `${shipping} ₺`}</span>
                            </div>
                            {installment > 1 && (
                                <div className="flex justify-between text-sm text-yellow-500">
                                    <span>Vade Farkı</span>
                                    <span>+{(installmentOptions.find(i => i.count === installment).total - total).toLocaleString()} ₺</span>
                                </div>
                            )}
                            <div className="h-px bg-white/10 my-2"></div>
                            <div className="flex justify-between text-lg font-black text-white">
                                <span>Toplam</span>
                                <span>{installmentOptions.find(i => i.count === installment).total.toLocaleString()} ₺</span>
                            </div>
                        </div>

                        {/* Step-Specific Actions */}
                        {step < 3 ? (
                            <button onClick={handleNext} className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl shadow-xl transition-all active-scale flex items-center justify-center gap-2">
                                {step === 1 ? 'Sepeti Onayla' : 'Ödemeye Geç'}
                                <ChevronRight size={18} />
                            </button>
                        ) : (
                            <div className="space-y-4">
                                {/* Contracts */}
                                <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 space-y-2">
                                    <label className="flex gap-2 items-start cursor-pointer">
                                        <input type="checkbox" defaultChecked className="mt-1" />
                                        <span className="text-[10px] text-slate-500 leading-tight">
                                            <span className="text-primary-500 underline">Ön Bilgilendirme</span> ve <span className="text-primary-500 underline">Mesafeli Satış Sözleşmesi</span>'ni okudum, onaylıyorum.
                                        </span>
                                    </label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                            <ShieldCheck size={12} /> 3D Secure
                                        </span>
                                        <div onClick={() => setUse3D(!use3D)} className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${use3D ? 'bg-primary-600' : 'bg-slate-700'}`}>
                                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${use3D ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handlePaymentSubmit} disabled={isProcessingCheckout} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-xl transition-all active-scale flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isProcessingCheckout ? <Info className="animate-spin" /> : <Lock size={18} />}
                                    <span className="flex-1 text-center">Ödemeyi Tamamla</span>
                                    <span className="bg-black/20 px-2 py-0.5 rounded text-xs">{installmentOptions.find(i => i.count === installment).total.toLocaleString()} ₺</span>
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
        </div>
    );
};

// Helper for stepper
const StepIndicator = ({ current, num, icon: Icon, label }) => {
    const isActive = current >= num;
    const isCurrent = current === num;
    return (
        <div className={`flex items-center gap-2 ${isActive ? 'text-white' : 'text-slate-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isActive ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/50' : 'bg-transparent border-slate-700'}`}>
                <Icon size={14} />
            </div>
            <span className={`text-xs font-bold hidden md:block ${isCurrent ? 'text-primary-500' : ''}`}>{label}</span>
        </div>
    );
};

export default CheckoutScreen;
