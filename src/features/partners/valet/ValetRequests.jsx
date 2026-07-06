import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, Clock, FileText, Key, MapPin, User, XCircle } from "lucide-react";
import { useUI } from "../../../context/UIContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../supabaseClient";

const ValetRequests = () => {
  const { showAlert } = useUI();
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchValetRequests = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("valet_bookings")
        .select("*, customer:profiles!valet_bookings_customer_id_fkey(full_name, phone_number)")
        .or(`status.eq.pending,and(valet_id.eq.${currentUser.id},status.neq.completed,status.neq.cancelled)`)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRequests(
          data.map((r) => ({
            id: r.id,
            type: r.package_id === "night" ? "dropoff" : "pickup",
            plate: r.note || "Özel Detay Yok",
            time: new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            location: r.pickup_point,
            owner: r.customer?.full_name || "Müşteri",
            phone: r.customer?.phone_number || "---",
            status: r.status,
            code: r.verification_code
          }))
        );
      }
    } catch (err) {
      console.error("Fetch valet requests error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetchValetRequests();

    const channel = supabase
      .channel("valet_bookings_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "valet_bookings"
        },
        () => {
          fetchValetRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchValetRequests]);

  const handleAction = async (id, action) => {
    try {
      let nextStatus = "";
      let updateFields = {};

      if (action === "accept") {
        nextStatus = "accepted";
        updateFields = { valet_id: currentUser.id, status: nextStatus };
      } else if (action === "reject") {
        nextStatus = "cancelled";
        updateFields = { status: nextStatus };
      } else if (action === "picked_up") {
        nextStatus = "picked_up";
        updateFields = { status: nextStatus };
      } else if (action === "parked") {
        nextStatus = "parked";
        updateFields = { status: nextStatus };
      } else if (action === "completed") {
        nextStatus = "completed";
        updateFields = { status: nextStatus };
      }

      if (nextStatus) {
        const { error } = await supabase
          .from("valet_bookings")
          .update(updateFields)
          .eq("id", id);

        if (error) throw error;
        showAlert("Başarılı", `Talep durumu güncellendi: ${nextStatus}`, "success");
        fetchValetRequests();
      }
    } catch (err) {
      console.error("Valet action error:", err);
      showAlert("Hata", "İşlem gerçekleştirilemedi.", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase font-sans">
            Vale Çağrıları
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Bekleyen araç talepleri</p>
        </div>
        <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>{" "}
          AKTİF
        </div>
      </div>

      <div className="space-y-4">
        {loading && requests.length === 0 ? (
          <div className="text-center py-10 opacity-50 text-[10px] font-black uppercase tracking-widest">
            Yükleniyor...
          </div>
        ) : requests.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Key size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-500">Şu an bekleyen çağrı yok.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="glass-card p-5 rounded-2xl border border-black/5 dark:border-white/5 animate-fade-in"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      req.type === "pickup"
                        ? "bg-orange-500/10 text-orange-500"
                        : "bg-green-500/10 text-green-500"
                    }`}
                  >
                    <Key size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono">
                      Kod: #{req.code || "---"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mt-1">
                      Hizmet: {req.type === "pickup" ? "TESLİM ALMA" : "TESLİM ETME"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs justify-end">
                    <Clock size={12} /> {req.time}
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs justify-end mt-1">
                    <MapPin size={12} /> {req.location}
                  </div>
                </div>
              </div>

              <div className="mb-4 flex flex-col gap-2 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5">
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <User size={14} className="text-slate-500" />
                  <span className="font-semibold">{req.owner}</span>
                  <span className="text-slate-500">({req.phone})</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <FileText size={12} />
                  <span>Not: {req.plate}</span>
                </div>
                <div className="text-xs text-primary-400 flex items-center gap-2 font-bold uppercase tracking-wider">
                  <span>Mevcut Durum: {req.status}</span>
                </div>
              </div>

              <div className="flex gap-3">
                {req.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleAction(req.id, "reject")}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active-scale"
                    >
                      <XCircle size={18} /> REDDET
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "accept")}
                      className="flex-[2] bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-900/50 transition-all active-scale"
                    >
                      <CheckCircle size={18} /> KABUL ET
                    </button>
                  </>
                )}
                {req.status === "accepted" && (
                  <button
                    onClick={() => handleAction(req.id, "picked_up")}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active-scale font-sans"
                  >
                    <Key size={18} /> ARACI TESLİM ALDIM
                  </button>
                )}
                {req.status === "picked_up" && (
                  <button
                    onClick={() => handleAction(req.id, "parked")}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-slate-900 dark:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active-scale font-sans"
                  >
                    <MapPin size={18} /> GÜVENLİ PARK ETTİM
                  </button>
                )}
                {req.status === "parked" && (
                  <button
                    onClick={() => handleAction(req.id, "completed")}
                    className="w-full bg-green-600 hover:bg-green-500 text-slate-900 dark:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active-scale font-sans"
                  >
                    <CheckCircle size={18} /> HİZMETİ TAMAMLA
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ValetRequests;
