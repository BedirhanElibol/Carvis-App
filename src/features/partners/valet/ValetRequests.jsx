import React, { useState } from 'react';
import { Key, MapPin, Clock, Phone, CheckCircle, XCircle } from 'lucide-react';
import { useUI } from '../../../context/UIContext';

const ValetRequests = () => {
    const { showAlert } = useUI();

    // Mock Requests
    const [requests, setRequests] = useState([
        { id: 1, type: 'pickup', plate: '34 RPD 91', location: 'Ana Giriş', time: '14:45', status: 'pending', owner: 'Ahmet Y.', phone: '0532...' },
        { id: 2, type: 'delivery', plate: '06 ANK 06', location: 'Vale Noktası', time: '14:50', status: 'pending', owner: 'Ayşe K.', phone: '0555...' },
    ]);

    const handleAction = (id, action) => {
        setRequests(prev => prev.filter(r => r.id !== id));
        if (action === 'accept') {
            showAlert('Başarılı', 'Çağrı kabul edildi.', 'success');
        } else {
            showAlert('Bilgi', 'Çağrı reddedildi.', 'info');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter text-white">Vale Çağrıları</h1>
                    <p className="text-slate-400 text-sm">Bekleyen araç talepleri</p>
                </div>
                <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    AKTİF
                </div>
            </div>

            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="glass-card p-10 text-center">
                        <Key size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-500">Şu an bekleyen çağrı yok.</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="glass-card p-5 rounded-2xl border border-white/5 animate-fade-in">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl ${req.type === 'pickup' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                                        <Key size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white">{req.plate}</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase">{req.type === 'pickup' ? 'TESLİM ALMA' : 'TESLİM ETME'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-slate-400 text-xs justify-end">
                                        <Clock size={12} /> {req.time}
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-400 text-xs justify-end mt-1">
                                        <MapPin size={12} /> {req.location}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4 flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded-lg">
                                <Phone size={14} className="text-slate-500" />
                                <span className="font-semibold">{req.owner}</span>
                                <span className="text-slate-500">({req.phone})</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAction(req.id, 'reject')}
                                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active-scale"
                                >
                                    <XCircle size={18} /> REDDET
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, 'accept')}
                                    className="flex-[2] bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-900/50 transition-all active-scale"
                                >
                                    <CheckCircle size={18} /> KABUL ET
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ValetRequests;
