import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import VehicleDemandForm from "../garage/VehicleDemandForm";
import { SpecialistCard } from "../../components/Core";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useGarage } from "../../context/GarageContext";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { triggerHaptic } from "../../utils/haptics";
import EmptyState from "../../components/shared/EmptyState";
import { SkeletonList } from "../../components/ui/SkeletonCard";

import ServiceBookingModal from "../appointments/ServiceBookingModal";

const MechanicsScreen = () => {
  const { t, showAlert, openModal } = useUI();
  const { currentUser } = useAuth();
  const { currentVehicle } = useGarage();
  const location = useLocation();
  const navigate = useNavigate();

  const [specialFlow, setSpecialFlow] = useState(location.state?.flow || null);
  const [isMapView, setIsMapView] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mechanicsList, setMechanicsList] = useState([]);
  const [loadingMechanics, setLoadingMechanics] = useState(true);

  // Appointment Modal State
  const [bookingModal, setBookingModal] = useState({ open: false, sellerId: null, shopName: "" });

  const handleOpenBooking = (sellerId, shopName) => {
    if (!currentUser || currentUser.isAnonymous) {
      openModal("login");
      return;
    }
    setBookingModal({ open: true, sellerId, shopName });
  };

  // API Key Check
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapUrl = GOOGLE_MAPS_API_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=39.93,32.85&zoom=10&size=600x600&sensor=false&key=${GOOGLE_MAPS_API_KEY}`
    : null;

  // Fetch Mechanics from DB
  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const { data, error } = await supabase
          .from("mechanic_shops")
          .select("*");
        if (error) throw error;
        const mapped = (data || []).map((m) => ({
          ...m,
          name: m.shop_name,
          brands: m.brands || ["Togg", "Fiat", "BMW", "Mercedes", "Audi"],
        }));
        setMechanicsList(mapped);
      } catch (err) {
        console.error("Fetch mechanics err:", err);
      } finally {
        setLoadingMechanics(false);
      }
    };
    fetchMechanics();
  }, []);

  if (!t) return null;

  if (specialFlow === "maintenance") {
    return (
      <div className="p-5 pb-32 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setSpecialFlow(null)}
            className="p-2.5 glass-card rounded-xl text-slate-400 active-scale border border-white/10"
          >
            <Icons.ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-black text-2xl text-white tracking-tighter">
              AKILLI TEKLİF TOPLA
            </h3>
            <p className="text-[10px] text-primary-500 font-black uppercase tracking-widest">
              Hızlı & Güvenilir Fiyat Al
            </p>
          </div>
        </div>
        <VehicleDemandForm
          vehicle={currentVehicle}
          initialDemandType="service"
          initialDescription={`Periyodik Bakım Talebi: ${currentVehicle?.brand} ${currentVehicle?.model} aracım için en uygun bakım paketini ve usta tekliflerini bekliyorum.`}
          onSubmit={async (data) => {
            setSubmitting(true);
            try {
              if (!currentUser || currentUser.isAnonymous) {
                openModal("login");
                return;
              }
              // Real Supabase Insert
              const { error } = await supabase.from("service_requests").insert([
                {
                  user_id: currentUser.id,
                  plate: currentVehicle?.plate || "BELİRSİZ",
                  brand: currentVehicle?.brand,
                  model: currentVehicle?.model,
                  engine_code: currentVehicle?.engineCode,
                  demand_type: data.demandType,
                  description: data.description,
                  status: "pending",
                },
              ]);
              if (error) throw error;
              showAlert(
                "Talebiniz Alındı",
                "İşiniz sisteme düştü, artık usta tekliflerini bekleyebilirsiniz.",
                "success",
              );
              setSpecialFlow(null);
              navigate("/app/tender");
            } catch (err) {
              console.error("Demand Submit Err:", err);
              showAlert("Hata", "Talebiniz kaydedilemedi.", "error");
            } finally {
              setSubmitting(false);
            }
          }}
        />
        {submitting && (
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
            <Icons.Loader2
              className="animate-spin text-primary-500"
              size={48}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 pb-32 space-y-6 animate-fade-in relative">
      <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-accent-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-3xl text-white tracking-tighter uppercase">
          {t.mechanics || "Servis & Tamir"}
        </h3>
        <div className="glass-card p-1.5 rounded-2xl flex gap-1 shadow-2xl border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => {
              setIsMapView(false);
              triggerHaptic("light");
            }}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all active-scale ${
              !isMapView
                ? "bg-primary-600 shadow-lg text-white"
                : "text-slate-500 hover:text-white"
            }`}
          >
            {t.listView}
          </button>
          <button
            onClick={() => {
              setIsMapView(true);
              triggerHaptic("light");
            }}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all active-scale ${
              isMapView
                ? "bg-primary-600 shadow-lg text-white"
                : "text-slate-500 hover:text-white"
            }`}
          >
            {t.mapView}
          </button>
        </div>
      </div>

      {/* Premium Filter Bar */}
      {!isMapView && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
          <button aria-label="Yakınlık (En Yakın)" className="flex items-center gap-1.5 px-4 py-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-xl text-[10px] font-black uppercase tracking-wider font-sans whitespace-nowrap active-scale">
            <Icons.MapPin size={12} /> Yakınlık (En Yakın)
          </button>
          <button aria-label="Puan (4.5+)" className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider font-sans whitespace-nowrap active-scale">
            <Icons.Star size={12} /> Puan (4.5+)
          </button>
          <button aria-label="Açık/Kapalı" className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider font-sans whitespace-nowrap active-scale">
            <Icons.Clock size={12} /> Açık/Kapalı
          </button>
          <button aria-label="Hizmet Tipi" className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider font-sans whitespace-nowrap active-scale">
            <Icons.SlidersHorizontal size={12} /> Hizmet Tipi
          </button>
        </div>
      )}
      {isMapView ? (
        <div className="h-[60vh] glass-card rounded-[3rem] flex items-center justify-center relative overflow-hidden group shadow-2xl border border-white/5 mx-1">
          {mapUrl ? (
            <div
              className="absolute inset-0 bg-cover opacity-30 group-hover:scale-105 transition-transform duration-1000"
              style={{ backgroundImage: `url('${mapUrl}')` }}
            ></div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 opacity-50"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
          <div className="relative z-10 glass-card p-8 rounded-[2.5rem] text-center shadow-2xl backdrop-blur-2xl border border-white/10 animate-slide-up">
            <div className="w-16 h-16 bg-accent-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-500/20">
              <Icons.MapPin size={32} className="text-accent-500" />
            </div>
            <p className="font-black text-white text-xl tracking-tighter mb-1">
              RADAR AKTİF
            </p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
              En Yakın Ustalar Taranıyor...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {loadingMechanics ? (
            <SkeletonList count={3} />
          ) : mechanicsList.length > 0 ? (
            mechanicsList.map((m) => {
              const isBrandSpecialist =
                currentVehicle && m.brands?.includes(currentVehicle.brand);
              return (
                <div
                  key={m.id}
                  className="relative animate-in slide-in-from-bottom-2"
                >
                  {isBrandSpecialist && (
                    <div className="absolute -top-2 left-6 z-10 bg-accent-600 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-lg border border-accent-400/20 uppercase tracking-widest flex items-center gap-1.5">
                      <Icons.ShieldCheck size={10} /> {currentVehicle.brand}{" "}
                      UZMANI
                    </div>
                  )}
                  <SpecialistCard 
                    specialist={m} 
                    onAction={() => handleOpenBooking(m.seller_id, m.shop_name)} 
                  />
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={Icons.Wrench}
              title="Servis Bulunamadı"
              subtitle="Bölgenizde henüz Rapidsy onaylı servis bulunmuyor. İhale sistemini kullanarak teklif toplayabilirsiniz."
              actionLabel="İhale Sistemini Aç"
              onAction={() => navigate("/app/tender")}
            />
          )}
        </div>
      )}

      <ServiceBookingModal
        isOpen={bookingModal.open}
        onClose={() => setBookingModal({ ...bookingModal, open: false })}
        sellerId={bookingModal.sellerId}
        serviceType="Genel Bakım & Onarım"
        onBooked={() => navigate("/app/appointments")}
      />
    </div>
  );
};

export default MechanicsScreen;
