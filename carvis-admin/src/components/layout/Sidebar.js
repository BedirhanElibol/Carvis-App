'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Wrench, Headset, CircleDollarSign, ShieldAlert, LogOut, Zap, MapPin, Fuel, Gavel } from 'lucide-react';

const MENU_ITEMS = [
    { name: 'Genel Bakış', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Kullanıcılar', icon: Users, href: '/dashboard/users' },
    { name: 'Ustalar & Çekiciler', icon: Wrench, href: '/dashboard/partners' },
    { name: 'Acil Çağrılar', icon: ShieldAlert, href: '/dashboard/sos', badge: 3 },
    { name: 'Vale Hizmetleri', icon: MapPin, href: '/dashboard/valet' },
    { name: 'Yakıt Yönetimi', icon: Fuel, href: '/dashboard/fuel' },
    { name: 'İhaleler (Tender)', icon: Gavel, href: '/dashboard/tenders' },
    { name: 'Finans', icon: CircleDollarSign, href: '/dashboard/finance' },
    { name: 'Destek', icon: Headset, href: '/dashboard/support' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-20 lg:w-64 glass-panel border-r border-border h-screen sticky top-0 flex flex-col justify-between py-6 transition-all duration-300 z-50">
            <div>
                {/* Logo Area */}
                <div className="px-4 lg:px-8 mb-10 flex items-center justify-center lg:justify-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <Zap size={20} className="text-primary" />
                    </div>
                    <span className="hidden lg:block text-xl font-black text-foreground tracking-tighter">Carvis<span className="text-primary">.ai</span></span>
                </div>

                {/* Navigation */}
                <nav className="px-2 lg:px-4 space-y-2">
                    <p className="hidden lg:block px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Ana Menü</p>
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href}
                                className={`flex items-center lg:justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                                    isActive 
                                    ? 'bg-primary/10 text-primary font-bold border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                                    : 'text-muted-foreground font-semibold hover:bg-secondary/50 hover:text-foreground'
                                }`}
                                title={item.name}
                            >
                                <div className="flex items-center gap-4 mx-auto lg:mx-0">
                                    <item.icon size={20} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground transition-colors'} />
                                    <span className="hidden lg:block text-sm">{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className="absolute top-2 right-2 lg:static bg-accent text-accent-foreground text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Logout */}
            <div className="px-2 lg:px-4">
                <button 
                    className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3 text-destructive/80 font-semibold rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all group"
                    title="Çıkış Yap"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden lg:block text-sm">Çıkış Yap</span>
                </button>
            </div>
        </aside>
    );
}
