import React from 'react';
import { Fuel, CreditCard, Droplet, ArrowLeft } from 'lucide-react';
import { ModernCard } from '../../components/Core';
import { FUEL_STATIONS } from '../../constants/mockData';
import { useUI } from '../../context/UIContext';
import { useNavigate } from 'react-router-dom';

const FuelScreen = () => {
    const { t } = useUI();
    const navigate = useNavigate();

    if (!t) return null;
    return (
        <div className="p-5 pb-32 space-y-6 min-h-screen bg-slate-950">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => navigate(-1)} className="p-2.5 glass-card rounded-xl text-white active-scale border border-white/10">
                    <ArrowLeft size={20} />
                </button>
                <h3 className="font-black text-2xl text-white italic">{t.fuelTitle || 'Yakıt İstasyonları'}</h3>
            </div>

            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden group hover:shadow-red-600/50 transition duration-500">
                <Fuel size={120} className="absolute -right-6 -bottom-6 text-white/20 group-hover:text-white/30 transition" />
                <p className="font-bold text-white/80">{t.payInCar}</p>
                <h2 className="text-3xl font-black mt-1">SmartPay</h2>
                <button className="mt-6 bg-white text-red-600 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-red-50 transition active:scale-95 flex items-center gap-2">
                    <CreditCard size={18} /> {t.pay}
                </button>
            </div>
            <h4 className="font-bold text-slate-800">{t.nearbyStations}</h4>
            {FUEL_STATIONS.map(s => (
                <ModernCard key={s.id} className="flex justify-between items-center border border-slate-100 shadow-md hover:shadow-lg hover:border-red-600">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-xl"><Droplet size={20} className="text-red-600" /></div>
                        <div><h4 className="font-bold text-slate-900">{s.name}</h4><p className="text-xs text-slate-500">{s.distance} • {s.type}</p></div>
                    </div>
                    <span className="font-black text-slate-900 text-lg">{s.price} ₺</span>
                </ModernCard>
            ))}
        </div>
    );
};

export default FuelScreen;
