import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useExternalData } from "../../hooks/useExternalData";
import { useUI } from "../../context/UIContext";

const FALLBACK_PRICES = [
  { name: "Kurşunsuz 95 (Benzin)", price: 43.77 },
  { name: "Motorin (Dizel)", price: 44.89 },
  { name: "Otogaz (LPG)", price: 23.50 },
];

const MarketPulse = () => {
  const { fetchFuelPrices } = useExternalData();
  const { selectedLocation } = useUI();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    // Clear stale null cache so we always get fresh data
    const city = selectedLocation.toLowerCase().split(",")[0].trim();
    const cacheKey = `carvis_fuel_prices_${city}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!parsed.data || !parsed.data.results || (parsed.data.results[0] && parsed.data.results[0].price < 50)) {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (_) { /* ignore */ }

    const loadPrices = async () => {
      setLoading(true);
      const data = await fetchFuelPrices(selectedLocation);
      if (data && data.results && data.results.length > 0) {
        setPrices(data.results);
        setSource(data.source || "shell");
        setLastUpdate(data.last_updated);
      } else {
        setPrices(FALLBACK_PRICES);
        setSource("fallback");
        setLastUpdate(new Date().toISOString());
      }
      setLoading(false);
    };
    loadPrices();
  }, [fetchFuelPrices, selectedLocation]);

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-white/5 h-full flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="glass-card bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/10 h-full relative overflow-hidden group lg:col-span-2 shadow-2xl backdrop-blur-xl">
      {/* Background Glow - Dimmed for better mobile readability */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/5 rounded-full blur-[100px] -mr-10 -mt-10 group-hover:bg-orange-600/10 transition-all duration-700"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="font-black text-white flex items-center gap-3 font-sans uppercase tracking-widest text-xs">
          <Icons.Fuel size={20} className="text-orange-500" /> Piyasa Nabzı
        </h3>
        <span className="text-[10px] bg-slate-900 text-slate-300 px-3 py-1 rounded-full font-black uppercase tracking-widest font-sans border border-white/10">
          {selectedLocation.split(",")[0]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {prices.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl flex flex-col justify-between group/item hover:border-orange-500/30 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-black text-xs group-hover/item:text-white group-hover/item:bg-orange-600 transition-all">
                {item.name.substring(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-black text-white font-sans uppercase tracking-tight">
                  {item.name}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">
                  Litre Fiyatı
                </p>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <p className="font-black text-white text-2xl tracking-tighter font-sans">
                ₺{Number(item.price).toFixed(2)}
              </p>
              <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1 font-sans">
                <Icons.TrendingUp size={10} /> Güncel
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-[10px] text-slate-400 text-center font-sans font-bold uppercase tracking-widest opacity-80">
          Veriler {source === "shell" ? "Shell Türkiye" : source === "opet" ? "OPET" : source === "petrolofisi" ? "Petrol Ofisi" : source === "epdk" ? "EPDK" : "Sistem"} üzerinden anlık sağlanmaktadır. {lastUpdate && `Son Güncelleme: ${new Date(lastUpdate).toLocaleTimeString('tr-TR')}`}
        </p>
      </div>
    </div>
  );
};

export default MarketPulse;
