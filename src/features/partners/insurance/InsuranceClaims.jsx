import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, XCircle, MessageSquare, Camera, ChevronRight, Filter } from "lucide-react";

const MOCK_CLAIMS = [
  {
    id: "CLM-4421",
    customer: "Ahmet Yılmaz",
    plate: "34 ABC 123",
    type: "Çarpışma Hasarı",
    amount: "₺18.500",
    status: "under_review",
    filed: "2026-07-05",
    description: "Otopark çıkışında sağ ön tampon hasarı oluştu. Araç sürülebilir durumda.",
    evidence: 3,
  },
  {
    id: "CLM-4408",
    customer: "Zeynep Şahin",
    plate: "16 GHI 012",
    type: "Cam Kırığı",
    amount: "₺2.200",
    status: "approved",
    filed: "2026-07-01",
    description: "Sol ön camda çatlak. Güvenli değil.",
    evidence: 2,
  },
  {
    id: "CLM-4395",
    customer: "Fatma Demir",
    plate: "06 XYZ 456",
    type: "Çalınma Girişimi",
    amount: "₺45.000",
    status: "rejected",
    filed: "2026-06-28",
    description: "Araç kapısı zorlanmış, kilit sistemi hasar görmüş.",
    evidence: 5,
  },
  {
    id: "CLM-4380",
    customer: "Burak Çelik",
    plate: "41 JKL 345",
    type: "Su Baskını",
    amount: "₺32.000",
    status: "pending_docs",
    filed: "2026-06-20",
    description: "Fırtına sonrası araç içi su hasarı.",
    evidence: 1,
  },
];

const statusConfig = {
  under_review: { label: "İnceleniyor", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  approved: { label: "Onaylandı", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  rejected: { label: "Reddedildi", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
  pending_docs: { label: "Belge Bekleniyor", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
};

export default function InsuranceClaims() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = MOCK_CLAIMS.filter((c) => filter === "all" || c.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Hasar Talepleri</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rapidsy platformu üzerinden iletilen hasar bildirimleri</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, sc]) => {
          const count = MOCK_CLAIMS.filter((c) => c.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? "all" : key)}
              className={`text-left bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all ${
                filter === key ? "border-blue-500/40 ring-1 ring-blue-500/20" : "border-black/5 dark:border-white/5"
              }`}
            >
              <div className={`${sc.bg} w-9 h-9 rounded-xl flex items-center justify-center mb-2`}>
                <sc.icon size={16} className={sc.color} />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{count}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{sc.label}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claims List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
          <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 dark:text-white">Talepler ({filtered.length})</span>
            <Filter size={16} className="text-slate-400" />
          </div>
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {filtered.map((claim) => {
              const sc = statusConfig[claim.status];
              const isSelected = selected?.id === claim.id;
              return (
                <button
                  key={claim.id}
                  onClick={() => setSelected(isSelected ? null : claim)}
                  className={`w-full text-left flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${
                    isSelected ? "bg-blue-500/5" : ""
                  }`}
                >
                  <div className={`${sc.bg} w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <sc.icon size={16} className={sc.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{claim.type}</span>
                      <span className="font-black text-sm text-slate-900 dark:text-white">{claim.amount}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {claim.customer} · {claim.plate} · {claim.filed}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-black/5 dark:border-white/5 p-5">
          {selected ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{selected.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConfig[selected.status].bg} ${statusConfig[selected.status].color}`}>
                  {statusConfig[selected.status].label}
                </span>
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 dark:text-white">{selected.customer}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selected.plate} · {selected.type}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Açıklama</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{selected.description}</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-slate-900 dark:text-white">{selected.amount}</p>
                  <p className="text-[11px] text-slate-500">Talep Tutarı</p>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Camera size={14} className="text-slate-400" />
                    <p className="text-xl font-black text-slate-900 dark:text-white">{selected.evidence}</p>
                  </div>
                  <p className="text-[11px] text-slate-500">Kanıt Dosyası</p>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white py-2.5 rounded-xl font-bold text-sm transition-all">
                  <CheckCircle size={16} />
                  Talebi Onayla
                </button>
                <button className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 text-red-500 py-2.5 rounded-xl font-bold text-sm transition-all">
                  <XCircle size={16} />
                  Reddet
                </button>
                <button className="w-full flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white py-2 rounded-xl font-bold text-sm transition-all">
                  <MessageSquare size={16} />
                  Müşteriyle İletişime Geç
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <AlertTriangle size={36} className="mb-3 opacity-30" />
              <p className="font-medium text-sm">Detay görüntülemek için</p>
              <p className="text-sm">bir talep seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
