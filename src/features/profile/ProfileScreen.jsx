import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Car, ClipboardList, Heart, Loader2, LogIn, LogOut, Package, Settings, ShoppingBag, Trash2, User, X } from "lucide-react";
import { triggerHaptic } from "../../utils/haptics";
import { Badge } from "../../components/Core";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useGarage } from "../../context/GarageContext";
import PredictiveHealth from "../ai/PredictiveHealth"; // Modals
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

  const userPhoto =
    currentUser?.user_metadata?.avatar_url || currentUser?.photoURL;
  const userName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.displayName ||
    t.welcome;
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

  return (
    <div className="p-5 space-y-6 pb-32 animate-fade-in relative">
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      <VehicleProSettings 
        isOpen={showProSettings} 
        onClose={() => {
          setShowProSettings(false);
          setSelectedVehicleForEdit(null);
        }}
        vehicle={selectedVehicleForEdit}
      />

      <div className="flex justify-between items-center">
        <h3 className="font-black text-3xl text-slate-900 dark:text-white tracking-tighter">
          {t.profile}
        </h3>
        <button
          onClick={() => setShowSettings(true)}
          className="p-3 glass-card rounded-2xl hover:bg-black/10 dark:bg-white/10 shadow-2xl transition-all border border-black/10 dark:border-white/10 active-scale"
        >
          <Settings size={22} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      <div className="glass-card p-6 rounded-[2.5rem] border border-black/10 dark:border-white/10 shadow-2xl flex items-center gap-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="w-20 h-20 bg-gradient-to-tr from-primary-600 to-accent-600 rounded-[2rem] flex items-center justify-center text-slate-900 dark:text-white shadow-xl p-0.5 border border-black/20 dark:border-white/20 relative">
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
        <div>
          <h4 className="font-black text-xl text-slate-900 dark:text-white leading-none mb-1">
            {userName}
          </h4>
          <p className="text-xs text-slate-500 font-medium mb-2">
            {currentUser?.email || "Misafir Kullanıcı"}
          </p>
          {!currentUser || currentUser.isAnonymous ? (
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
          ) : (
            <Badge type="success" className="text-[9px] px-3 py-1 font-black">
              Giriş Yapıldı
            </Badge>
          )}
        </div>
      </div>
      {/* Referral Program */}
      {!currentUser?.isAnonymous && <ReferralCard />}

      {/* Activity Center: Bids, Consultations, Insurances */}
      {!currentUser?.isAnonymous && <ActivityCenter />}

      {/* AI Predictive Maintenance Module */}
      {currentVehicle && <PredictiveHealth vehicle={currentVehicle} />}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            if (currentVehicle) {
              setSelectedVehicleForEdit(currentVehicle);
              setShowProSettings(true);
            } else {
              setShowVehicleSelector(true);
            }
          }}
          className="glass-card p-5 rounded-[2rem] border border-black/5 dark:border-white/5 hover:border-accent-500/30 transition-all text-left group shadow-xl active-scale relative overflow-hidden"
        >
          <div className="bg-accent-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-accent-500/10">
            <Car size={24} className="text-accent-500" />
          </div>
          <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">
            {t.myGarage}
          </h4>
          <p className="text-[10px] text-slate-500 mt-1 font-bold">
            {vehicleCount} Araç
          </p>
        </button>

        <button
          onClick={() => setShowServiceHistoryModal(true)}
          className="glass-card p-5 rounded-[2rem] border border-black/5 dark:border-white/5 hover:border-primary-500/30 transition-all text-left group shadow-xl active-scale relative overflow-hidden"
        >
          <div className="bg-primary-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-primary-500/10">
            <ClipboardList size={24} className="text-primary-500" />
          </div>
          <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">
            {t.serviceHistory}
          </h4>
          <p className="text-[10px] text-slate-500 mt-1 font-bold">
            {serviceHistoryCount} Kayıt
          </p>
        </button>

        <button
          onClick={() => navigate("/quotes")}
          className="glass-card p-5 rounded-[2rem] border border-black/5 dark:border-white/5 hover:border-blue-500/30 transition-all text-left group shadow-xl active-scale relative overflow-hidden"
        >
          <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/10">
            <Package size={24} className="text-blue-400" />
          </div>
          <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">
            {t.myQuotes}
          </h4>
          <p className="text-[10px] text-slate-500 mt-1 font-bold">
            Teklifleri Gör
          </p>
        </button>

        <button
          onClick={() => navigate("/appointments")}
          className="glass-card p-5 rounded-[2rem] border border-black/5 dark:border-white/5 hover:border-emerald-500/30 transition-all text-left group shadow-xl active-scale relative overflow-hidden"
        >
          <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/10">
            <CalendarDays size={24} className="text-teal-400" />
          </div>
          <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">
            {t.myAppointments}
          </h4>
          <p className="text-[10px] text-slate-500 mt-1 font-bold">Takip Et</p>
        </button>

        <button
          onClick={() => {
            navigate("/orders");
            triggerHaptic("light");
          }}
          className="glass-card p-5 rounded-[2rem] border border-black/5 dark:border-white/5 hover:border-green-500/30 transition-all text-left group shadow-xl active-scale relative overflow-hidden"
        >
          <div className="bg-green-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-green-500/10">
            <ShoppingBag size={24} className="text-green-400" />
          </div>
          <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">
            {t.myOrders}
          </h4>
          <p className="text-[10px] text-slate-500 mt-1 font-bold">Takip Et</p>
        </button>

        <button
          onClick={() => {
            navigate("/app/favorites");
            triggerHaptic("light");
          }}
          className="glass-card p-5 rounded-[2rem] border border-black/5 dark:border-white/5 hover:border-red-500/30 transition-all text-left group shadow-xl active-scale relative overflow-hidden"
        >
          <div className="bg-red-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-red-500/10">
            <Heart size={24} className="text-red-400" />
          </div>
          <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">
            Favorilerim
          </h4>
          <p className="text-[10px] text-slate-500 mt-1 font-bold">
            Kaydedilenler
          </p>
        </button>
      </div>

      <div className="pt-4 px-4 space-y-4">
        <button
          onClick={() => { handleLogout(); navigate("/"); }}
          className="w-full glass-card border-slate-500/30 text-slate-500 dark:text-slate-400 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-black/5 dark:bg-white/5 transition-all active-scale shadow-2xl flex items-center justify-center gap-3"
        >
          <LogOut size={20} /> {t.logout}
        </button>
        
        {!currentUser?.isAnonymous && (
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
