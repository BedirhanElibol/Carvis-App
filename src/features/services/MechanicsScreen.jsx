import React, { useState, useEffect } from "react";
import { ChevronLeft, Clock, Loader2, MapPin, ShieldCheck, SlidersHorizontal, Star, Wrench } from "lucide-react";
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
  const serviceType = location.state?.serviceType || "maintenance";
  const [isMapView, setIsMapView] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mechanicsList, setMechanicsList] = useState([]);
  const [loadingMechanics, setLoadingMechanics] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null); // 'verified' | 'authorized' | 'open' | null

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

  // Client-side filtered and sorted list
  const filteredMechanics = mechanicsList
    .filter(m => {
      if (activeFilter === 'verified') return m.is_verified || m.verified;
      if (activeFilter === 'authorized') return m.is_authorized || m.authorized_brands?.length > 0;
      if (activeFilter === 'open') {
        const hour = new Date().getHours();
        return hour >= 8 && hour < 20; // assume 08:00-20:00 as default open hours
      }
      return true; // no filter = show all
    })
    .sort((a, b) => {
      if (currentVehicle) {
        const aIsSpecialist = a.brands?.includes(currentVehicle.brand);
        const bIsSpecialist = b.brands?.includes(currentVehicle.brand);
        if (aIsSpecialist && !bIsSpecialist) return -1;
        if (!aIsSpecialist && bIsSpecialist) return 1;
      }
      return 0;
    });

  const toggleFilter = (filter) => {
    setActiveFilter(prev => prev === filter ? null : filter);
    triggerHaptic('light');
  };

  if (!t) return null;

  if (specialFlow === "maintenance") {
    return (
      <div className="p-5 pb-32 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setSpecialFlow(null)}
            className="p-2.5 glass-card rounded-xl text-slate-500 dark:text-slate-400 active-scale border border-black/10 dark:border-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">
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
          initialDescription={
            serviceType === "repair"
              ? `Arıza / Sorun Bildirimi: ${currentVehicle?.brand} ${currentVehicle?.model} aracımda bir sorun yaşıyorum. İnceleme ve onarım için teklif/randevu bekliyorum.`
              : serviceType === "tire"
              ? `Lastik & Rot Balans Talebi: ${currentVehicle?.brand} ${currentVehicle?.model} aracım için lastik / rot-balans hizmetine ihtiyacım var.`
              : serviceType === "wash"
              ? `Temizlik & Detaylı Bakım Talebi: ${currentVehicle?.brand} ${currentVehicle?.model} aracım için detaylı iç/dış yıkama, seramik kaplama vb. hizmet arıyorum.`
              : `Periyodik Bakım Talebi: ${currentVehicle?.brand} ${currentVehicle?.model} aracım için en uygun bakım paketini ve usta tekliflerini bekliyorum.`
          }
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
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950/50 z-50 flex items-center justify-center rounded-xl">
            <Loader2
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
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-3xl text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
          {t.mechanics || "Kurumsal Servisler"}
        </h3>
        <div className="glass-card p-1.5 rounded-2xl flex gap-1 border border-black/10 dark:border-white/10">
          <button
            onClick={() => {
              setIsMapView(false);
              triggerHaptic("light");
            }}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all active-scale ${
              !isMapView
                ? "bg-primary-600 shadow-lg text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-white"
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
                ? "bg-primary-600 shadow-lg text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-white"
            }`}
          >
            {t.mapView}
          </button>
        </div>
      </div>

      {/* Premium Filter Bar */}
      {!isMapView && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
          <button
            aria-label="Kurumsal Zincirler"
            onClick={() => toggleFilter('verified')}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-wider font-sans whitespace-nowrap active-scale shadow-sm transition-all ${
              activeFilter === 'verified'
                ? 'bg-primary-500 border-primary-400/30 text-slate-900 dark:text-white shadow-lg shadow-primary-500/20'
                : 'bg-primary-500/10 border-primary-500/20 text-primary-600 dark:text-primary-400 hover:bg-primary-500/20'
            }`}
          >
            <ShieldCheck size={12} /> Kurumsal Zincirler
          </button>
          <button
            aria-label="Yetkili Servis"
            onClick={() => toggleFilter('authorized')}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-wider font-sans whitespace-nowrap active-scale transition-all ${
              activeFilter === 'authorized'
                ? 'bg-amber-500 border-amber-400/30 text-slate-900 shadow-lg shadow-amber-500/20'
                : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
            }`}
          >
            <Star size={12} /> Yetkili Servis
          </button>
          <button
            aria-label="Açık/Kapalı"
            onClick={() => toggleFilter('open')}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-wider font-sans whitespace-nowrap active-scale transition-all ${
              activeFilter === 'open'
                ? 'bg-green-500 border-green-400/30 text-slate-900 shadow-lg shadow-green-500/20'
                : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
            }`}
          >
            <Clock size={12} /> Şu An Açık
          </button>
          {activeFilter && (
            <button
              aria-label="Filtreyi Temizle"
              onClick={() => setActiveFilter(null)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-wider font-sans whitespace-nowrap active-scale transition-all"
            >
              <SlidersHorizontal size={12} /> Temizle
            </button>
          )}
        </div>
      )}
      {isMapView ? (
        <div className="h-[60vh] glass-card rounded-[3rem] flex items-center justify-center relative overflow-hidden group border border-black/5 dark:border-white/5 mx-1">
          {mapUrl ? (
            <div
              className="absolute inset-0 bg-cover opacity-30 group-hover:scale-[1.01] transition-transform duration-1000"
              style={{ backgroundImage: `url('${mapUrl}')` }}
            ></div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 opacity-50"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
          <div className="relative z-10 glass-card p-8 rounded-xl text-center border border-black/10 dark:border-white/10 animate-slide-up">
            <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-500/20">
              <ShieldCheck size={32} className="text-primary-500" />
            </div>
            <p className="font-black text-slate-900 dark:text-white text-xl tracking-tighter mb-1">
              KURUMSAL AĞ RADARI
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">
              Ulusal Servis Ağları Taranıyor...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {loadingMechanics ? (
            <SkeletonList count={3} />
          ) : filteredMechanics.length > 0 ? (
            filteredMechanics.map((m) => {
              const isBrandSpecialist =
                currentVehicle && m.brands?.includes(currentVehicle.brand);
              return (
                <div
                  key={m.id}
                  className="relative animate-in slide-in-from-bottom-2"
                >
                  {isBrandSpecialist && (
                    <div className="absolute -top-2 left-6 z-10 bg-accent-600 text-slate-900 dark:text-white text-[8px] font-black px-3 py-1 rounded-full shadow-lg border border-accent-400/20 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldCheck size={10} /> {currentVehicle.brand}{" "}
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
              icon={Wrench}
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
