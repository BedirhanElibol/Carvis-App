import React from "react";
import { AlertCircle, ArrowRight, CheckCircle, Clock, XCircle, Shield, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuoteCard = ({ quote }) => {
  const navigate = useNavigate();

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-400",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          label: "Beklemede",
        };
      case "accepted":
        return {
          icon: CheckCircle,
          color: "text-green-400",
          bg: "bg-green-500/10",
          border: "border-green-500/30",
          label: "Kabul Edildi",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          label: "Reddedildi",
        };
      case "expired":
        return {
          icon: AlertCircle,
          color: "text-slate-500",
          bg: "bg-slate-500/10",
          border: "border-slate-500/30",
          label: "Süresi Doldu",
        };
      default:
        return {
          icon: Clock,
          color: "text-slate-500 dark:text-slate-400",
          bg: "bg-slate-500/10",
          border: "border-slate-500/30",
          label: "Bilinmiyor",
        };
    }
  };

  const config = getStatusConfig(quote.status);
  const StatusIcon = config.icon;

  return (
    <div
      onClick={() => navigate(`/quotes/${quote.id}`)}
      className={`glass-card p-5 rounded-2xl border ${config.border} cursor-pointer active-scale transition-all hover:bg-black/5 dark:bg-white/5`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`${config.bg} ${config.color} px-2 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold`}
            >
              <StatusIcon size={14} />
              {config.label}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {quote.seller?.company_name ||
                quote.seller?.full_name ||
                "Satıcı"}
            </h3>
            {quote.seller?.is_verified && (
              <div
                className="flex items-center gap-1 bg-primary-500/10 text-primary-400 px-1.5 py-0.5 rounded-md border border-primary-500/20"
                title="Doğrulanmış Satıcı"
              >
                <CheckCircle size={10} className="fill-current" />
                <span className="text-[9px] font-black uppercase tracking-tighter">
                  Resmi
                </span>
              </div>
            )}
          </div>
          {quote.seller?.seller_rating > 0 ? (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                <Shield size={12} className="text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-black text-[10px] uppercase tracking-wider">
                  Rapidsy Güven Skoru: {quote.seller.seller_rating.toFixed(1)}/5
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < Math.floor(quote.seller.seller_rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-300 dark:text-slate-700"
                    }
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
              <Shield size={12} /> Yeni İş Ortağı
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
            ₺{quote.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </p>
          {quote.estimated_delivery_days && (
            <p className="text-xs text-slate-500 mt-1">
              {quote.estimated_delivery_days} gün teslimat
            </p>
          )}
        </div>
      </div>

      {/* OEM Labor Ceiling Badge */}
      {quote.standard_hours && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
          <span className="text-cyan-400 font-bold flex items-center gap-1.5 text-[10px]">
            ⚡ OEM Standart Süre: <strong>{quote.standard_hours} Saat</strong>
          </span>
          <span className="text-emerald-400 font-bold text-[10px]">
            Tavan Limit: ₺{quote.max_labor_ceiling?.toLocaleString("tr-TR") || quote.price}
          </span>
        </div>
      )}

      {/* Description */}
      {quote.description && (
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
          {quote.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
        <div className="text-xs text-slate-500">
          {new Date(quote.created_at).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="flex items-center gap-1 text-primary-400 text-sm font-semibold">
          Detaylar <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;
