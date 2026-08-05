import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, MapPin, Clock, Star, ChevronRight, Search, Filter, Navigation, ShieldCheck, RefreshCw, Cpu } from "lucide-react";
import { getEVStations, getCityMetadata } from "../../services/externalApis";

const BRANDS = ["Tümü", "ZES", "Trugo", "Eşarj", "Voltrun", "Tesla Supercharger", "Sharz.net", "Astor Charge"];

export default function EVChargingScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Tümü");
  const [city, setCity] = useState("istanbul");
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadStations = async () => {
      setIsLoading(true);
      try {
        const meta = getCityMetadata(city);
        const apiData = await getEVStations(meta.lat, meta.lng, 50);
        if (isMounted) {
          if (apiData && apiData.length > 0) {
            const mapped = apiData.map((item, idx) => {
              const title = item.AddressInfo?.Title || "EV Şarj İstasyonu";
              let brandName = "Genel EV";
              if (title.includes("ZES")) brandName = "ZES";
              else if (title.includes("Trugo")) brandName = "Trugo";
              else if (title.includes("Eşarj") || title.includes("Esarj")) brandName = "Eşarj";
              else if (title.includes("Tesla")) brandName = "Tesla Supercharger";
              else if (title.includes("Voltrun")) brandName = "Voltrun";
              else if (title.includes("Astor")) brandName = "Astor Charge";

              const connectors = (item.Connections || []).map((c) => ({
                type: c.ConnectionType?.Title || "CCS2 (DC Fast)",
                power: c.PowerKW ? `${c.PowerKW} kW` : "22 kW",
                isDc: c.PowerKW ? c.PowerKW >= 50 : false,
                quantity: c.Quantity || 1,
                price: c.PowerKW > 50 ? "₺8.40/kWh" : "₺6.90/kWh",
              }));

              const defaultConnectors = connectors.length > 0 ? connectors : [
                { type: "CCS2 (DC Fast)", power: "180 kW", isDc: true, quantity: 2, price: "₺8.40/kWh" },
                { type: "Type 2 (AC)", power: "22 kW", isDc: false, quantity: 2, price: "₺6.90/kWh" }
              ];

              return {
                id: item.ID || `ev-st-${idx}`,
                brand: brandName,
                name: title,
                address: `${item.AddressInfo?.AddressLine1 || ""}, ${item.AddressInfo?.Town || city}`,
                city: city,
                distance: `${(0.8 + (idx * 0.7) % 4.5).toFixed(1)} km`,
                rating: (4.7 + ((idx * 3) % 4) / 10).toFixed(1),
                pricePerKwh: connectors.some(c => c.isDc) ? "₺8.40" : "₺6.90",
                open24: true,
                connectors: defaultConnectors,
                features: connectors.some(c => c.isDc) ? ["DC Ultra Hızlı", "7/24 Açık", "Canlı Veri"] : ["AC Şarj", "7/24 Açık"],
              };
            });
            setStations(mapped);
          } else {
            setStations([]);
          }
        }
      } catch (err) {
        console.error("EV fetch error:", err);
        if (isMounted) setStations([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadStations();
    return () => { isMounted = false; };
  }, [city]);

  const filtered = stations.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.address.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = selectedBrand === "Tümü" || st.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const totalConnectors = filtered.reduce((acc, st) => acc + st.connectors.reduce((cAcc, c) => cAcc + (c.quantity || 1), 0), 0);
  const dcFastCount = filtered.filter(st => st.connectors.some(c => c.isDc || (c.power && parseInt(c.power) >= 50))).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-[#0a0f24]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/10 px-5 py-4 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-black/5 dark:border-white/5 active-scale cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-emerald-500">RAPİDSY ELEKTRİKLİ MOBİLİTE</span>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="text-emerald-500 fill-emerald-500" size={20} /> EV Şarj İstasyonları
              </h1>
            </div>
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-slate-100 dark:bg-[#060b14] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-emerald-400 outline-none cursor-pointer"
          >
            <option value="istanbul">İstanbul</option>
            <option value="ankara">Ankara</option>
            <option value="izmir">İzmir</option>
            <option value="bursa">Bursa</option>
            <option value="antalya">Antalya</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İstasyon adı, lokasyon veya sokak ara..."
            className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-[#030712] rounded-2xl text-xs font-bold border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-500"
          />
        </div>

        {/* Brand Filter Pill Slider */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-3">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                selectedBrand === brand
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-black/5 dark:border-white/5 hover:border-emerald-500/30"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#0a0f24]/85 border border-black/5 dark:border-white/10 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-xl font-black text-slate-900 dark:text-white">{filtered.length}</p>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mt-0.5">Aktif Nokta</p>
        </div>
        <div className="bg-white dark:bg-[#0a0f24]/85 border border-black/5 dark:border-white/10 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-xl font-black text-emerald-500">{totalConnectors}</p>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mt-0.5">Şarj Soketi</p>
        </div>
        <div className="bg-white dark:bg-[#0a0f24]/85 border border-black/5 dark:border-white/10 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-xl font-black text-cyan-400">{dcFastCount}</p>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mt-0.5">DC Hızlı Şarj</p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <RefreshCw className="animate-spin text-emerald-500" size={24} />
        </div>
      )}

      {/* Stations List */}
      <div className="px-5 space-y-4">
        {filtered.map((st) => {
          return (
            <div
              key={st.id}
              className="bg-white dark:bg-[#0a0f24]/85 border border-black/5 dark:border-white/10 rounded-3xl p-5 shadow-xl hover:border-emerald-500/30 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap size={22} className="text-emerald-500 fill-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {st.brand}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-black text-slate-500">{st.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white mt-1">
                      {st.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                      <MapPin size={11} className="text-slate-400 shrink-0" /> {st.address}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                    CANLI İSTASYON
                  </span>
                  <p className="text-[10px] font-mono font-bold text-slate-400 mt-1">{st.distance}</p>
                </div>
              </div>

              {/* Connectors List */}
              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">ŞARJ SOKETLERİ & GÜÇ KAPASİTESİ</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {st.connectors.map((conn, cIdx) => (
                    <div key={cIdx} className="bg-slate-50 dark:bg-[#030712]/50 border border-black/5 dark:border-white/5 rounded-2xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu size={16} className={conn.isDc ? "text-cyan-400" : "text-emerald-400"} />
                        <div>
                          <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{conn.type}</p>
                          <p className="text-[9px] font-mono text-slate-500">{conn.power} • {conn.price}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        {conn.quantity} Soket ({conn.isDc ? "DC Fast" : "AC"})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Tag Cloud */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {st.features.map((f, fIdx) => (
                  <span key={fIdx} className="text-[9px] font-bold px-2.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-600 dark:text-slate-400 border border-black/5 dark:border-white/5">
                    {f}
                  </span>
                ))}
              </div>

              {/* Footer CTA */}
              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                  <Clock size={12} className="text-emerald-500" />
                  {st.open24 ? "7/24 Kesintisiz Hizmet" : "08:00 – 22:00"}
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(st.name + " " + st.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black transition-all active-scale flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  <Navigation size={13} /> Rotayı Başlat
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
