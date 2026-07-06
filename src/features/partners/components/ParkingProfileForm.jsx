import React, { useState } from "react";
import { Accessibility, Camera, ShieldCheck, SquareParking, Tag, UserCheck, Warehouse, Zap } from "lucide-react";

const ParkingProfileForm = ({ data, onUpdate }) => {
  const [parkingData, setParkingData] = useState({
    parking_name: data?.parking_name || "",
    total_capacity: data?.total_capacity || 0,
    occupied_count: data?.occupied_count || 0,
    price_per_hour: data?.price_per_hour || 0,
    is_indoor: data?.is_indoor ?? true,
    has_security: data?.has_security ?? true,
    has_valet: data?.has_valet ?? false,
    has_ev_charging: data?.has_ev_charging ?? false,
    has_disabled_access: data?.has_disabled_access ?? false,
    has_security_cams: data?.has_security_cams ?? true,
    address_text: data?.address_text || "",
    city: data?.city || "",
  });

  const handleChange = (field, value) => {
    const updated = { ...parkingData, [field]: value };
    setParkingData(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-primary-400">
          <SquareParking size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Otopark İşletme Bilgileri</h2>
          <p className="text-sm text-slate-500 font-sans">Kapasite ve tesis özellikleri yönetimi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="md:col-span-2 space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Otopark Adı</span>
          <input
            type="text"
            value={parkingData.parking_name}
            onChange={(e) => handleChange("parking_name", e.target.value)}
            className="w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none font-sans"
            placeholder="Örn: Merkez AVM Kapalı Otopark"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Saatlik Ücret</span>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3">
            <Tag size={18} className="text-primary-400" />
            <input
              type="number"
              value={parkingData.price_per_hour}
              onChange={(e) => handleChange("price_per_hour", Number(e.target.value))}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none font-sans"
            />
            <span className="text-xs text-slate-500 font-bold uppercase">TRY</span>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Toplam Kapasite</span>
            <input
              type="number"
              value={parkingData.total_capacity}
              onChange={(e) => handleChange("total_capacity", Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none font-sans text-center"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Dolu Araç</span>
            <input
              type="number"
              value={parkingData.occupied_count}
              onChange={(e) => handleChange("occupied_count", Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900/80 border border-emerald-500/20 text-teal-400 rounded-2xl px-4 py-3 text-sm outline-none font-sans text-center"
            />
          </label>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: "is_indoor", label: "Kapalı", icon: Warehouse },
            { key: "has_security", label: "Güvenlik", icon: ShieldCheck },
            { key: "has_security_cams", label: "Kamera", icon: Camera },
            { key: "has_ev_charging", label: "Şarj (EV)", icon: Zap },
            { key: "has_disabled_access", label: "Engelli", icon: Accessibility },
            { key: "has_valet", label: "Vale", icon: UserCheck },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleChange(item.key, !parkingData[item.key])}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 text-center group ${
                parkingData[item.key]
                  ? "bg-primary-500/10 border-primary-500/40 text-primary-400"
                  : "bg-slate-100 dark:bg-slate-800/50 border-black/5 dark:border-white/5 text-slate-500 hover:border-black/10 dark:border-white/10"
              }`}
            >
              <item.icon size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>

        <label className="md:col-span-2 space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Otopark Adresi</span>
          <textarea
            value={parkingData.address_text}
            onChange={(e) => handleChange("address_text", e.target.value)}
            className="w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-3xl px-6 py-4 text-sm text-slate-900 dark:text-white outline-none min-h-[80px] font-sans resize-none"
            placeholder="Sokak, Mahalle ve Kapı No..."
          />
        </label>
      </div>
    </div>
  );
};

export default ParkingProfileForm;
