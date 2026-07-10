import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Calendar, Car, Key, LayoutDashboard, LogOut, Menu, Package, ParkingCircle, Settings, ShieldAlert, Shield, Tag, Truck, Droplets, User, Wrench, X, FileText, ClipboardList } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PartnerLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initial role from Auth Context. DO NOT COMPROMISE SECURITY with defaults.
  const [role, setRole] = useState(currentUser?.role || null);

  useEffect(() => {
    if (currentUser) {
      const allowedRoles = ["parking", "valet", "mechanic", "parts", "insurance", "tow_truck", "carwash"];
      if (!allowedRoles.includes(currentUser.role)) {
        // STRICT: If not in allowed list, KICK OUT immediately.
        navigate("/partner-login");
      } else {
        setRole(currentUser.role);
      }
    } else {
      // No user? Redirect to login.
      navigate("/partner-login");
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    {
      key: "dashboard",
      label: "Panel",
      icon: LayoutDashboard,
      path: "/partner/dashboard",
    },
    {
      key: "settings",
      label: "Ayarlar",
      icon: Settings,
      path: "/partner/settings",
    },
  ];

  // Role specific items
  if (role === "parking") {
    navItems.splice(1, 0, {
      key: "capacity",
      label: "Otopark Yönetimi",
      icon: ParkingCircle,
      path: "/partner/parking/capacity",
    });
  } else if (role === "valet") {
    navItems.splice(1, 0, {
      key: "requests",
      label: "Vale Çağrıları",
      icon: Key,
      path: "/partner/valet/requests",
    });
  } else if (role === "mechanic") {
    navItems.splice(1, 0, {
      key: "campaigns",
      label: "Kampanyalarım",
      icon: Tag,
      path: "/partner/campaigns",
    });
    navItems.splice(1, 0, {
      key: "services",
      label: "Hizmet Paketleri",
      icon: Settings,
      path: "/partner/mechanic/services",
    });
    navItems.splice(1, 0, {
      key: "jobs",
      label: "İş Takibi",
      icon: Wrench,
      path: "/partner/mechanic/jobs",
    });
  } else if (role === "parts") {
    navItems.splice(1, 0, {
      key: "products",
      label: "Ürün Yönetimi",
      icon: Package,
      path: "/partner/products",
    });
  } else if (role === "insurance") {
    navItems.splice(1, 0, {
      key: "claims",
      label: "Hasar Talepleri",
      icon: ClipboardList,
      path: "/partner/insurance/claims",
    });
    navItems.splice(1, 0, {
      key: "policies",
      label: "Poliçe Teklifleri",
      icon: FileText,
      path: "/partner/insurance/policies",
    });
  } else if (role === "tow_truck") {
    navItems.splice(1, 0, {
      key: "assignments",
      label: "Çekici Görevleri",
      icon: Truck,
      path: "/partner/tow/assignments",
    });
  } else if (role === "carwash") {
    navItems.splice(1, 0, {
      key: "slots",
      label: "Randevu Takvimleri",
      icon: Droplets,
      path: "/partner/carwash/slots",
    });
  }

  // Add appointments link for all partner roles (mechanic, valet, carwash, etc.)
  const appointmentRoles = ["mechanic", "valet", "carwash", "parking", "tow_truck"];
  if (appointmentRoles.includes(role)) {
    navItems.push({
      key: "appointments",
      label: "Randevularım",
      icon: Calendar,
      path: "/partner/appointments",
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-black/5 dark:border-white/5 transform transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Car size={20} className="text-slate-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter">RAPIDSY</h1>
              <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">
                PARTNER
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary-600 text-slate-900 dark:text-white shadow-lg shadow-primary-900/50"
                    : "text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:bg-white/5 hover:text-slate-900 dark:text-white"
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* DEV: Role Switcher */}
        <div className="px-4 py-4 mt-4 border-t border-black/5 dark:border-white/5">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">
            Simüle Modu (Dev)
          </p>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setRole("parking")}
              className={`p-2 rounded-lg text-xs font-bold ${
                role === "parking"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              Oto
            </button>
            <button
              onClick={() => setRole("valet")}
              className={`p-2 rounded-lg text-xs font-bold ${
                role === "valet"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              Vale
            </button>
            <button
              onClick={() => setRole("mechanic")}
              className={`p-2 rounded-lg text-xs font-bold ${
                role === "mechanic"
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              Usta
            </button>
            <button
              onClick={() => setRole("parts")}
              className={`p-2 rounded-lg text-xs font-bold ${
                role === "parts"
                  ? "bg-yellow-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              Parça
            </button>
            <button
              onClick={() => setRole("insurance")}
              className={`p-2 rounded-lg text-xs font-bold ${
                role === "insurance"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              Sigorta
            </button>
            <button
              onClick={() => setRole("tow_truck")}
              className={`p-2 rounded-lg text-xs font-bold ${
                role === "tow_truck"
                  ? "bg-red-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              Çekici
            </button>
            <button
              onClick={() => setRole("carwash")}
              className={`p-2 rounded-lg text-xs font-bold ${
                role === "carwash"
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              Yıkama
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <button
            onClick={() => navigate("/application/home")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-primary-400 hover:bg-primary-500/10 transition-all border border-primary-500/10"
          >
            <User size={20} />
            <span className="font-medium text-sm">Müşteri Modu</span>
          </button>

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
      <main className="flex-1 md:ml-64 relative bg-slate-50 dark:bg-slate-950">
        {/* Header for Mobile */}
        <div className="md:hidden p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-900 dark:text-white">
            <Menu size={24} />
          </button>
          <span className="font-bold">
            Partner Paneli ({(role || "PARTNER").toUpperCase()})
          </span>
          <div className="w-6"></div>
        </div>

        {/* Verification Status Banner */}
        {currentUser?.verification_status && currentUser.verification_status !== "approved" && (
          <div className={`p-4 ${
            currentUser.verification_status === "rejected" ? "bg-red-500/10 border-b border-red-500/20" : "bg-orange-500/10 border-b border-orange-500/20"
          } flex items-center justify-between gap-4 animate-in fade-in duration-500`}>
            <div className="flex items-center gap-3">
              <div className={`${
                currentUser.verification_status === "rejected" ? "bg-red-500/20" : "bg-orange-500/20"
              } p-2 rounded-xl`}>
                <ShieldAlert size={20} className={
                  currentUser.verification_status === "rejected" ? "text-red-500" : "text-orange-500"
                } />
              </div>
              <div>
                <p className={`text-sm font-bold ${
                  currentUser.verification_status === "rejected" ? "text-red-200" : "text-orange-200"
                }`}>
                  {currentUser.verification_status === "pending" ? "BAŞVURUNUZ İNCELENİYOR" : "BAŞVURUNUZ REDDEDİLDİ"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {currentUser.verification_status === "pending" 
                    ? "Belgeleriniz admin ekibimiz tarafından kontrol ediliyor. Bu süreçte bazı özellikler kısıtlı olabilir."
                    : `Red Nedeni: ${currentUser.rejection_reason || "Belgelerdeki eksiklik veya tutarsızlık."}`}
                </p>
              </div>
            </div>
            {currentUser.verification_status === "rejected" && (
              <button 
                onClick={() => navigate("/partner/settings")}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
              >
                Belgeleri Güncelle
              </button>
            )}
          </div>
        )}

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PartnerLayout;
