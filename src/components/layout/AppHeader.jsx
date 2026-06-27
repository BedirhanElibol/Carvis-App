import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { useNotification } from "../../context/NotificationContext";
import { useMessage } from "../../context/MessageContext";
import { useNavigate } from "react-router-dom";

const AppHeader = () => {
  const { currentUser, handleLogout } = useAuth();
  const { t, language, toggleLanguage, theme, toggleTheme, openModal, selectedLocation } = useUI();
  const { unreadCount } = useNotification();
  const { conversations = [] } = useMessage();
  const navigate = useNavigate();

  const totalUnreadMessages = Array.isArray(conversations)
    ? conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0)
    : 0;

  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSellerEntry = () => {
    // If the user already has a partner role, go directly to dashboard
    const partnerRoles = ["parking", "valet", "mechanic", "parts"];
    if (currentUser && partnerRoles.includes(currentUser.role)) {
      navigate("/partner/dashboard");
    } else {
      // Otherwise, show the selection/landing screen
      navigate("/partner-login");
    }
  };

  return (
    <div className="p-4 sm:p-5 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 sticky top-0 z-[100]">
      <button
        onClick={() => openModal("location")}
        className="flex items-center gap-2.5 text-slate-800 dark:text-slate-100 glass-card px-4 py-2.5 rounded-2xl active-scale border border-black/10 dark:border-white/10 hover:bg-black/5 dark:bg-white/5 transition-all shadow-xl"
      >
        <div className="bg-primary-500/20 p-1.5 rounded-lg shadow-inner">
          <Icons.MapPin size={16} className="text-primary-500" />
        </div>
        <div className="text-left">
          <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">
            {t.location}
          </p>
          <p className="font-black text-[10px] uppercase tracking-tighter text-slate-900 dark:text-white leading-none truncate max-w-[80px]">
            {selectedLocation || t.selectCityHeader}
          </p>
        </div>
        <Icons.ChevronRight
          size={12}
          className="text-slate-500 rotate-90 ml-1"
        />
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="w-10 h-10 glass-card text-slate-900 dark:text-white rounded-xl flex items-center justify-center relative group active-scale border border-black/5 dark:border-white/5"
        >
          <Icons.Globe
            size={18}
            className="text-slate-500 dark:text-slate-400 group-hover:text-primary-500 transition-colors"
          />
          <span className="absolute text-[7px] bottom-1 font-black text-primary-400">
            {language?.toUpperCase()}
          </span>
        </button>

        {/* Tema Butonu */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 glass-card text-slate-900 dark:text-white rounded-xl flex items-center justify-center relative active-scale border border-black/5 dark:border-white/5"
          title={theme === "dark" ? t.lightMode : t.darkMode}
        >
          {theme === "dark" ? (
            <Icons.Sun size={18} className="text-amber-400" />
          ) : (
            <Icons.Moon size={18} className="text-slate-500 dark:text-slate-400" />
          )}
        </button>

        {/* Mesaj Butonu */}
        <button
          onClick={() => navigate("/messages")}
          className="w-10 h-10 glass-card text-slate-900 dark:text-white rounded-xl flex items-center justify-center relative active-scale border border-black/5 dark:border-white/5"
        >
          <Icons.MessageSquare size={18} className="text-slate-500 dark:text-slate-400" />
          {totalUnreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary-500 text-slate-900 dark:text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse border-2 border-slate-950">
              {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
            </span>
          )}
        </button>

        {/* Bildirim Butonu */}
        <button
          onClick={() => navigate("/notifications")}
          className="w-10 h-10 glass-card text-slate-900 dark:text-white rounded-xl flex items-center justify-center relative active-scale border border-black/5 dark:border-white/5"
        >
          <Icons.Bell size={18} className="text-slate-500 dark:text-slate-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-slate-900 dark:text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse border-2 border-slate-950">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={handleSellerEntry}
          className="w-10 h-10 bg-primary-600 text-slate-900 dark:text-white rounded-xl shadow-lg flex items-center justify-center active-scale transition-all"
        >
          <Icons.Store size={20} />
        </button>

        {/* Admin Girişi (Sadece Adminler görür) */}
        {currentUser?.role === "admin" && (
          <button
            onClick={() => navigate("/admin")}
            className="w-10 h-10 bg-rose-600 text-slate-900 dark:text-white rounded-xl shadow-lg flex items-center justify-center active-scale transition-all border border-rose-400"
            title={t.adminPanel || "Yönetim Paneli"}
          >
            <div className="animate-pulse-slow">
              <Icons.ShieldAlert size={20} />
            </div>
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 glass-card text-slate-900 dark:text-white rounded-xl flex items-center justify-center active-scale border border-black/10 dark:border-white/10"
          >
            <Icons.User size={20} className="text-slate-700 dark:text-slate-200" />
          </button>
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-[90]"
                onClick={() => setShowUserMenu(false)}
              ></div>
              <div className="absolute top-12 right-0 w-48 glass-card border border-black/10 dark:border-white/10 rounded-2xl z-[100] py-2 animate-slide-up shadow-2xl backdrop-blur-3xl">
                <div className="px-4 py-2 border-b border-black/5 dark:border-white/5 mb-1">
                  <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">
                    {t.myAccount}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                    {currentUser?.email || t.guest}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                    navigate("/");
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 font-bold font-sans"
                >
                  <Icons.LogOut size={16} />
                  {t.logout}
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
