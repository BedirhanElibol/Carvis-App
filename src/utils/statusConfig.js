import * as Icons from "lucide-react";

// Quote/Order Status Configuration
export const QUOTE_STATUS_CONFIG = {
  pending: {
    icon: Icons.Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    label: "Beklemede",
  },
  tender_open: {
    icon: Icons.AlertCircle,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    label: "İhaleye Açık",
  },
  claimed: {
    icon: Icons.CheckCircle,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    label: "Üstlenildi",
  },
  in_review: {
    icon: Icons.Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    label: "İncelemede",
  },
  accepted: {
    icon: Icons.CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    label: "Kabul Edildi",
  },
  rejected: {
    icon: Icons.XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "Reddedildi",
  },
  expired: {
    icon: Icons.Clock,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    label: "Süresi Doldu",
  },
  assigned: {
    icon: Icons.CheckCircle,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    label: "Yönlendirildi",
  },
  processing: {
    icon: Icons.Package,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    label: "İşleniyor",
  },
  in_transit: {
    icon: Icons.Truck,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    label: "Yolda",
  },
  shipped: {
    icon: Icons.Truck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    label: "Kargoda",
  },
  resolved: {
    icon: Icons.CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    label: "Çözümlendi",
  },
  completed: {
    icon: Icons.CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    label: "Tamamlandı",
  },
  refunded: {
    icon: Icons.XCircle,
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    label: "İade Edildi",
  },
  cancelled: {
    icon: Icons.XCircle,
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
      icon: Icons.AlertCircle,
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
