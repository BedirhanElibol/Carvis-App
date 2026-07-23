import React from "react";
import { CircleCheck, Info, ShieldCheck, TriangleAlert } from "lucide-react";

const AlertModal = ({ show, onClose, title, message, type }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[10001] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-xl ${
              type === "error"
                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                : type === "success"
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : type === "verified"
                    ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            }`}
          >
            {type === "error" ? (
              <TriangleAlert size={32} />
            ) : type === "success" ? (
              <CircleCheck size={32} />
            ) : type === "verified" ? (
              <ShieldCheck size={32} />
            ) : (
              <Info size={32} />
            )}
          </div>
          <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2 font-sans">{title}</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 font-sans leading-relaxed">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg font-sans"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
