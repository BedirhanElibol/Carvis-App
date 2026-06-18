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
    { id: "/application/home", icon: Icons.Home, label: "Hizmet" },
    { id: "/app/parts", icon: Icons.ShoppingCart, label: "Market" },
    {
      id: "/messages",
      icon: Icons.MessageSquare,
      label: "Mesajlar",
      badge: unreadCount,
    },
    { id: "/app/map", icon: Icons.Map, label: "Harita" },
    { id: "/app/profile", icon: Icons.Car, label: "Garaj" },
  ];

  if (!t) return null;

  return (
    <nav className="fixed bottom-8 left-0 right-0 flex justify-center items-center z-[999] pointer-events-none px-4">
      <div className="w-full max-w-[400px] pointer-events-auto animate-slide-up">
        <div className="relative">
          {/* Premium Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent blur-3xl pointer-events-none"></div>
          <div className="relative glass-panel bg-slate-950/80 backdrop-blur-3xl border border-white/10 px-4 py-3 flex justify-between items-center rounded-[2rem] shadow-2xl ring-1 ring-white/5">
            {tabs.map((tab) => {
              const isActive = location.pathname.startsWith(tab.id);
              return (
                <Link
                  key={tab.id}
                  to={tab.id}
                  onClick={() => triggerHaptic("light")}
                  className="relative flex flex-col items-center justify-center group"
                >
                  <div
                    className={cn(
                      "p-3 rounded-2xl transition-all duration-300 relative",
                      isActive
                        ? "text-primary-400 bg-primary-500/10 shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)] scale-110"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5",
                    )}
                  >
                    <tab.icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={cn(
                        "transition-transform duration-300",
                        isActive && "scale-105",
                      )}
                    />

                    {/* Unread Badge */}
                    {tab.badge > 0 && (
                      <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center bg-red-500 text-[10px] font-bold text-white rounded-full ring-2 ring-slate-950 animate-bounce">
                        {tab.badge > 9 ? "9+" : tab.badge}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <span className="absolute -bottom-2 w-1 h-1 bg-primary-500 rounded-full animate-fade-in shadow-[0_0_8px_2px_rgba(249,115,22,0.6)]"></span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
