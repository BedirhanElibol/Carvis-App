import React, { useState } from "react";
 
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Calendar, CreditCard, Plus, Wrench, X } from "lucide-react";
import { useGarage } from "../../context/GarageContext";
import { Badge } from "../Core";

const ServiceHistoryModal = ({ show, onClose }) => {
  const { maintenanceRecords, currentVehicle, addMaintenanceRecord } =
    useGarage();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    cost: "",
    km: currentVehicle?.km || "",
    service_type: "oil",
  });
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSave = async () => {
    if (!formData.description) return;
    setLoading(true);
    const { error } = await addMaintenanceRecord(formData);
    setLoading(false);
    if (!error) {
      setFormData({
        description: "",
        cost: "",
        km: currentVehicle?.km || "",
        service_type: "oil",
      });
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-primary-500/10 p-3 rounded-2xl">
                <Activity size={24} className="text-primary-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none font-sans">
                  SERVİS GEÇMİŞİ
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 font-sans">
                  {currentVehicle?.brand} {currentVehicle?.model}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 transition-all active-scale"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50 dark:bg-slate-950/20">
            {/* Add New Panel */}
            {!isAdding ? (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-4 border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 hover:border-primary-500/50 hover:text-primary-400 transition-all group"
              >
                <Plus
                  size={20}
                  className="group-hover:rotate-90 transition-transform"
                />
                <span className="text-xs font-black uppercase tracking-widest font-sans">
                  YENİ KAYIT EKLE
                </span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-black/10 dark:bg-white/10 p-6 rounded-[2rem] border border-black/10 dark:border-white/10 space-y-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-black text-xs text-primary-400 uppercase tracking-widest font-sans">
                    Kayıt Detayları
                  </h4>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="text-slate-500 hover:text-slate-900 dark:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <select
                    value={formData.service_type}
                    onChange={(e) =>
                      setFormData({ ...formData, service_type: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 p-4 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary-500 font-sans"
                  >
                    <option value="oil">Yağ Bakımı</option>
                    <option value="brakes">Fren Sitemi</option>
                    <option value="tires">Lastik</option>
                    <option value="battery">Akü</option>
                    <option value="other">Diğer Mekanik</option>
                  </select>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Yapılan işlemi açıklayın..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 p-4 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary-500 font-medium text-sm h-24 resize-none font-sans"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={formData.km}
                      onChange={(e) =>
                        setFormData({ ...formData, km: e.target.value })
                      }
                      placeholder="Servis KM"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 p-4 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary-500 font-bold font-sans"
                    />
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) =>
                        setFormData({ ...formData, cost: e.target.value })
                      }
                      placeholder="Tutar (₺)"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 p-4 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary-500 font-bold text-teal-400 font-sans"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={loading || !formData.description}
                    className="w-full bg-primary-600 text-slate-900 dark:text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-500 transition shadow-xl shadow-primary-900/40 active-scale disabled:opacity-50 font-sans"
                  >
                    {loading ? (
                      <Activity
                        size={20}
                        className="animate-spin mx-auto"
                      />
                    ) : (
                      "KAYDI TAMAMLA"
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* List */}
            <div className="space-y-4">
              <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-[0.3em] px-1 font-sans">
                Geçmiş Kayıtlar
              </h4>
              {maintenanceRecords.length === 0 ? (
                <div className="text-center py-12 opacity-30 bg-black/5 dark:bg-white/5 rounded-3xl border border-dashed border-black/10 dark:border-white/10">
                  <Wrench size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-medium font-sans">
                    Henüz bir servis kaydı yok.
                  </p>
                </div>
              ) : (
                maintenanceRecords.map((record, index) => (
                  <div
                    key={record.id || index}
                    className="glass-card p-5 rounded-3xl border border-black/5 dark:border-white/5 hover:border-black/20 dark:border-white/20 transition-all bg-white/[0.02] group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-500/10 p-2.5 rounded-xl border border-primary-500/20">
                          <Calendar
                            size={16}
                            className="text-primary-400"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
                            {new Date(
                              record.service_date || record.created_at,
                            ).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tabular-nums font-sans">
                            {record.km?.toLocaleString()} KM
                          </p>
                        </div>
                      </div>
                      <Badge
                        type="info"
                        className="text-[8px] px-2 py-0.5 uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition"
                      >
                        {record.service_type || "Genel"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4 font-sans">
                      {record.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2 text-teal-400">
                        <CreditCard size={14} />
                        <span className="text-xs font-black font-sans">
                          {record.cost
                            ? `${Number(record.cost).toLocaleString()} ₺`
                            : "Fiyat Belirtilmedi"}
                        </span>
                      </div>
                      <Wrench
                        size={16}
                        className="text-slate-700 group-hover:text-primary-600 transition"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-black/5 dark:border-white/5">
            <button
              onClick={onClose}
              className="w-full text-slate-500 py-2 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 dark:text-white transition font-sans"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ServiceHistoryModal;
