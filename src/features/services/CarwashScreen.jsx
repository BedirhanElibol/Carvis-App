import React, { useState, useEffect } from "react";
import { ChevronLeft, Droplets, Loader2 } from "lucide-react";
import { SpecialistCard } from "../../components/Core";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useGarage } from "../../context/GarageContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { triggerHaptic } from "../../utils/haptics";
import EmptyState from "../../components/shared/EmptyState";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import VehicleDemandForm from "../garage/VehicleDemandForm";

const CarwashScreen = () => {
  const { t, showAlert, openModal } = useUI();
  const { currentUser } = useAuth();
  const { currentVehicle } = useGarage();
  const navigate = useNavigate();

  const [isMapView, setIsMapView] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [carwashList, setCarwashList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDemandForm, setShowDemandForm] = useState(false);

  // Fetch Carwash Partners from DB
  useEffect(() => {
    const fetchCarwashes = async () => {
      try {
        // Fetch profiles with role 'carwash' that are approved
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "carwash")
          .eq("application_status", "approved");
          
        if (error) throw error;
        
        // Map to specialist card format
        const mapped = (data || []).map((m) => {
          const price = m.business_details?.base_price;
          return {
            id: m.id,
            seller_id: m.id,
            name: m.full_name || m.company_name || "Seyyar Yıkama Uzmanı",
            shop_name: m.company_name || m.full_name || "Seyyar Yıkama Uzmanı",
            brands: ["Tüm Araçlar"],
            price: price ? `${price} ₺` : null,
            rating_avg: m.rating_avg || 0,
            review_count: m.review_count || 0,
            distance: "Yakınınızda", // Will be calculated based on loc
            is_open: true
          }
        });
        setCarwashList(mapped);
      } catch (err) {
        console.error("Fetch carwash err:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCarwashes();
  }, []);

  const [mapUrl, setMapUrl] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    const fetchMap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-map-image", {
          method: "GET",
        });
        if (error) throw error;
        if (data && data instanceof Blob) {
          objectUrl = URL.createObjectURL(data);
          setMapUrl(objectUrl);
        }
      } catch (err) {
        console.error("Fetch map err:", err);
      }
    };
    fetchMap();

    // Component unmount map cleanup
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, []);

  if (!t) return null;

  if (showDemandForm) {
    return (
      <div className="p-5 pb-32 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setShowDemandForm(false)}
            className="p-2.5 glass-card rounded-xl text-slate-500 dark:text-slate-400 active-scale border border-black/10 dark:border-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter uppercase">
              Yıkamacı Çağır
            </h3>
            <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">
              Konumuna Seyyar Yıkama İste
            </p>
          </div>
        </div>
        <VehicleDemandForm
          vehicle={currentVehicle}
          initialDemandType="service"
          initialDescription={`${currentVehicle?.brand || 'Aracım'} için bulunduğum konuma detaylı iç-dış seyyar yıkama hizmeti talep ediyorum.`}
          onSubmit={async (data) => {
            setSubmitting(true);
            try {
              if (!currentUser || currentUser.isAnonymous) {
                openModal("login");
                return;
              }
              const { error } = await supabase.from("service_requests").insert([
                {
                  user_id: currentUser.id,
                  plate: currentVehicle?.plate || "BELİRSİZ",
                  brand: currentVehicle?.brand,
                  model: currentVehicle?.model,
                  engine_code: currentVehicle?.engineCode,
                  demand_type: "carwash",
                  description: data.description,
                  status: "pending",
                },
              ]);
              if (error) throw error;
              showAlert(
                "Talebiniz Alındı",
                "Yıkama talebiniz bölgenizdeki seyyar yıkamacılara iletildi.",
                "success",
              );
              setShowDemandForm(false);
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
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
            <Loader2 className="animate-spin text-cyan-500" size={48} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 pb-32 space-y-6 animate-fade-in relative">
      <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-black text-3xl text-slate-900 dark:text-white tracking-tighter uppercase">
            Seyyar Yıkama
          </h3>
          <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest mt-1">Bulunduğunuz yere gelsin</p>
        </div>
        <div className="glass-card p-1.5 rounded-2xl flex gap-1 shadow-2xl border border-black/10 dark:border-white/10 backdrop-blur-xl">
          <button
            onClick={() => { setIsMapView(false); triggerHaptic("light"); }}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all active-scale ${
              !isMapView ? "bg-cyan-600 shadow-lg text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-white"
            }`}
          >
            LİSTE
          </button>
          <button
            onClick={() => { setIsMapView(true); triggerHaptic("light"); }}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all active-scale ${
              isMapView ? "bg-cyan-600 shadow-lg text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-white"
            }`}
          >
            HARİTA
          </button>
        </div>
      </div>

      <button 
        onClick={() => setShowDemandForm(true)}
        className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-500 p-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all active-scale mb-6"
      >
        <Droplets size={20} /> Açık Talep Oluştur
      </button>

      {isMapView ? (
        <div className="h-[60vh] glass-card rounded-[3rem] flex items-center justify-center relative overflow-hidden group shadow-2xl border border-black/5 dark:border-white/5 mx-1">
          {mapUrl ? (
            <div className="absolute inset-0 bg-cover opacity-30 group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: `url('${mapUrl}')` }}></div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-cyan-900/20 to-slate-900 opacity-50"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
          <div className="relative z-10 glass-card p-8 rounded-[2.5rem] text-center shadow-2xl backdrop-blur-2xl border border-black/10 dark:border-white/10 animate-slide-up">
            <div className="w-16 h-16 bg-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
              <Droplets size={32} className="text-cyan-500" />
            </div>
            <p className="font-black text-slate-900 dark:text-white text-xl tracking-tighter mb-1">RADAR AKTİF</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">Bölgenizdeki Yıkamacılar Taranıyor...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <SkeletonList count={3} />
          ) : carwashList.length > 0 ? (
            carwashList.map((m) => (
              <div key={m.id} className="relative animate-in slide-in-from-bottom-2">
                <SpecialistCard 
                  specialist={m} 
                  onAction={() => setShowDemandForm(true)} 
                />
              </div>
            ))
          ) : (
            <EmptyState
              icon={Droplets}
              title="Yıkamacı Bulunamadı"
              subtitle="Bölgenizde aktif seyyar yıkamacı bulunamadı. Talep oluşturarak onlara ulaşabilirsiniz."
              actionLabel="Talep Oluştur"
              onAction={() => setShowDemandForm(true)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CarwashScreen;
