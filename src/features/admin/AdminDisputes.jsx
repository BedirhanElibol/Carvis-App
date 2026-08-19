import React, { useState, useEffect } from "react";
import { ShieldAlert, Eye, X, CheckCircle, RotateCcw, Search, RefreshCw, AlertTriangle, Scale, Clock, ArrowRight, User } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { DisputeService } from "../../services/DisputeService";

const statusConfig = {
  under_review: { label: "İnceleniyor", color: "bg-amber-500/10 text-amber-500", icon: Clock },
  refunded: { label: "Müşteriye İade", color: "bg-emerald-500/10 text-emerald-500", icon: RotateCcw },
  released_to_seller: { label: "Satıcıya Aktarıldı", color: "bg-blue-500/10 text-blue-500", icon: CheckCircle }
};

const reasonLabels = {
  poor_quality: "Hizmet kalitesi beklentinin altında",
  damage: "Araçta çizik veya fiziksel hasar",
  wrong_part: "Yanlış veya kalitesiz parça takıldı",
  other: "Diğer operasyonel aksaklıklar"
};

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("under_review");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("order_disputes")
        .select("*, customer:customer_id(full_name, phone_number, email, avatar_url), seller:seller_id(full_name, company_name, phone_number, avatar_url), order:order_id(id, total_amount, created_at, status, quote)")
        .order("created_at", { ascending: false });

      if (!error) setDisputes(data || []);
    } catch (err) {
      console.error("Error fetching disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (dispute, resolution) => {
    setActionLoading(true);
    const { error } = await DisputeService.resolveDispute(dispute.id, dispute.order_id, resolution);
    if (!error) {
      setSelectedDispute(null);
      fetchDisputes();
    }
    setActionLoading(false);
  };

  const tabs = [
    { key: "under_review", label: "İnceleme Bekleyenler", count: disputes.filter(d => d.status === "under_review").length },
    { key: "resolved", label: "Çözümlenenler", count: disputes.filter(d => ["refunded", "released_to_seller"].includes(d.status)).length },
    { key: "all", label: "Tümü", count: disputes.length }
  ];

  const filteredDisputes = disputes.filter(d => {
    const matchesTab = activeTab === "all"
      ? true
      : activeTab === "resolved"
        ? ["refunded", "released_to_seller"].includes(d.status)
        : d.status === activeTab;
    const matchesSearch = searchQuery === "" ||
      (d.customer?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.seller?.company_name || d.seller?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Scale size={24} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Anlaşmazlık Çözüm Merkezi</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Açılmış şikayetleri inceleyin, ödemeyi müşteriye iade edin veya satıcıya serbest bırakın.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-500/10 p-2 rounded-xl"><Clock size={18} className="text-amber-500" /></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bekleyen</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{disputes.filter(d => d.status === "under_review").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl"><RotateCcw size={18} className="text-emerald-500" /></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">İade Edilen</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{disputes.filter(d => d.status === "refunded").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500/10 p-2 rounded-xl"><CheckCircle size={18} className="text-blue-500" /></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Satıcıya Aktarılan</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{disputes.filter(d => d.status === "released_to_seller").length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/5 dark:border-white/5 overflow-x-auto gap-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === t.key
                ? "border-red-500 text-red-600 dark:text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 px-4 py-3 rounded-xl flex items-center gap-3">
          <Search size={16} className="text-slate-400" />
          <input type="text" placeholder="Müşteri, satıcı veya dispute numarası ile ara..."
            className="bg-transparent w-full outline-none text-xs text-slate-900 dark:text-white placeholder:text-slate-500"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={fetchDisputes} className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 w-12 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Yükleniyor...</div>
      ) : filteredDisputes.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl">
          <Scale size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-bold text-sm">Anlaşmazlık kaydı bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((d) => {
            const cfg = statusConfig[d.status] || statusConfig.under_review;
            const StatusIcon = cfg.icon;
            return (
              <div key={d.id} className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${
                d.status === "under_review" ? "border-amber-500/20" : "border-black/5 dark:border-white/5"
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Parties */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <User size={14} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Şikayetçi</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{d.customer?.full_name || "Müşteri"}</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-300" />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <User size={14} className="text-orange-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Satıcı</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{d.seller?.company_name || d.seller?.full_name || "Satıcı"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status + Reason */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${cfg.color}`}>
                        <StatusIcon size={12} /> {cfg.label}
                      </span>
                      <span className="bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {reasonLabels[d.reason_category] || d.reason_category || "Belirtilmedi"}
                      </span>
                      <span className="text-[10px] font-black text-slate-900 dark:text-white">
                        ₺{Number(d.order?.total_amount || 0).toLocaleString("tr-TR")}
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(d.created_at).toLocaleDateString("tr-TR")}</span>
                    </div>

                    {d.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 dark:bg-black/20 p-2 rounded-lg">"{d.description}"</p>
                    )}
                  </div>

                  <button onClick={() => setSelectedDispute(d)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-white transition-colors shrink-0"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-lg rounded-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedDispute(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Scale size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Tahkim Kararı</h3>
                <p className="text-[10px] text-slate-500 font-bold">#{selectedDispute.id.slice(0, 12)}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Parties */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl space-y-1">
                  <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">ŞİKAYETÇİ (MÜŞTERİ)</p>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedDispute.customer?.full_name}</p>
                  <p className="text-[10px] text-slate-500">{selectedDispute.customer?.phone_number || "—"}</p>
                </div>
                <div className="bg-orange-500/5 border border-orange-500/10 p-4 rounded-2xl space-y-1">
                  <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest">SAVUNMACI (SATICI)</p>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedDispute.seller?.company_name || selectedDispute.seller?.full_name}</p>
                  <p className="text-[10px] text-slate-500">{selectedDispute.seller?.phone_number || "—"}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl space-y-1">
                <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">ŞİKAYET SEBEBİ</p>
                <p className="font-bold text-sm text-amber-600 dark:text-amber-400">{reasonLabels[selectedDispute.reason_category] || selectedDispute.reason_category}</p>
                {selectedDispute.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">"{selectedDispute.description}"</p>
                )}
              </div>

              {/* Order Amount */}
              <div className="flex justify-between items-center bg-slate-50 dark:bg-black/20 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Havuzdaki Tutar</span>
                <span className="font-black text-xl text-slate-900 dark:text-white">₺{Number(selectedDispute.order?.total_amount || 0).toLocaleString("tr-TR")}</span>
              </div>

              {/* Admin Actions */}
              {selectedDispute.status === "under_review" && (
                <div className="space-y-3 pt-2">
                  <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-600 dark:text-red-400 font-bold leading-normal">
                      Kararınız nihai olacaktır. Ödeme seçtiğiniz tarafa aktarılacak ve sipariş statüsü güncellenecektir.
                    </p>
                  </div>

                  <button onClick={() => handleResolve(selectedDispute, "refund")} disabled={actionLoading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <RotateCcw size={16} /> {actionLoading ? "İşleniyor..." : "Müşteriye İade Et (Tam Geri Ödeme)"}
                  </button>

                  <button onClick={() => handleResolve(selectedDispute, "release")} disabled={actionLoading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <CheckCircle size={16} /> {actionLoading ? "İşleniyor..." : "Satıcıya Aktar (Ödemeyi Serbest Bırak)"}
                  </button>
                </div>
              )}

              {/* Resolved Info */}
              {selectedDispute.status !== "under_review" && (
                <div className={`p-4 rounded-2xl text-center ${
                  selectedDispute.status === "refunded"
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-blue-500/10 border border-blue-500/20"
                }`}>
                  {selectedDispute.status === "refunded" ? (
                    <>
                      <RotateCcw size={24} className="text-emerald-500 mx-auto mb-2" />
                      <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Müşteriye İade Edildi</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={24} className="text-blue-500 mx-auto mb-2" />
                      <p className="font-bold text-sm text-blue-600 dark:text-blue-400">Satıcıya Aktarıldı</p>
                    </>
                  )}
                  <p className="text-[10px] text-slate-500 mt-1">{selectedDispute.updated_at ? new Date(selectedDispute.updated_at).toLocaleDateString("tr-TR") : ""}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
