import React from "react";
import * as Icons from "lucide-react";
import { Badge } from "../Core";

const AppointmentsModal = ({ show, onClose, t, appointments, onCancel }) => {
  if (!show || !t) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[85] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-xl tracking-tighter flex items-center gap-2 font-sans uppercase">
            <Icons.CalendarDays size={20} className="text-emerald-400" />{" "}
            {t.myAppointments}
          </h3>
          <button onClick={onClose}>
            <Icons.X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {appointments.length === 0 ? (
            <p className="text-center text-slate-500 py-10">
              {t.noAppointments}
            </p>
          ) : (
            appointments.map((appt) => (
              <div
                key={appt.id}
                className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-md hover:shadow-lg transition"
              >
                <div className="bg-emerald-500/10 p-3 rounded-xl">
                  <Icons.CalendarDays className="text-emerald-400" size={20} />
                </div>
                <h4 className="font-bold text-slate-900 flex justify-between items-center font-sans">
                  {appt.service}
                  <Badge type="neutral">{appt.date.split(",")[0]}</Badge>
                </h4>
                <p className="text-sm text-slate-600 mt-1 font-sans">
                  {appt.shopName} •{" "}
                  <span className="font-bold">{appt.date.split(",")[1]}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">{appt.car}</p>
                <button
                  onClick={() => onCancel(appt.id)}
                  className="mt-3 text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg bg-white shadow-sm hover:bg-red-50 transition font-sans"
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
