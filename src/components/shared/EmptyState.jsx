import React from "react";
import * as Icons from "lucide-react"; /** * Common Empty State component for the marketplace */
const EmptyState = ({ icon: Icon, title, subtitle, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in zoom-in duration-500">
      {" "}
      <div className="w-20 h-20 bg-white dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-black/5 dark:border-white/5 shadow-2xl">
        {" "}
        {Icon && <Icon size={32} className="text-slate-500" />}{" "}
      </div>{" "}
      <h3 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 uppercase">
        {" "}
        {title}{" "}
      </h3>{" "}
      <p className="text-sm text-slate-500 max-w-[280px] mb-8 leading-relaxed font-black uppercase tracking-widest text-[10px]">
        {" "}
        {subtitle}{" "}
      </p>{" "}
      {actionLabel && (
        <button
          onClick={onAction}
          className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white rounded-2xl font-black text-sm tracking-tighter transition-all active:scale-95 shadow-lg shadow-primary-600/20 uppercase"
        >
          {" "}
          {actionLabel}{" "}
        </button>
      )}{" "}
    </div>
  );
};
export default EmptyState;
