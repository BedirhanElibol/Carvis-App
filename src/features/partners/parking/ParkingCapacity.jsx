import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { useUI } from "../../../context/UIContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../supabaseClient";

const ParkingCapacity = () => {
  const { showAlert } = useUI();
  const { currentUser } = useAuth();
  
  const [capacity, setCapacity] = useState(100);
  const [occupancy, setOccupancy] = useState(45);
  const [isOpen, setIsOpen] = useState(true);
  const [price, setPrice] = useState(50);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("parking_profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();
        if (!error && data) {
          setCapacity(data.total_capacity ?? 100);
          setOccupancy(data.occupied_count ?? 0);
          setPrice(data.price_per_hour ?? 0);
          setIsOpen(data.is_open ?? true);
        }
      } catch (err) {
        console.error("Load parking profile error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("parking_profiles")
        .update({
          total_capacity: capacity,
          occupied_count: occupancy,
          price_per_hour: price,
          is_open: isOpen,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentUser.id);

      if (error) throw error;
      showAlert("Başarılı", "Otopark durumu güncellendi.", "success");
    } catch (err) {
      console.error("Save parking error:", err);
      showAlert("Hata", "Otopark durumu güncellenemedi.", "error");
    } finally {
      setLoading(false);
    }
  };

  const occupancyPercent = Math.round((occupancy / capacity) * 100);

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white font-sans uppercase">
            Otopark Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-sans">
            Kapasite ve fiyat ayarları
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-black uppercase font-sans ${isOpen ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
        >
          {isOpen ? "AÇIK" : "KAPALI"}
        </div>
      </div>

      {/* Occupancy Card */}
      <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 bottom-0 bg-primary-600/10 transition-all duration-1000"
          style={{ width: `${occupancyPercent}%` }}
        ></div>
        <div className="relative z-10 text-center py-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-2 font-sans">
            DOLULUK ORANI
          </p>
          <p className="text-6xl font-black text-slate-900 dark:text-white font-sans">
            {occupancyPercent}%
          </p>
          <p className="text-sm text-slate-500 mt-2 font-sans">
            {occupancy} / {capacity} Araç
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider font-sans">
            Anlık Doluluk ({occupancy})
          </label>
          <input
            type="range"
            min="0"
            max={capacity}
            value={occupancy}
            onChange={(e) => setOccupancy(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary-500 hover:accent-primary-400 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase font-sans">
              Kapasite
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-mono focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase font-sans">
              Saatlik Ücret (TL)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-mono focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex-1 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active-scale font-sans ${
              isOpen
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
            }`}
          >
            <Icons.Power size={20} />
            {isOpen ? "KAPAT" : "AÇ"}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-[2] bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white p-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary-900/50 active-scale disabled:opacity-50 transition-all font-sans"
          >
            <Icons.Save size={20} />
            {loading ? "KAYDEDİLİYOR..." : "GÜNCELLE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParkingCapacity;
