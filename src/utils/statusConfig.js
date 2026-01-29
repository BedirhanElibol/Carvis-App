import { Clock, CheckCircle, XCircle, Package, Truck, AlertCircle } from 'lucide-react';

// Quote/Order Status Configuration
export const QUOTE_STATUS_CONFIG = {
    pending: {
        icon: Clock,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        label: 'Beklemede'
    },
    accepted: {
        icon: CheckCircle,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        label: 'Kabul Edildi'
    },
    rejected: {
        icon: XCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        label: 'Reddedildi'
    },
    expired: {
        icon: Clock,
        color: 'text-slate-500',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
        label: 'Süresi Doldu'
    },
    processing: {
        icon: Package,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        label: 'İşleniyor'
    },
    shipped: {
        icon: Truck,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        label: 'Kargoda'
    },
    completed: {
        icon: CheckCircle,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        label: 'Tamamlandı'
    },
    cancelled: {
        icon: XCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        label: 'İptal Edildi'
    },
};

// Get status config with fallback
export const getStatusConfig = (status) => {
    return QUOTE_STATUS_CONFIG[status] || {
        icon: AlertCircle,
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
        label: 'Bilinmiyor'
    };
};

// Urgency Configuration (for AI suggestions, alerts)
export const URGENCY_CONFIG = {
    high: { bg: 'bg-red-500', text: 'text-white', label: 'Acil' },
    medium: { bg: 'bg-amber-500', text: 'text-white', label: 'Yakında' },
    low: { bg: 'bg-green-500', text: 'text-white', label: 'Planla' },
};

// Item Type Configuration (for unified cart)
export const ITEM_TYPE_CONFIG = {
    part: {
        bg: 'bg-primary-500/20',
        color: 'text-primary-400',
        label: 'Parça'
    },
    service: {
        bg: 'bg-accent-500/20',
        color: 'text-accent-400',
        label: 'Servis'
    },
};
