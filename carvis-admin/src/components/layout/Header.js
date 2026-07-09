'use client';
import { Bell, Search, Settings } from 'lucide-react';

export default function Header() {
    return (
        <header className="h-24 px-8 lg:px-12 flex items-center justify-between bg-transparent z-40">
            {/* Search - Minimalist glowing bar */}
            <div className="w-full max-w-md glass-panel rounded-2xl flex items-center px-5 py-3 transition-all focus-within:ring-1 focus-within:ring-primary/50 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.15)] group">
                <Search size={18} className="text-muted-foreground group-focus-within:text-primary transition-colors mr-3" />
                <input 
                    type="text" 
                    placeholder="Araç, plaka veya müşteri ara..." 
                    className="bg-transparent border-none outline-none text-sm font-semibold w-full text-foreground placeholder-muted-foreground"
                />
            </div>

            {/* Profile & Actions */}
            <div className="flex items-center gap-4">
                <button className="w-11 h-11 glass-panel rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-all relative group">
                    <Bell size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2.5 right-3 w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse"></span>
                </button>
                
                <button className="w-11 h-11 glass-panel rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-all group">
                    <Settings size={18} className="group-hover:rotate-45 transition-transform duration-500" />
                </button>

                <div className="h-11 px-4 glass-panel rounded-xl flex items-center gap-3 cursor-pointer hover:bg-secondary/40 transition-colors border border-transparent hover:border-border">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/80 to-emerald-800 flex items-center justify-center text-primary-foreground text-[10px] font-black shadow-inner">
                        AD
                    </div>
                    <div className="hidden sm:flex flex-col">
                        <span className="text-xs font-black text-foreground leading-none">Admin Yetkili</span>
                        <span className="text-[10px] font-bold text-primary leading-none mt-1">Sistem Yöneticisi</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
