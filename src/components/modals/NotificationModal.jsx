import React from "react";
import * as Icons from "lucide-react";
import { NOTIFICATIONS_MOCK } from "../../constants/mockData";

const NotificationModal = ({ show, onClose, t }) => {
  if (!show || !t) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[75] flex items-start justify-center pt-20 p-4 backdrop-blur-sm animate-in slide-in-from-top-10">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg font-sans">{t.notifications}</h3>
          <button
            onClick={onClose}
            className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 shadow-md"
          >
            <Icons.X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="space-y-3">
          {NOTIFICATIONS_MOCK.map((n) => (
            <div
              key={n.id}
              className="flex gap-3 items-start border-b border-slate-100/50 pb-3 last:border-0 bg-white p-3 rounded-xl hover:bg-slate-50 transition shadow-md"
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  n.type === "success"
                    ? "bg-green-500"
                    : n.type === "warning"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                }`}
              ></div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 font-sans">{n.title}</h4>
                <p className="text-xs text-slate-500 font-sans">{n.message}</p>
                <span className="text-[10px] text-slate-300">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
