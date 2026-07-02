import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Wrench, Package, Truck, Droplet, Star } from 'lucide-react';

const statusConfig = {
    pending: { label: 'Onay Bekliyor', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    accepted: { label: 'Onaylandı', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    in_progress: { label: 'İşlemde', icon: Wrench, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    completed: { label: 'Tamamlandı', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    cancelled: { label: 'İptal Edildi', icon: Clock, color: 'text-red-500', bg: 'bg-red-500/10' },
};

const getRoleIcon = (role) => {
    switch (role) {
        case 'mechanic': return Wrench;
        case 'carwash': return Droplet;
        case 'parts': return Package;
        case 'valet': return Truck;
        default: return Wrench;
    }
};

const LiveOrderStatus = ({ order }) => {
    if (!order) return null;

    const currentStatus = statusConfig[order.status] || statusConfig.pending;
    const RoleIcon = getRoleIcon(order.seller_role);

    // Progress percentage based on status
    const getProgress = (status) => {
        switch (status) {
            case 'pending': return 25;
            case 'accepted': return 50;
            case 'in_progress': return 75;
            case 'completed': return 100;
            case 'cancelled': return 0;
            default: return 0;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        <RoleIcon className="text-primary-500" size={20} />
                        Hizmet Durumu
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sipariş No: #{order.id?.split('-')[0]}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${currentStatus.bg} ${currentStatus.color}`}>
                    {currentStatus.label}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgress(order.status)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`absolute top-0 left-0 h-full ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-primary-500'}`}
                />
            </div>

            {/* Status Details (CRM Update from Seller) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                <div className={`p-3 rounded-full ${currentStatus.bg} ${currentStatus.color}`}>
                    <currentStatus.icon size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                        {order.status === 'completed' ? 'İşlem Tamamlandı' : 'Son Güncelleme'}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {order.status_details || "Hizmet sağlayıcıdan güncelleme bekleniyor..."}
                    </p>
                    
                    {order.rating && (
                        <div className="flex items-center gap-1 mt-3 text-yellow-500">
                            {[...Array(order.rating)].map((_, i) => (
                                <Star key={i} size={14} fill="currentColor" />
                            ))}
                            <span className="text-xs font-bold text-slate-500 ml-1">Sizin Değerlendirmeniz</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default LiveOrderStatus;
