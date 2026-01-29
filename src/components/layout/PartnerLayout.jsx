import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    LogOut,
    Menu,
    X,
    Car,
    ParkingCircle,
    Wrench,
    Key,
    Key,
    RefreshCw,
    Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const PartnerLayout = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Initial role from Auth Context. DO NOT COMPROMISE SECURITY with defaults.
    const [role, setRole] = useState(currentUser?.role || null);

    useEffect(() => {
        if (currentUser) {
            const allowedRoles = ['parking', 'valet', 'mechanic', 'parts'];

            if (!allowedRoles.includes(currentUser.role)) {
                // STRICT: If not in allowed list, KICK OUT immediately.
                navigate('/partner-login');
            } else {
                setRole(currentUser.role);
            }
        } else {
            // No user? Redirect to login.
            navigate('/partner-login');
        }
    }, [currentUser, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navItems = [
        { key: 'dashboard', label: 'Panel', icon: LayoutDashboard, path: '/partner/dashboard' },
        { key: 'settings', label: 'Ayarlar', icon: Settings, path: '/partner/settings' },
    ];

    // Role specific items
    if (role === 'parking') {
        navItems.splice(1, 0, { key: 'capacity', label: 'Otopark Yönetimi', icon: ParkingCircle, path: '/partner/parking/capacity' });
    } else if (role === 'valet') {
        navItems.splice(1, 0, { key: 'requests', label: 'Vale Çağrıları', icon: Key, path: '/partner/valet/requests' });
    } else if (role === 'mechanic') {
        navItems.splice(1, 0, { key: 'services', label: 'Hizmet Paketleri', icon: Settings, path: '/partner/mechanic/services' });
        navItems.splice(1, 0, { key: 'jobs', label: 'İş Takibi', icon: Wrench, path: '/partner/mechanic/jobs' });
    } else if (role === 'parts') {
        navItems.splice(1, 0, { key: 'products', label: 'Ürün Yönetimi', icon: Package, path: '/partner/products' });
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/5 transform transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                            <Car size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic tracking-tighter">CARVIS</h1>
                            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">PARTNER</p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <nav className="px-4 py-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.key}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* DEV: Role Switcher */}
                <div className="px-4 py-4 mt-4 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Simüle Modu (Dev)</p>
                    <div className="grid grid-cols-3 gap-1">
                        <button onClick={() => setRole('parking')} className={`p-2 rounded-lg text-xs font-bold ${role === 'parking' ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Oto</button>
                        <button onClick={() => setRole('valet')} className={`p-2 rounded-lg text-xs font-bold ${role === 'valet' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Vale</button>
                        <button onClick={() => setRole('mechanic')} className={`p-2 rounded-lg text-xs font-bold ${role === 'mechanic' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Usta</button>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 relative bg-slate-950">
                {/* Header for Mobile */}
                <div className="md:hidden p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-white">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold">Partner Paneli ({(role || 'PARTNER').toUpperCase()})</span>
                    <div className="w-6"></div>
                </div>

                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default PartnerLayout;
