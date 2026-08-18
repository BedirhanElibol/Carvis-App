import React from "react";

export const SkeletonCard = ({ rows = 3, type = "card", className = "" }) => {
  if (type === "list") {
    return (
      <div className={`w-full space-y-4 animate-pulse ${className}`}>
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700/80 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`w-full p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
      </div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
