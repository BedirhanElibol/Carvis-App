import React, { useState } from "react";
import { Inbox, MinusCircle, Package, Truck } from "lucide-react";

const ProductProfileForm = ({ data, onUpdate }) => {
  const [sellerData, setSellerData] = useState({
    business_name: data?.business_name || "",
    categories: data?.categories || [],
    delivery_radius_km: data?.delivery_radius_km || 50,
    store_type: data?.store_type || "retail",
    tax_info: data?.tax_info || "",
    is_warehouse_direct: data?.is_warehouse_direct ?? false,
    min_order_amount: data?.min_order_amount || 0,
    working_days: data?.working_days || ["mon", "tue", "wed", "thu", "fri"],
  });

  const handleChange = (field, value) => {
    const updated = { ...sellerData, [field]: value };
    setSellerData(updated);
    onUpdate(updated);
  };

  const categoriesOptions = [
    "Motor Parçaları",
    "Fren Sistemleri",
    "Filtreler",
    "Aydınlatma",
    "Kaporta / Aksesuar",
    "Elektrik / Elektronik",
    "Şanzıman / Debriyaj",
    "Sıvılar / Yağlar",
  ];

  const toggleCategory = (cat) => {
    const current = sellerData.categories;
    const updated = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    handleChange("categories", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-primary-400">
          <Package size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Yedek Parça Mağaza Bilgileri</h2>
          <p className="text-sm text-slate-500 font-sans">Envanter kapsamı ve lojistik ayarları</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Teslimat Yarıçapı</span>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3">
            <Truck size={18} className="text-primary-400" />
            <input
              type="number"
              value={sellerData.delivery_radius_km}
              onChange={(e) => handleChange("delivery_radius_km", Number(e.target.value))}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none font-sans"
            />
            <span className="text-xs text-slate-500 font-bold uppercase">KM</span>
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Mağaza Türü</span>
          <select
            value={sellerData.store_type}
            onChange={(e) => handleChange("store_type", e.target.value)}
            className="w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none font-sans appearance-none"
          >
            <option value="retail">Perakende / Mağaza</option>
            <option value="wholesale">Toptancı</option>
            <option value="warehouse">Depo / Dağıtım Merkezi</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Minimum Sipariş</span>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3">
            <MinusCircle size={18} className="text-primary-400" />
            <input
              type="number"
              value={sellerData.min_order_amount}
              onChange={(e) => handleChange("min_order_amount", Number(e.target.value))}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none font-sans"
            />
            <span className="text-xs text-slate-500 font-bold uppercase">TRY</span>
          </div>
        </label>

        <div className="md:col-span-2 space-y-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Sevkiyat Günleri</span>
          <div className="flex flex-wrap gap-2">
            {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => {
              const isSelected = (sellerData.working_days || []).includes(day);
              const labels = { mon: "Pzt", tue: "Sal", wed: "Çar", thu: "Per", fri: "Cum", sat: "Cmt", sun: "Paz" };
              return (
                <button
                  key={day}
                  onClick={() => {
                    const current = sellerData.working_days || [];
                    const updated = isSelected ? current.filter(d => d !== day) : [...current, day];
                    handleChange("working_days", updated);
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    isSelected ? "bg-emerald-500/10 border-emerald-500/40 text-teal-400 shadow-lg shadow-emerald-900/10" : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-500"
                  }`}
                >
                  {labels[day]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Satış Kategorileri</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categoriesOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all border ${
                  sellerData.categories.includes(cat)
                    ? "bg-primary-600 border-primary-500 text-slate-900 dark:text-white shadow-lg shadow-primary-900/20"
                    : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-black/10 dark:border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <label className="md:col-span-2 space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Vergi / Kurumsal Kimlik Bilgisi</span>
          <input
            type="text"
            value={sellerData.tax_info}
            onChange={(e) => handleChange("tax_info", e.target.value)}
            placeholder="Vergi No ve Daire Bilgisi"
            className="w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none font-sans"
          />
        </label>
      </div>

      <div className="pt-2">
        <button
          onClick={() => handleChange("is_warehouse_direct", !sellerData.is_warehouse_direct)}
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
            sellerData.is_warehouse_direct
              ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
              : "bg-slate-100 dark:bg-slate-800/50 border-black/5 dark:border-white/5 text-slate-500"
          }`}
        >
          <Inbox size={20} />
          <div className="text-left">
            <p className="text-xs font-black uppercase tracking-wider">Depodan Doğrudan Satış</p>
            <p className="text-[10px] opacity-70 font-sans">Mağaza olmadan sadece depo üzerinden sevkiyat yapıyorum.</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProductProfileForm;
