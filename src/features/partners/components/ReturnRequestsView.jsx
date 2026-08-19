import React, { useState, useEffect } from "react";
import { RotateCcw, Package, CheckCircle, XCircle, Eye, X, AlertCircle, Clock, RefreshCw, Search, ImageIcon } from "lucide-react";
import { ReturnService } from "../../../services/ReturnService";

const statusConfig = {
  pending: { label: "Bekliyor", color: "bg-amber-500/10 text-amber-500", icon: Clock },
  approved: { label: "Onaylandı", color: "bg-emerald-500/10 text-emerald-500", icon: CheckCircle },
  rejected: { label: "Reddedildi", color: "bg-red-500/10 text-red-500", icon: XCircle }
};

const reasonLabels = {
  defective: "Kusurlu / Arızalı Ürün",
  wrong_item: "Yanlış Ürün Gönderildi",
  not_as_described: "Tanıma Uygun Değil",
  damaged_in_shipping: "Kargoda Hasar Gördü",
  changed_mind: "Fikir Değişikliği",
  poor_quality: "Kalite Beklentinin Altında",
  other: "Diğer"
};

export default function ReturnRequestsView({ currentUser }) {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReturns = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    const { data } = await ReturnService.getReturnRequests(currentUser.id);
    setReturns(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReturns();
  }, [currentUser]);

  const handleApprove = async (returnReq) => {
    setActionLoading(true);
    const refundAmount = returnReq.order?.total_amount || 0;
    const { error } = await ReturnService.approveReturn(returnReq.id, returnReq.order_id, refundAmount);
    if (!error) {
      setSelectedReturn(null);
      fetchReturns();
    }
    setActionLoading(false);
  };

  const handleReject = async (returnReq) => {
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    const { error } = await ReturnService.rejectReturn(returnReq.id, rejectionReason);
    if (!error) {
      setSelectedReturn(null);
      setRejectionReason("");
      fetchReturns();
    }
    setActionLoading(false);
  };

  const tabs = [
    { key: "pending", label: "Bekleyenler", count: returns.filter(r => r.status === "pending").length },
    { key: "approved", label: "Onaylananlar", count: returns.filter(r => r.status === "approved").length },
    { key: "rejected", label: "Reddedilenler", count: returns.filter(r => r.status === "rejected").length },
    { key: "all", label: "Tümü", count: returns.length }
  ];

  const filteredReturns = returns.filter(r => {
    const matchesTab = activeTab === "all" || r.status === activeTab;
    const matchesSearch = searchQuery === "" ||
      (r.customer?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-mono font-black uppercase tracking-tight text-white">İade & İptal Talepleri</h1>
        <p className="text-xs text-slate-400 mt-1">Müşterilerden gelen iade taleplerini inceleyin, onaylayın veya reddedin.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === t.key
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 bg-slate-900/40 border border-white/5 px-4 py-3 rounded-2xl flex items-center gap-3">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            placeholder="Müşteri adı veya talep numarası ile ara..."
            className="bg-transparent w-full outline-none text-xs text-white placeholder:text-slate-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={fetchReturns} className="glass-card border border-white/5 w-12 flex items-center justify-center rounded-2xl text-slate-400 hover:text-white cursor-pointer active-scale">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Yükleniyor...</div>
      ) : filteredReturns.length === 0 ? (
        <div className="py-16 text-center text-slate-500 glass-card border border-white/5 rounded-xl">
          <RotateCcw size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-bold text-sm">İade talebi bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReturns.map((r) => {
            const cfg = statusConfig[r.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            // Map status config colors to unified colors
            let colorClass = cfg.color;
            if (r.status === "pending") colorClass = "bg-orange-500/10 text-orange-400";
            else if (r.status === "approved") colorClass = "bg-emerald-500/10 text-emerald-400";
            else if (r.status === "rejected") colorClass = "bg-red-500/10 text-red-400";
            
            return (
              <div key={r.id} className="glass-card border border-white/5 bg-slate-900/40 rounded-xl p-5 shadow-sm hover:border-white/10 transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-sm">
                        {r.customer?.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{r.customer?.full_name || "Müşteri"}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Sipariş: #{(r.order_id || "").slice(0, 8)} · {new Date(r.created_at).toLocaleDateString("tr-TR")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${colorClass}`}>
                        <StatusIcon size={12} /> {cfg.label}
                      </span>
                      <span className="bg-slate-950/40 border border-white/5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-300">
                        {reasonLabels[r.reason] || r.reason || "Belirtilmedi"}
                      </span>
                      {r.order?.total_amount && (
                        <span className="text-xs font-mono font-black text-white">₺{Number(r.order.total_amount).toLocaleString("tr-TR")}</span>
                      )}
                    </div>

                    {r.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/40 border border-white/5 p-3 rounded-xl">"{r.description}"</p>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedReturn(r)}
                    className="p-2.5 bg-slate-950/40 hover:bg-slate-900 border border-white/5 rounded-xl text-white transition-colors cursor-pointer active-scale shrink-0"
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
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="glass-card border border-white/10 bg-slate-950/95 w-full max-w-lg rounded-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setSelectedReturn(null); setRejectionReason(""); }} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer transition-colors">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <RotateCcw size={22} className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-black uppercase tracking-tight text-white">İade Talebi Detayı</h3>
                <p className="text-[10px] text-slate-400 font-bold">#{selectedReturn.id.slice(0, 12)}</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Customer Info */}
              <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 space-y-2">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">MÜŞTERİ BİLGİLERİ</p>
                <p className="font-bold text-sm text-white">{selectedReturn.customer?.full_name || "Müşteri"}</p>
                <p className="text-xs text-slate-400">{selectedReturn.customer?.phone_number || "—"} · {selectedReturn.customer?.email || "—"}</p>
              </div>

              {/* Reason */}
              <div className="bg-orange-500/5 border border-orange-500/10 p-4 rounded-2xl space-y-1.5">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">İADE SEBEBİ</p>
                <p className="font-mono font-bold text-sm text-orange-500">{reasonLabels[selectedReturn.reason] || selectedReturn.reason}</p>
                {selectedReturn.description && (
                  <p className="text-xs text-slate-300 mt-2 italic">"{selectedReturn.description}"</p>
                )}
              </div>

              {/* Evidence */}
              {selectedReturn.evidence_urls?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">KANIT GÖRSELLERİ</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {selectedReturn.evidence_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-20 h-20 bg-slate-900/40 rounded-2xl flex items-center justify-center border border-white/5 shrink-0 hover:border-orange-500/50 transition-colors">
                        <ImageIcon size={20} className="text-slate-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Amount */}
              <div className="flex justify-between items-center bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                <span className="text-xs font-bold text-slate-400">İade Tutarı</span>
                <span className="font-mono font-black text-lg text-emerald-400">₺{Number(selectedReturn.order?.total_amount || 0).toLocaleString("tr-TR")}</span>
              </div>

              {/* Actions */}
              {selectedReturn.status === "pending" && (
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => handleApprove(selectedReturn)}
                    disabled={actionLoading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer active-scale shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle size={16} /> {actionLoading ? "İşleniyor..." : "İadeyi Onayla & Geri Öde"}
                  </button>

                  <div className="space-y-2">
                    <textarea
                      rows="2"
                      placeholder="Red sebebi yazın..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full bg-slate-900/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none text-white placeholder:text-slate-500"
                    />
                    <button
                      onClick={() => handleReject(selectedReturn)}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 font-black rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-red-500/20 cursor-pointer"
                    >
                      <XCircle size={16} /> İadeyi Reddet
                    </button>
                  </div>
                </div>
              )}

              {/* Resolution Info */}
              {selectedReturn.status === "approved" && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                  <CheckCircle size={24} className="text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-sm text-emerald-400">İade Onaylandı</p>
                  <p className="text-[10px] text-slate-400 mt-1">{selectedReturn.resolved_at ? new Date(selectedReturn.resolved_at).toLocaleDateString("tr-TR") : ""}</p>
                </div>
              )}

              {/* Resolution Info */}
              {selectedReturn.status === "rejected" && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                  <XCircle size={20} className="text-red-400 mb-2" />
                  <p className="font-bold text-sm text-red-400">İade Reddedildi</p>
                  {selectedReturn.rejection_reason && (
                    <p className="text-xs text-slate-300 mt-1">Sebep: {selectedReturn.rejection_reason}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
