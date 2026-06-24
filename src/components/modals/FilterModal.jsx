import React, { useState } from "react";
import * as Icons from "lucide-react";

const FilterModal = ({
  show,
  onClose,
  t,
  onApply,
  onClear,
  currentFilters,
}) => {
  const [tempFilters, setTempFilters] = useState(
    currentFilters || { min: "", max: "", stock: false, brand: "", model: "" },
  );

  if (!show || !t) return null;

  const BRANDS = [
    "Filtresiz",
    "Volkswagen",
    "BMW",
    "Fiat",
    "Renault",
    "Togg",
    "Mercedes",
    "Audi",
    "Toyota",
  ];

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  const handleClear = () => {
    const cleared = { min: "", max: "", stock: false, brand: "", model: "" };
    setTempFilters(cleared);
    onClear(cleared);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/80 z-[200] flex items-end sm:items-center justify-center backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full sm:w-[450px] rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-[0_20px_100px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-full duration-500 border-t sm:border border-black/10 dark:border-white/10 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

        <div className="flex justify-between items-center mb-10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500/20 p-2.5 rounded-2xl shadow-inner">
              <Icons.Filter size={24} className="text-primary-500" />
            </div>
            <div>
              <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter uppercase font-sans">
                {t.filterTitle}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 font-sans">
                Aramanı Özelleştir
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl hover:bg-black/10 dark:bg-white/10 transition-all active-scale border border-black/5 dark:border-white/5"
          >
            <Icons.X size={20} className="text-slate-900 dark:text-white" />
          </button>
        </div>

        <div className="space-y-8 relative z-10">
          {/* Vehicle Filter Section */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 font-sans">
              Araç Filtreleme
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <select
                  value={tempFilters.brand}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      brand: e.target.value,
                      model: "",
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl p-4 outline-none text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer font-sans"
                >
                  <option
                    value=""
                    disabled
                    className="bg-white dark:bg-slate-900 text-slate-500"
                  >
                    MARKA SEÇ
                  </option>
                  {BRANDS.map((b) => (
                    <option
                      key={b}
                      value={b === "Filtresiz" ? "" : b}
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      {b}
                    </option>
                  ))}
                </select>
                <Icons.ChevronRight
                  size={14}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none"
                />
              </div>
              <input
                type="text"
                placeholder="MODEL (ÖRN: GOLF)"
                value={tempFilters.model}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, model: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl p-4 outline-none text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-600 font-sans"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 font-sans">
              {t.price} Aralığı (₺)
            </p>
            <div className="flex gap-4">
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">
                  {t.minPrice}
                </p>
                <input
                  type="number"
                  value={tempFilters.min}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, min: e.target.value })
                  }
                  placeholder="0"
                  className="bg-transparent w-full outline-none text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-800"
                />
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">
                  {t.maxPrice}
                </p>
                <input
                  type="number"
                  value={tempFilters.max}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, max: e.target.value })
                  }
                  placeholder="99.999"
                  className="bg-transparent w-full outline-none text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Stock Switch */}
          <div
            onClick={() =>
              setTempFilters({ ...tempFilters, stock: !tempFilters.stock })
            }
            className={`flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer active-scale group ${
              tempFilters.stock
                ? "bg-primary-600/10 border-primary-500/50"
                : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:bg-black/10 dark:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-xl transition-all ${
                  tempFilters.stock
                    ? "bg-primary-500 text-slate-900 dark:text-white shadow-lg shadow-primary-900/40"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                <Icons.CircleCheck size={20} />
              </div>
              <span
                className={`text-sm font-bold uppercase tracking-tight transition-all ${tempFilters.stock ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
              >
                {t.onlyInStock}
              </span>
            </div>
            <div
              className={`w-10 h-5 rounded-full relative transition-all ${tempFilters.stock ? "bg-primary-600" : "bg-slate-100 dark:bg-slate-800"}`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${tempFilters.stock ? "left-6 shadow-md" : "left-1"}`}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-12 relative z-10">
          <button
            onClick={handleClear}
            className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-500 py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] border border-black/5 dark:border-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all active-scale flex items-center justify-center gap-2 font-sans"
          >
            <Icons.Trash2 size={16} /> {t.clear}
          </button>
          <button
            onClick={handleApply}
            className="flex-[2] bg-white text-slate-950 py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active-scale shadow-2xl flex items-center justify-center gap-2 font-sans"
          >
            <Icons.CircleCheck size={16} /> {t.apply}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
