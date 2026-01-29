import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Navigation,
    Search,
    LocateFixed,
    Wrench,
    Truck,
    Zap,
    ChevronLeft,
    Phone,
    Star,
    AlertTriangle,
    ShieldCheck,
    X,
    MessageCircle
} from 'lucide-react';
import { useMap } from '../../context/MapContext';
import { Badge } from '../../components/Core';

const MapScreen = () => {
    const navigate = useNavigate();
    const { nearbyProviders, fetchNearbyProviders, userLocation, activeSOS, createSOSRequest, cancelSOS } = useMap();

    const [selectedProvider, setSelectedProvider] = useState(null);
    const [showSOSPanel, setShowSOSPanel] = useState(false);
    const [sosProcessing, setSosProcessing] = useState(false);

    useEffect(() => {
        fetchNearbyProviders();
    }, []);

    const handleCreateSOS = async (type) => {
        setSosProcessing(true);
        await createSOSRequest(type, "Acil yardım gerekiyor.");
        setSosProcessing(false);
        setShowSOSPanel(false);
    };

    // Harita üzerindeki noktaları simüle edelim (Gerçek veri yoksa mock kullan)
    const mapMarkers = nearbyProviders.length > 0 ? nearbyProviders : [
        { id: 1, full_name: "Yıldız Çekici", provider_type: "tow_truck", lat: 39.970, lng: 32.750, rating: 4.8 },
        { id: 2, full_name: "Maslak Usta", provider_type: "mechanic", lat: 39.965, lng: 32.745, rating: 4.9 },
        { id: 3, full_name: "Mobil Akü", provider_type: "mobile_fixer", lat: 39.962, lng: 32.755, rating: 4.7 }
    ];

    return (
        <div className="h-screen bg-slate-950 relative overflow-hidden text-white">
            {/* --- CUSTOM NEON MAP VIEW --- */}
            <div className="absolute inset-0 bg-[#060a12] overflow-hidden">
                {/* Simulated Map Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}></div>

                {/* Simulated Active Pulsing Glows */}
                <div className="absolute top-[30%] left-[40%] w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[120px] animate-pulse-slow"></div>

                {/* Map Pins */}
                {mapMarkers.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setSelectedProvider(m)}
                        className="absolute transition-all active-scale group z-10"
                        style={{
                            top: `${30 + (m.lat - 39.96) * 1000}%`,
                            left: `${40 + (m.lng - 32.74) * 1000}%`
                        }}
                    >
                        <div className={`relative p-3 rounded-2xl backdrop-blur-md border ${selectedProvider?.id === m.id ? 'bg-primary-500 border-white scale-125' : 'bg-slate-900/60 border-white/10'} shadow-2xl transition-all`}>
                            {m.provider_type === 'mechanic' && <Wrench size={18} />}
                            {m.provider_type === 'tow_truck' && <Truck size={18} />}
                            {m.provider_type === 'mobile_fixer' && <Zap size={18} />}

                            {/* Pulse effect */}
                            <div className="absolute -inset-1 bg-primary-500/20 rounded-full animate-ping pointer-events-none"></div>
                        </div>
                    </button>
                ))}

                {/* User Location Label */}
                <div
                    className="absolute z-20 transition-all"
                    style={{ top: '50%', left: '50%' }}
                >
                    <div className="relative">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-950">
                            <Navigation size={18} className="text-primary-600" />
                        </div>
                        <div className="absolute -inset-4 bg-primary-500/10 rounded-full animate-ping-slow"></div>
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 px-3 py-1 rounded-full border border-white/10 whitespace-nowrap shadow-xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Konumunuz</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- HEADER CONTROLS --- */}
            <div className="absolute top-6 left-5 right-5 z-30 flex gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center active-scale border border-white/10"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1 glass-card rounded-2xl border border-white/10 flex items-center px-4 backdrop-blur-3xl shadow-2xl">
                    <Search size={18} className="text-slate-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Usta veya Yol Yardım ara..."
                        className="bg-transparent border-none outline-none text-xs font-bold text-white w-full placeholder-slate-500"
                    />
                </div>
            </div>

            {/* SIMULATION BADGE */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full backdrop-blur-md">
                <p className="text-[9px] font-black uppercase tracking-widest text-yellow-500">✨ SİMÜLASYON MODU</p>
            </div>

            {/* --- SOS BUTTON --- */}
            <button
                onClick={() => setShowSOSPanel(true)}
                className="absolute bottom-32 right-5 z-30 w-16 h-16 bg-red-600 text-white rounded-[2rem] shadow-[0_0_30px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center active-scale border-4 border-white/20 group hover:bg-red-500 transition-all"
            >
                <AlertTriangle size={20} className="group-hover:animate-bounce" />
                <span className="text-[10px] font-black mt-1">SOS</span>
            </button>

            {/* --- PROVIDER DETAIL PANEL (Dynamic) --- */}
            {selectedProvider && (
                <div className="absolute bottom-10 left-5 right-5 z-40 animate-in slide-in-from-bottom-5">
                    <div className="glass-card bg-slate-900/80 backdrop-blur-3xl border border-white/20 p-5 rounded-[2.5rem] shadow-2xl">
                        <button onClick={() => setSelectedProvider(null)} className="absolute top-4 right-4 text-slate-500"><X size={20} /></button>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white border border-white/10 shadow-xl">
                                {selectedProvider.provider_type === 'tow_truck' ? <Truck size={32} /> : <Wrench size={32} />}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-lg italic uppercase tracking-tighter leading-none mb-1">
                                    {selectedProvider.full_name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Star size={14} className="fill-yellow-400" />
                                        <span className="text-xs font-bold">{selectedProvider.rating || '4.8'}</span>
                                    </div>
                                    <Badge type="info" className="text-[8px]">7/24 Aktif</Badge>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mesafe</p>
                                <p className="text-xs font-black text-emerald-400">1.2 KM</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="bg-slate-800 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active-scale border border-white/5">
                                <Phone size={18} /> ARA
                            </button>
                            <button onClick={() => navigate(`/messages/${selectedProvider.id || 'mock'}`)} className="bg-primary-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active-scale shadow-xl shadow-primary-900/20">
                                <MessageCircle size={18} /> MESAJ AT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SOS MODAL SYSTEM --- */}
            {showSOSPanel && (
                <div className="absolute inset-0 z-50 flex items-end animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-red-950/20 backdrop-blur-md" onClick={() => setShowSOSPanel(false)}></div>
                    <div className="w-full bg-slate-900 border-t-4 border-red-600 rounded-t-[3rem] p-8 pb-12 relative shadow-[0_-20px_100px_rgba(220,38,38,0.3)] z-10 animate-in slide-in-from-bottom-20 duration-500">
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 opacity-50"></div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-center mb-2">ACİL YARDIM ÇAĞRISI</h2>
                        <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-widest mb-10">Sorun nedir? Ekip 15 dakika içinde yanında.</p>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'engine_failure', label: "Motor Arızası", icon: AlertTriangle, color: "text-orange-500" },
                                { id: 'tow_truck', label: "Çekici Lazım", icon: Truck, color: "text-blue-500" },
                                { id: 'battery_dead', label: "Akü Bitti", icon: Zap, color: "text-yellow-500" },
                                { id: 'tire_puncture', label: "Lastik Patladı", icon: LocateFixed, color: "text-emerald-500" }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleCreateSOS(item.id)}
                                    className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all active-scale hover:bg-white/10 group"
                                >
                                    <div className={`p-4 rounded-2xl bg-slate-950/50 ${item.color} group-hover:scale-110 transition-transform shadow-inner`}>
                                        <item.icon size={32} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase">Resmi Carvis Güvencesi Altındasınız</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ACTIVE SOS STATUS --- */}
            {activeSOS && (
                <div className="absolute top-24 left-5 right-5 z-40">
                    <div className="bg-red-600 p-4 rounded-3xl shadow-2xl flex items-center justify-between border-2 border-white/20 animate-pulse">
                        <div className="flex items-center gap-3">
                            <Truck size={24} className="animate-bounce" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/70 leading-none mb-1">Yol Yardım Yolda</p>
                                <p className="text-xs font-bold">Ekip 4 dakika içinde yanınızda olacak.</p>
                            </div>
                        </div>
                        <button onClick={() => cancelSOS(activeSOS.id)} className="bg-white/20 p-2 rounded-xl text-xs font-black">X</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapScreen;
