import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Car, Fuel, Loader2, Plus, Trash2, X } from "lucide-react";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useGarage } from "../../context/GarageContext";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const FuelScreen = () => {
  const { t, showAlert } = useUI();
  const { currentUser } = useAuth();
  const { currentVehicle: activeVehicle } = useGarage();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    liters: "",
    price_per_liter: "",
    total_cost: "",
    odometer: activeVehicle?.mileage || "",
    fuel_type: activeVehicle?.fuel_type || "Benzin",
    station_name: "",
    notes: ""
  });

  const fetchLogs = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }
    if (!activeVehicle?.id) {
      setLoading(false);
      setLogs([]);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("fuel_logs")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("vehicle_id", activeVehicle.id)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code !== "42P01") { // ignore relation does not exist
          console.error("Error fetching fuel logs:", error);
        }
        setLogs([]);
      } else {
        setLogs(data || []);
      }
    } catch (error) {
      console.error("Catch error:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, activeVehicle?.id]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    
    // Auto calculate
    if (name === "liters" || name === "price_per_liter") {
      const liters = parseFloat(name === "liters" ? value : formData.liters) || 0;
      const price = parseFloat(name === "price_per_liter" ? value : formData.price_per_liter) || 0;
      if (liters > 0 && price > 0) {
        newFormData.total_cost = (liters * price).toFixed(2);
      }
    } else if (name === "total_cost" && parseFloat(value) > 0 && parseFloat(formData.liters) > 0) {
       newFormData.price_per_liter = (parseFloat(value) / parseFloat(formData.liters)).toFixed(2);
    }

    setFormData(newFormData);
  };

  const isValidUUID = (str) =>
    typeof str === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.id || !activeVehicle?.id) {
      showAlert("Hata", "Kullanıcı veya araç bilgisi bulunamadı.", "error");
      return;
    }

    if (!formData.liters || !formData.price_per_liter || !formData.total_cost || !formData.odometer) {
      showAlert("Hata", "Lütfen zorunlu alanları doldurun.", "error");
      return;
    }

    // Ensure valid UUID format for user_id and vehicle_id
    if (!isValidUUID(currentUser.id)) {
      showAlert("Oturum Gerekli", "Lütfen yakıt kaydı eklemek için giriş yapın.", "warning");
      return;
    }

    if (!isValidUUID(activeVehicle.id)) {
      showAlert("Araç Seçin", "Lütfen önce garajınıza resmi bir araç ekleyin.", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("fuel_logs").insert([
        {
          user_id: currentUser.id,
          vehicle_id: activeVehicle.id,
          liters: parseFloat(formData.liters),
          price_per_liter: parseFloat(formData.price_per_liter),
          total_cost: parseFloat(formData.total_cost),
          odometer: parseInt(formData.odometer, 10),
          fuel_type: formData.fuel_type || "Benzin",
          station_name: formData.station_name || "Belirtilmedi",
          notes: formData.notes || ""
        }
      ]);

      if (error) throw error;

      showAlert("Başarılı", "Yakıt kaydı başarıyla eklendi.", "success");
      setShowAddModal(false);
      setFormData({
        liters: "",
        price_per_liter: "",
        total_cost: "",
        odometer: activeVehicle?.mileage || "",
        fuel_type: activeVehicle?.fuel_type || "Benzin",
        station_name: "",
        notes: ""
      });
      fetchLogs();
    } catch (error) {
      console.error("Insert error:", error);
      if (error.code === "42P01") {
        showAlert("Hata", "Veritabanı tablosu henüz hazır değil (fuel_logs).", "error");
      } else if (error.message?.includes("invalid input syntax for type uuid") || error.status === 400) {
        showAlert("Hata", "Geçerli bir araç veya kullanıcı kimliği bulunamadı.", "error");
      } else {
        showAlert("Hata", error.message || "Yakıt kaydı eklenirken bir sorun oluştu.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteLog = async (id) => {
    if (!window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    try {
      const { error } = await supabase.from("fuel_logs").delete().eq("id", id);
      if (error) throw error;
      fetchLogs();
      showAlert("Silindi", "Kayıt silindi.", "success");
    } catch (_err) {
      showAlert("Hata", "Silinirken bir hata oluştu.", "error");
    }
  };

  if (!t) return null;

  return (
    <div className="p-5 pb-32 space-y-6 min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 glass-card rounded-xl text-slate-900 dark:text-white active-scale border border-black/10 dark:border-white/10 hover:bg-black/5 dark:bg-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter uppercase">
            YAKIT TAKİBİ
          </h3>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 text-slate-900 dark:text-white p-2.5 rounded-xl shadow-lg shadow-primary-900/20 hover:bg-primary-500 active-scale transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {!activeVehicle ? (
        <div className="glass-card border border-amber-500/20 bg-amber-500/5 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 text-center">
          <Car className="text-amber-500" size={32} />
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Yakıt takibi yapabilmek için önce bir araç seçmeli veya eklemelisiniz.</p>
        </div>
      ) : (
        <>
          {/* List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
              <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-black/5 dark:border-white/5 shadow-2xl mb-4">
                <Fuel size={32} className="text-slate-500" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.1em] text-slate-500">
                Henüz yakıt kaydı bulunmuyor
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-lg relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => deleteLog(log.id)} className="text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 p-2 rounded-xl">
                        <Trash2 size={16} />
                     </button>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary-500/10 p-3 rounded-2xl border border-primary-500/20">
                      <Fuel size={24} className="text-primary-500" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-slate-900 dark:text-white uppercase">
                        {log.station_name || "İstasyon Belirtilmedi"}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: tr })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Litre</p>
                       <p className="font-bold text-slate-900 dark:text-white">{log.liters} L</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tutar</p>
                       <p className="font-bold text-primary-500">{log.total_cost} ₺</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Kilometre</p>
                       <p className="font-bold text-slate-900 dark:text-white">{log.odometer} km</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 p-2 rounded-full"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Yeni Yakıt Kaydı</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Alınan Litre *</label>
                  <input type="number" step="0.01" required name="liters" value={formData.liters} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none transition-colors" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Litre Fiyatı (₺) *</label>
                  <input type="number" step="0.01" required name="price_per_liter" value={formData.price_per_liter} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none transition-colors" placeholder="0.00" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Toplam Tutar (₺) *</label>
                <input type="number" step="0.01" required name="total_cost" value={formData.total_cost} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none transition-colors" placeholder="0.00" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Araç Kilometresi *</label>
                <input type="number" required name="odometer" value={formData.odometer} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none transition-colors" placeholder="Örn: 45000" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Yakıt Tipi</label>
                  <select name="fuel_type" value={formData.fuel_type} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none transition-colors appearance-none">
                    <option value="Benzin">Benzin</option>
                    <option value="Dizel">Dizel</option>
                    <option value="LPG">LPG</option>
                    <option value="Elektrik">Elektrik</option>
                    <option value="Hibrit">Hibrit</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">İstasyon</label>
                  <input type="text" name="station_name" value={formData.station_name} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none transition-colors" placeholder="Örn: Shell" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notlar (İsteğe Bağlı)</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="2" className="w-full bg-slate-50 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none transition-colors custom-scrollbar" placeholder="Kısa bir not ekleyin..." />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-primary-600 text-slate-900 dark:text-white rounded-2xl py-4 font-black uppercase tracking-wider mt-4 shadow-lg shadow-primary-900/20 active-scale disabled:opacity-50"
              >
                {submitting ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelScreen;
