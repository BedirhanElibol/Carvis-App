import React, { useState } from 'react';
import { ParkingCircle, Save, Power } from 'lucide-react';
import { useUI } from '../../../context/UIContext';

const ParkingCapacity = () => {
    const { showAlert } = useUI();
    const [capacity, setCapacity] = useState(100);
    const [occupancy, setOccupancy] = useState(45);
    const [isOpen, setIsOpen] = useState(true);
    const [price, setPrice] = useState(50);
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        // Mock API call
        setTimeout(() => {
            setLoading(false);
            showAlert('Başarılı', 'Otopark durumu güncellendi.', 'success');
        }, 1000);
    };

    const occupancyPercent = Math.round((occupancy / capacity) * 100);

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter text-white">Otopark Yönetimi</h1>
                    <p className="text-slate-400 text-sm">Kapasite ve fiyat ayarları</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isOpen ? 'AÇIK' : 'KAPALI'}
                </div>
            </div>

            {/* Occupancy Card */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 bg-primary-600/10 transition-all duration-1000" style={{ width: `${occupancyPercent}%` }}></div>

                <div className="relative z-10 text-center py-6">
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-2">DOLULUK ORANI</p>
                    <p className="text-6xl font-black text-white">{occupancyPercent}%</p>
                    <p className="text-sm text-slate-500 mt-2">{occupancy} / {capacity} Araç</p>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Anlık Doluluk ({occupancy})</label>
                    <input
                        type="range"
                        min="0"
                        max={capacity}
                        value={occupancy}
                        onChange={(e) => setOccupancy(Number(e.target.value))}
                        className="w-full h-4 bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary-500 hover:accent-primary-400 transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Kapasite</label>
                        <input
                            type="number"
                            value={capacity}
                            onChange={(e) => setCapacity(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-primary-500 focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Saatlik Ücret (TL)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-primary-500 focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="pt-4 flex gap-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex-1 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active-scale ${isOpen ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                    >
                        <Power size={20} />
                        {isOpen ? 'KAPAT' : 'AÇ'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-[2] bg-primary-600 hover:bg-primary-500 text-white p-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary-900/50 active-scale disabled:opacity-50 transition-all"
                    >
                        <Save size={20} />
                        {loading ? 'KAYDEDİLİYOR...' : 'GÜNCELLE'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParkingCapacity;
