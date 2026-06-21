import React, { useState } from "react";
import * as Icons from "lucide-react";
import { cn } from "../../lib/utils";
import { useAI } from "../../context/AIContext";

const AccidentAssistantModal = ({ show, onClose }) => {
  const [step, setStep] = useState(1);
  const { analyzeDamage, analysisStatus } = useAI();
  const [reportData, setReportData] = useState({
    photos: [],
    description: "",
    witnessInfo: "",
    opponentPlate: "",
  });

  const steps = [
    { id: 1, title: "Fotoğraflar", icon: Icons.Camera },
    { id: 2, title: "Bilgiler", icon: Icons.FileText },
    { id: 3, title: "AI Analiz", icon: Icons.Sparkles },
    { id: 4, title: "Özet", icon: Icons.ShieldCheck },
  ];

  if (!show) return null;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleStartAnalysis = () => {
    // Simulate uploading a photo
    analyzeDamage(
      "https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=600&auto=format&fit=crop",
    );
    nextStep();
  };

  const stepProgressStyle = { width: `${(step - 1) * 33}%` };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="bg-slate-900 w-full max-w-xl rounded-t-[2.5rem] sm:rounded-[3rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 pb-safe max-h-[90vh] flex flex-col">
        {/* Touch Drag Indicator (Mobile Only) */}
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2 sm:hidden shrink-0"></div>

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500/20 p-2 rounded-xl text-primary-400">
              <Icons.ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter text-white uppercase font-sans">
                KAZA ASİSTANI
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 font-sans">
                Dijital Tutanak Rehberi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500"
          >
            <Icons.X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pt-6 pb-2">
          <div className="flex justify-between relative">
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2 z-10">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    step >= s.id
                      ? "bg-primary-600 border-primary-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      : "bg-slate-800 border-white/10 text-slate-500",
                  )}
                >
                  <s.icon size={18} />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest font-sans",
                    step >= s.id ? "text-primary-400" : "text-slate-600",
                  )}
                >
                  {s.title}
                </span>
              </div>
            ))}
            {/* Connecting Line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-white/5 -z-0"></div>
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary-600 transition-all duration-700 -z-0"
              style={stepProgressStyle}
            ></div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 min-h-[350px] overflow-y-auto no-scrollbar overscroll-contain flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="bg-primary-500/5 border border-primary-500/20 p-4 rounded-3xl flex items-start gap-4">
                <Icons.AlertTriangle
                  size={24}
                  className="text-primary-400 shrink-0 mt-1"
                />
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  <span className="font-bold text-white uppercase block mb-1">
                    UNUTMAYIN
                  </span>
                  Kaza mahalini, plakaları ve hasarı net şekilde fotoğraflayın.
                  Mümkünse araçları trafiği engellemeyecek bir yere çekin.
                </p>
              </div>
              <button className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-primary-500/40 hover:bg-primary-500/5 transition-all active-scale group">
                <div className="bg-slate-800 p-5 rounded-3xl group-hover:scale-110 transition-transform">
                  <Icons.Camera
                    size={40}
                    className="text-slate-500 group-hover:text-primary-400"
                  />
                </div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-sans">
                  Fotoğraf Çek veya Yükle
                </span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 font-sans">
                  Karşı Taraf Plaka
                </label>
                <input
                  className="w-full bg-slate-800 border border-white/5 p-4 rounded-2xl text-sm outline-none focus:border-primary-500/50 transition-all font-mono"
                  placeholder="34 ABC 123"
                  value={reportData.opponentPlate}
                  onChange={(e) =>
                    setReportData({
                      ...reportData,
                      opponentPlate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 font-sans">
                  Olay Özeti
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-white/5 p-4 rounded-3xl text-sm outline-none focus:border-primary-500/50 transition-all h-32 resize-none font-sans"
                  placeholder="Kaza nasıl meydana geldi?"
                  value={reportData.description}
                  onChange={(e) =>
                    setReportData({
                      ...reportData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-3xl animate-pulse"></div>
                <div className="bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center border border-primary-500/50 relative">
                  <Icons.Sparkles
                    size={48}
                    className="text-primary-400 animate-spin-slow"
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white uppercase tracking-tighter mb-2 font-sans">
                  Hasar Analizi Başlatılıyor
                </h3>
                <p className="text-xs text-slate-400 max-w-[250px] mx-auto leading-relaxed font-sans">
                  Yüklediğiniz fotoğraflar AI motorumuz tarafından saniyeler
                  içinde incelenecek.
                </p>
              </div>
              <button
                onClick={handleStartAnalysis}
                className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-900/40 active-scale font-sans"
              >
                {analysisStatus === "analyzing"
                  ? "ANALİZ EDİLİYOR..."
                  : "ANALİZİ BAŞLAT"}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="text-center">
                <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/40">
                  <Icons.CheckCircle2 size={32} className="text-green-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter font-sans">
                  DOSYA HAZIR
                </h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold font-sans">
                  Kaza Raporunuz Dijital Olarak Oluşturuldu
                </p>
              </div>
              <div className="bg-white/5 rounded-[2rem] p-5 space-y-4 border border-white/5">
                <div className="flex justify-between items-center text-sm font-bold font-sans">
                  <span className="text-slate-500 uppercase text-[10px] tracking-widest">
                    Kaza Türü:
                  </span>
                  <span className="text-white">Maddi Hasarlı</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold font-sans">
                  <span className="text-slate-500 uppercase text-[10px] tracking-widest">
                    Tahmini Hasar:
                  </span>
                  <span className="text-primary-400">7.500 ₺ - 12.000 ₺</span>
                </div>
                <div className="pt-3 border-t border-white/5">
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    "Tutanak ve fotoğraflar güvenli buluta kaydedildi. Sigorta
                    şirketinizle paylaşmaya hazır."
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active-scale font-sans"
              >
                RAPORU KAYDET VE KAPAT
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step < 4 && (
          <div className="p-6 bg-slate-950/50 border-t border-white/5 flex gap-4 shrink-0">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-4 rounded-2xl border border-white/10 text-white active-scale transition-colors"
              >
                <Icons.ArrowLeft size={20} />
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl active-scale font-sans"
            >
              İleri <Icons.ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccidentAssistantModal;
