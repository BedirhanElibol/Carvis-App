import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Calendar, Car, Key, LayoutDashboard, LogOut, Menu, Package, ParkingCircle, Settings, ShieldAlert, Shield, Tag, Truck, Droplets, User, Wrench, X, FileText, ClipboardList, Percent, Wallet, DollarSign, Landmark, Star, RotateCcw, BarChart3 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Import High-Fidelity Views
import InvoiceListingView from "../../features/partners/components/InvoiceListingView";
import OrderRecordsView from "../../features/partners/components/OrderRecordsView";
import FinancialReportsView from "../../features/partners/components/FinancialReportsView";
import PartnerLoanView from "../../features/partners/components/PartnerLoanView";
import CommissionTariffsView from "../../features/partners/components/CommissionTariffsView";
import PromotionsView from "../../features/partners/components/PromotionsView";
import ContractsView from "../../features/partners/components/ContractsView";
import PartnerReviewsPanel from "../../components/reviews/PartnerReviewsPanel";
import ReturnRequestsView from "../../features/partners/components/ReturnRequestsView";
import PerformanceScoreView from "../../features/partners/components/PerformanceScoreView";

const PartnerLayout = () => {
  const { currentUser, handleLogout: logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  // Initial role from Auth Context.
  const [role, setRole] = useState(currentUser?.role || null);

  useEffect(() => {
    if (currentUser) {
      const allowedRoles = ["mechanic", "parts", "insurance", "tow_truck", "carwash", "admin", "partner"];
      if (!allowedRoles.includes(currentUser.role)) {
        navigate("/partner-login");
      } else {
        setRole(currentUser.role === "partner" ? "mechanic" : currentUser.role);
      }
    } else {
      navigate("/partner-login");
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleMenuClick = (item) => {
    setIsSidebarOpen(false);
    if (item.viewKey) {
      setActiveView(item.viewKey);
    } else {
      setActiveView("dashboard");
      navigate(item.path);
    }
  };

  // Structured Navigation Groups based on Trendyol Partner Layout screenshots
  const generalItems = [
    { key: "dashboard", label: "Panel", icon: LayoutDashboard, path: "/partner/dashboard" }
  ];

  // Add role-specific items to general group
  if (role === "mechanic") {
    generalItems.push({ key: "jobs", label: "İş Takibi", icon: Wrench, path: "/partner/mechanic/jobs" });
    generalItems.push({ key: "services", label: "Hizmet Paketleri", icon: Settings, path: "/partner/mechanic/services" });
  } else if (role === "parts") {
    generalItems.push({ key: "products", label: "Ürün Yönetimi", icon: Package, path: "/partner/products" });
  } else if (role === "insurance") {
    generalItems.push({ key: "claims", label: "Hasar Talepleri", icon: ClipboardList, path: "/partner/insurance/claims" });
    generalItems.push({ key: "policies", label: "Poliçe Teklifleri", icon: FileText, path: "/partner/insurance/policies" });
  } else if (role === "tow_truck") {
    generalItems.push({ key: "assignments", label: "Çekici Görevleri", icon: Truck, path: "/partner/tow/assignments" });
  } else if (role === "carwash") {
    generalItems.push({ key: "slots", label: "Randevu Takvimleri", icon: Droplets, path: "/partner/carwash/slots" });
  }

  const appointmentRoles = ["mechanic", "carwash", "tow_truck"];
  if (appointmentRoles.includes(role)) {
    generalItems.push({ key: "appointments", label: "Randevularım", icon: Calendar, path: "/partner/appointments" });
  }

  // Financial and pricing groupings matching screenshots exactly
  const pricingItems = [
    { key: "komisyon_tarifeleri", label: "Komisyon Tarifeleri", icon: Percent, viewKey: "komisyon_tarifeleri", badge: "plus" }
  ];

  const shippingItems = [
    { key: "siparis_kayitlari", label: "Sipariş Kayıtları", icon: ClipboardList, viewKey: "siparis_kayitlari" }
  ];

  const financeItems = [
    { key: "fatura_listeleme", label: "Fatura Listeleme", icon: FileText, viewKey: "fatura_listeleme" },
    { key: "finans_raporlari", label: "Finans Raporları", icon: Wallet, viewKey: "finans_raporlari", badge: "Yeni" }
  ];

  const solutionItems = [
    { key: "partner_loan", label: "İş Ortağım Kredisi", icon: Landmark, viewKey: "partner_loan", badge: "Popüler" }
  ];

  const promoItems = [
    { key: "promotions", label: "Kuponlar & Kampanyalar", icon: Tag, viewKey: "promotions" }
  ];

  const customerItems = [
    { key: "reviews", label: "Müşteri Yorumları", icon: Star, viewKey: "reviews" },
    { key: "returns", label: "İade Talepleri", icon: RotateCcw, viewKey: "returns", badge: "Yeni" }
  ];

  const analyticsItems = [
    { key: "performance", label: "Performans Karnesi", icon: BarChart3, viewKey: "performance", badge: "Yeni" }
  ];

  const legalItems = [
    { key: "sozlesmeler", label: "Sözleşmeler & Kurallar", icon: Shield, viewKey: "sozlesmeler" }
  ];

  const renderBadge = (badge) => {
    if (!badge) return null;
    if (badge === "plus") {
      return <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter ml-auto">plus</span>;
    }
    if (badge === "Yeni") {
      return <span className="text-[9px] font-black text-white bg-red-600 px-1.5 py-0.5 rounded ml-auto">Yeni</span>;
    }
    if (badge === "Popüler") {
      return <span className="text-[9px] font-black text-white bg-orange-600 px-1.5 py-0.5 rounded ml-auto">Popüler</span>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 premium-gradient text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/60 border-r border-white/5 backdrop-blur-xl transform transition-transform duration-300 md:translate-x-0 overflow-y-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Car size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter">RAPIDSY</h1>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">
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

        {/* Sidebar Nav Sections */}
        <div className="px-4 py-2 space-y-6 pb-24">
          {/* Group 1: Genel */}
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Genel</p>
            {generalItems.map((item) => {
              const isActive = activeView === "dashboard" && location.pathname === item.path;
              return (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-bold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Group 2: Fiyatlandırma */}
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Fiyatlandırma</p>
            {pricingItems.map((item) => {
              const isActive = activeView === item.viewKey;
              return (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-bold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-xs">{item.label}</span>
                  {renderBadge(item.badge)}
                </button>
              );
            })}
          </div>

          {/* Group 3: Sipariş & Kargo */}
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Sipariş & Kargo</p>
            {shippingItems.map((item) => {
              const isActive = activeView === item.viewKey;
              return (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-bold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Group 4: Finans & Ödemeler */}
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Finans & Ödemeler</p>
            {financeItems.map((item) => {
              const isActive = activeView === item.viewKey;
              return (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-bold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-xs">{item.label}</span>
                  {renderBadge(item.badge)}
                </button>
              );
            })}
          </div>

          {/* Group 5: Finansal Çözümler */}
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Finansal Çözümler</p>
            {solutionItems.map((item) => {
              const isActive = activeView === item.viewKey;
              return (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-bold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-xs">{item.label}</span>
                  {renderBadge(item.badge)}
                </button>
              );
            })}
          </div>

          {/* Group 6: Müşteri Yönetimi */}
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Müşteri Yönetimi</p>
            {customerItems.map((item) => {
              const isActive = activeView === item.viewKey;
              return (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-bold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-xs">{item.label}</span>
                  {renderBadge(item.badge)}
                </button>
              );
            })}
          </div>

          {/* Group 7: Analitik */}
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Analitik</p>
            {analyticsItems.map((item) => {
              const isActive = activeView === item.viewKey;
              return (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-bold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-xs">{item.label}</span>
                  {renderBadge(item.badge)}
                </button>
              );
            })}
          </div>

          {/* Group 8: Promosyon */}
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Promosyon</p>
            {promoItems.map((item) => {
              const isActive = activeView === item.viewKey;
              return (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-bold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Group 7: Yasal & Uyum */}
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Yasal & Uyum</p>
            {legalItems.map((item) => {
              const isActive = activeView === item.viewKey;
              return (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-bold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-950/20 border-t border-white/5">
          <button
            onClick={() => handleMenuClick({ key: "settings", path: "/partner/settings" })}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer ${
              location.pathname === "/partner/settings" && activeView === "dashboard" ? "bg-orange-600 text-white font-bold" : ""
            }`}
          >
            <Settings size={18} />
            <span className="font-medium text-xs">Ayarlar</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all mt-1 cursor-pointer"
          >
            <LogOut size={18} />
            <span className="font-medium text-xs">Çıkış Yap</span>
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
          <span className="font-bold text-xs uppercase tracking-wider">
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
                onClick={() => {
                  setActiveView("dashboard");
                  navigate("/partner/settings");
                }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
              >
                Belgeleri Güncelle
              </button>
            )}
          </div>
        )}

        {/* Premium Page Swapper Area */}
        <div className="p-6">
          {activeView === "dashboard" && <Outlet />}
          {activeView === "fatura_listeleme" && <InvoiceListingView currentUser={currentUser} />}
          {activeView === "siparis_kayitlari" && <OrderRecordsView currentUser={currentUser} />}
          {activeView === "finans_raporlari" && <FinancialReportsView currentUser={currentUser} />}
          {activeView === "partner_loan" && <PartnerLoanView currentUser={currentUser} />}
          {activeView === "komisyon_tarifeleri" && <CommissionTariffsView />}
          {activeView === "promotions" && <PromotionsView currentUser={currentUser} />}
          {activeView === "sozlesmeler" && <ContractsView currentUser={currentUser} />}
          {activeView === "reviews" && <PartnerReviewsPanel partnerId={currentUser?.id} partnerName={currentUser?.company_name || currentUser?.full_name} />}
          {activeView === "returns" && <ReturnRequestsView currentUser={currentUser} />}
          {activeView === "performance" && <PerformanceScoreView currentUser={currentUser} />}
        </div>
      </main>
    </div>
  );
};

export default PartnerLayout;
