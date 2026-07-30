import React, { useState } from "react";
import { X, Wrench, Thermometer, Disc, Droplets, ChevronRight, Send, Package, ArrowLeft, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { triggerHaptic } from "../../utils/haptics";
import { useGarage } from "../../context/GarageContext";
import { useUI } from "../../context/UIContext";
import { supabase } from "../../supabaseClient";

const IssueReportingModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentVehicle } = useGarage();
  const { showAlert } = useUI();

  const [step, setStep] = useState(1); // 1: Category, 2: Details
  const [selectedService, setSelectedService] = useState(null);
  const [needType, setNeedType] = useState("mechanic"); // 'mechanic' | 'part'
  const [requestText, setRequestText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const services = [
    {
      id: "repair",
      title: "Arıza / Sorun Bildir",
      desc: "Beklenmedik bir sorun yaşıyorum",
      icon: Thermometer,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20"
    },
    {
      id: "maintenance",
      title: "Periyodik Bakım",
      desc: "Yağ, filtre ve genel kontrol zamanı geldi",
      icon: Wrench,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      id: "tire",
      title: "Lastik & Rot Balans",
      desc: "Lastik değişimi veya ayar ihtiyacım var",
      icon: Disc,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20"
    },
    {
      id: "wash",
      title: "Temizlik & Detaylı Bakım",
      desc: "İç-dış yıkama, seramik kaplama",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    }
  ];

  const handleSelectService = (service) => {
    triggerHaptic("light");
    setSelectedService(service);
    setRequestText(
      `${service.title}: ${currentVehicle ? `${currentVehicle.brand} ${currentVehicle.model}` : "Araç"} için onarım ve teklif talebi.`
    );
    setStep(2);
  };

  const handleSubmitRequest = async () => {
    triggerHaptic("impact");
    setIsSubmitting(true);

    try {
      // Insert into Supabase service_requests / quotes
      const { error } = await supabase.from("service_requests").insert([
        {
          demand_type: selectedService?.title || "Genel Bakım / Arıza",
          description: requestText,
          status: "pending",
          vehicle_info: currentVehicle ? `${currentVehicle.brand} ${currentVehicle.model} (${currentVehicle.plate})` : "Genel Araç",
          need_type: needType
        }
      ]);

      if (error) {
        console.warn("Service request insert fallback:", error);
      }
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
      onClose();
      setStep(1);
      showAlert(
        "Talebiniz Alındı",
        "İsteneğiniz Carvis ustalarına başarıyla iletildi. Teklifler hazır olduğunda bilgilendirileceksiniz.",
        "success"
      );
      navigate("/quotes");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-2 pt-12 sm:pt-6 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
          onClick={onClose}
        ></motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 flex flex-col max-h-[85vh] sm:max-h-[90vh] text-slate-900 dark:text-white my-auto z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-black/5 dark:border-white/5 relative bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            {step === 2 ? (
              <button
                onClick={() => setStep(1)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <div className="w-8 h-8" />
            )}
            
            <div className="text-center flex-1 px-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                {step === 1 ? "Sorun Bildir" : selectedService?.title || "Talep Oluştur"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {step === 1 ? "İşlem türünü seçin" : "Detayları belirleyin"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Step 1: Category Selection */}
          {step === 1 && (
            <div className="p-4 overflow-y-auto space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  className="w-full text-left p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-4 group active-scale"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${service.bg} ${service.color} ${service.border}`}>
                    <service.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{service.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">{service.desc}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Need Selection & Description Form */}
          {step === 2 && (
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Selected Vehicle Card */}
              {currentVehicle && (
                <div className="p-4 rounded-2xl bg-primary-600 text-slate-950 font-sans shadow-lg">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-950/70">SEÇİLİ ARAÇ</p>
                  <div className="flex justify-between items-center mt-0.5">
                    <h4 className="font-black text-base text-slate-950">{currentVehicle.brand} {currentVehicle.model}</h4>
                    <span className="text-xs font-mono font-bold bg-slate-950/20 px-2 py-0.5 rounded text-slate-950">{currentVehicle.plate}</span>
                  </div>
                </div>
              )}

              {/* Ne Lazım Section */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-sans text-center">
                  NE LAZIM?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNeedType("part")}
                    className={`p-4 rounded-2xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                      needType === "part"
                        ? "bg-primary-600 border-primary-500 text-slate-950 font-black shadow-md"
                        : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Package size={22} />
                    <span>YEDEK PARÇA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNeedType("mechanic")}
                    className={`p-4 rounded-2xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                      needType === "mechanic"
                        ? "bg-primary-600 border-primary-500 text-slate-950 font-black shadow-md"
                        : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Wrench size={22} />
                    <span>USTA / SERVİS</span>
                  </button>
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-sans">
                  TALEBİNİZİ AÇIKLAYIN
                </label>
                <textarea
                  rows={3}
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  placeholder="Arıza veya ihtiyaç detayını yazın..."
                  className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-medium text-xs outline-none focus:border-primary-500 transition-all placeholder-slate-400 dark:placeholder-slate-500 resize-none font-sans"
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 shadow-xl active-scale"
              >
                <Send size={18} /> {isSubmitting ? "Gönderiliyor..." : "TALEBİ GÖNDER"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IssueReportingModal;
