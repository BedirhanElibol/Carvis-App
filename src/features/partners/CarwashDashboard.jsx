import React, { useState, useEffect, useCallback } from "react";
import { Droplet, MapPin, CheckCircle, Clock, RefreshCw, EyeOff, User } from "lucide-react";
import CarwashService from "../../services/CarwashService";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";

export default function CarwashDashboard() {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available"); // "available" | "my_jobs"

  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const result = await CarwashService.getPendingRequests(currentUser.id);
    if (result.success) {
      setRequests(result.data || []);
    }
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchRequests();

    // Setup Realtime Subscription
    const channel = supabase
      .channel('carwash_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'carwash_requests' }, () => {
        fetchRequests(); // Refetch on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

  const handleAccept = async (id) => {
    const result = await CarwashService.acceptRequest(id);
    if (result.success) {
      showAlert("Başarılı", "Yıkama talebi başarıyla alındı!", "success");
      fetchRequests();
      setActiveTab("my_jobs");
    } else {
      showAlert("Hata", result.message, "error");
    }
  };

  const handleComplete = async (id, escrowOrderId) => {
    const result = await CarwashService.completeRequest(id, escrowOrderId);
    if (result.success) {
      showAlert("Başarılı", "Yıkama tamamlandı ve ödeme hesabınıza aktarıldı!", "success");
      fetchRequests();
    } else {
      showAlert("Hata", result.message, "error");
    }
  };

  const availableJobs = requests.filter(r => r.status === "pending");
  const myJobs = requests.filter(r => r.status === "accepted" && r.provider_id === currentUser?.id);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Seyyar Yıkama Paneli
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Bölgenizdeki seyyar / mobil yıkama taleplerini üstlenin.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
            <Droplet size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Açık Talepler</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{availableJobs.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Aktif İşlerim</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{myJobs.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 rounded-2xl w-fit border border-black/5 dark:border-white/5">
        <button
          onClick={() => setActiveTab("available")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "available"
              ? "bg-primary-600 text-slate-900 dark:text-white shadow-lg"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
          }`}
        >
          Açık Talepler ({availableJobs.length})
        </button>
        <button
          onClick={() => setActiveTab("my_jobs")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "my_jobs"
              ? "bg-emerald-600 text-slate-900 dark:text-white shadow-lg"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
          }`}
        >
          Aktif İşlerim ({myJobs.length})
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-primary-400" />
        </div>
      ) : (activeTab === "available" ? availableJobs : myJobs).length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            {activeTab === "available" ? (
              <Droplet size={32} className="text-slate-400" />
            ) : (
              <CheckCircle size={32} className="text-slate-400" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {activeTab === "available" ? "Açık Talep Bulunmuyor" : "Aktif İşiniz Yok"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            {activeTab === "available"
              ? "Şu an için bölgenizde yeni bir mobil yıkama talebi bulunmuyor."
              : "Havuzdan bir iş üstlenerek başlayabilirsiniz."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(activeTab === "available" ? availableJobs : myJobs).map((req) => (
            <div key={req.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:border-primary-500/30 transition-all flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <EyeOff size={100} />
              </div>
              <div className="relative z-10 flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {req.wash_type} Yıkama
                    </span>
                    {req.status === "accepted" && (
                      <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        Üstlenildi
                      </span>
                    )}
                  </div>
                  <h4 className="font-black text-xl text-slate-900 dark:text-white">
                    {req.status === "pending" ? "Gizli Müşteri" : (req.profiles?.full_name || "Müşteri")}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Araç: {req.vehicles?.brand} {req.vehicles?.model || ""} ({req.vehicles?.plate || "---"})
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ₺{req.price}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Ödeme Blokede</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 relative z-10">
                <div className="flex items-start gap-3 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                  <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Adres</p>
                    <p className="text-sm font-bold dark:text-white leading-tight mt-0.5">{req.address_text}</p>
                  </div>
                </div>
                {req.status === "accepted" && req.profiles?.phone && (
                  <div className="flex items-start gap-3 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                    <User size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">İletişim</p>
                      <p className="text-sm font-bold dark:text-white leading-tight mt-0.5">{req.profiles.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 relative z-10">
                {req.status === 'pending' ? (
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-slate-900 dark:text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all active-scale"
                  >
                    Talebi Kabul Et
                  </button>
                ) : (
                  <button
                    onClick={() => handleComplete(req.id, req.escrow_order_id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all active-scale shadow-lg shadow-emerald-900/20"
                  >
                    Yıkamayı Tamamla (Escrow Çöz)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
