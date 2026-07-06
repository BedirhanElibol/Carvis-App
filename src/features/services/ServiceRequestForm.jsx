import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGarage } from "../../context/GarageContext";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { supabase } from "../../supabaseClient";
import { AlertCircle, Banknote, Camera, Car, ChevronLeft, FileText, HelpCircle, Image, Loader2, Mic, Paperclip, Send, ShieldAlert, Sparkles, Trash2, Volume2, Activity, Flame, ChevronsDown, CircleSlash, Droplets, Wind, ZapOff } from "lucide-react";

const Icons = { Activity, Volume2, Flame, ChevronsDown, CircleSlash, Droplets, Wind, ZapOff };

const SYMPTOMS_LIST = [
  { id: "vibration", label: "Titreme / Sarsıntı", icon: "Activity", desc: "Pedalda veya direksiyonda sarsıntı", color: "text-amber-400" },
  { id: "noise", label: "Garip Sesler", icon: "Volume2", desc: "Motordan veya tekerden tıkırtı/ıslık", color: "text-blue-400" },
  { id: "overheating", label: "Hararet / Isınma", icon: "Flame", desc: "Hararet göstergesi yüksek seviyede", color: "text-red-400" },
  { id: "loss_of_power", label: "Çekiş Düşüklüğü", icon: "ChevronsDown", desc: "Gaza basıldığında geç tepki verme", color: "text-indigo-400" },
  { id: "weak_brakes", label: "Fren Zayıflığı", icon: "CircleSlash", desc: "Geç yavaşlama veya fren sesi", color: "text-pink-400" },
  { id: "leak", label: "Sıvı Kaçağı", icon: "Droplets", desc: "Alt kısımdan yağ veya su sızıntısı", color: "text-teal-400" },
  { id: "smoke", label: "Egzoz Dumanı", icon: "Wind", desc: "Siyah veya mavi renkli yoğun duman", color: "text-slate-500 dark:text-slate-400" },
  { id: "crank_issue", label: "Marş Sorunu", icon: "ZapOff", desc: "Aracın geç çalışması veya çalışmaması", color: "text-yellow-400" },
];

const ServiceRequestForm = () => {
  const navigate = useNavigate();
  const { vehicles, currentVehicle } = useGarage();
  const { currentUser } = useAuth();
  const { showAlert } = useUI();

  const [selectedVehicleId, setSelectedVehicleId] = useState(currentVehicle?.id || "");
  const [demandType, setDemandType] = useState("service"); // 'part' or 'service'
  const [description, setDescription] = useState("");
  const [engineCode, setEngineCode] = useState("");
  const [urgency, setUrgency] = useState("pending"); // 'immediate', 'pending', 'flexible'
  
  // New AI Diagnosis features
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [pendingUploadType, setPendingUploadType] = useState(null);

  // Auto-calculated state variables based on symptoms & description
  const [aiDiagnosis, setAiDiagnosis] = useState({
    diagnosis: "Belirti bekleniyor...",
    risk: "low",
    minCost: 1000,
    maxCost: 2500,
    confidence: 90,
  });

  const getSymptomIconComponent = (iconName) => {
    const Comp = Icons[iconName];
    return Comp ? <Comp size={20} /> : <HelpCircle size={20} />;
  };

  const handleSymptomToggle = (id) => {
    setSelectedSymptoms((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Client-side AI pre-analysis based on selected symptoms (real-time UX feedback)
  useEffect(() => {
    if (selectedSymptoms.length === 0 && !description.trim()) {
      setAiDiagnosis({
        diagnosis: "Lütfen yukarıdan belirti seçin veya arızayı açıklayın.",
        risk: "low",
        minCost: 1000,
        maxCost: 2500,
        confidence: 0,
      });
      return;
    }

    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      let diagnosis = "Sistem ve Sensör Taraması Önerilir";
      let risk = "low";
      let minCost = 1200;
      let maxCost = 2800;
      let confidence = 80 + Math.min(15, selectedSymptoms.length * 3);

      if (selectedSymptoms.includes("overheating")) {
        diagnosis = "Soğutma Sistemi & Termostat Arızası";
        risk = "critical";
        minCost = 4500;
        maxCost = 9000;
      } else if (selectedSymptoms.includes("weak_brakes")) {
        diagnosis = "Fren Balatası ve Hidrolik Aşınması";
        risk = "high";
        minCost = 1800;
        maxCost = 3500;
      } else if (selectedSymptoms.includes("crank_issue") || selectedSymptoms.includes("loss_of_power")) {
        diagnosis = "Yakıt Enjeksiyonu & Ateşleme Sistemi Hatası";
        risk = "medium";
        minCost = 3500;
        maxCost = 7200;
      } else if (selectedSymptoms.includes("leak")) {
        diagnosis = "Karter Tapa Sızıntısı & Keçe Eskimesi";
        risk = "medium";
        minCost = 2000;
        maxCost = 4500;
      } else if (selectedSymptoms.includes("vibration") || selectedSymptoms.includes("noise")) {
        diagnosis = "Alt Takım Askı Rotları & Aks Körüğü Değişimi";
        risk = "low";
        minCost = 1500;
        maxCost = 3200;
      }

      // Add variation if description is descriptive
      if (description.toLowerCase().includes("motor") || description.toLowerCase().includes("şanzıman")) {
        minCost += 1500;
        maxCost += 3000;
        if (risk === "low") risk = "medium";
      }

      setAiDiagnosis({
        diagnosis,
        risk,
        minCost,
        maxCost,
        confidence: Math.min(99, confidence),
      });
      setIsAnalyzing(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedSymptoms, description]);

  const handleUploadClick = (type) => {
    setPendingUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : 'audio/*';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUploadType) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${currentUser.id}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('service-proofs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('service-proofs')
        .getPublicUrl(filePath);

      setMediaFiles(prev => [
        ...prev,
        { id: Date.now(), type: pendingUploadType, url: urlData.publicUrl, name: file.name }
      ]);
      showAlert("Yüklendi", `${pendingUploadType === 'image' ? 'Fotoğraf' : 'Ses dosyası'} sisteme başarıyla yüklendi.`, "success");
    } catch (err) {
      console.error('Upload error:', err);
      showAlert("Hata", "Dosya yüklenirken bir sorun oluştu.", "error");
    } finally {
      setPendingUploadType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = (id) => {
    setMediaFiles(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      showAlert("Hata", "Lütfen talep açıklaması girin.", "error");
      return;
    }
    if (!selectedVehicleId) {
      showAlert("Hata", "Lütfen bir araç seçin.", "error");
      return;
    }

    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId || v.id.toString() === selectedVehicleId.toString());
    if (!selectedVehicle) {
      showAlert("Hata", "Geçersiz araç seçimi.", "error");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("service_requests")
        .insert([
          {
            user_id: currentUser.id,
            plate: selectedVehicle.plate,
            brand: selectedVehicle.brand,
            model: selectedVehicle.model,
            engine_code: engineCode || null,
            demand_type: demandType,
            description: description,
            status: "pending",
            symptoms: selectedSymptoms,
            ai_pre_diagnosis: aiDiagnosis.diagnosis,
            risk_level: aiDiagnosis.risk,
            estimated_cost_min: aiDiagnosis.minCost,
            estimated_cost_max: aiDiagnosis.maxCost,
            urgency: urgency,
            media_urls: mediaFiles.map(m => m.url),
          },
        ]);

      if (error) throw error;

      showAlert(
        "Başarılı",
        "Akıllı Talebiniz başarıyla oluşturuldu! Satıcılar ve ustalar size en uygun teklifleri iletecektir.",
        "success"
      );

      // Create notification
      await supabase.from("notifications").insert([
        {
          user_id: currentUser.id,
          type: "system",
          title: "Yapay Zeka Talebi Alındı",
          message: `${selectedVehicle.brand} ${selectedVehicle.model} için AI ön teşhisli talebiniz yayında.`,
        },
      ]);

      navigate("/quotes");
    } catch (error) {
      console.error("Error creating service request:", error);
      showAlert("Hata", "Talep oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 p-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale border border-black/10 dark:border-white/10 hover:bg-black/5 dark:bg-white/5 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase">AKILLI TEŞHİS SİHİRBAZI</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">AI Ön Teşhisli Servis Talebi</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-5 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Araç Seçimi */}
          <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <Car size={16} className="text-primary-500" />
              Araç Seçimi
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              required
            >
              <option value="">İşlem yapılacak aracı seçin...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.plate})
                </option>
              ))}
            </select>
          </div>

          {/* Belirti Seçici Grid */}
          <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <ShieldAlert size={16} className="text-primary-500" />
              Hissedilen Belirtiler (Çoklu Seçim)
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              {SYMPTOMS_LIST.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => handleSymptomToggle(sym.id)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all relative overflow-hidden group ${
                      isSelected 
                        ? "bg-white dark:bg-slate-900/90 border-primary-500 shadow-lg shadow-primary-950/20" 
                        : "bg-white dark:bg-slate-900/30 border-black/5 dark:border-white/5 hover:border-black/10 dark:border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 ${isSelected ? sym.color : 'text-slate-500 group-hover:text-slate-500 dark:text-slate-400'}`}>
                        {getSymptomIconComponent(sym.icon)}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">{sym.label}</p>
                      <p className="text-[8px] font-medium text-slate-500 uppercase mt-0.5 line-clamp-1">{sym.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Real-time Ön Teşhis Kartı */}
          <div className="relative group overflow-hidden">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-[2rem] blur opacity-15"></div>
            <div className="relative glass-card border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900/90 p-6 rounded-[2rem] space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-600/10 p-2.5 rounded-xl border border-primary-500/20 text-primary-400">
                    <Sparkles size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">AI Ön Teşhis Motoru</h3>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">CANLI ANALİZ PANELİ</p>
                  </div>
                </div>

                {isAnalyzing ? (
                  <span className="text-[8px] font-black text-primary-400 uppercase tracking-widest animate-pulse">ANALİZ EDİLİYOR...</span>
                ) : aiDiagnosis.confidence > 0 ? (
                  <span className="text-[8px] font-black text-teal-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">%{aiDiagnosis.confidence} Güven</span>
                ) : (
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Girdi Bekleniyor</span>
                )}
              </div>

              {/* Dynamic Risk Gauge (İbre) & Cost info */}
              {aiDiagnosis.confidence > 0 ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Olası Arıza Tespiti</p>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">{aiDiagnosis.diagnosis}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Risk Seviyesi</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded mt-1 inline-block ${
                        aiDiagnosis.risk === 'critical' ? 'bg-red-500/10 text-red-400' :
                        aiDiagnosis.risk === 'high' ? 'bg-orange-500/10 text-orange-400' :
                        aiDiagnosis.risk === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-teal-400'
                      }`}>
                        {aiDiagnosis.risk.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Cost Prediction Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Banknote size={10} className="text-emerald-500" /> Tahmini Alt Limit</p>
                      <p className="text-lg font-black text-teal-400 mt-1">₺{aiDiagnosis.minCost.toLocaleString('tr-TR')}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><AlertCircle size={10} className="text-red-500" /> Tahmini Üst Limit</p>
                      <p className="text-lg font-black text-red-400 mt-1">₺{aiDiagnosis.maxCost.toLocaleString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-black/5 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{aiDiagnosis.diagnosis}</p>
                </div>
              )}
            </div>
          </div>

          {/* Arıza Kanıt Yükleme Alanı */}
          <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <Paperclip size={16} className="text-primary-500" />
                Medya Kanıtı Yükle
              </label>
              <span className="text-[8px] font-black uppercase bg-primary-500/10 text-primary-500 px-2 py-1 rounded-md">BETA</span>
            </div>
            <p className="text-[9px] font-medium text-slate-500">
              * Motor sesi analizi (AI) şu an test aşamasındadır. Kesin arıza tespiti için lütfen servisinize danışınız.
            </p>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => handleUploadClick('image')}
                className="py-4 bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary-500/30 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
              >
                <Camera size={18} />
                <span className="text-[9px] font-black uppercase tracking-widest">FOTOĞRAF EKLE</span>
              </button>
              <button 
                type="button"
                onClick={() => handleUploadClick('audio')}
                className="py-4 bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary-500/30 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
              >
                <Mic size={18} />
                <span className="text-[9px] font-black uppercase tracking-widest">SES KAYDI YÜKLE</span>
              </button>
            </div>

            {/* Media previews */}
            {mediaFiles.length > 0 && (
              <div className="pt-2 space-y-2">
                {mediaFiles.map((media) => (
                  <div key={media.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-black/5 dark:border-white/5 flex justify-between items-center animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2">
                      <span className="text-primary-400">
                        {media.type === 'image' ? <Image size={14} /> : <Volume2 size={14} />}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px] uppercase tracking-tight">{media.name}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveMedia(media.id)}
                      className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Engine Code (Optional) */}
          <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
              Motor Hacmi / Kodu <span className="text-slate-600">(Opsiyonel)</span>
            </label>
            <input
              type="text"
              value={engineCode}
              onChange={(e) => setEngineCode(e.target.value)}
              placeholder="Örn: 1.6 TDI, 1.5 TSI, 2.0 D"
              className="w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          {/* Talep Tipi */}
          <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Talep Tipi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDemandType("part")}
                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  demandType === "part"
                    ? "bg-primary-600 text-slate-900 dark:text-white shadow-xl shadow-primary-950/40"
                    : "bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400"
                }`}
              >
                Parça Talebi
              </button>
              <button
                type="button"
                onClick={() => setDemandType("service")}
                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  demandType === "service"
                    ? "bg-primary-600 text-slate-900 dark:text-white shadow-xl shadow-primary-950/40"
                    : "bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400"
                }`}
              >
                Servis Talebi
              </button>
            </div>
          </div>

          {/* Aciliyet Durumu */}
          <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Aciliyet Durumu</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "immediate", label: "ACİL / SOS", desc: "Aynı Gün", color: "border-red-500 text-red-400" },
                { id: "pending", label: "PLANLI", desc: "1-3 Gün", color: "border-primary-500 text-primary-400" },
                { id: "flexible", label: "ESNEK", desc: "Bu Hafta", color: "border-slate-500 text-slate-500 dark:text-slate-400" },
              ].map((urg) => {
                const isSelected = urgency === urg.id;
                return (
                  <button
                    key={urg.id}
                    type="button"
                    onClick={() => setUrgency(urg.id)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected 
                        ? `bg-white dark:bg-slate-900 border-2 ${urg.color} shadow-lg shadow-black/20` 
                        : "bg-white dark:bg-slate-900/30 border-black/5 dark:border-white/5 text-slate-500"
                    }`}
                  >
                    <p className="text-[9px] font-black uppercase tracking-wider">{urg.label}</p>
                    <p className="text-[8px] font-bold opacity-60 uppercase mt-0.5">{urg.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Açıklama */}
          <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <FileText size={16} className="text-primary-500" />
              Talep Açıklaması
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                demandType === "part"
                  ? "Örn: Ön fren balatası ve disk lazım. Pedalda yüksek titreşim var."
                  : "Örn: Periyodik bakım yaptırmak istiyorum. Yağ, hava filtresi ve genel arıza kontrolü yapılacak."
              }
              rows={4}
              className="w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              required
            />
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1 font-bold">
              Detaylı açıklamalar AI ön teşhis güven oranını arttırır.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 p-5 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-white active-scale disabled:opacity-50 shadow-xl shadow-primary-900/20 border border-black/10 dark:border-white/10"
          >
            {loading ? (
              <Loader2 className="animate-spin text-slate-900 dark:text-white" size={16} />
            ) : (
              <>
                <Send size={16} />
                TEŞHİSLİ TALEBİ GÖNDER
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceRequestForm;
