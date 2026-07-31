import React, { useState, useEffect } from "react";
import { CalendarCheck, Car, Check, Compass, Copy, CreditCard, Disc, Download, Eye, File, FileLock2, FileText, Flower2, Gauge, History, Key, Lightbulb, Loader2, Plus, RotateCw, Save, ShieldAlert, ShieldCheck, Sparkles, Thermometer, Trash2, Wind, Workflow, Wrench, X, Zap, ScanText, CheckCircle2, UploadCloud, Droplets, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "../../../context/UIContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../supabaseClient";
import Tesseract from "tesseract.js";
import { calculateCarValuation } from "../../../utils/carValuation";
import { auditOdometerHistory } from "../../../utils/odometerAudit";
import { exportElementToPdf } from "../../../utils/pdfExport";
import CarfaxReportHeader from "../../../components/carfax/CarfaxReportHeader";
import { generateCryptoVehiclePassport } from "../../../utils/cryptoPassportEngine";

const VehiclePassport = ({ vehicle, onClose }) => {
  const { t, showAlert } = useUI();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  const valuation = calculateCarValuation({
    brand: vehicle?.brand || "",
    model: vehicle?.model || "",
    year: vehicle?.year || vehicle?.model_year || 2018,
    km: vehicle?.km || 120000
  });

  // Maintenance tracker state
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrComplete, setOcrComplete] = useState(false);
  const [newRecord, setNewRecord] = useState({
    part_name: "",
    changed_date: new Date().toISOString().split("T")[0],
    changed_km: vehicle?.km || 0,
    next_km_interval: 15000,
    next_date_interval_months: 12,
    notes: ""
  });

  // Default maintenance items users can track
  const maintenancePresets = [
    { name: "Motor Yağı & Filtre", icon: Droplets, interval_km: 10000, interval_months: 12, color: "text-amber-500" },
    { name: "Fren Balatası (Ön)", icon: ShieldAlert, interval_km: 40000, interval_months: 36, color: "text-rose-500" },
    { name: "Fren Balatası (Arka)", icon: ShieldAlert, interval_km: 50000, interval_months: 48, color: "text-rose-400" },
    { name: "Hava Filtresi", icon: Wind, interval_km: 20000, interval_months: 24, color: "text-blue-500" },
    { name: "Polen Filtresi", icon: Flower2, interval_km: 15000, interval_months: 12, color: "text-emerald-500" },
    { name: "Lastik Değişimi", icon: Disc, interval_km: 40000, interval_months: 48, color: "text-slate-500" },
    { name: "Akü", icon: Zap, interval_km: 80000, interval_months: 48, color: "text-cyan-500" },
    { name: "Triger Kayışı/Zinciri", icon: RotateCw, interval_km: 90000, interval_months: 72, color: "text-orange-500" },
    { name: "Antifriz", icon: Thermometer, interval_km: 40000, interval_months: 24, color: "text-sky-500" },
    { name: "Buji", icon: Sparkles, interval_km: 30000, interval_months: 36, color: "text-yellow-500" }
  ];

  // Load saved records from Supabase
  useEffect(() => {
    if (!vehicle?.id || !currentUser) return;
    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("*")
        .eq("vehicle_id", vehicle.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setMaintenanceRecords(data);
      }
    };
    fetchRecords();
  }, [vehicle?.id, currentUser]);

  if (!vehicle) return null;

  const handleCopyChassis = () => {
    navigator.clipboard.writeText(vehicle.chassis_no || vehicle.chassis_number || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProofFile(file);
    setOcrScanning(true);
    setOcrComplete(false);

    try {
      // Real OCR using Tesseract.js
      const { data: { text } } = await Tesseract.recognize(
        file,
        'tur',
        { logger: m => console.log("OCR Progress:", m) }
      );
      
      const rawText = text.toLowerCase();
      
      // Basic keyword mapping
      let detectedPart = "Genel Bakım ve Onarım";
      if (rawText.includes("yağ") || rawText.includes("filtre")) detectedPart = "Periyodik Bakım (Yağ ve Filtreler)";
      if (rawText.includes("balata") || rawText.includes("disk")) detectedPart = "Fren Sistemi Bakımı";
      if (rawText.includes("lastik") || rawText.includes("rot")) detectedPart = "Lastik / Rot Balans İşlemi";
      
      const kmMatch = rawText.match(/(\d{2,3}[.\s]?\d{3})\s*km/i) || rawText.match(/kilometre\s*:\s*(\d+)/i);
      const parsedKm = kmMatch ? parseInt(kmMatch[1].replace(/[.\s]/g, "")) : (vehicle?.km || 0);
      
      setOcrScanning(false);
      setOcrComplete(true);
      
      setNewRecord({
        part_name: detectedPart,
        changed_date: new Date().toISOString().split("T")[0],
        changed_km: parsedKm,
        next_km_interval: 15000,
        next_date_interval_months: 12,
        notes: `OCR Sonucu: Taranan fiş başarıyla analiz edildi.`
      });
      
    } catch (err) {
      console.error("OCR Error:", err);
      showAlert("Hata", "Fatura okunamadı, lütfen daha net bir fotoğraf çekin.", "error");
      setOcrScanning(false);
      setProofFile(null);
    }
  };

  const handleConfirmOcrRecord = async () => {
    if (!proofFile || !ocrComplete) return;

    if (!currentUser) {
      showAlert("Giriş Gerekli", "Bakım kaydı eklemek için giriş yapmalısınız.", "warning");
      return;
    }

    setUploading(true);
    let proofImageUrl = null;
    
    try {
      const extension = proofFile.name.split(".").pop() || "jpg";
      const filePath = `maintenance_${vehicle.id}/${Date.now()}_ocr.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("service-proofs")
        .upload(filePath, proofFile, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("service-proofs")
        .getPublicUrl(filePath);
        
      proofImageUrl = publicUrlData.publicUrl;
    } catch (error) {
      console.error("Proof upload error:", error);
      showAlert("Hata", "Fotoğraf yüklenemedi. Lütfen tekrar deneyin.", "error");
      setUploading(false);
      return;
    }

    const payload = {
      vehicle_id: vehicle.id,
      user_id: currentUser.id,
      part_name: newRecord.part_name,
      changed_date: newRecord.changed_date,
      changed_km: parseInt(newRecord.changed_km) || 0,
      next_km_interval: parseInt(newRecord.next_km_interval) || 15000,
      next_date_interval_months: parseInt(newRecord.next_date_interval_months) || 12,
      notes: newRecord.notes,
      proof_image_url: proofImageUrl
    };

    const { data, error } = await supabase
      .from("maintenance_records")
      .insert([payload])
      .select();

    if (error) {
      console.error("Maintenance record insert error:", error);
      const localRecord = { ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString() };
      setMaintenanceRecords(prev => [localRecord, ...prev]);
      showAlert("Kayıt Eklendi", "Bakım faturası işlendi (Yerel).", "success");
    } else if (data && data[0]) {
      setMaintenanceRecords(prev => [data[0], ...prev]);
      showAlert("Kayıt Eklendi", `Fatura başarıyla dijital pasaporta işlendi.`, "success");
    }

    resetForm();
  };

  const resetForm = () => {
    setNewRecord({
      part_name: "",
      changed_date: new Date().toISOString().split("T")[0],
      changed_km: vehicle?.km || 0,
      next_km_interval: 15000,
      next_date_interval_months: 12,
      notes: ""
    });
    setProofFile(null);
    setOcrScanning(false);
    setOcrComplete(false);
    setShowAddForm(false);
    setUploading(false);
  };

  const handleDeleteRecord = async (recordId) => {
    if (typeof recordId === "string" && recordId.startsWith("local-")) {
      setMaintenanceRecords(prev => prev.filter(r => r.id !== recordId));
      return;
    }
    const { error } = await supabase.from("maintenance_records").delete().eq("id", recordId);
    if (!error) {
      setMaintenanceRecords(prev => prev.filter(r => r.id !== recordId));
    }
  };

  // Calculate remaining km / date for a maintenance record
  const getMaintenanceStatus = (record) => {
    const currentKm = vehicle.km || 0;
    const kmSinceChange = currentKm - (record.changed_km || 0);
    const nextKm = record.next_km_interval || 15000;
    const kmRemaining = nextKm - kmSinceChange;

    const changedDate = new Date(record.changed_date);
    const nextDateMs = changedDate.getTime() + (record.next_date_interval_months || 12) * 30.44 * 24 * 60 * 60 * 1000;
    const daysRemaining = Math.ceil((nextDateMs - Date.now()) / (24 * 60 * 60 * 1000));

    let status = "ok"; // ok, warning, overdue
    if (kmRemaining <= 0 || daysRemaining <= 0) status = "overdue";
    else if (kmRemaining < 2000 || daysRemaining < 30) status = "warning";

    return { kmSinceChange, kmRemaining, daysRemaining, status };
  };

  const serviceHistory = maintenanceRecords.map(r => ({
    id: r.id,
    date: new Date(r.changed_date).toLocaleDateString("tr-TR"),
    type: r.part_name,
    partner: "Onaylı Servis & Pasaport Kaydı",
    mileage: `${(r.changed_km || 0).toLocaleString()} KM`,
    price: r.cost ? `${r.cost} ₺` : "Pasaport Kaydı",
    icon: Wrench,
    proof_url: r.proof_image_url
  }));

  const documentsList = maintenanceRecords.filter(r => r.proof_image_url).map(r => ({
    id: r.id,
    category: "Servis Faturası / Fiş",
    name: `${r.part_name} Belgesi`,
    date: new Date(r.changed_date).toLocaleDateString("tr-TR"),
    size: "Görsel / PDF",
    url: r.proof_image_url
  }));

  const handlePresetSelect = (preset) => {
    setNewRecord(prev => ({
      ...prev,
      part_name: preset.name,
      next_km_interval: preset.interval_km,
      next_date_interval_months: preset.interval_months
    }));
    setShowAddForm(true);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDownloadPdf = async () => {
    setPdfDownloading(true);
    try {
      const fileName = `Rapidsy_Pasaport_${(vehicle.plate || "34CVS202").replace(/\s+/g, "")}.pdf`;
      await exportElementToPdf("vehicle-passport-modal-content", fileName, vehicle);
      showAlert("PDF İndirildi!", "Araç pasaportunuz resmi A4 formatında başarıyla cihazınıza indirildi.", "success");
    } catch (err) {
      console.error("PDF download error:", err);
      showAlert("Hata", "PDF oluşturulurken bir hata oluştu.", "error");
    } finally {
      setPdfDownloading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-2 pt-10 sm:pt-6 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="vehicle-passport-modal-content"
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] my-auto text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Background Pattern */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-teal-500/10 via-teal-500/5 to-transparent pointer-events-none" />

        {/* Top Bar for Action Buttons & Badges (Sticky Top) */}
        <div className="px-4 pt-3 sm:px-8 sm:pt-5 flex items-center justify-between z-30 relative sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 pb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap pr-2">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-500/20">
              Rapidsy Araç Pasaportu
            </span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 hidden xs:inline-block">
              Resmi Hafıza
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfDownloading}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-md shadow-teal-500/20 active-scale transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border-none"
            >
              {pdfDownloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span>{pdfDownloading ? "HAZIRLANIYOR..." : "PDF İNDİR"}</span>
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose?.();
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center border border-slate-200 dark:border-white/20 shadow-sm active-scale transition-all cursor-pointer"
              aria-label="Kapat"
            >
              <X size={16} className="sm:hidden" />
              <X size={18} className="hidden sm:block" />
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="px-4 sm:px-8 pt-3 pb-3 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
              <FileText size={24} className="sm:hidden" />
              <FileText size={32} className="hidden sm:block" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-tight">
                {vehicle.brand} {vehicle.model}
              </h2>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-0.5 rounded text-[10px] border border-slate-300 dark:border-slate-700 font-mono font-black uppercase">
                  {vehicle.plate || "34 CVS 202"}
                </span>
                {(vehicle.chassis_no || vehicle.chassis_number) && (
                  <div className="flex items-center gap-1 text-[11px]">
                    <span>• Şase:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold max-w-[120px] sm:max-w-none truncate">
                      {vehicle.chassis_no || vehicle.chassis_number}
                    </span>
                    <button 
                      onClick={handleCopyChassis}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-teal-500 dark:text-teal-400 cursor-pointer border-none bg-transparent"
                      title={t.copy}
                    >
                      {copied ? <Check size={13} className="text-teal-400" /> : <Copy size={13} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic TR Market Valuation Badge */}
          <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-900 dark:bg-slate-950/90 border border-emerald-500/30 text-white flex items-center justify-between sm:justify-start gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                <TrendingUp size={18} className="sm:hidden" />
                <TrendingUp size={20} className="hidden sm:block" />
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-emerald-400 block">Tahmini 2. El Piyasa Değeri</span>
                <span className="text-sm sm:text-base font-black font-mono text-white block">{valuation.formattedRange}</span>
                <span className="text-[8px] sm:text-[9px] text-slate-400 block mt-0.5">*Piyasa ve araç durumuna göre tahmini aralıktır</span>
              </div>
            </div>
            <div className="text-right border-l border-white/10 pl-3 ml-1 hidden sm:block">
              <span className="text-[8px] font-black uppercase tracking-widest text-teal-400 block">6 Ay Sonraki Tahmin</span>
              <span className="text-xs font-mono font-bold text-slate-200">{valuation.formattedForecast6m}</span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-3 sm:px-8 border-b border-slate-200 dark:border-white/10 flex gap-1.5 sm:gap-2 overflow-x-auto relative z-10 scrollbar-none bg-slate-50/50 dark:bg-slate-900/50">
          {[
            { id: "overview", label: t.generalStatus || "Genel Durum", icon: Compass },
            { id: "carfax", label: "Resmi Geçmiş & Hasar", icon: ShieldCheck },
            { id: "blockchain", label: "Dijital Mühür & KM Güvenliği", icon: FileLock2 },
            { id: "timeline", label: t.memoryTimeline || "Hafıza & Zaman Tüneli", icon: History },
            { id: "documents", label: t.documentVault || "Belge Kasası", icon: File },
            { id: "maintenance", label: "Bakım Takibi", icon: Wrench }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all bg-transparent cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive 
                    ? "border-teal-500 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 rounded-t-xl" 
                    : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Icon size={14} className="sm:hidden" />
                <Icon size={16} className="hidden sm:block" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-12 sm:pb-8 relative z-10 min-h-[250px]">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Vehicle Summary Card */}
                <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 flex flex-col items-center justify-center text-center shadow-sm">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">Araç Özeti</h4>
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 border-2 border-teal-500/40 flex items-center justify-center shadow-inner">
                      <Car size={40} className="text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{vehicle.km?.toLocaleString() || "—"} KM</p>
                    <p className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Güncel Kilometre</p>
                  </div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                    Bakım takibinizi "Bakım Takibi" sekmesinden güncelleyebilirsiniz.
                  </p>
                </div>

                {/* Left Side Quick Info */}
                <div className="md:col-span-2 space-y-6">
                  {/* Detailed Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: t.mileage || "Kilometre", val: `${vehicle.km?.toLocaleString() || "—"} KM`, icon: Gauge },
                      { label: t.lastMaintenance || "Son Bakım", val: vehicle.last_oil_change ? new Date(vehicle.last_oil_change).toLocaleDateString("tr-TR") : "BELİRTİLMEDİ", icon: Wrench },
                      { label: "Model Yılı", val: vehicle.year || "—", icon: CalendarCheck },
                      { label: "Motor Kodu", val: vehicle.engine_code || "BELİRTİLMEDİ", icon: Workflow },
                      { label: t.spareKey || "Yedek Anahtar", val: vehicle.spare_key ? (vehicle.spare_key === "yes" ? "MEVCUT" : "YOK") : "BELİRTİLMEDİ", icon: Key },
                      { label: "Plaka", val: vehicle.plate || "—", icon: CreditCard }
                    ].map((spec, i) => {
                      const SpecIcon = spec.icon;
                      return (
                        <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 shadow-md border border-slate-200 dark:border-white/10 flex flex-col justify-between">
                          <SpecIcon className="text-teal-600 dark:text-teal-400 mb-4" size={20} />
                          <div>
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">{spec.label}</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1 block font-mono">{spec.val}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Info Panel */}
                  <div className="p-6 rounded-3xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex gap-4 shadow-sm">
                    <Lightbulb className="text-teal-600 dark:text-teal-400 flex-shrink-0" size={24} />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Bakım Hatırlatması</h4>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                        Bakım Takibi sekmesinde parça değişim tarihlerinizi ve km bilgilerinizi kaydedin. Rapidsy sizi zamanı geldiğinde uyaracaktır.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DEDICATED CARFAX TAB */}
            {activeTab === "carfax" && (
              <motion.div
                key="carfax"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <CarfaxReportHeader vehicle={vehicle} recordsCount={maintenanceRecords.length} />
              </motion.div>
            )}

            {/* DEDICATED BLOCKCHAIN & SECURITY AUDIT TAB */}
            {activeTab === "blockchain" && (() => {
              const kmAudit = auditOdometerHistory(maintenanceRecords);
              const cryptoPassport = generateCryptoVehiclePassport(vehicle, maintenanceRecords);
              return (
                <motion.div
                  key="blockchain"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* VeChain / BMW Blockchain Banner */}
                  <div className="p-6 rounded-3xl bg-slate-950 border border-indigo-500/30 text-white space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shrink-0">
                        <FileLock2 size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-sm uppercase text-indigo-400">DEĞİŞTİRİLEMEZ DİJİTAL SAYAÇ & BAKIM MÜHRÜ</h5>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                            maintenanceRecords.length > 0
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}>
                            {maintenanceRecords.length > 0 ? "DİJİTAL ONAYLI" : "KAYIT BEKLENİYOR"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          {maintenanceRecords.length > 0
                            ? "Bu aracın tüm servis ve kilometre verileri dijital ağ üzerinde kilitlenmiştir."
                            : "Sisteme henüz onaylı servis veya bakım faturası eklenmemiştir. Fatura eklediğinizde dijital mühür aktifleşecektir."}
                        </p>
                      </div>
                    </div>

                    {maintenanceRecords.length > 0 ? (
                      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 font-mono text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Aktif Doğrulama İmzası:</span>
                          <span className="text-teal-400 font-bold">{cryptoPassport.currentBlockHash}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Önceki İmzalı Kayıt:</span>
                          <span className="text-slate-300">{cryptoPassport.previousBlockHash}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Dijital Kayıt Kimliği:</span>
                          <span className="text-indigo-300">{cryptoPassport.contractAddress}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 text-amber-300/80 font-mono text-xs flex items-center justify-between">
                        <span>Dijital Mühür Durumu:</span>
                        <span className="font-bold">Henüz Kayıt Girilmedi</span>
                      </div>
                    )}
                  </div>

                  {/* CARFAX Odometer Audit Banner */}
                  <div className={`p-6 rounded-3xl border flex items-center justify-between gap-4 ${kmAudit.badgeColor}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold shrink-0">
                        <Gauge size={24} />
                      </div>
                      <div>
                        <h5 className="font-black text-sm uppercase">{kmAudit.title}</h5>
                        <p className="text-xs font-semibold mt-1 leading-snug">{kmAudit.message}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {activeTab === "timeline" && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.chronologicalArchive || "Kronolojik Arşiv"}</h4>
                </div>

                <div className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-8 py-2">
                  {serviceHistory.length > 0 ? (
                    serviceHistory.map((item, index) => {
                      const EventIcon = item.icon;
                      return (
                        <div key={index} className="relative group">
                          <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-500 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-all shadow-lg">
                            <EventIcon size={12} />
                          </div>
                          <div className="p-6 rounded-3xl bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 hover:border-teal-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{item.date}</span>
                              <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">{item.type}</h4>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{item.partner} • {item.mileage}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-base font-black text-slate-900 dark:text-white">{item.price}</span>
                              {item.proof_url ? (
                                <a 
                                  href={item.proof_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-teal-500/20 cursor-pointer no-underline"
                                >
                                  Faturayı Gör
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Onaylı</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs font-bold uppercase tracking-widest">Henüz servis geçmişi yok.</div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "documents" && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.myDigitalDocs || "Dijital Belgelerim"}</h4>
                  <button 
                    onClick={() => setActiveTab("maintenance")}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center gap-2 border-none cursor-pointer"
                  >
                    <Plus size={14} /> Yeni Belge Yükle
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentsList.length > 0 ? (
                    documentsList.map((doc, i) => (
                      <div key={i} className="p-6 rounded-3xl bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 hover:border-teal-500/20 transition-all flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                            <File size={20} />
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{doc.category}</span>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5 uppercase tracking-tight">{doc.name}</h4>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{doc.date} • {doc.size}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-white dark:bg-white/5 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl flex items-center justify-center transition-all active-scale border border-black/5 dark:border-white/5 cursor-pointer no-underline"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-slate-500 text-xs font-bold uppercase tracking-widest">Henüz belge yok.</div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "maintenance" && (
              <motion.div
                key="maintenance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bakım Takip Kayıtları</h4>
                    <p className="text-[9px] text-slate-500 mt-1">Parça değişikliklerinizi kaydedin, Rapidsy size zamanını hatırlatsın.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center gap-2 border-none cursor-pointer"
                  >
                    <Plus size={14} /> Bakım Kaydı Ekle
                  </button>
                </div>

                {/* Quick preset selection */}
                {showAddForm && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-[#0a0f24] border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

                      {!proofFile && !ocrScanning && !ocrComplete && (
                        <div className="space-y-4 w-full">
                          <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                            <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-ping opacity-20"></div>
                            <ScanText size={36} className="text-teal-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Akıllı Fatura Tarama</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">Ustadan aldığınız faturanın veya fişin fotoğrafını çekin, Rapidsy yapay zeka ile işlemleri pasaportunuza otomatik işlesin.</p>
                          </div>
                          
                          <div className="relative mt-4">
                            <input
                              aria-label="Fatura Yükle"
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-full bg-slate-100 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-teal-500 dark:hover:border-teal-500 rounded-2xl py-8 flex flex-col items-center justify-center gap-2 transition-colors">
                              <UploadCloud size={28} className="text-slate-400" />
                              <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300 tracking-widest">Kamerayı Aç / Fotoğraf Seç</span>
                            </div>
                          </div>
                          
                          <button onClick={resetForm} className="text-[10px] uppercase font-black tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mt-4 cursor-pointer bg-transparent border-none">
                            Vazgeç
                          </button>
                        </div>
                      )}

                      {ocrScanning && (
                        <div className="space-y-6 w-full py-8">
                          <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 border-4 border-slate-200 dark:border-white/10 rounded-2xl"></div>
                            <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 rounded-full shadow-xl animate-[scan_2s_ease-in-out_infinite]"></div>
                            <ScanText size={40} className="text-teal-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">
                              Rapidsy AI Faturayı Analiz Ediyor...
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-2 font-mono">Motor yağı, kilometre ve tutar bilgileri eşleştiriliyor.</p>
                          </div>
                        </div>
                      )}

                      {ocrComplete && (
                        <div className="space-y-6 w-full text-left">
                          <div className="flex items-center gap-3 pb-4 border-b border-black/5 dark:border-white/10">
                            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                              <CheckCircle2 size={24} />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Tarama Başarılı</h3>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Faturadaki İşlemler Çözümlendi</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Tespit Edilen İşlem</span>
                              <p className="text-xs font-black text-slate-900 dark:text-white mt-1 leading-snug">{newRecord.part_name}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Değişim KM</span>
                              <p className="text-xs font-black text-slate-900 dark:text-white mt-1 font-mono">{newRecord.changed_km.toLocaleString()} KM</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 col-span-2">
                              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Çıkarılan Notlar / Tutar</span>
                              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">{newRecord.notes}</p>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 mt-4">
                            <button
                              onClick={resetForm}
                              className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-xl transition-all cursor-pointer border-none"
                            >
                              İptal / Yeniden Çek
                            </button>
                            <button
                              onClick={handleConfirmOcrRecord}
                              disabled={uploading}
                              className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer border-none disabled:opacity-50"
                            >
                              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                              {uploading ? "PASAPORTA İŞLENİYOR..." : "ONAYLA VE PASAPORTA İŞLE"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Records list */}
                <div className="space-y-3">
                  {maintenanceRecords.length === 0 && !showAddForm && (
                    <div className="text-center py-12">
                      <Wrench size={40} className="mx-auto text-slate-600 dark:text-slate-500 mb-4" />
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-2">Henüz Bakım Kaydınız Yok</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        "Bakım Kaydı Ekle" butonuna basarak parça değişikliklerinizi kaydedin. Rapidsy size sonraki değişim zamanını hatırlatsın.
                      </p>
                    </div>
                  )}

                  {maintenanceRecords.map((record) => {
                    const s = getMaintenanceStatus(record);
                    const preset = maintenancePresets.find(p => p.name === record.part_name);
                    const RecordIcon = preset?.icon || Wrench;
                    const iconColor = preset?.color || "text-slate-500";
                    
                    return (
                      <div key={record.id} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-between gap-4 group hover:border-teal-500/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5`}>
                            <RecordIcon size={20} className={iconColor} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{record.part_name}</h4>
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                              Değişim: {new Date(record.changed_date).toLocaleDateString("tr-TR")} • {(record.changed_km || 0).toLocaleString()} km'de
                            </p>
                            {record.notes && (
                              <p className="text-[9px] text-slate-400 mt-0.5 italic">{record.notes}</p>
                            )}
                            {record.proof_image_url && (
                              <a href={record.proof_image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase text-amber-500 hover:text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                                <File size={10} /> Belgeyi Gör
                              </a>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${
                              s.status === "overdue" ? "text-red-500" : s.status === "warning" ? "text-amber-500" : "text-emerald-500"
                            }`}>
                              {s.status === "overdue" ? "SÜRESİ GEÇTİ" : s.status === "warning" ? "YAKINLAŞIYOR" : "SORUNSUZ"}
                            </span>
                            <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                              {s.kmRemaining > 0 ? `${s.kmRemaining.toLocaleString()} km kaldı` : `${Math.abs(s.kmRemaining).toLocaleString()} km geçti`}
                              {" • "}
                              {s.daysRemaining > 0 ? `${s.daysRemaining} gün kaldı` : `${Math.abs(s.daysRemaining)} gün geçti`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="w-8 h-8 rounded-xl bg-transparent hover:bg-red-500/10 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border-none cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VehiclePassport;
