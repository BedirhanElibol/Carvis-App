import React, { useState, useEffect } from "react";
import { Users, Car, MapPin } from "lucide-react";
import ParkingService from "../../services/ParkingService";
import { supabase } from "../../supabaseClient";

export default function ParkingDashboard() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    setLoading(true);
    const result = await ParkingService.getActiveReservations();
    if (result.success) {
      setReservations(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();

    // Setup Realtime Subscription
    const channel = supabase
      .channel('parking_reservations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_reservations' }, (payload) => {
        fetchReservations(); // Refetch on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleComplete = async (id, escrowOrderId) => {
    const result = await ParkingService.completeReservation(id, escrowOrderId);
    if (result.success) {
      alert("Rezervasyon tamamlandı ve ücret aktarıldı!");
      fetchReservations();
    } else {
      alert("Hata: " + result.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Otopark Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kapasite ve müşteri giriş-çıkış takibi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Aktif Rezervasyonlar</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{reservations.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">Yükleniyor...</div>
      ) : reservations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Car size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Rezervasyon Yok</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Şu an için aktif bir araç giriş/çıkış veya rezervasyon kaydı bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reservations.map((res) => (
            <div key={res.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">{res.profiles?.full_name || "Müşteri"}</h4>
                  <p className="text-sm text-slate-500">Araç: {res.vehicles?.brand} {res.vehicles?.license_plate}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                  {res.price} ₺
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Giriş:</span>
                  <span className="font-medium dark:text-white">{new Date(res.start_time).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Çıkış:</span>
                  <span className="font-medium dark:text-white">{new Date(res.end_time).toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => handleComplete(res.id, res.escrow_order_id)}
                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors">
                Çıkış Yap (Escrow Çöz)
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
