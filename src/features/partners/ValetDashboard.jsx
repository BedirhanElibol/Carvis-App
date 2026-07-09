import React, { useState, useEffect } from "react";
import { Key, MapPin, CheckCircle, Clock } from "lucide-react";
import ValetService from "../../services/ValetService";
import { supabase } from "../../supabaseClient";

export default function ValetDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    const result = await ValetService.getPendingBookings();
    if (result.success) {
      setBookings(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();

    // Setup Realtime Subscription
    const channel = supabase
      .channel('valet_bookings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'valet_bookings' }, (payload) => {
        fetchBookings(); // Refetch on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAccept = async (id) => {
    const result = await ValetService.acceptBooking(id);
    if (result.success) {
      alert("Görev başarıyla alındı!");
      fetchBookings();
    } else {
      alert("Hata: " + result.message);
    }
  };

  const handleComplete = async (id, escrowOrderId) => {
    const result = await ValetService.completeBooking(id, escrowOrderId);
    if (result.success) {
      alert("Görev tamamlandı ve ödeme hesabınıza aktarıldı!");
      fetchBookings();
    } else {
      alert("Hata: " + result.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Vale Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Araç teslim alma ve bırakma operasyonları
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Key size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Aktif Vale Görevleri</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{bookings.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">Yükleniyor...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Key size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Aktif Görev Yok</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Şu an için bölgenizde yeni bir araç teslim alma veya bırakma görevi bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">{booking.profiles?.full_name || "Müşteri"}</h4>
                  <p className="text-sm text-slate-500">Araç: {booking.vehicles?.brand} {booking.vehicles?.license_plate}</p>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                  {booking.price} ₺
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Alış Noktası</p>
                    <p className="text-sm font-medium dark:text-white">{booking.pickup_point}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Bırakış Noktası</p>
                    <p className="text-sm font-medium dark:text-white">{booking.dropoff_point || "Belirtilmedi"}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {booking.status === 'pending' ? (
                  <button 
                    onClick={() => handleAccept(booking.id)}
                    className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors">
                    Görevi Kabul Et
                  </button>
                ) : (
                  <button 
                    onClick={() => handleComplete(booking.id, booking.escrow_order_id)}
                    className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors">
                    Görevi Tamamla (Escrow Çöz)
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
