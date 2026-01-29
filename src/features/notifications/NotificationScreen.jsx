import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useUI } from '../../context/UIContext';
import { Bell, Check, Trash2, Clock, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { Badge } from '../../components/Core';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const NotificationScreen = () => {
    const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotification();
    const { t } = useUI();
    const [filter, setFilter] = useState('all'); // 'all', 'unread'

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        return true;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={20} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={20} className="text-amber-500" />;
            case 'error': return <X size={20} className="text-red-500" />;
            default: return <Info size={20} className="text-primary-500" />;
        }
    };

    return (
        <div className="p-4 sm:p-6 pb-24 max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-3">
                        <div className="p-2 bg-primary-600/20 rounded-xl">
                            <Bell className="text-primary-500" />
                        </div>
                        Bildirimler
                        {unreadCount > 0 && (
                            <Badge type="error" className="text-sm px-2 py-0.5">{unreadCount} Yeni</Badge>
                        )}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Siparişler, teklifler ve sistem uyarıları.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-slate-900 rounded-xl border border-white/10">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Tümü
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'unread' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Okunmamış
                        </button>
                    </div>

                    <button
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="p-2.5 glass-card rounded-xl text-primary-400 hover:text-white hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Tümünü Okundu İşaretle"
                    >
                        <Check size={20} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`glass-card p-4 rounded-2xl border transition-all group relative overflow-hidden ${notif.is_read ? 'border-white/5 opacity-80 hover:opacity-100' : 'border-primary-500/30 bg-primary-500/5'}`}
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${notif.is_read ? 'bg-transparent' : 'bg-primary-500'}`}></div>

                            <div className="flex gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-white/5 ${notif.is_read ? 'bg-slate-900' : 'bg-slate-800'}`}>
                                    {getIcon(notif.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className={`font-bold text-sm truncate pr-6 ${notif.is_read ? 'text-slate-300' : 'text-white'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 flex-shrink-0">
                                            <Clock size={10} />
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: tr })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        {notif.message}
                                    </p>
                                </div>
                            </div>

                            {/* Actions (Hover) */}
                            <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notif.is_read && (
                                    <button onClick={() => markAsRead(notif.id)} className="p-1.5 bg-slate-800 hover:bg-primary-600 rounded-lg text-slate-400 hover:text-white transition-colors" title="Okundu işaretle">
                                        <Check size={14} />
                                    </button>
                                )}
                                <button onClick={() => deleteNotification(notif.id)} className="p-1.5 bg-slate-800 hover:bg-red-600 rounded-lg text-slate-400 hover:text-white transition-colors" title="Sil">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 animate-pulse">
                            <Bell size={32} className="text-slate-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-300">Bildirim Yok</h3>
                        <p className="text-xs text-slate-500 mt-1">Şu an için gösterilecek yeni bir bildiriminiz bulunmuyor.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationScreen;
