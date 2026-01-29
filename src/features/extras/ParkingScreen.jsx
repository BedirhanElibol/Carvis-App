import React from 'react';
import { ParkingCircle, Navigation, ArrowLeft, Clock, MapPin } from 'lucide-react';
import { PARKING_SPOTS } from '../../constants/mockData';
import { useUI } from '../../context/UIContext';
import { useNavigate } from 'react-router-dom';

const ParkingScreen = () => {
    const { t } = useUI();
    const navigate = useNavigate();

    if (!t) return null;

    const openDirections = (lat, lng) => {
        window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
    };

    // API Key Check
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const mapUrl = GOOGLE_MAPS_API_KEY
        ? `https://maps.googleapis.com/maps/api/staticmap?center=41.02,29.00&zoom=13&size=600x300&sensor=false&key=${GOOGLE_MAPS_API_KEY}`
        : null;

    return (
        <div className="p-5 pb-32 space-y-6 min-h-screen bg-slate-950">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => navigate(-1)} className="p-2.5 glass-card rounded-xl text-white active-scale border border-white/10">
                    <ArrowLeft size={20} />
                </button>
                <h3 className="font-black text-2xl text-white italic flex items-center gap-2">
                    <ParkingCircle size={28} className="text-blue-500" /> {t.parkingTitle || 'Yakın Otoparklar'}
                </h3>
            </div>

            {/* Map Preview */}
            <div className="h-48 glass-card rounded-[2rem] relative overflow-hidden border border-white/10">
                {mapUrl ? (
                    <div className="absolute inset-0 bg-cover opacity-40" style={{ backgroundImage: `url('${mapUrl}')` }}></div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-40"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Konumunuz</p>
                        <p className="text-white font-bold flex items-center gap-2"><MapPin size={14} className="text-blue-400" /> Kadıköy, İstanbul</p>
                    </div>
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs">{PARKING_SPOTS.length} Otopark</div>
                </div>
            </div>

            {/* Parking List */}
            <div className="space-y-3">
                {PARKING_SPOTS.map(p => (
                    <div key={p.id} className="glass-card p-4 rounded-2xl border border-white/10 flex justify-between items-center active-scale cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.occupancy > 90 ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                                <ParkingCircle size={24} className={p.occupancy > 90 ? 'text-red-400' : 'text-blue-400'} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{p.name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <Clock size={10} /> {p.distance}
                                    </span>
                                    <span className="text-[10px] text-primary-400 font-bold">{p.price}</span>
                                </div>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${p.occupancy > 90 ? 'bg-red-500' : p.occupancy > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            style={{ width: `${p.occupancy}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-[9px] font-black ${p.occupancy > 90 ? 'text-red-400' : 'text-green-400'}`}>
                                        %{p.occupancy} Dolu
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => openDirections(p.lat, p.lng)}
                            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-900/50 active-scale"
                        >
                            <Navigation size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParkingScreen;
