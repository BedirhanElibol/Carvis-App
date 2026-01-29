import React from 'react';
import { X, MapPin, Phone, Calendar, ShieldCheck } from 'lucide-react';
import ServiceTimeline from './ServiceTimeline';

const OrderDetailsModal = ({ show, onClose, order }) => {
    if (!show || !order) return null;

    // Mock evidence for demo
    const evidencePhotos = [
        "https://images.unsplash.com/photo-1632823471565-1ec85e2368a2?q=80&w=600&auto=format&fit=crop"
    ];

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#0f172a] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-950">
                    <div>
                        <h3 className="font-black text-white text-lg">Sipariş Detayı</h3>
                        <p className="text-xs text-slate-500">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto space-y-6 custom-scrollbar">

                    {/* Status Badge */}
                    <div className="bg-primary-900/20 border border-primary-500/20 p-4 rounded-2xl flex items-center gap-3">
                        <div className="bg-primary-500/20 p-2.5 rounded-xl">
                            <ShieldCheck className="text-primary-400" size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">GÜVENLİ İŞLEM (TRANSPARENT EYE)</p>
                            <p className="text-sm text-white font-medium">Bu servis işlemi Carvis güvencesi altındadır.</p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div>
                        <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider opacity-70 border-b border-white/5 pb-2">Canlı Süreç Takibi</h4>
                        <ServiceTimeline status={order.status || 'pending'} evidencePhotos={evidencePhotos} />
                    </div>

                    {/* Service Info */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-white text-sm mb-2 uppercase tracking-wider opacity-70 border-b border-white/5 pb-2">Hizmet Bilgileri</h4>

                        <div className="flex items-start gap-3">
                            <MapPin size={16} className="text-slate-500 mt-1" />
                            <div>
                                <p className="text-sm text-white font-bold">Oto Sanayi Sitesi, Maslak</p>
                                <p className="text-xs text-slate-500">34. Sk No:12, İstanbul</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone size={16} className="text-slate-500" />
                            <p className="text-sm text-slate-300 font-bold">+90 532 555 00 00</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-slate-500" />
                            <p className="text-sm text-slate-300 font-bold">28 Ocak 2026, 14:30</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/5 bg-slate-950">
                    <button onClick={onClose} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white font-bold text-xs uppercase tracking-[0.2em] transition-all">
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
