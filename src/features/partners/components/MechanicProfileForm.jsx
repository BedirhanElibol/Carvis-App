import React, { useState } from "react";
import { Award, CheckCircle2, Plus, Users2, Wrench, X, Cpu, Car, Shield } from "lucide-react";

const VEHICLE_TYPES = [
  { id: "passenger", label: "Binek AraÃ§", emoji: "ğŸš—" },
  { id: "suv", label: "SUV / Arazi", emoji: "ğŸš™" },
  { id: "commercial", label: "Ticari AraÃ§", emoji: "ğŸš" },
  { id: "electric", label: "Elektrikli", emoji: "âš¡" },
  { id: "hybrid", label: "Hibrid", emoji: "ğŸ”‹" },
  { id: "motorcycle", label: "Motosiklet", emoji: "ğŸï¸" },
];

const DIAGNOSTIC_TOOLS = [
  "Bosch TeÅŸhis", "Launch TeÅŸhis", "Snap-on", "Autocom", "VCDS (VAG-COM)", "Ä°diag / Diagbox", "Piwis (Porsche)", "Star Diagnosis (Mercedes)",
];

const SPECIALTIES_OPTIONS = [
  "Periyodik BakÄ±m", "Fren Sistemi", "Motor / Mekanik", "Elektrik / Elektronik",
  "Kaporta / Boya", "Lastik / Rot Balans", "Klima / IsÄ±tma", "ÅanzÄ±man / Diferansiyel",
  "Hibrid / EV Sistemleri", "Turbosarj / KompresÃ¶r",
];

const MechanicProfileForm = ({ data, onUpdate }) => {
  const [mechanicData, setMechanicData] = useState({
    shop_name: data?.shop_name || "",
    brands: data?.brands || [],
    specialties: data?.specialties || [],
    experience_years: data?.experience_years || 5,
    working_hours: data?.working_hours || {
      mon: "09:00-18:00", tue: "09:00-18:00", wed: "09:00-18:00",
      thu: "09:00-18:00", fri: "09:00-18:00", sat: "09:00-14:00", sun: "closed",
    },
    technician_count: data?.technician_count || 1,
    is_authorized_service: data?.is_authorized_service ?? false,
    // Yeni alanlar
    accepted_vehicle_types: data?.accepted_vehicle_types || ["passenger"],
    diagnostic_tools: data?.diagnostic_tools || [],
    lift_count: data?.lift_count || 1,
    is_mobile_service: data?.is_mobile_service ?? false,
    warranty_policy_days: data?.warranty_policy_days || 30,
    service_location_type: data?.service_location_type || "at_shop",
  });

  const [newBrand, setNewBrand] = useState("");

  const handleChange = (field, value) => {
    const updated = { ...mechanicData, [field]: value };
    setMechanicData(updated);
    onUpdate(updated);
  };

  const addBrand = () => {
    if (newBrand && !mechanicData.brands.includes(newBrand)) {
      handleChange("brands", [...mechanicData.brands, newBrand]);
      setNewBrand("");
    }
  };

  const removeBrand = (brand) => {
    handleChange("brands", mechanicData.brands.filter((b) => b !== brand));
  };

  const toggleSpecialty = (spec) => {
    const current = mechanicData.specialties;
    handleChange("specialties", current.includes(spec) ? current.filter((s) => s !== spec) : [...current, spec]);
  };

  const toggleVehicleType = (typeId) => {
    const current = mechanicData.accepted_vehicle_types;
    handleChange("accepted_vehicle_types", current.includes(typeId) ? current.filter((t) => t !== typeId) : [...current, typeId]);
  };

  const toggleDiagTool = (tool) => {
    const current = mechanicData.diagnostic_tools;
    handleChange("diagnostic_tools", current.includes(tool) ? current.filter((t) => t !== tool) : [...current, tool]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-primary-400">
          <Wrench size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Teknik Servis Bilgileri</h2>
          <p className="text-sm text-slate-500 font-sans">UzmanlÄ±k alanlarÄ± ve marka yetkinlikleri</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Servis / Shop AdÄ±</span>
          <input
            type="text"
            value={mechanicData.shop_name}
            onChange={(e) => handleChange("shop_name", e.target.value)}
            className="w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none font-sans"
            placeholder="Ã–rn: Maslak Pro Garage"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Teknisyen SayÄ±sÄ±</span>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3">
            <Users2 size={18} className="text-primary-400" />
            <input
              type="number"
              value={mechanicData.technician_count}
              onChange={(e) => handleChange("technician_count", Number(e.target.value))}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none font-sans"
              min="1"
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Lift SayÄ±sÄ±</span>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3">
            <Car size={18} className="text-primary-400" />
            <input
              type="number"
              value={mechanicData.lift_count}
              onChange={(e) => handleChange("lift_count", Number(e.target.value))}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none font-sans"
              min="0"
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Standart Garanti (Gün)</span>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3">
            <Shield size={18} className="text-primary-400" />
            <input
              type="number"
              value={mechanicData.warranty_policy_days}
              onChange={(e) => handleChange("warranty_policy_days", Number(e.target.value))}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none font-sans"
              min="0"
            />
          </div>
        </label>

        {/* Saatlik İşçilik Ücreti (OEM Standart Tavan Hesabı İçin) */}
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-1.5">
            <Cpu size={14} /> Saatlik İşçilik Ücreti (TL/Saat)
          </span>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 border border-cyan-500/30 rounded-2xl px-4 py-3">
            <span className="text-sm font-black text-cyan-400 font-mono">₺</span>
            <input
              type="number"
              value={mechanicData.hourly_labor_rate || 1000}
              onChange={(e) => handleChange("hourly_labor_rate", Number(e.target.value))}
              className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white outline-none font-mono"
              placeholder="Örn: 1000"
              min="100"
              step="50"
            />
            <span className="text-xs text-slate-500 font-bold">TL / Saat</span>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold italic">
            * OEM fabrika standart saatleriyle çarpılarak teklif verirken azami tavan fiyatınızı belirler.
          </p>
        </label>

        {/* Servis Konumu */}
        <div className="md:col-span-2 space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Servis Konumu</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "at_shop", label: "Serviste" },
              { id: "at_customer", label: "MÃ¼ÅŸteride" },
              { id: "both", label: "Her Ä°kisi" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleChange("service_location_type", opt.id)}
                className={`px-3 py-2.5 rounded-xl text-[10px] font-bold border transition-all ${
                  mechanicData.service_location_type === opt.id
                    ? "bg-primary-600 border-primary-500 text-white"
                    : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-500"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Yetkili Servis Toggle */}
        <div className="flex flex-col justify-end">
          <button
            onClick={() => handleChange("is_authorized_service", !mechanicData.is_authorized_service)}
            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
              mechanicData.is_authorized_service
                ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                : "bg-slate-100 dark:bg-slate-800 border-black/5 dark:border-white/5 text-slate-500 hover:border-black/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <Award size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-left">Yetkili Servis</span>
            </div>
            {mechanicData.is_authorized_service && <CheckCircle2 size={16} className="text-blue-400" />}
          </button>
        </div>

        {/* Mobil Servis Toggle */}
        <div className="flex flex-col justify-end">
          <button
            onClick={() => handleChange("is_mobile_service", !mechanicData.is_mobile_service)}
            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
              mechanicData.is_mobile_service
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                : "bg-slate-100 dark:bg-slate-800 border-black/5 dark:border-white/5 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <Car size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-left">Yol BaÅŸÄ± BakÄ±m</span>
            </div>
            {mechanicData.is_mobile_service && <CheckCircle2 size={16} className="text-emerald-400" />}
          </button>
        </div>

        {/* Kabul Edilen AraÃ§ Tipleri */}
        <div className="md:col-span-2 space-y-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Kabul Edilen AraÃ§ Tipleri</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {VEHICLE_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => toggleVehicleType(type.id)}
                className={`p-2 rounded-xl text-center text-[10px] font-bold transition-all border ${
                  mechanicData.accepted_vehicle_types.includes(type.id)
                    ? "bg-primary-600 border-primary-500 text-white"
                    : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-500"
                }`}
              >
                <div className="text-base">{type.emoji}</div>
                <div>{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* UzmanlÄ±k AlanlarÄ± */}
        <div className="md:col-span-2 space-y-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">UzmanlÄ±k AlanlarÄ±</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {SPECIALTIES_OPTIONS.map((spec) => (
              <button
                key={spec}
                onClick={() => toggleSpecialty(spec)}
                className={`px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all border ${
                  mechanicData.specialties.includes(spec)
                    ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/20"
                    : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* TeÅŸhis CihazlarÄ± */}
        <div className="md:col-span-2 space-y-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <Cpu size={12} /> TeÅŸhis CihazlarÄ± (MÃ¼ÅŸteriye GÃ¼ven Sinyali)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DIAGNOSTIC_TOOLS.map((tool) => (
              <button
                key={tool}
                onClick={() => toggleDiagTool(tool)}
                className={`px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all border ${
                  mechanicData.diagnostic_tools.includes(tool)
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-400"
                    : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400"
                }`}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>

        {/* Hizmet Verilen Markalar */}
        <div className="md:col-span-2 space-y-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Hizmet Verilen Markalar</span>
          <div className="flex flex-wrap gap-2 mb-2">
            {mechanicData.brands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tighter"
              >
                {brand}
                <button onClick={() => removeBrand(brand)} className="text-slate-500 hover:text-red-400">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addBrand()}
              className="flex-1 bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none font-sans"
              placeholder="Marka ekle (Ã–rn: BMW)"
            />
            <button
              onClick={addBrand}
              className="bg-primary-600 text-slate-900 dark:text-white p-2 rounded-xl active-scale"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicProfileForm;
