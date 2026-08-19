import React from "react";
import { Home, MessageSquare, ShoppingCart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUI } from "../../context/UIContext";
import { triggerHaptic } from "../../utils/haptics";
import { useMessage } from "../../context/MessageContext";
import { cn } from "../../lib/utils";

export const BottomNav = () => {
  const { t } = useUI();
  const location = useLocation();
  const { conversations } = useMessage();

  // Toplam okunmamış mesaj sayısını hesapla
  const unreadCount = (conversations || []).reduce(
    (acc, conv) => acc + (conv.unreadCount || 0),
    0,
  );

  const tabs = [
    { id: "/", icon: Home, label: "Ana Sayfa" },
    { id: "/app/parts", icon: ShoppingCart, label: "Market" },
    {
      id: "/messages",
      icon: MessageSquare,
      label: "Mesajlar",
      badge: unreadCount,
    },
    { id: "/app/profile", icon: User, label: "Profil & Kokpit" },
  ];

  if (!t) return null;

  return (
    <nav className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-0 right-0 flex justify-center items-center z-[90] pointer-events-none px-4">
      <div className="w-full max-w-[340px] pointer-events-auto animate-slide-up">
        <div className="relative">
          {/* Subtle Glow under nav */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/5 via-primary-500/10 to-primary-500/5 blur-xl pointer-events-none rounded-full"></div>
          
          {/* Main Nav Container */}
          <div className="relative bg-white/90 dark:bg-[#0c101a]/90 border border-slate-200/80 dark:border-white/10 px-2.5 py-1.5 flex justify-between items-center rounded-full">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.id || (tab.id === "/" && location.pathname === "/application/home");
                
              return (
                <Link
                  key={tab.id}
                  to={tab.id}
                  onClick={() => triggerHaptic("light")}
                  className="relative flex flex-col items-center justify-center group w-12 h-12"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 z-10 relative",
                      isActive
                        ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30 dark:bg-cyan-500 dark:text-slate-950"
                        : "text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white",
                    )}
                  >
                    <tab.icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={cn(
                        "transition-transform duration-300",
                        isActive && "scale-105",
                      )}
                    />

                    {/* Unread Badge */}
                    {tab.badge > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-red-500 text-[9px] font-black text-white rounded-full ring-2 ring-white dark:ring-[#0c101a] animate-bounce z-20 shadow-sm">
                        {tab.badge > 9 ? "9+" : tab.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
