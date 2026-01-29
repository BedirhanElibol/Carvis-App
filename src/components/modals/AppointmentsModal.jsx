import React from 'react';
import { CalendarDays, X } from 'lucide-react';
import { Badge } from '../Core';

const AppointmentsModal = ({ show, onClose, t, appointments, onCancel }) => {
    if (!show || !t) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[85] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl flex items-center gap-2"><CalendarDays size={22} className="text-orange-600" /> {t.myAppointments}</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4">
                    {appointments.length === 0 ? <p className="text-center text-slate-500 py-10">{t.noAppointments}</p> :
                        appointments.map(appt => (
                            <div key={appt.id} className="p-4 rounded-2xl bg-white border border-purple-100 shadow-md hover:shadow-lg transition">
                                <h4 className="font-bold text-slate-900 flex justify-between items-center">
                                    {appt.service}
                                    <Badge type="neutral">{appt.date.split(',')[0]}</Badge>
                                </h4>
                                <p className="text-sm text-slate-600 mt-1">{appt.shopName} • <span className="font-bold">{appt.date.split(',')[1]}</span></p>
                                <p className="text-xs text-slate-400 mt-0.5">{appt.car}</p>
                                <button onClick={() => onCancel(appt.id)} className="mt-3 text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg bg-white shadow-sm hover:bg-red-50 transition">
                                    {t.cancelAppointment}
                                </button>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default AppointmentsModal;
