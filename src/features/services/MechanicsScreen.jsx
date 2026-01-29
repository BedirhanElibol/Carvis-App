import React, { useState } from 'react';
import { ChevronLeft, MapPin, ShieldCheck } from 'lucide-react';
import VehicleDemandForm from '../garage/VehicleDemandForm';
import { SpecialistCard } from '../../components/Core';
import { MECHANICS } from '../../constants/mockData';
import { useUI } from '../../context/UIContext';
import { useGarage } from '../../context/GarageContext';
import { useLocation } from 'react-router-dom';

const MechanicsScreen = () => {
    const { t } = useUI();
    const { currentVehicle } = useGarage();
    const location = useLocation();
    const [specialFlow, setSpecialFlow] = useState(location.state?.flow || null);
    const [isMapView, setIsMapView] = useState(false);

    // API Key Check
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const mapUrl = GOOGLE_MAPS_API_KEY
        ? `https://maps.googleapis.com/maps/api/staticmap?center=39.93,32.85&zoom=10&size=600x600&sensor=false&key=${GOOGLE_MAPS_API_KEY}`
        : null;

    if (!t) return null;

    if (specialFlow === 'maintenance') {
        return (
            <div className="p-5 pb-32 animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setSpecialFlow(null)} className="p-2.5 glass-card rounded-xl text-slate-400 active-scale border border-white/10">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h3 className="font-black text-2xl text-white italic tracking-tighter">AKILLI TEKLİF TOPLA</h3>
                        <p className="text-[10px] text-primary-500 font-black uppercase tracking-widest">Hızlı & Güvenilir Fiyat Al</p>
                    </div>
                </div>

                <VehicleDemandForm
                    vehicle={currentVehicle}
                    initialDemandType="service"
                    initialDescription={`Periyodik Bakım Talebi: ${currentVehicle?.brand} ${currentVehicle?.model} aracım için en uygun bakım paketini ve usta tekliflerini bekliyorum.`}
                    onSubmit={async (data) => {
                        // Simulate submission
                        // alert("Teklif talebiniz sisteme iletildi! Ustalar 15 dk içinde size dönecek.");
                        // Use UI Alert mechanism if available, or just console log for now as alert is blocking
                        console.log("Demand submitted", data);
                        setSpecialFlow(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="p-5 pb-32 space-y-6 animate-fade-in relative">
            <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-accent-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-3xl text-white italic tracking-tighter">{t.mechanics}</h3>
                <div className="glass-card p-1.5 rounded-2xl flex gap-1 shadow-2xl border border-white/10 backdrop-blur-xl">
                    <button onClick={() => setIsMapView(false)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all active-scale ${!isMapView ? 'bg-primary-600 shadow-lg text-white' : 'text-slate-500 hover:text-white'}`}>{t.listView}</button>
                    <button onClick={() => setIsMapView(true)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all active-scale ${isMapView ? 'bg-primary-600 shadow-lg text-white' : 'text-slate-500 hover:text-white'}`}>{t.mapView}</button>
                </div>
            </div>

            {isMapView ? (
                <div className="h-[60vh] glass-card rounded-[3rem] flex items-center justify-center relative overflow-hidden group shadow-2xl border border-white/5 mx-1">
                    {/* Map Background or Fallback */}
                    {mapUrl ? (
                        <div className="absolute inset-0 bg-cover opacity-30 group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: `url('${mapUrl}')` }}></div>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 opacity-50"></div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                    <div className="relative z-10 glass-card p-8 rounded-[2.5rem] text-center shadow-2xl backdrop-blur-2xl border border-white/10 animate-slide-up">
                        <div className="w-16 h-16 bg-accent-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-500/20">
                            <MapPin size={32} className="text-accent-500" />
                        </div>
                        <p className="font-black text-white italic text-xl tracking-tighter mb-1">RADAR AKTİF</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">En Yakın Ustalar Taranıyor...</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Sort by priority: 1. Specialists for user's car brand 2. General */}
                    {[...MECHANICS].sort((a, b) => {
                        const aSpecialist = currentVehicle && a.brands?.includes(currentVehicle.brand);
                        const bSpecialist = currentVehicle && b.brands?.includes(currentVehicle.brand);
                        if (aSpecialist && !bSpecialist) return -1;
                        if (!aSpecialist && bSpecialist) return 1;
                        return 0;
                    }).map(m => {
                        const isBrandSpecialist = currentVehicle && m.brands?.includes(currentVehicle.brand);
                        return (
                            <div key={m.id} className="relative">
                                {isBrandSpecialist && (
                                    <div className="absolute -top-2 left-6 z-10 bg-accent-600 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-lg border border-accent-400/20 uppercase tracking-widest flex items-center gap-1.5 animate-bounce-subtle">
                                        <ShieldCheck size={10} /> {currentVehicle.brand} UZMANI
                                    </div>
                                )}
                                <SpecialistCard specialist={m} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MechanicsScreen;
