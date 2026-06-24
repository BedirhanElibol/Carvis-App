import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";

const TenderScreen = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!currentUser || currentUser.id.toString().startsWith("guest-")) {
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);

    } catch (error) {
      console.error("Fetch Service Requests Err:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Ustalar İnceliyor",
          color: "text-yellow-400",
          bg: "bg-yellow-500/10 border-yellow-500/20",
        };
      case "tender_open":
        return {
          label: "Teklif Bekliyor",
          color: "text-blue-400",
          bg: "bg-blue-500/10 border-blue-500/20",
        };
      case "claimed":
        return {
          label: "İş Üstlenildi",
          color: "text-green-400",
          bg: "bg-green-500/10 border-green-500/20",
        };
      default:
        return {
          label: status,
          color: "text-slate-500 dark:text-slate-400",
          bg: "bg-slate-500/10 border-slate-500/20",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 animate-fade-in relative">
      {/* Ambient Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app/home")}
              className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale border border-black/5 dark:border-white/5"
            >
              <Icons.ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold font-sans">Açık Taleplerim</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ustaların teklif verdiği aktif işleriniz
              </p>
            </div>
          </div>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-2"
          >
            <Icons.RefreshCw
              size={20}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center">
            <Icons.RefreshCw
              className="animate-spin text-primary-500 mb-4"
              size={32}
            />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Talepleriniz yükleniyor...
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <Icons.FileText className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">
              Henüz oluşturduğunuz bir teknik servis talebi yok.
            </p>
            <button
              onClick={() => navigate("/app/mechanics")}
              className="bg-primary-600 text-slate-900 dark:text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition font-sans"
            >
              Hemen Talep Oluştur
            </button>
          </div>
        ) : (
          requests.map((req) => {
            const statusInfo = getStatusLabel(req.status);
            return (
              <div
                key={req.id}
                className="glass-card p-5 rounded-2xl border border-black/5 dark:border-white/5 relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-3 border-b border-black/5 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-primary-400">
                      {req.demand_type === "part" ? (
                        <Icons.Package size={20} />
                      ) : (
                        <Icons.Wrench size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight uppercase tracking-tight font-sans">
                        {req.brand || "Bilinmeyen"} {req.model}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-mono mt-0.5">
                        {req.plate}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border ${statusInfo.bg} ${statusInfo.color} font-sans`}
                  >
                    <Icons.Clock size={12} /> {statusInfo.label}
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed font-medium">
                  {req.description || "Detay belirtilmedi."}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 font-sans">
                    Açılış: {new Date(req.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => navigate("/quotes")}
                    className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white text-xs font-bold px-4 py-2 rounded-lg transition-all active-scale font-sans"
                  >
                    Gelen Teklifleri Gör
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TenderScreen;
