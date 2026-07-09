import React, { useState } from "react";
import { FileText, Plus, Search, Filter, CheckCircle, Clock, XCircle, TrendingUp, Shield, ChevronRight } from "lucide-react";

const MOCK_POLICIES = [
  { id: "POL-001", customer: "Ahmet Yılmaz", plate: "34 ABC 123", type: "Kasko", premium: "₺4.200", status: "active", expires: "2027-03-15", risk: "Düşük" },
  { id: "POL-002", customer: "Fatma Demir", plate: "06 XYZ 456", type: "Trafik", premium: "₺1.850", status: "active", expires: "2026-12-01", risk: "Orta" },
  { id: "POL-003", customer: "Mehmet Kaya", plate: "35 DEF 789", type: "Kasko+", premium: "₺6.500", status: "pending", expires: "—", risk: "—" },
  { id: "POL-004", customer: "Zeynep Şahin", plate: "16 GHI 012", type: "Trafik", premium: "₺1.400", status: "expired", expires: "2025-11-30", risk: "Yüksek" },
];

const statusConfig = {
  active: { label: "Aktif", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  pending: { label: "Onay Bekliyor", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  expired: { label: "Süresi Doldu", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
};

export default function InsurancePolicies() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = MOCK_POLICIES.filter((p) => {
    const matchSearch =
      p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.plate.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Poliçe Teklifleri</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rapidsy üzerinden gelen sigorta talepleri ve aktif poliçeler</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/30">
          <Plus size={16} />
          Yeni Teklif Oluştur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Aktif Poliçe", value: "2", icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Bekleyen Teklif", value: "1", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Bu Ay Prim", value: "₺12.350", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Toplam Poliçe", value: "4", icon: FileText, color: "text-slate-400", bg: "bg-slate-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-black/5 dark:border-white/5">
            <div className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-black/5 dark:border-white/5 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Müşteri adı, plaka veya poliçe no..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-black/5 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "pending", "expired"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {f === "all" ? "Tümü" : statusConfig[f]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="divide-y divide-black/5 dark:divide-white/5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sonuç bulunamadı</p>
            </div>
          ) : (
            filtered.map((policy) => {
              const sc = statusConfig[policy.status];
              return (
                <div key={policy.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                  <div className={`${sc.bg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <sc.icon size={18} className={sc.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{policy.customer}</span>
                      <span className="text-xs text-slate-400">{policy.id}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {policy.plate} · {policy.type} · {policy.expires !== "—" ? `Bitiş: ${policy.expires}` : "Henüz aktif değil"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-slate-900 dark:text-white text-sm">{policy.premium}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-all flex-shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
