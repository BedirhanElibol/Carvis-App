import React from "react";
import * as Icons from "lucide-react";

const AlertModal = ({ show, onClose, title, message, type }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[10001] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-xl ${
              type === "error"
                ? "bg-red-100 text-red-600"
                : type === "success"
                  ? "bg-green-100 text-green-600"
                  : type === "verified"
                    ? "bg-primary-100 text-primary-600"
                    : "bg-blue-100 text-blue-600"
            }`}
          >
            {type === "error" ? (
              <Icons.TriangleAlert size={32} />
            ) : type === "success" ? (
              <Icons.CircleCheck size={32} />
            ) : type === "verified" ? (
              <Icons.ShieldCheck size={32} />
            ) : (
              <Icons.Info size={32} />
            )}
          </div>
          <h3 className="font-black text-xl text-slate-900 mb-2 font-sans">{title}</h3>
          <p className="text-slate-600 mb-6 font-sans">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg font-sans"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
