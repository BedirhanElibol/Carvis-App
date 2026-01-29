import React, { useState } from 'react';
import { MapPin, ChevronRight, Globe, Store, User, LogOut, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useGarage } from '../../context/GarageContext';
import { useNotification } from '../../context/NotificationContext';
import { useMessage } from '../../context/MessageContext';
import { useNavigate } from 'react-router-dom';

const AppHeader = () => {
    const { currentUser, handleLogout } = useAuth();
    const { t, language, toggleLanguage, openModal, selectedLocation } = useUI();
    const { currentVehicle } = useGarage();
    const { unreadCount } = useNotification();
    const { conversations = [] } = useMessage();
    const navigate = useNavigate();

    const totalUnreadMessages = Array.isArray(conversations)
        ? conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0)
        : 0;

    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleSellerEntry = () => {
        // Navigate to the Partner Selection Screen instead of direct dashboard
        navigate('/partner-login');
    };

    return (
        <div className="p-4 sm:p-5 flex justify-between items-center bg-slate-950/20 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-[100]">
            <button
                onClick={() => openModal('location')}
                className="flex items-center gap-2.5 text-slate-100 glass-card px-4 py-2.5 rounded-2xl active-scale border border-white/10 hover:bg-white/5 transition-all shadow-xl"
            >
                <div className="bg-primary-500/20 p-1.5 rounded-lg shadow-inner">
                    <MapPin size={16} className="text-primary-500" />
                </div>
                <div className="text-left">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Konum</p>
                    <p className="font-black text-[10px] uppercase tracking-tighter text-white leading-none truncate max-w-[80px]">
                        {selectedLocation || "Şehir Seç"}
                    </p>
                </div>
                <ChevronRight size={12} className="text-slate-500 rotate-90 ml-1" />
            </button>

            <div className="flex items-center gap-2">
                <button onClick={toggleLanguage} className="w-10 h-10 glass-card text-white rounded-xl flex items-center justify-center relative group active-scale border border-white/5">
                    <Globe size={18} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                    <span className="absolute text-[7px] bottom-1 font-black text-primary-400">{language?.toUpperCase()}</span>
                </button>

                {/* Mesaj Butonu */}
                <button
                    onClick={() => navigate('/messages')}
                    className="w-10 h-10 glass-card text-white rounded-xl flex items-center justify-center relative active-scale border border-white/5"
                >
                    <MessageSquare size={18} className="text-slate-400" />
                    {totalUnreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse border-2 border-slate-950">
                            {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                        </span>
                    )}
                </button>

                {/* Bildirim Butonu */}
                <button
                    onClick={() => navigate('/notifications')}
                    className="w-10 h-10 glass-card text-white rounded-xl flex items-center justify-center relative active-scale border border-white/5"
                >
                    <Bell size={18} className="text-slate-400" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse border-2 border-slate-950">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                <button onClick={handleSellerEntry} className="w-10 h-10 bg-primary-600 text-white rounded-xl shadow-lg flex items-center justify-center active-scale transition-all">
                    <Store size={20} />
                </button>

                {/* Admin Girişi (Sadece Adminler görür) */}
                {currentUser?.role === 'admin' && (
                    <button
                        onClick={() => navigate('/admin')}
                        className="w-10 h-10 bg-rose-600 text-white rounded-xl shadow-lg flex items-center justify-center active-scale transition-all border border-rose-400"
                        title="Yönetim Paneli"
                    >
                        <div className="animate-pulse-slow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                    </button>
                )}

                <div className="relative">
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-10 h-10 glass-card text-white rounded-xl flex items-center justify-center active-scale border border-white/10">
                        <User size={20} className="text-slate-200" />
                    </button>

                    {showUserMenu && (
                        <>
                            <div className="fixed inset-0 z-[90]" onClick={() => setShowUserMenu(false)}></div>
                            <div className="absolute top-12 right-0 w-48 glass-card border border-white/10 rounded-2xl z-[100] py-2 animate-slide-up shadow-2xl backdrop-blur-3xl">
                                <div className="px-4 py-2 border-b border-white/5 mb-1">
                                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Hesabım</p>
                                    <p className="font-bold text-white text-xs truncate">{currentUser?.email || "Misafir"}</p>
                                </div>
                                <button onClick={() => { setShowUserMenu(false); handleLogout(); }} className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 font-bold">
                                    <LogOut size={16} /> {t.logout}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppHeader;
