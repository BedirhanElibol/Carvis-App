import React, { useState, useEffect } from "react";
import { Shield, FileText, ClipboardList, CheckCircle2, ChevronRight, Activity, DollarSign, X, AlertCircle } from "lucide-react";
import { supabase } from "../../../supabaseClient";

export default function InsuranceDashboardView({ currentUser }) {
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // active, history

  const [stats, setStats] = useState({
    activePolicies: 0,
    pendingQuotes: 0,
    lossRatio: "38%",
    premiumVolume: 0
  });

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data: polList, error: polErr } = await supabase
        .from("insurance_quotes")
        .select("*, profiles:customer_id(full_name, phone), vehicles(brand, model, plate)");

      if (!polErr && polList) {
        setPolicies(polList);
      } else {
        setPolicies([]);
      }

      const { data: claimList, error: clmErr } = await supabase
        .from("insurance_claims")
        .select("*, profiles:customer_id(full_name, phone), vehicles(brand, model, plate)");

      if (!clmErr && claimList) {
        setClaims(claimList);
      } else {
        setClaims([]);
      }
    } catch (err) {
      console.error("Insurance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const activeDbCount = policies.filter(p => p.status === "active").length;
    const pendingDbCount = policies.filter(p => p.status === "pending").length;
    const totalDbPremium = policies.filter(p => p.status === "active").reduce((sum, p) => sum + (Number(p.price) || 0), 0);

    setStats({
      activePolicies: activeDbCount,
      pendingQuotes: pendingDbCount,
      lossRatio: "38%",
      premiumVolume: totalDbPremium
    });
  }, [policies]);

  const handleApproveQuote = async (id) => {
    await supabase.from("insurance_quotes").update({ status: "active" }).eq("id", id);
    fetchData();
  };

  const handleDeclineQuote = async (id) => {
    await supabase.from("insurance_quotes").update({ status: "declined" }).eq("id", id);
    fetchData();
  };

  // Filter queues by activeTab
  const dbPending = policies.filter(p => p.status === "pending");
  const dbActivePolicies = policies.filter(p => p.status === "active");
  const dbClaims = claims.filter(c => c.status === "pending" || c.status === "under_review");
  const dbSettledClaims = claims.filter(c => c.status === "approved" || c.status === "declined" || c.status === "completed");

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Sigorta Şirketi Paneli</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Rapidsy üzerinden gelen sigorta talepleri ve aktif poliçeler</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { label: "Aktif Poliçeler", value: stats.activePolicies, icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Teklif Talepleri", value: stats.pendingQuotes, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Hasar Kaybı Oranı", value: stats.lossRatio, icon: Activity, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Toplam Prim Hacmi", value: `₺${stats.premiumVolume.toLocaleString("tr-TR")}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
            <div className={`${s.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
              <s.icon size={22} className={s.color} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-black/5 dark:border-white/5 pb-px">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "active"
              ? "text-blue-500"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
          }`}
        >
          Bekleyen Risk İncelemeleri
          {activeTab === "active" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "history"
              ? "text-blue-500"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
          }`}
        >
          Aktif Poliçeler & Geçmiş Hasarlar
          {activeTab === "history" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "active" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Policy Underwriting Queue */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Poliçe Onay Sırası</h3>
              <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-bold">RİSK ANALİZİ</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500">Yükleniyor...</div>
            ) : dbPending.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FileText size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">Onay bekleyen teklif bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dbPending.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-3">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.profiles?.full_name || "Müşteri"}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Araç: {p.vehicles?.brand} {p.vehicles?.model} ({p.vehicles?.plate})</p>
                      </div>
                      <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                        ₺{p.price}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveQuote(p.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                      >
                        Poliçeleştir
                      </button>
                      <button
                        onClick={() => handleDeclineQuote(p.id)}
                        className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-2 rounded-xl text-xs transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Insurance Claims */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Hasar Talebi İnceleme Merkezi</h3>
              <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold">HASAR DOSYALARI</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500">Yükleniyor...</div>
            ) : dbClaims.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">İncelenen hasar dosyası bulunmuyor.</p>
              </div>
            ) : (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {dbClaims.map((claim) => (
                  <div key={claim.id} className="py-4 flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{claim.profiles?.full_name || "Müşteri"}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Talep No: #{claim.id.slice(0, 8)} · Tutar: ₺{claim.amount}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History View: Active Policies & Settled Claims */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Policies */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Aktif Yürürlükteki Poliçeler</h3>
              <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold">AKTİF</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500">Yükleniyor...</div>
            ) : dbActivePolicies.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Shield size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">Aktif yürürlükte poliçe bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dbActivePolicies.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.profiles?.full_name || "Müşteri"}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Araç: {p.vehicles?.brand} {p.vehicles?.model} ({p.vehicles?.plate})</p>
                      </div>
                      <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                        ₺{p.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settled Claims */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Sonuçlandırılan Hasarlar</h3>
              <span className="bg-slate-500/10 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold">SONUÇLANDI</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500">Yükleniyor...</div>
            ) : dbSettledClaims.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">Sonuçlandırılmış hasar dosyası bulunmuyor.</p>
              </div>
            ) : (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {dbSettledClaims.map((claim) => (
                  <div key={claim.id} className="py-4 flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{claim.profiles?.full_name || "Müşteri"}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Talep No: #{claim.id.slice(0, 8)} · Tutar: ₺{claim.amount} · Durum: <span className="font-bold uppercase text-[9px]">{claim.status}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
