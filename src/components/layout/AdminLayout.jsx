import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FileCheck, LayoutDashboard, LogOut, Menu, Settings, ShieldAlert, Users, Wallet, X, Scale } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";

const AdminLayout = () => {
  const { t } = useUI();
  const { currentUser, handleLogout: logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role !== "admin") {
        // Not admin? Redirect to home.
        navigate("/app/home");
      }
    } else {
      navigate("/auth");
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    {
      key: "dashboard",
      label: t.adminOverview,
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      key: "users",
      label: t.adminUsers,
      icon: Users,
      path: "/admin/users",
    },
    {
      key: "partners",
      label: t.adminPartners,
      icon: FileCheck,
      path: "/admin/partners",
    },
    {
      key: "disputes",
      label: "Anlaşmazlıklar",
      icon: Scale,
      path: "/admin/disputes",
    },
    {
      key: "finance",
      label: t.adminFinance,
      icon: Wallet,
      path: "/admin/finance",
    },
    {
      key: "settings",
      label: t.adminSettings,
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-black/5 dark:border-white/5 transform transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50">
              <ShieldAlert size={20} className="text-slate-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter">RAPIDSY</h1>
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
                {t.admin}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-500 dark:text-slate-400"
          >
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-red-600 text-slate-900 dark:text-white shadow-lg shadow-red-900/50" : "text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:bg-white/5 hover:text-slate-900 dark:text-white"}`}
              >
                <item.icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-sans"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative bg-slate-50 dark:bg-slate-950">
        {/* Header for Mobile */}
        <div className="md:hidden p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-900 dark:text-white">
            <Menu size={24} />
          </button>
          <span className="font-bold text-red-500">{t.adminPanel}</span>
          <div className="w-6"></div>
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
