import React, { useState, useRef } from "react";
import { CalendarDays, Camera, Car, Check, ChevronLeft, ChevronRight, Gauge, Hash, HelpCircle, Search, ShieldCheck } from "lucide-react";
import { Badge } from "../../components/Core";
import { useExternalData } from "../../hooks/useExternalData";
import { useUI } from "../../context/UIContext";
import { CAR_DATABASE } from "../../constants/carDatabase";

const VehicleSearch = ({ onVehicleFound }) => {
  const [searchMode, setSearchMode] = useState("manual"); // 'manual' or 'vin'
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { showAlert } = useUI();

  // Step-by-step Selection States
  const [step, setStep] = useState("brand"); // brand, series, model, trim, final
  const [brandSearch, setBrandSearch] = useState("");
  const [seriesSearch, setSeriesSearch] = useState("");
  
  const [selection, setSelection] = useState({
    brand: "",
    series: "",
    model: "",
    trim: "",
    fuel: "",
    year: "",
    km: "",
    plate: "",
  });

  const { fetchVinDetails } = useExternalData();

  const handleVinSearch = async () => {
    if (vin.length < 17) {
      showAlert("Hata", "Lütfen 17 haneli geçerli bir şase numarası giriniz.", "error");
      return;
    }

    setLoading(true);
    const data = await fetchVinDetails(vin);
    if (data) {
      onVehicleFound({
        brand: data.brand || "Bilinmiyor",
        model: data.model || "Bilinmiyor",
        year: data.year || "",
        engine: `${data.engine_cylinders || "4"} Silindir - ${data.fuel_type || "Benzin"}`,
        plate: selection.plate ? selection.plate.toUpperCase().replace(/\s+/g, '') : "34" + (Math.random() + 1).toString(36).substring(7).toUpperCase(),
        vin: vin,
        chassis_number: vin,
        vin_data: {
          engine_displacement: data.engine_displacement,
          engine_hp: data.engine_hp,
          engine_cylinders: data.engine_cylinders,
          drive_type: data.drive_type,
          transmission: data.transmission,
          transmission_speeds: data.transmission_speeds,
          body_type: data.body_type,
          fuel_type: data.fuel_type,
          doors: data.doors,
          vehicle_type: data.vehicle_type,
          gvwr: data.gvwr,
          plant_country: data.plant_country,
          plant_city: data.plant_city,
          abs: data.abs,
          esc: data.esc,
          traction_control: data.traction_control,
          airbags: data.airbags,
          steering: data.steering,
        },
      });
    } else {
      showAlert("Hata", "Araç bilgileri bulunamadı. Lütfen kontrol ediniz.", "error");
    }
    setLoading(false);
  };

  const handleCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    setOcrProgress(0);

    try {
      // Dinamik Import: OCR sadece buton basıldığında yüklenecek! (Code Splitting)
      const tesseractModule = await import("tesseract.js");
      const Tesseract = tesseractModule.default || tesseractModule;

      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      // Extract VIN (17 alphanumeric characters)
      const cleanVin = text.replace(/[^A-HJ-NPR-Z0-9]/gi, "").toUpperCase();
      const vinMatch = cleanVin.match(/[A-HJ-NPR-Z0-9]{17}/);

      if (vinMatch) {
        setVin(vinMatch[0]);
      } else if (cleanVin.length >= 10) {
        // Partial match, let user fix it
        setVin(cleanVin.substring(0, 17));
      } else {
        showAlert(
          "Uyarı",
          "Şase numarası net okunamadı. Lütfen tekrar çekin veya manuel girin.",
          "warning"
        );
      }
    } catch (err) {
      console.error("OCR Error:", err);
      showAlert("Hata", "Tarama sırasında bir hata oluştu.", "error");
    } finally {
      setScanning(false);
      setOcrProgress(0);
    }
  };

  const handleManualSubmit = () => {
    if (selection.brand && selection.series) {
      onVehicleFound({
        brand: selection.brand,
        model: `${selection.series} ${selection.model || ""}`.trim(),
        year: selection.year,
        engine: `${selection.trim || ""} - ${selection.fuel || ""}`.trim().replace(/^-\s*|\s*-$/, ""),
        plate: selection.plate ? selection.plate.toUpperCase().replace(/\s+/g, '') : "34" + (Math.random() + 1).toString(36).substring(7).toUpperCase(),
        km: selection.km,
      });
    }
  };

  const getFuelBadgeColor = (fuel) => {
    switch (fuel?.toLowerCase()) {
      case "benzin":
        return "bg-emerald-500/10 text-teal-400 border-emerald-500/20";
      case "dizel":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "elektrik":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "hibrit":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "lpg":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20";
    }
  };

  const selectedBrandData = CAR_DATABASE.find(c => c.brand === selection.brand);
  const selectedSeriesData = selectedBrandData?.series.find(s => s.name === selection.series);
  const selectedModelData = selectedSeriesData?.models.find(m => m.name === selection.model);

  return (
    <div className="glass-card rounded-[2.5rem] p-8 border border-black/10 dark:border-white/10 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
      {/* Design elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

      {scanning && (
        <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 animate-in fade-in">
          <div className="relative w-48 h-32 border-2 border-primary-500/50 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-primary-500/5 flex items-center justify-center">
              <Hash
                size={48}
                className="text-primary-500/20 animate-pulse"
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-500 shadow-xl animate-scanline"></div>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 animate-pulse mb-1">
              TARAMA YAPILIYOR: %{ocrProgress}
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              Görüntü İşleniyor...
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary-500/20 p-2.5 rounded-2xl">
            <Car size={24} className="text-primary-500" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">
              ARACINIZI TANIMLAYIN
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Doğru parça ve usta için %100 uyum
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-black/5 dark:border-white/5 mb-6">
          <button
            onClick={() => setSearchMode("manual")}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              searchMode === "manual"
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg"
                : "text-slate-500"
            }`}
          >
            Manuel Seçim
          </button>
          <button
            onClick={() => setSearchMode("vin")}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              searchMode === "vin"
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg"
                : "text-slate-500"
            }`}
          >
            Şase No (VIN)
          </button>
        </div>

        {searchMode === "vin" ? (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="relative">
              <Hash
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                type="text"
                maxLength={17}
                placeholder="17 haneli Şase No giriniz..."
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl p-5 pl-12 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-600"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-primary-500/10 hover:bg-primary-500/20 rounded-xl transition-all"
                title="Kamera ile Tara"
              >
                <Camera size={18} className="text-primary-500" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCapture}
              />
            </div>

            <div className="bg-primary-500/5 border border-primary-500/20 p-4 rounded-2xl flex items-start gap-3">
              <ShieldCheck
                size={20}
                className="text-primary-500 shrink-0"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                <span className="text-slate-900 dark:text-white font-black uppercase">
                  Rapidsy Uyarı:
                </span>{" "}
                Şase numarası, aracınızın tam parça katalog kodlarını (TecDoc
                uyumlu) çözmemizi sağlar. Yanlış parça riskini sıfıra indirir.
              </p>
            </div>

            <button
              onClick={handleVinSearch}
              disabled={vin.length < 17 || loading}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-30 text-slate-900 dark:text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active-scale shadow-lg shadow-primary-900/40 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "ARACI ÇÖZÜMLE"
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Steps Navigation / Breadcrumbs */}
            {step !== "brand" && (
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 mb-2 animate-in fade-in">
                <button
                  onClick={() => {
                    if (step === "series") setStep("brand");
                    else if (step === "model") setStep("series");
                    else if (step === "trim") setStep("model");
                    else if (step === "final") setStep("trim");
                  }}
                  className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Geri</span>
                </button>
                <div className="text-right">
                  <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest">
                    {selection.brand}
                    {selection.series && ` > ${selection.series}`}
                    {selection.model && ` > ${selection.model}`}
                  </span>
                </div>
              </div>
            )}

            {/* STEP 1: BRAND SELECTION */}
            {step === "brand" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="Marka Ara... (Örn: Fiat, BMW)"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl p-4 pl-11 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                  {CAR_DATABASE.filter(c =>
                    c.brand.toLowerCase().includes(brandSearch.toLowerCase())
                  ).map((car, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelection({ ...selection, brand: car.brand, series: "", model: "", trim: "" });
                        setStep("series");
                      }}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-black/5 dark:border-white/5 hover:border-primary-500/50 hover:bg-white dark:bg-slate-900/50 transition-all text-center flex flex-col items-center justify-center gap-1.5 active-scale group"
                    >
                      <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 group-hover:bg-primary-500/10 flex items-center justify-center font-black text-xs text-slate-500 dark:text-slate-400 group-hover:text-primary-400 transition-colors uppercase">
                        {car.brand.substring(0, 2)}
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors tracking-tight truncate w-full">
                        {car.brand}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: SERIES SELECTION */}
            {step === "series" && selectedBrandData && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="Seri Ara... (Örn: Egea, 3 Serisi)"
                    value={seriesSearch}
                    onChange={(e) => setSeriesSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl p-4 pl-11 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                  {selectedBrandData.series.filter(s =>
                    s.name.toLowerCase().includes(seriesSearch.toLowerCase())
                  ).map((ser, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelection({ ...selection, series: ser.name, model: "", trim: "" });
                        setStep("model");
                      }}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-black/5 dark:border-white/5 hover:border-primary-500/50 hover:bg-white dark:bg-slate-900/50 transition-all text-left flex items-center justify-between group active-scale"
                    >
                      <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors">
                        {ser.name}
                      </span>
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-primary-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: MODEL (ENGINE) SELECTION */}
            {step === "model" && selectedSeriesData && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 ml-1">Motor / Model Seçiniz</p>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                  {selectedSeriesData.models.map((mod, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelection({ ...selection, model: mod.name, fuel: mod.fuel, trim: "" });
                        setStep("trim");
                      }}
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-black/5 dark:border-white/5 hover:border-primary-500/50 hover:bg-white dark:bg-slate-900/50 transition-all flex items-center justify-between group text-left active-scale"
                    >
                      <div>
                        <p className="text-xs font-black uppercase text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors">
                          {mod.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase border ${getFuelBadgeColor(mod.fuel)}`}>
                          {mod.fuel}
                        </span>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: TRIM (PACKAGE) SELECTION */}
            {step === "trim" && selectedModelData && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 ml-1">Donanım Paketi Seçiniz</p>
                <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                  {selectedModelData.trims.map((trm, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelection({ ...selection, trim: trm });
                        setStep("final");
                      }}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-black/5 dark:border-white/5 hover:border-primary-500/50 hover:bg-white dark:bg-slate-900/50 transition-all text-left flex items-center justify-between group active-scale"
                    >
                      <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors truncate">
                        {trm}
                      </span>
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-primary-500 transition-colors shrink-0" />
                    </button>
                  ))}
                  {/* Option for custom/other trim */}
                  <button
                    onClick={() => {
                      setSelection({ ...selection, trim: "Standart" });
                      setStep("final");
                    }}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-dashed border-black/10 dark:border-white/10 hover:border-primary-500/50 hover:bg-white dark:bg-slate-900/50 transition-all text-left flex items-center justify-between group active-scale"
                  >
                    <span className="text-xs font-bold uppercase text-slate-500 group-hover:text-slate-900 dark:text-white transition-colors">
                      Standart / Diğer
                    </span>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-primary-500 transition-colors" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: FINAL DETAILS (YEAR & KM) */}
            {step === "final" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                {/* Summary Card */}
                <div className="bg-primary-500/5 border border-primary-500/20 p-5 rounded-3xl relative overflow-hidden flex items-start gap-4">
                  <div className="bg-primary-500/10 p-3 rounded-2xl text-primary-400 shrink-0">
                    <Car size={22} />
                  </div>
                  <div className="space-y-1 w-full">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-500">Seçilen Araç Karakteri</p>
                    <h4 className="text-base font-black uppercase text-slate-900 dark:text-white tracking-tight leading-snug">
                      {selection.brand} {selection.series}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      {selection.model} • <span className="text-primary-400">{selection.trim}</span>
                    </p>
                    <div className="flex gap-2 pt-1.5">
                      <span className="bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-black/5 dark:border-white/5">
                        {selection.fuel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-1.5 block">
                      ÜRETİM YILI
                    </label>
                    <div className="relative">
                      <CalendarDays size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="number"
                        placeholder="Örn: 2020"
                        min="1950"
                        max={new Date().getFullYear() + 1}
                        value={selection.year}
                        onChange={(e) => setSelection({ ...selection, year: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl p-4.5 pl-11 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-1.5 block">
                      MEVCUT KİLOMETRE
                    </label>
                    <div className="relative">
                      <Gauge size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="number"
                        placeholder="Örn: 95000"
                        value={selection.km}
                        onChange={(e) => setSelection({ ...selection, km: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl p-4.5 pl-11 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* License Plate Field */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-1.5 block">
                    ARAÇ PLAKASI
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-blue-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-sm select-none">
                      TR
                    </div>
                    <input
                      type="text"
                      placeholder="Örn: 34ABC123"
                      value={selection.plate}
                      onChange={(e) => setSelection({ ...selection, plate: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl p-4.5 pl-14 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <button
                  onClick={handleManualSubmit}
                  disabled={!selection.year || !selection.km || !selection.plate}
                  className="w-full bg-white text-slate-950 hover:bg-slate-100 disabled:opacity-30 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active-scale shadow-xl flex items-center justify-center gap-3"
                >
                  GARAJA EKLE
                  <Check size={18} />
                </button>
              </div>
             )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4 text-slate-600">
          <button className="flex items-center gap-1.5 hover:text-slate-900 dark:text-white transition-colors">
            <HelpCircle size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
              Şase No Nerede Yazar?
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleSearch;
