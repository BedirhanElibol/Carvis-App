import {
    Home,
    ShoppingCart,
    Map as MapIcon,
    Car
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { cn } from '../../lib/utils';

export const BottomNav = () => {
    const { t } = useUI();
    const location = useLocation();

    const tabs = [
        { id: '/application/home', icon: Home, label: "Hizmet" },
        { id: '/app/parts', icon: ShoppingCart, label: "Market" },
        { id: '/app/map', icon: MapIcon, label: "Harita" },
        { id: '/app/profile', icon: Car, label: "Garaj" },
    ];

    if (!t) return null;

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[360px] z-50 animate-slide-up">
            <div className="relative">
                {/* Premium Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent blur-3xl pointer-events-none"></div>

                <div className="relative glass-panel bg-slate-950/80 backdrop-blur-3xl border border-white/10 px-6 py-4 flex justify-between items-center rounded-[2rem] shadow-2xl ring-1 ring-white/5">
                    {tabs.map((tab) => {
                        const isActive = location.pathname.startsWith(tab.id);

                        return (
                            <Link
                                key={tab.id}
                                to={tab.id}
                                className="relative flex flex-col items-center justify-center group"
                            >
                                <div className={cn(
                                    "p-3 rounded-2xl transition-all duration-300 relative",
                                    isActive 
                                        ? "text-primary-400 bg-primary-500/10 shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)] scale-110" 
                                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                )}>
                                    <tab.icon
                                        size={24}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={cn(
                                            "transition-transform duration-300",
                                            isActive && "scale-105"
                                        )}
                                    />
                                </div>
                                
                                {isActive && (
                                    <span className="absolute -bottom-3 w-1 h-1 bg-primary-500 rounded-full animate-fade-in shadow-[0_0_8px_2px_rgba(249,115,22,0.6)]"></span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
