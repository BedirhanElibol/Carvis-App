import React, { useState } from "react";
import * as Icons from "lucide-react";

const MechanicProfileForm = ({ data, onUpdate }) => {
  const [mechanicData, setMechanicData] = useState({
    shop_name: data?.shop_name || "",
    brands: data?.brands || [],
    specialties: data?.specialties || [],
    experience_years: data?.experience_years || 5,
    working_hours: data?.working_hours || {
      mon: "09:00-18:00",
      tue: "09:00-18:00",
      wed: "09:00-18:00",
      thu: "09:00-18:00",
      fri: "09:00-18:00",
      sat: "09:00-14:00",
      sun: "closed",
    },
    technician_count: data?.technician_count || 1,
    is_authorized_service: data?.is_authorized_service ?? false,
  });

  const [newBrand, setNewBrand] = useState("");

  const handleChange = (field, value) => {
    const updated = { ...mechanicData, [field]: value };
    setMechanicData(updated);
    onUpdate(updated);
  };

  const addBrand = () => {
    if (newBrand && !mechanicData.brands.includes(newBrand)) {
      const updatedBrands = [...mechanicData.brands, newBrand];
      handleChange("brands", updatedBrands);
      setNewBrand("");
    }
  };

  const removeBrand = (brand) => {
    const updatedBrands = mechanicData.brands.filter((b) => b !== brand);
    handleChange("brands", updatedBrands);
  };

  const toggleSpecialty = (spec) => {
    const current = mechanicData.specialties;
    const updated = current.includes(spec)
      ? current.filter((s) => s !== spec)
      : [...current, spec];
    handleChange("specialties", updated);
  };

  const specialtiesOptions = [
    "Periyodik Bakım",
    "Fren Sistemi",
    "Motor / Mekanik",
    "Elektrik / Elektronik",
    "Kaporta / Boya",
    "Lastik / Rot Balans",
    "Klima / Isıtma",
    "Şanzıman / Diferansiyel",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400">
          <Icons.Wrench size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Teknik Servis Bilgileri</h2>
          <p className="text-sm text-slate-500 font-sans">Uzmanlık alanları ve marka yetkinlikleri</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Servis / Shop Adı</span>
          <input
            type="text"
            value={mechanicData.shop_name}
            onChange={(e) => handleChange("shop_name", e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none font-sans"
            placeholder="Örn: Maslak Pro Garage"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Teknisyen Sayısı</span>
          <div className="flex items-center gap-3 bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3">
            <Icons.Users2 size={18} className="text-primary-400" />
            <input
              type="number"
              value={mechanicData.technician_count}
              onChange={(e) => handleChange("technician_count", Number(e.target.value))}
              className="w-full bg-transparent text-sm text-white outline-none font-sans"
              min="1"
            />
          </div>
        </label>

        <div className="flex flex-col justify-end">
          <button
            onClick={() => handleChange("is_authorized_service", !mechanicData.is_authorized_service)}
            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
              mechanicData.is_authorized_service 
                ? "bg-blue-500/10 border-blue-500/40 text-blue-400" 
                : "bg-slate-800 border-white/5 text-slate-500 hover:border-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icons.Award size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-left">Yetkili Servis Durumu</span>
            </div>
            {mechanicData.is_authorized_service && <Icons.CheckCircle2 size={16} className="text-blue-400" />}
          </button>
        </div>

        <div className="md:col-span-2 space-y-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Uzmanlık Alanları</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {specialtiesOptions.map((spec) => (
              <button
                key={spec}
                onClick={() => toggleSpecialty(spec)}
                className={`px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all border ${
                  mechanicData.specialties.includes(spec)
                    ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/20"
                    : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Hizmet Verilen Markalar</span>
          <div className="flex flex-wrap gap-2 mb-2">
            {mechanicData.brands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-2 bg-slate-800 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-white uppercase tracking-tighter"
              >
                {brand}
                <button onClick={() => removeBrand(brand)} className="text-slate-500 hover:text-red-400">
                  <Icons.X size={14} />
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
              className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none font-sans"
              placeholder="Marka ekle (Örn: BMW)"
            />
            <button
              onClick={addBrand}
              className="bg-primary-600 text-white p-2 rounded-xl active-scale"
            >
              <Icons.Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicProfileForm;
