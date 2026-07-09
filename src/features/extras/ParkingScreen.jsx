import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ParkingCircle, MapPin, Clock, Star, ChevronRight, Search, Filter } from "lucide-react";

const MOCK_LOTS = [
  {
    id: "p1",
    name: "Zorlu Center Otoparkı",
    address: "Zorlu Center, Beşiktaş/İstanbul",
    distance: "0.3 km",
    available: 42,
    total: 200,
    hourly: "₺45",
    rating: 4.8,
    open24: true,
    features: ["Kapalı", "Güvenlikli", "Engelli Erişimli"],
  },
  {
    id: "p2",
    name: "İstanbul Park AVM",
    address: "Ataşehir, İstanbul",
    distance: "1.2 km",
    available: 8,
    total: 350,
    hourly: "₺25",
    rating: 4.5,
    open24: false,
    features: ["Açık", "Kameralı"],
  },
  {
    id: "p3",
    name: "Beşiktaş Meydanı Otoparkı",
    address: "Çarşı Cad. Beşiktaş/İstanbul",
    distance: "0.8 km",
    available: 0,
    total: 80,
    hourly: "₺30",
    rating: 4.2,
    open24: true,
    features: ["Kapalı", "EV Şarj"],
  },
  {
    id: "p4",
    name: "Levent Metro Parkı",
    address: "Levent, Beşiktaş/İstanbul",
    distance: "2.1 km",
    available: 115,
    total: 300,
    hourly: "₺20",
    rating: 4.6,
    open24: true,
    features: ["Kapalı", "Güvenlikli", "EV Şarj", "Yıkama"],
  },
];

export default function ParkingScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = MOCK_LOTS.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#0a0f24]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-5 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Otopark Bul</h1>
            <p className="text-[10px] text-slate-500 font-medium">Çevrenizdeki müsait otoparklar</p>
          </div>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Otopark veya semt ara..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-sm border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        {[
          { label: "Toplam", value: filtered.length, color: "text-slate-900 dark:text-white" },
          { label: "Müsait", value: filtered.filter((l) => l.available > 0).length, color: "text-emerald-500" },
          { label: "Dolu", value: filtered.filter((l) => l.available === 0).length, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#0a0f24]/85 border border-black/5 dark:border-white/5 rounded-2xl p-3 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="px-5 space-y-4">
        {filtered.map((lot) => {
          const pct = Math.round((lot.available / lot.total) * 100);
          const statusColor =
            lot.available === 0
              ? "text-red-500 bg-red-500/10"
              : lot.available < 20
              ? "text-amber-500 bg-amber-500/10"
              : "text-emerald-500 bg-emerald-500/10";

          return (
            <div
              key={lot.id}
              className="bg-white dark:bg-[#0a0f24]/85 border border-black/5 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <ParkingCircle size={22} className="text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white">{lot.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={10} /> {lot.address}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {lot.features.map((f) => (
                        <span key={f} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-600 dark:text-slate-400">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-base text-slate-900 dark:text-white">{lot.hourly}<span className="text-[10px] text-slate-400 font-normal">/sa</span></p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{lot.rating}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-slate-500 font-medium">Doluluk Oranı</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusColor}`}>
                      {lot.available === 0 ? "DOLU" : `${lot.available} boş`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct === 0 ? "bg-red-500" : pct < 20 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${100 - pct}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <Clock size={11} />
                  {lot.open24 ? "7/24" : "08:00–22:00"}
                </div>
                <button className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1">
                  {lot.available === 0 ? "Yol Tarifi" : "Rezerve Et"} <ChevronRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
