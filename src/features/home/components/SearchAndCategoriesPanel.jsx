import React from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { serviceCategories } from "../data/constants";

export const SearchAndCategoriesPanel = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white dark:bg-[#0a0f24]/80 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md space-y-6">
      <div>
        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
          Hizmet & Parça Arama
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          Aracınız için en iyi usta, vale ve yedek parçayı hemen bulun
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
        <Icons.Search className="absolute left-4.5 text-slate-500 dark:text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Ne aramıştınız? (Örn: fren balatası, periyodik bakım, oto çekici...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-2xl py-4.5 pl-12 pr-28 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white shadow-lg active-scale transition-all border-none cursor-pointer"
        >
          ARA
        </button>
      </form>

      {/* Quick Categories Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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
            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:text-white transition-colors uppercase tracking-tight text-center leading-none">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
