import React, { useState, useEffect } from "react";
import { Key, MapPin, CheckCircle, Clock, DollarSign, Car } from "lucide-react";
import ValetService from "../../services/ValetService";
import { supabase } from "../../supabaseClient";

export default function ValetDashboard() {
  const [bookings, setBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  const [stats, setStats] = useState({
    activeCount: 0,
    completedCount: 0,
    avgTime: "—",
    totalEarnings: 0,
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Active bookings (pending + accepted)
      const result = await ValetService.getPendingBookings();
      const activeData = result.success ? result.data : [];
      setBookings(activeData);

      // Completed bookings
      const { data: completed } = await supabase
        .from("valet_bookings")
        .select("*, profiles:customer_id(full_name, phone), vehicles(brand, license_plate)")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(20);

      setCompletedBookings(completed || []);

      // Calculate stats
      const totalEarnings = (completed || []).reduce(
        (sum, b) => sum + (Number(b.price) || 0),
        0
      );

      setStats({
        activeCount: activeData.length,
        completedCount: (completed || []).length,
        avgTime: activeData.length > 0 ? "~15 Dk" : "—",
        totalEarnings: totalEarnings,
      });
    } catch (err) {
      console.error("Valet fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel("valet_bookings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "valet_bookings" },
        () => fetchBookings()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleAccept = async (id) => {
    const result = await ValetService.acceptBooking(id);
    if (result.success) {
      fetchBookings();
    } else {
      alert("Hata: " + result.message);
    }
  };

  const handleComplete = async (id, escrowOrderId) => {
    const result = await ValetService.completeBooking(id, escrowOrderId);
    if (result.success) {
      fetchBookings();
    } else {
      alert("Hata: " + result.message);
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-100">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono font-black text-white uppercase tracking-tighter glow-orange">
            Vale Yönetim Paneli
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Araç teslim alma ve bırakma operasyonları, görev yönetimi.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Aktif Görevler",
            value: stats.activeCount,
            icon: Key,
            color: "text-orange-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "Tamamlanan Görevler",
            value: stats.completedCount,
            icon: CheckCircle,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Ort. Teslimat Süresi",
            value: stats.avgTime,
            icon: Clock,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Toplam Hasılat",
            value: `₺${stats.totalEarnings.toLocaleString("tr-TR")}`,
            icon: DollarSign,
            color: "text-teal-400",
            bg: "bg-teal-500/10",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card border border-white/5 bg-slate-900/40 p-6 rounded-3xl flex items-center justify-between shadow-sm hover:border-white/10 transition-all duration-300"
          >
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {s.label}
              </p>
              <h3 className="text-2xl font-mono font-black text-white mt-1.5">
                {s.value}
              </h3>
            </div>
            <div className={`p-4 rounded-2xl ${s.bg}`}>
              <s.icon size={22} className={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 pb-px">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all cursor-pointer relative ${
            activeTab === "active"
              ? "text-orange-500"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Aktif Vale Görevleri
          {activeTab === "active" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all cursor-pointer relative ${
            activeTab === "history"
              ? "text-orange-500"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Geçmiş Görevler
          {activeTab === "history" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "active" ? (
        <div className="glass-card border border-white/5 bg-slate-900/40 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-mono font-black text-white uppercase tracking-tight">
              Araç Teslim Alma & Bırakma
            </h3>
            <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
              AKTİF GÖREVLER
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Yükleniyor...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Key size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">
                Bölgenizde aktif vale görevi bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {booking.profiles?.full_name || "Müşteri"}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Araç: {booking.vehicles?.brand}{" "}
                        {booking.vehicles?.license_plate}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                      ₺{booking.price}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs">
                      <MapPin
                        size={14}
                        className="text-slate-500 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-slate-400">Alış Noktası</p>
                        <p className="font-bold text-white">
                          {booking.pickup_point}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <MapPin
                        size={14}
                        className="text-slate-500 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-slate-400">Bırakış Noktası</p>
                        <p className="font-bold text-white">
                          {booking.dropoff_point || "Belirtilmedi"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {booking.status === "pending" ? (
                    <button
                      onClick={() => handleAccept(booking.id)}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors active-scale shadow-lg shadow-orange-500/10"
                    >
                      Görevi Kabul Et
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleComplete(booking.id, booking.escrow_order_id)
                      }
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-widest cursor-pointer transition-colors flex items-center justify-center gap-1.5 active-scale shadow-lg shadow-emerald-500/10"
                    >
                      <CheckCircle size={14} /> Görevi Tamamla
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* History View */
        <div className="glass-card border border-white/5 bg-slate-900/40 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-mono font-black text-white uppercase tracking-tight">
              Tamamlanan Vale Görevleri
            </h3>
            <span className="bg-slate-500/10 text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
              GEÇMİŞ
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Yükleniyor...
            </div>
          ) : completedBookings.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">
                Geçmişte tamamlanmış görev bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-2 hover:border-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {booking.profiles?.full_name || "Müşteri"}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Araç: {booking.vehicles?.brand}{" "}
                        {booking.vehicles?.license_plate}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      ₺{booking.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin size={14} className="text-slate-500 shrink-0" />
                    <span className="truncate">
                      {booking.pickup_point} → {booking.dropoff_point || "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
