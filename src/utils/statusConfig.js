import { AlertCircle, CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react";

// Quote/Order Status Configuration
export const QUOTE_STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    label: "Beklemede",
  },
  tender_open: {
    icon: AlertCircle,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    label: "İhaleye Açık",
  },
  claimed: {
    icon: CheckCircle,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    label: "Üstlenildi",
  },
  in_review: {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    label: "İncelemede",
  },
  accepted: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    label: "Kabul Edildi",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "Reddedildi",
  },
  expired: {
    icon: Clock,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    label: "Süresi Doldu",
  },
  assigned: {
    icon: CheckCircle,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    label: "Yönlendirildi",
  },
  processing: {
    icon: Package,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    label: "İşleniyor",
  },
  in_transit: {
    icon: Truck,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    label: "Yolda",
  },
  shipped: {
    icon: Truck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    label: "Kargoda",
  },
  resolved: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    label: "Çözümlendi",
  },
  completed: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    label: "Tamamlandı",
  },
  refunded: {
    icon: XCircle,
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    label: "İade Edildi",
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "İptal Edildi",
  },
};

// Get status config with fallback
export const getStatusConfig = (status) => {
  return (
    QUOTE_STATUS_CONFIG[status] || {
      icon: AlertCircle,
      color: "text-slate-500 dark:text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/30",
      label: "Bilinmiyor",
    }
  );
};

// Urgency Configuration (for AI suggestions, alerts)
export const URGENCY_CONFIG = {
  high: { bg: "bg-red-500", text: "text-slate-900 dark:text-white", label: "Acil" },
  medium: { bg: "bg-amber-500", text: "text-slate-900 dark:text-white", label: "Yakında" },
  low: { bg: "bg-green-500", text: "text-slate-900 dark:text-white", label: "Planla" },
};

// Item Type Configuration (for unified cart)
export const ITEM_TYPE_CONFIG = {
  part: { bg: "bg-primary-500/20", color: "text-primary-400", label: "Parça" },
  service: {
    bg: "bg-accent-500/20",
    color: "text-accent-400",
    label: "Servis",
  },
};
