import React from "react";
import { CalendarDays, X } from "lucide-react";
import { Badge } from "../Core";

const AppointmentsModal = ({ show, onClose, t, appointments, onCancel }) => {
  if (!show || !t) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[85] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-sm rounded-xl p-6 max-h-[80vh] flex flex-col text-slate-900 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-xl tracking-tighter flex items-center gap-2 font-sans uppercase text-slate-900 dark:text-white">
            <CalendarDays size={20} className="text-teal-400" />{" "}
            {t.myAppointments}
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {appointments.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-10">
              {t.noAppointments}
            </p>
          ) : (
            appointments.map((appt) => (
              <div
                key={appt.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-emerald-500/20 shadow-md hover:shadow-lg transition"
              >
                <div className="bg-emerald-500/10 p-3 rounded-xl mb-3 w-fit">
                  <CalendarDays className="text-teal-400" size={20} />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white flex justify-between items-center font-sans">
                  {appt.service}
                  <Badge type="neutral">{appt.date.split(",")[0]}</Badge>
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-sans">
                  {appt.shopName} •{" "}
                  <span className="font-bold text-slate-900 dark:text-white">{appt.date.split(",")[1]}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">{appt.car}</p>
                <button
                  onClick={() => onCancel(appt.id)}
                  className="mt-3 text-xs font-bold text-red-500 hover:text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition font-sans"
                >
                  {t.cancelAppointment}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsModal;
