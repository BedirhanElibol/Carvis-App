import * as Icons from "lucide-react";
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
  const unreadCount = conversations.reduce(
    (acc, conv) => acc + (conv.unreadCount || 0),
    0,
  );

  const tabs = [
    { id: "/", icon: Icons.Home, label: "Ana Sayfa" },
    { id: "/app/parts", icon: Icons.ShoppingCart, label: "Market" },
    {
      id: "/messages",
      icon: Icons.MessageSquare,
      label: "Mesajlar",
      badge: unreadCount,
    },
    { id: "/app/map", icon: Icons.Map, label: "Harita" },
    { id: "/application/home", icon: Icons.LayoutDashboard, label: "Hizmetler" },
  ];

  if (!t) return null;

  return (
    <nav className="fixed bottom-6 left-0 right-0 flex justify-center items-center z-[999] pointer-events-none px-4">
      <div className="w-full max-w-[400px] pointer-events-auto animate-slide-up">
        <div className="relative">
          {/* Subtle Shadow/Glow under the nav container */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/5 via-primary-500/10 to-primary-500/5 blur-2xl pointer-events-none rounded-[3rem]"></div>
          
          {/* Main Nav Container */}
          <div className="relative bg-white/95 dark:bg-[#0c101a]/95 backdrop-blur-2xl border border-slate-200/50 dark:border-white/5 px-3 py-2.5 flex justify-between items-center rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
            {tabs.map((tab) => {
              const isActive = tab.id === "/" 
                ? location.pathname === "/" 
                : location.pathname.startsWith(tab.id);
                
              return (
                <Link
                  key={tab.id}
                  to={tab.id}
                  onClick={() => triggerHaptic("light")}
                  className="relative flex flex-col items-center justify-center group w-[60px] h-[60px]"
                >
                  {/* The Active Glow Background (Orange glow behind the blue dot) */}
                  {isActive && (
                    <div className="absolute -bottom-2 w-8 h-8 bg-accent-500/30 dark:bg-accent-500/40 blur-[10px] rounded-full pointer-events-none transition-all duration-500"></div>
                  )}

                  <div
                    className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-[1.4rem] transition-all duration-500 z-10",
                      isActive
                        ? "bg-primary-50 text-primary-500 dark:bg-[#18233a] dark:text-primary-400 shadow-sm dark:shadow-none"
                        : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",
                    )}
                  >
                    <tab.icon
                      size={24}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={cn(
                        "transition-transform duration-500",
                        isActive && "scale-[1.15]",
                      )}
                    />

                    {/* Unread Badge */}
                    {tab.badge > 0 && (
                      <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center bg-accent-500 text-[10px] font-bold text-white rounded-full ring-2 ring-white dark:ring-[#0c101a] animate-bounce z-20 shadow-sm">
                        {tab.badge > 9 ? "9+" : tab.badge}
                      </span>
                    )}
                  </div>
                  
                  {/* Active Blue Dot Indicator */}
                  <div className={cn(
                    "absolute -bottom-0.5 w-1.5 h-1.5 rounded-full transition-all duration-500 z-20",
                    isActive 
                      ? "bg-primary-500 dark:bg-primary-400 opacity-100 scale-100" 
                      : "bg-transparent opacity-0 scale-0"
                  )} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
