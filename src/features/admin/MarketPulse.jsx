import React, { useEffect, useState } from 'react';
import { Fuel, TrendingUp } from 'lucide-react';
import { useExternalData } from '../../hooks/useExternalData';

const MarketPulse = () => {
    const { fetchFuelPrices } = useExternalData();
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPrices = async () => {
            const data = await fetchFuelPrices();
            if (data && data.results) {
                setPrices(data.results);
            }
            setLoading(false);
        };
        loadPrices();
    }, [fetchFuelPrices]);

    if (loading) return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 h-full relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-600/20 transition-all duration-700"></div>

            <h3 className="font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <Fuel size={20} className="text-orange-500" /> Piyasa Nabzı
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full ml-auto">İstanbul</span>
            </h3>

            <div className="space-y-4 relative z-10">
                {prices.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between items-center group/item">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-[10px] group-hover/item:text-white group-hover/item:bg-slate-700 transition-colors">
                                {item.name.substring(0, 1)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{item.name}</p>
                                <p className="text-[10px] text-slate-500">Litre Fiyatı</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-white text-lg tracking-tight">
                                ₺{Number(item.price).toFixed(2)}
                            </p>
                            <p className="text-[10px] text-green-500 font-bold flex items-center justify-end gap-1">
                                <TrendingUp size={10} /> Güncel
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 text-center">
                    Veriler CollectAPI üzerinden anlık sağlanmaktadır.
                </p>
            </div>
        </div>
    );
};

export default MarketPulse;
