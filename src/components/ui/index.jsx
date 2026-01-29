import React from 'react';
import { getStatusConfig, URGENCY_CONFIG, ITEM_TYPE_CONFIG } from '../utils/statusConfig';

// ================================================
// StatusBadge - Reusable status indicator
// ================================================
export const StatusBadge = ({ status, size = 'md', showIcon = true, className = '' }) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    const sizes = {
        sm: 'text-[9px] px-2 py-0.5',
        md: 'text-[10px] px-2.5 py-1',
        lg: 'text-xs px-3 py-1.5',
    };

    return (
        <span className={`inline-flex items-center gap-1 font-black uppercase tracking-widest rounded-full ${config.bg} ${config.color} ${sizes[size]} ${className}`}>
            {showIcon && <Icon size={size === 'sm' ? 10 : size === 'lg' ? 14 : 12} />}
            {config.label}
        </span>
    );
};

// ================================================
// UrgencyBadge - For AI suggestions and alerts
// ================================================
export const UrgencyBadge = ({ level = 'medium', size = 'sm', className = '' }) => {
    const config = URGENCY_CONFIG[level] || URGENCY_CONFIG.medium;

    const sizes = {
        sm: 'text-[8px] px-2 py-0.5',
        md: 'text-[10px] px-2.5 py-1',
        lg: 'text-xs px-3 py-1.5',
    };

    return (
        <span className={`inline-flex items-center font-black uppercase rounded-full ${config.bg} ${config.text} ${sizes[size]} ${className}`}>
            {config.label}
        </span>
    );
};

// ================================================
// ItemTypeBadge - For cart items (part/service)
// ================================================
export const ItemTypeBadge = ({ type = 'part', className = '' }) => {
    const config = ITEM_TYPE_CONFIG[type] || ITEM_TYPE_CONFIG.part;

    return (
        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${config.bg} ${config.color} ${className}`}>
            {config.label}
        </span>
    );
};

// ================================================
// LoadingSpinner - Consistent loading indicator
// ================================================
export const LoadingSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
    const sizes = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
    };

    const colors = {
        primary: 'border-primary-500',
        white: 'border-white',
        slate: 'border-slate-500',
    };

    return (
        <div className={`animate-spin rounded-full border-b-transparent ${sizes[size]} ${colors[color]} ${className}`} />
    );
};

// ================================================
// EmptyState - Placeholder for empty lists
// ================================================
export const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => (
    <div className={`text-center py-12 ${className}`}>
        {Icon && <Icon size={48} className="mx-auto mb-4 text-slate-600" />}
        <h4 className="font-bold text-white mb-2">{title}</h4>
        {description && <p className="text-sm text-slate-500 mb-4">{description}</p>}
        {action}
    </div>
);

// ================================================
// GlassCard - Standard glass card wrapper
// ================================================
export const GlassCard = ({ children, className = '', onClick, hover = true }) => (
    <div
        onClick={onClick}
        className={`
            glass-card rounded-2xl border border-white/10 
            ${hover ? 'hover:border-primary-500/30 transition-all' : ''} 
            ${onClick ? 'cursor-pointer active-scale' : ''} 
            ${className}
        `}
    >
        {children}
    </div>
);
