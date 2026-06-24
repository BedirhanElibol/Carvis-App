import React from "react";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";

const ComingSoon = ({
  title = "Çok Yakında",
  description = "Bu özellik üzerinde çalışmalarımız devam ediyor. En kısa sürede hizmetinizde olacak!",
}) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px]"></div>
      <div className="glass-card p-12 rounded-[3rem] border border-black/5 dark:border-white/5 max-w-lg w-full relative z-10">
        <div className="w-24 h-24 bg-white dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-black/5 dark:border-white/5">
          <Icons.Construction
            size={48}
            className="text-primary-500 animate-pulse"
          />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          {" "}
          {title}{" "}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 leading-relaxed">
          {" "}
          {description}{" "}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 text-slate-900 dark:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 px-8 py-4 rounded-xl font-bold transition-all w-full group"
        >
          <Icons.ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Geri Dön
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
