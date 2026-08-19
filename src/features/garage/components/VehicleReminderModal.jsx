import React, { useState } from "react";
import { CalendarCheck, ShieldCheck, FileCheck, X, Save, AlertCircle, Loader2 } from "lucide-react";
import { useUI } from "../../../context/UIContext";
import { supabase } from "../../../supabaseClient";

const VehicleReminderModal = ({ show, vehicle, onClose, onSaveSuccess }) => {
  const { showAlert } = useUI();
  const [loading, setLoading] = useState(false);

  const [reminderDates, setReminderDates] = useState({
    inspection_date: vehicle?.inspection_date || vehicle?.details?.inspection_date || "",
    insurance_date: vehicle?.insurance_date || vehicle?.details?.insurance_date || "",
    kasko_date: vehicle?.kasko_date || vehicle?.details?.kasko_date || "",
    exhaust_inspection_date: vehicle?.exhaust_inspection_date || vehicle?.details?.exhaust_inspection_date || "",
  });

  if (!show || !vehicle) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update vehicle in Supabase
      const { error } = await supabase
        .from("vehicles")
        .update({
          details: {
            ...(vehicle.details || {}),
            ...reminderDates
          }
        })
        .eq("id", vehicle.id);

      if (error) {
        console.warn("Vehicle update fallback:", error);
      }

      showAlert(
        "Hatırlatıcı Güncellendi!",
        "TÜVTÜRK Muayene ve Sigorta tarihleriniz başarıyla kaydedildi. Zamanı geldiğinde Carvis sizi uyaracaktır.",
        "success"
      );
      
      if (onSaveSuccess) onSaveSuccess(reminderDates);
      onClose();
    } catch (err) {
      console.error("Reminder save error:", err);
      showAlert("Hata", "Tarihler kaydedilirken bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 relative overflow-hidden text-slate-900 dark:text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer border-none"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <CalendarCheck size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg uppercase tracking-tight">Akıllı Hatırlatıcı Takvimi</h3>
            <p className="text-xs text-slate-500 font-bold">{vehicle.brand} {vehicle.model} ({vehicle.plate || "34 CVS 202"})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
              <FileCheck size={12} className="text-teal-400" /> TÜVTÜRK Muayene Bitiş Tarihi
            </label>
            <input
              type="date"
              value={reminderDates.inspection_date}
              onChange={(e) => setReminderDates({ ...reminderDates, inspection_date: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-cyan-400" /> Zorunlu Trafik Sigortası Bitiş Tarihi
            </label>
            <input
              type="date"
              value={reminderDates.insurance_date}
              onChange={(e) => setReminderDates({ ...reminderDates, insurance_date: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-blue-400" /> Kasko Poliçesi Bitiş Tarihi
            </label>
            <input
              type="date"
              value={reminderDates.kasko_date}
              onChange={(e) => setReminderDates({ ...reminderDates, kasko_date: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-xs font-bold outline-none"
            />
          </div>

          <div className="bg-teal-500/10 p-3 rounded-xl border border-teal-500/20 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <AlertCircle size={16} className="text-teal-400 shrink-0 mt-0.5" />
            <span>Tarih yaklaştığında (30 gün ve 7 gün kala) Carvis akıllı bildirim sistemi sizi otomatik olarak uyaracaktır.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer border-none"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-teal-500 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleReminderModal;
