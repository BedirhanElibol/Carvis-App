import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CalendarDays, Car, ClipboardList, Heart, Loader2, LogIn, LogOut, MapPin, Package, Phone, Settings, ShoppingBag, Trash2, User, X, Mail, Edit3 } from "lucide-react";
import { triggerHaptic } from "../../utils/haptics";
import { Badge } from "../../components/Core";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useGarage } from "../../context/GarageContext";
import { validateUserProfileCompleteness } from "../../utils/validationUtils";

import SettingsModal from "../../components/modals/SettingsModal";
import ServiceHistoryModal from "../../components/modals/ServiceHistoryModal";
import AuthLoginModal from "../../components/modals/AuthLoginModal";
import DeleteAccountModal from "../../components/modals/DeleteAccountModal";
const VehicleSearch = React.lazy(() => import("../garage/VehicleSearch"));
import VehicleProSettings from "../garage/VehicleProSettings";
import ActivityCenter from "./ActivityCenter";
import ReferralCard from "./ReferralCard";

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { t, showAlert } = useUI();
  const { currentUser, handleLogout } = useAuth();
  const { vehicles, currentVehicle, addVehicle } = useGarage();

  // Modal States
  const [showSettings, setShowSettings] = useState(false);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showProSettings, setShowProSettings] = useState(false);
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showServiceHistoryModal, setShowServiceHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceHistoryCount] = useState(0); 

  if (!t) return null;

  const isLoggedIn = currentUser && !currentUser.isAnonymous;
  const profileStatus = validateUserProfileCompleteness(currentUser);

  const userPhoto =
    currentUser?.user_metadata?.avatar_url || currentUser?.photoURL;
  const userName = isLoggedIn
    ? (currentUser?.user_metadata?.full_name || currentUser?.displayName || t.welcome)
    : "Misafir Ziyaretçi";
  const vehicleCount = vehicles?.length || 0;

  const handleVehicleFound = async (data) => {
    const { error } = await addVehicle({
      brand: data.brand,
      model: data.model,
      plate: data.plate || "34RPD" + Math.floor(100 + Math.random() * 900),
      km: data.km || "0",
      engine_code: data.engine_code || data.engine || "",
      year: data.year ? parseInt(data.year, 10) : null,
      chassis_number: data.vin || null,
    });
    if (!error) {
      setShowVehicleSelector(false);
      showAlert("Başarılı", "Yeni araç garajınıza eklendi.", "success");
    } else {
      showAlert("Hata", "Araç eklenirken bir sorun oluştu.", "error");
    }
  };

  // Personal info items for logged-in users
  const personalInfoItems = [
    { icon: Mail, label: "E-posta", value: currentUser?.email || "—" },
    { icon: Phone, label: "Telefon", value: currentUser?.phone || currentUser?.user_metadata?.phone || "Belirtilmemiş" },
    { icon: MapPin, label: "Adres", value: currentUser?.address || currentUser?.user_metadata?.address || "Belirtilmemiş" },
    { icon: CalendarDays, label: "Doğum Tarihi", value: currentUser?.birth_date || currentUser?.user_metadata?.birth_date || "Belirtilmemiş" },
  ];

  // Management action cards
  const actionCards = [
    { icon: Car, label: t.myGarage, subtitle: `${vehicleCount} Araç`, color: "accent", onClick: () => { if (currentVehicle) { setSelectedVehicleForEdit(currentVehicle); setShowProSettings(true); } else { setShowVehicleSelector(true); } } },
    { icon: ClipboardList, label: t.serviceHistory, subtitle: `${serviceHistoryCount} Kayıt`, color: "primary", onClick: () => setShowServiceHistoryModal(true) },
    { icon: Package, label: t.myQuotes, subtitle: "Teklifleri Gör", color: "blue", onClick: () => navigate("/quotes") },
    { icon: CalendarDays, label: t.myAppointments, subtitle: "Takip Et", color: "emerald", onClick: () => navigate("/appointments") },
    { icon: ShoppingBag, label: t.myOrders, subtitle: "Takip Et", color: "green", onClick: () => { navigate("/orders"); triggerHaptic("light"); } },
    { icon: Heart, label: "Favorilerim", subtitle: "Kaydedilenler", color: "red", onClick: () => { navigate("/app/favorites"); triggerHaptic("light"); } },
  ];

  const colorMap = {
    accent: { bg: "bg-accent-500/10", border: "border-accent-500/10", text: "text-accent-500", hover: "hover:border-accent-500/30" },
    primary: { bg: "bg-primary-500/10", border: "border-primary-500/10", text: "text-primary-500", hover: "hover:border-primary-500/30" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/10", text: "text-blue-400", hover: "hover:border-blue-500/30" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/10", text: "text-teal-400", hover: "hover:border-emerald-500/30" },
    green: { bg: "bg-green-500/10", border: "border-green-500/10", text: "text-green-400", hover: "hover:border-green-500/30" },
    red: { bg: "bg-red-500/10", border: "border-red-500/10", text: "text-red-400", hover: "hover:border-red-500/30" },
  };

  return (
    <div className="p-5 space-y-5 pb-32 animate-fade-in relative">
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      <VehicleProSettings 
        isOpen={showProSettings} 
        onClose={() => {
          setShowProSettings(false);
          setSelectedVehicleForEdit(null);
        }}
        vehicle={selectedVehicleForEdit}
      />

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-cyan-400 font-black leading-none font-mono">Rapidsy</p>
          <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter mt-1">
            Profil & Kokpit
          </h3>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-3 glass-card rounded-2xl hover:bg-black/10 dark:bg-white/10 shadow-2xl transition-all border border-black/10 dark:border-white/10 active-scale"
        >
          <Settings size={22} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      {/* PROFILE CARD */}
      <div className="glass-card p-6 rounded-[2.5rem] border border-black/10 dark:border-white/10 shadow-2xl flex items-center gap-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="w-20 h-20 bg-gradient-to-tr from-primary-600 to-accent-600 rounded-[2rem] flex items-center justify-center text-slate-900 dark:text-white shadow-xl p-0.5 border border-black/20 dark:border-white/20 relative shrink-0">
          {userPhoto ? (
            <img
              src={userPhoto}
              className="w-full h-full rounded-[2rem] object-cover relative z-10"
              alt="Profile"
            />
          ) : (
            <User size={40} className="relative z-10" />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-black text-xl text-slate-900 dark:text-white leading-none mb-1 truncate">
            {userName}
          </h4>
          <p className="text-xs text-slate-500 font-medium mb-2 truncate">
            {isLoggedIn ? currentUser.email : "Oturum Açılmadı"}
          </p>
          {isLoggedIn ? (
            <Badge type={profileStatus.isComplete ? "success" : "warning"} className="text-[9px] px-3 py-1 font-black">
              {profileStatus.isComplete ? "Giriş Yapıldı" : `%${profileStatus.completeness} Tamamlandı`}
            </Badge>
          ) : (
            <button
              onClick={() => {
                setShowLoginModal(true);
                setShowVehicleSelector(false);
              }}
              className="text-[10px] font-black bg-accent-600/20 text-accent-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-accent-600/30 transition-all uppercase tracking-widest"
            >
              <LogIn size={12} />
              {t.loginTitle}
            </button>
          )}
        </div>
      </div>

      {/* PROFILE COMPLETENESS ALERT — if missing fields like Phone or Address */}
      {isLoggedIn && !profileStatus.isComplete && (
        <div 
          onClick={() => setShowSettings(true)}
          className="glass-card p-4 rounded-[1.8rem] border border-amber-500/30 bg-amber-500/10 shadow-xl flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-500/20 transition-all active-scale"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <h5 className="text-xs font-black text-amber-400 uppercase tracking-tight">Profilinizi Tamamlayın (%{profileStatus.completeness})</h5>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                Eksik: {profileStatus.missingFields.join(", ")}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-xl whitespace-nowrap">
            Tamamla →
          </span>
        </div>
      )}

      {/* PERSONAL INFO SECTION — only for logged-in users */}
      {isLoggedIn && (
        <div className="glass-card p-5 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-xl space-y-1">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 font-mono">KİŞİSEL BİLGİLER</span>
            <button
              onClick={() => setShowSettings(true)}
              className="text-[10px] font-black text-cyan-400 flex items-center gap-1 hover:text-cyan-300 transition-colors uppercase tracking-wider"
            >
              <Edit3 size={12} /> Düzenle
            </button>
          </div>
          {personalInfoItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 py-2.5 border-b border-black/5 dark:border-white/5 last:border-0">
              <div className="w-9 h-9 bg-white/5 dark:bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5">
                <item.icon size={16} className="text-slate-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GUEST CTA — only for non-logged-in users */}
      {!isLoggedIn && (
        <div className="glass-card p-6 rounded-[2rem] border border-accent-500/20 shadow-xl text-center space-y-4 bg-gradient-to-br from-accent-500/5 to-transparent">
          <div className="w-16 h-16 bg-accent-500/10 rounded-2xl flex items-center justify-center mx-auto border border-accent-500/20">
            <LogIn size={28} className="text-accent-500" />
          </div>
          <div>
            <h4 className="font-black text-lg text-slate-900 dark:text-white">Hesabınıza Giriş Yapın</h4>
            <p className="text-xs text-slate-500 mt-1">Araç garajı, servis geçmişi, randevular ve tüm özelliklere erişmek için giriş yapın.</p>
          </div>
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full bg-accent-600 hover:bg-accent-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active-scale shadow-xl flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> GİRİŞ YAP / KAYIT OL
          </button>
        </div>
      )}

      {/* Referral Program — logged in only */}
      {isLoggedIn && <ReferralCard />}

      {/* Activity Center — logged in only */}
      {isLoggedIn && <ActivityCenter />}

      {/* ACTIVE VEHICLE COCKPIT CARD */}
      {isLoggedIn && currentVehicle && (
        <div className="glass-card p-5 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-xl bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 font-mono">SEÇİLİ ARAÇ KOKPİTİ</span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{currentVehicle.brand} {currentVehicle.model}</h4>
              <p className="text-xs font-mono text-slate-500 font-bold mt-0.5">{currentVehicle.plate} • {currentVehicle.km ? `${currentVehicle.km} KM` : "KM Belirtilmemiş"}</p>
            </div>
            <button
              onClick={() => setShowVehicleSelector(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-black uppercase tracking-wider hover:bg-cyan-500/30 transition-all active-scale"
            >
              Değiştir
            </button>
          </div>
        </div>
      )}

      {/* MANAGEMENT ACTION CARDS */}
      {isLoggedIn && (
        <div className="grid grid-cols-2 gap-4">
          {actionCards.map((card, idx) => {
            const colors = colorMap[card.color];
            return (
              <button
                key={idx}
                onClick={card.onClick}
                className={`glass-card p-5 rounded-[2rem] border border-black/5 dark:border-white/5 ${colors.hover} transition-all text-left group shadow-xl active-scale relative overflow-hidden`}
              >
                <div className={`${colors.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colors.border}`}>
                  <card.icon size={24} className={colors.text} />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">
                  {card.label}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 font-bold">
                  {card.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* LOGOUT / LOGIN SECTION */}
      <div className="pt-2 px-2 space-y-4">
        {isLoggedIn ? (
          <button
            onClick={() => {
              triggerHaptic("impact");
              handleLogout();
            }}
            className="w-full glass-card border-slate-500/30 text-slate-500 dark:text-slate-400 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-black/5 dark:bg-white/5 transition-all active-scale shadow-2xl flex items-center justify-center gap-3"
          >
            <LogOut size={20} /> {t.logout}
          </button>
        ) : (
          <button
            onClick={() => {
              triggerHaptic("impact");
              setShowLoginModal(true);
            }}
            className="w-full bg-primary-600 hover:bg-primary-500 text-slate-950 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all active-scale shadow-2xl flex items-center justify-center gap-3"
          >
            <LogIn size={20} /> GİRİŞ YAP / KAYIT OL
          </button>
        )}
        
        {isLoggedIn && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full text-red-500/50 hover:text-red-500 py-2 font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={12} /> Hesabımı Sil (KVKK)
          </button>
        )}

        <p className="text-center text-[10px] font-black text-slate-700 tracking-[0.3em] uppercase pt-10 opacity-30">
          Rapidsy v1.0 - Premium Edition
        </p>
      </div>

      {/* MODALS */}
      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        t={t}
        currentUser={currentUser}
        showAlert={showAlert}
      />
      {showLoginModal && (
        <AuthLoginModal
          show={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          t={t}
        />
      )}
      
      <DeleteAccountModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        showAlert={showAlert}
      />

      {/* Vehicle Selector Modal Wrapper */}
      {showVehicleSelector && (
        <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowVehicleSelector(false)}
              className="absolute -top-12 right-0 text-slate-900 dark:text-white hover:text-red-500 transition"
            >
              <X size={24} />
            </button>
            <React.Suspense fallback={<div className="p-10 flex justify-center"><Loader2 className="animate-spin text-accent-500" size={32}/></div>}>
              <VehicleSearch onVehicleFound={handleVehicleFound} />
            </React.Suspense>
          </div>
        </div>
      )}

      {/* Service History Modal */}
      <ServiceHistoryModal
        show={showServiceHistoryModal}
        onClose={() => setShowServiceHistoryModal(false)}
        t={t}
      />
    </div>
  );
};

export default ProfileScreen;
