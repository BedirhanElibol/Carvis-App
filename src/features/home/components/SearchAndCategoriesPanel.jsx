import React, { memo } from "react";
import { ChevronRight, Map, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchAndCategoriesPanel = memo(({ t, searchQuery, setSearchQuery, serviceCategories }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-[#0a0f24]/80 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md space-y-6">
      <div>
        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
          {t.serviceSearch}
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          {t.serviceSearchDesc}
        </p>
      </div>

      {/* Search Input */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery.trim()) {
            navigate("/app/mechanics", { state: { search: searchQuery } });
          }
        }}
        className="relative flex items-center"
      >
        <Search className="absolute left-4.5 text-slate-600 dark:text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t.serviceSearchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-2xl py-4.5 pl-12 pr-28 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white shadow-lg active-scale transition-all border-none cursor-pointer"
        >
          {t.search}
        </button>
      </form>

      {/* Quick Categories Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
        {serviceCategories.map((cat, idx) => (
          <div
            key={idx}
            onClick={() => navigate(cat.route)}
            className={`bg-slate-50 dark:bg-[#030712]/40 border border-black/5 dark:border-white/5 ${cat.border} p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 active-scale cursor-pointer group transition-all duration-300 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors pointer-events-none"></div>
            <div className={`p-3 rounded-xl ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform shadow-inner`}>
              <cat.icon size={20} />
            </div>
            <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:text-white transition-colors uppercase tracking-tight text-center leading-none">
              {cat.name}
            </span>
          </div>
        ))}
      </div>

      {/* EDS & Social Map Banner - Temporarily hidden per user request
      <button 
        onClick={() => navigate("/app/map")}
        className="w-full bg-gradient-to-r from-cyan-500/10 to-orange-500/10 hover:from-cyan-500/20 hover:to-orange-500/20 border border-cyan-500/30 p-4 rounded-2xl flex items-center justify-between group active-scale transition-all cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform shadow-inner relative">
            <Map size={24} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              EDS & Sosyal Trafik Haritası
            </h3>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <RefreshCw size={10} className="text-cyan-400 animate-spin-slow" />
              Her gün güncellenir. Kasis, Radar, Yakıt verileri.
            </p>
          </div>
        </div>
        <ChevronRight className="text-cyan-500 group-hover:translate-x-1 transition-transform" />
      </button>
      */}
    </div>
  );
});

SearchAndCategoriesPanel.displayName = 'SearchAndCategoriesPanel';
export default SearchAndCategoriesPanel;
