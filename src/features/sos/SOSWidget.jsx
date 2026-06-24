import React, { useState } from "react";
import * as Icons from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useUI } from "../../context/UIContext";

const SOSWidget = ({ userId, currentVehicle }) => {
  const { showAlert, openModal } = useUI();
  const [loading, setLoading] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  const handleSOS = async () => {
    if (!userId) {
      openModal("login");
      return;
    }
    if (!currentVehicle) {
      showAlert("Hata", "Lütfen önce bir araç seçin.", "error");
      return;
    }

    setLoading(true);
    try {
      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { data, error } = await supabase
        .from("emergency_requests")
        .insert([
          {
            customer_id: userId,
            vehicle_id: currentVehicle.id,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            description: "Acil yol yardımı talebi oluşturuldu.",
            status: "searching"
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setActiveRequest(data);
      showAlert("SOS Gönderildi", "En yakın yardım ekibi yönlendiriliyor. Lütfen güvenli bir yerde bekleyin.", "success");
    } catch (error) {
      console.error("SOS Error:", error);
      showAlert("Hata", "Yardım talebi oluşturulamadı. Lütfen 112'yi veya sigortanızı arayın.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (activeRequest) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-900 dark:text-white shadow-lg shadow-emerald-900/40">
            <Icons.Truck size={24} />
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest">Yardım Yolda</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Ekipler konuma yönlendirildi.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2.5rem] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-slate-900 dark:text-white shadow-xl shadow-red-900/40 group-hover:scale-110 transition-transform duration-500">
            <Icons.AlertTriangle size={24} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-black uppercase text-sm tracking-tight">Yolda mı kaldın?</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Carvis SOS ile tek tuşla yardım çağır.</p>
          </div>
        </div>
        
        <button 
          onClick={handleSOS}
          disabled={loading}
          className="bg-white text-red-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all active-scale disabled:opacity-50"
        >
          {loading ? <Icons.Loader2 className="animate-spin" size={16} /> : "YARDIM ÇAĞIR"}
        </button>
      </div>
    </div>
  );
};

export default SOSWidget;
