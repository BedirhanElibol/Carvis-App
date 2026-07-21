import React, { useState, useEffect } from "react";
import { Car, Users, Clock, DollarSign, CheckCircle, MapPin } from "lucide-react";
import ParkingService from "../../services/ParkingService";
import { supabase } from "../../supabaseClient";

export default function ParkingDashboard() {
  const [reservations, setReservations] = useState([]);
  const [completedReservations, setCompletedReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  const [stats, setStats] = useState({
    activeCount: 0,
    completedCount: 0,
    avgDuration: "—",
    totalEarnings: 0,
  });

  const fetchReservations = async () => {
    setLoading(true);
    try {
      // Active reservations
      const result = await ParkingService.getActiveReservations();
      const activeData = result.success ? result.data : [];
      setReservations(activeData);

      // Completed reservations
      const { data: completed } = await supabase
        .from("parking_reservations")
        .select("*, profiles:customer_id(full_name, phone), vehicles(brand, license_plate)")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(20);

      setCompletedReservations(completed || []);

      // Calculate stats
      const totalEarnings = (completed || []).reduce(
        (sum, r) => sum + (Number(r.price) || 0),
        0
      );
      const durations = (completed || [])
        .filter((r) => r.start_time && r.end_time)
        .map(
          (r) =>
            (new Date(r.end_time) - new Date(r.start_time)) / (1000 * 60 * 60)
        );
      const avgHours =
        durations.length > 0
          ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1)
          : "—";

      setStats({
        activeCount: activeData.length,
        completedCount: (completed || []).length,
        avgDuration: avgHours === "—" ? "—" : `${avgHours} Saat`,
        totalEarnings: totalEarnings,
      });
    } catch (err) {
      console.error("Parking fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();

    const channel = supabase
      .channel("parking_reservations_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "parking_reservations" },
        () => fetchReservations()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleComplete = async (id, escrowOrderId) => {
    const result = await ParkingService.completeReservation(id, escrowOrderId);
    if (result.success) {
      fetchReservations();
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
            Otopark Yönetim Paneli
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Kapasite ve müşteri giriş-çıkış takibi, rezervasyon yönetimi.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Aktif Rezervasyonlar",
            value: stats.activeCount,
            icon: Car,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Tamamlanan Park",
            value: stats.completedCount,
            icon: CheckCircle,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Ort. Park Süresi",
            value: stats.avgDuration,
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
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
          Aktif Rezervasyonlar
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
          Geçmiş Park Kayıtları
          {activeTab === "history" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "active" ? (
        <div className="glass-card border border-white/5 bg-slate-900/40 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-mono font-black text-white uppercase tracking-tight">
              Araç Giriş / Çıkış Kayıtları
            </h3>
            <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
              AKTİF
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Yükleniyor...
            </div>
          ) : reservations.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Car size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">
                Şu an aktif rezervasyon bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reservations.map((res) => (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {res.profiles?.full_name || "Müşteri"}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Araç: {res.vehicles?.brand}{" "}
                        {res.vehicles?.license_plate}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                      ₺{res.price}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Giriş:</span>
                      <span className="font-mono font-bold text-white">
                        {new Date(res.start_time).toLocaleString("tr-TR")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Çıkış:</span>
                      <span className="font-mono font-bold text-white">
                        {new Date(res.end_time).toLocaleString("tr-TR")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleComplete(res.id, res.escrow_order_id)
                    }
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-1.5 active-scale shadow-lg shadow-orange-500/10"
                  >
                    <CheckCircle size={14} /> Çıkışı Onayla
                  </button>
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
              Tamamlanan Park Kayıtları
            </h3>
            <span className="bg-slate-500/10 text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
              GEÇMİŞ
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Yükleniyor...
            </div>
          ) : completedReservations.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">
                Geçmişte tamamlanmış park kaydı bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedReservations.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-2 hover:border-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {res.profiles?.full_name || "Müşteri"}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Araç: {res.vehicles?.brand}{" "}
                        {res.vehicles?.license_plate}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      ₺{res.price}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Giriş:</span>
                    <span className="font-mono text-slate-300">
                      {new Date(res.start_time).toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Çıkış:</span>
                    <span className="font-mono text-slate-300">
                      {new Date(res.end_time).toLocaleString("tr-TR")}
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
