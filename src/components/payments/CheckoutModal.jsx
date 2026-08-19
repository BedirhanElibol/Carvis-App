import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Loader2, X, Lock } from 'lucide-react';
import RapidsyTrustBadge from '../shared/RapidsyTrustBadge';

export default function CheckoutModal({ isOpen, onClose, amount, providerName, onPaymentSuccess }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        
        // Mock payment processing delay (3D Secure simulation)
        setTimeout(() => {
            setIsProcessing(false);
            if (onPaymentSuccess) {
                onPaymentSuccess();
            }
        }, 2500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 animate-in fade-in duration-200">
            <div className="bg-[#030712] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-primary/20 to-accent/20 p-6 text-center border-b border-white/10">
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={18} className="text-white" />
                    </button>
                    <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                        <ShieldCheck size={24} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight">Güvenli Ödeme (Escrow)</h2>
                    <p className="text-sm text-slate-300 mt-1 font-medium">Hizmet tamamlanana kadar paranız Rapidsy güvencesindedir.</p>
                </div>

                {/* Body */}
                <div className="p-6">
                    <RapidsyTrustBadge className="mb-6" />

                    <div className="flex justify-between items-center mb-6 bg-secondary/50 p-4 rounded-xl border border-white/5">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Ödenecek Tutar</p>
                            <p className="text-sm text-white font-medium">{providerName}</p>
                        </div>
                        <div className="text-2xl font-black text-primary">
                            ₺{amount.toLocaleString('tr-TR')}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kart Üzerindeki İsim</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                placeholder="Örn: Bedirhan Elibol"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kart Numarası</label>
                            <div className="relative">
                                <CreditCard size={18} className="absolute left-3.5 top-3.5 text-slate-500" />
                                <input 
                                    type="text" 
                                    required
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    maxLength={19}
                                    className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                    placeholder="0000 0000 0000 0000"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Son Kul. (AA/YY)</label>
                                <input 
                                    type="text" 
                                    required
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value)}
                                    maxLength={5}
                                    className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                    placeholder="12/25"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">CVV</label>
                                <input 
                                    type="password" 
                                    required
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                    maxLength={3}
                                    className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                    placeholder="***"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isProcessing}
                            className="w-full mt-6 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white font-black uppercase tracking-wider py-4 rounded-xl transition-all flex items-center justify-center gap-2 active-scale disabled:opacity-70"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Ödeme İşleniyor...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} /> 
                                    ₺{amount.toLocaleString('tr-TR')} Güvenli Öde
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                        <Lock size={12} />
                        256-bit SSL şifreleme ile güvence altındadır
                    </div>
                </div>
            </div>
        </div>
    );
}
