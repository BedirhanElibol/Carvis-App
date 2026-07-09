import React, { useState, useEffect } from "react";
import { Droplet, MapPin, CheckCircle, Clock } from "lucide-react";
import CarwashService from "../../services/CarwashService";
import { supabase } from "../../supabaseClient";

export default function CarwashDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const result = await CarwashService.getPendingRequests();
    if (result.success) {
      setRequests(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    // Setup Realtime Subscription
    const channel = supabase
      .channel('carwash_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'carwash_requests' }, (payload) => {
        fetchRequests(); // Refetch on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAccept = async (id) => {
    const result = await CarwashService.acceptRequest(id);
    if (result.success) {
      alert("Yıkama talebi başarıyla alındı!");
      fetchRequests();
    } else {
      alert("Hata: " + result.message);
    }
  };

  const handleComplete = async (id, escrowOrderId) => {
    const result = await CarwashService.completeRequest(id, escrowOrderId);
    if (result.success) {
      alert("Yıkama tamamlandı ve ödeme hesabınıza aktarıldı!");
      fetchRequests();
    } else {
      alert("Hata: " + result.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Seyyar Yıkama
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Bölgenizdeki mobil yıkama talepleri
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
            <Droplet size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Bekleyen Talepler</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{requests.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">Yükleniyor...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Droplet size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Talep Yok</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Şu an için bölgenizde yeni bir yıkama talebi bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">{req.profiles?.full_name || "Müşteri"}</h4>
                  <p className="text-sm text-slate-500">Araç: {req.vehicles?.brand} {req.vehicles?.license_plate}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 px-3 py-1 rounded-full text-xs font-bold capitalize">
                    {req.wash_type} Yıkama
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {req.price} ₺
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Adres</p>
                    <p className="text-sm font-medium dark:text-white">{req.address_text}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {req.status === 'pending' ? (
                  <button 
                    onClick={() => handleAccept(req.id)}
                    className="flex-1 bg-cyan-500 text-white py-3 rounded-xl font-bold hover:bg-cyan-600 transition-colors">
                    Talebi Kabul Et
                  </button>
                ) : (
                  <button 
                    onClick={() => handleComplete(req.id, req.escrow_order_id)}
                    className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors">
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
