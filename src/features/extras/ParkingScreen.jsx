import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { useUI } from "../../context/UIContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const ParkingScreen = () => {
  const { t, showAlert } = useUI();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    const fetchParkingSpots = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("parking_profiles")
        .select("*, profiles(full_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSpots(
          data.map((p) => ({
            id: p.id,
            name: p.parking_name || p.profiles?.full_name || "Otopark",
            price: p.price_per_hour ? `${p.price_per_hour} ₺/saat` : "Belirtilmedi",
            occupancy: p.total_capacity > 0
              ? Math.round((p.occupied_count / p.total_capacity) * 100)
              : 0,
            totalCapacity: p.total_capacity,
            occupiedCount: p.occupied_count,
            isIndoor: p.is_indoor,
            hasSecurity: p.has_security,
            hasValet: p.has_valet,
            city: p.city,
            address: p.address_text,
          }))
        );
      }
      setLoading(false);
    };

    fetchParkingSpots();
  }, []);

  if (!t) return null;

  // API Key Check
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapUrl = GOOGLE_MAPS_API_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=41.02,29.00&zoom=13&size=600x300&sensor=false&key=${GOOGLE_MAPS_API_KEY}`
    : null;

  return (
    <div className="p-5 pb-32 space-y-6 min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 glass-card rounded-xl text-slate-900 dark:text-white active-scale border border-black/10 dark:border-white/10"
        >
          <Icons.ArrowLeft size={20} />
        </button>
        <h3 className="font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
          <Icons.ParkingCircle size={28} className="text-blue-500" />
          {t.parkingTitle || "Yakın Otoparklar"}
        </h3>
      </div>

      {/* Map Preview */}
      <div className="h-48 glass-card rounded-[2rem] relative overflow-hidden border border-black/10 dark:border-white/10">
        {mapUrl ? (
          <div
            className="absolute inset-0 bg-cover opacity-40"
            style={{ backgroundImage: `url('${mapUrl}')` }}
          ></div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-40"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
              Kayıtlı Otoparklar
            </p>
            <p className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
              <Icons.MapPin size={14} className="text-blue-400" />
              {spots.length > 0 ? spots[0].city || "Türkiye" : "Türkiye"}
            </p>
          </div>
          <div className="bg-blue-600 text-slate-900 dark:text-white px-4 py-2 rounded-xl font-bold text-xs">
            {spots.length} Otopark
          </div>
        </div>
      </div>

      {/* Parking List */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Icons.RefreshCw className="animate-spin text-blue-500" size={32} />
        </div>
      ) : spots.length === 0 ? (
        <div className="text-center py-16">
          <Icons.ParkingCircle size={48} className="text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500">Yakınlarda kayıtlı otopark bulunamadı.</p>
          <p className="text-xs text-slate-600 mt-1">Otopark işletmeleri sisteme kaydoldukça burada listelenecektir.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {spots.map((p) => (
            <div
              key={p.id}
              className="glass-card p-4 rounded-2xl border border-black/10 dark:border-white/10 flex justify-between items-center active-scale cursor-pointer group animate-in fade-in slide-in-from-bottom-4"
              onClick={() => showAlert("Detay", `${p.name} — ${p.address || "Adres belirtilmedi"}`, "info")}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.occupancy > 90 ? "bg-red-500/20" : "bg-blue-500/20"}`}
                >
                  <Icons.ParkingCircle
                    size={24}
                    className={
                      p.occupancy > 90 ? "text-red-400" : "text-blue-400"
                    }
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{p.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Icons.Layers size={10} /> {p.occupiedCount}/{p.totalCapacity} Araç
                    </span>
                    <span className="text-[10px] text-primary-400 font-bold">
                      {p.price}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${p.occupancy > 90 ? "bg-red-500" : p.occupancy > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${p.occupancy}%` }}
                      ></div>
                    </div>
                    <span
                      className={`text-[9px] font-black ${p.occupancy > 90 ? "text-red-400" : "text-green-400"}`}
                    >
                      %{p.occupancy} Dolu
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {p.isIndoor && (
                  <span className="text-[8px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg font-bold">KAPALI</span>
                )}
                {p.hasSecurity && (
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg font-bold">GÜVENLİK</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParkingScreen;
