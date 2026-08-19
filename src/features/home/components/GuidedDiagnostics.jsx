import React, { useState, useEffect, useRef } from "react";
import { Activity, BrainCircuit, ChevronRight, Droplet, Loader2, Radio, ShieldAlert, Volume2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "../../../utils/haptics";
import { useUI } from "../../../context/UIContext";

const GuidedDiagnostics = ({ show, onClose, vehicle, onRequestCreated, onOpenObdDictionary }) => {
  const { t } = useUI();
  const [step, setStep] = useState(1); // 1: Select Symptom, 2: Microphone Telemetry, 3: AI Diagnostic Report
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [recordingTime, setRecordingTime] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [telemetrySignal, setTelemetrySignal] = useState([]);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Symptoms list for guided decision selector
  const symptoms = [
    {
      id: "engine_knock",
      label: t.engineKnock,
      icon: Volume2,
      desc: t.engineKnockDesc,
      danger: t.high,
      possibleFault: t.engineKnockFault,
      estimatedCostRange: "₺8,000 - ₺22,000",
      repairTime: t.engineKnockTime,
      recommendation: t.engineKnockRec
    },
    {
      id: "vibration",
      label: t.vibration,
      icon: Activity,
      desc: t.vibrationDesc,
      danger: t.medium,
      possibleFault: t.vibrationFault,
      estimatedCostRange: "₺2,500 - ₺5,500",
      repairTime: t.vibrationTime,
      recommendation: t.vibrationRec
    },
    {
      id: "oil_leak",
      label: t.oilLeak,
      icon: Droplet,
      desc: t.oilLeakDesc,
      danger: t.high,
      possibleFault: t.oilLeakFault,
      estimatedCostRange: "₺3,000 - ₺7,500",
      repairTime: t.oilLeakTime,
      recommendation: t.oilLeakRec
    },
    {
      id: "brake_squeal",
      label: t.brakeSqueal,
      icon: ShieldAlert,
      desc: t.brakeSquealDesc,
      danger: t.medium,
      possibleFault: t.brakeSquealFault,
      estimatedCostRange: "₺1,800 - ₺3,600",
      repairTime: t.brakeSquealTime,
      recommendation: t.brakeSquealRec
    }
  ];

  // Visualizer Animation for mic simulation
  useEffect(() => {
    if (!isRecording || step !== 2) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillRect(0, 0, width, height);

      const bars = 45;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        // High fidelity audio simulation - randomized height
        const barHeight = Math.random() * height * 0.85;

        // Gradient telemetry style
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "rgba(249, 115, 22, 0.2)"); // Orange/Amber hazard
        gradient.addColorStop(0.5, "rgba(249, 115, 22, 0.8)");
        gradient.addColorStop(1, "rgba(239, 68, 68, 1)"); // Red peak

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, (height - barHeight) / 2, barWidth - 3, barHeight);
      }
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording, step]);

  // Audio recording countdown simulation
  useEffect(() => {
    let timer;
    if (isRecording && recordingTime > 0) {
      timer = setTimeout(() => {
        setRecordingTime((prev) => prev - 1);
        // Telemetry signals output
        const signals = [
          `${t.freqAmp}: ${(2000 + Math.random() * 4500).toFixed(0)} Hz`,
          `${t.resonance}: %${(65 + Math.random() * 30).toFixed(1)}`,
          `${t.noiseRatio}: ${(3.2 + Math.random() * 8.4).toFixed(2)} dB`,
          `${t.harmonicDev}: DETECTED`
        ];
        setTelemetrySignal(signals);
        triggerHaptic("impact");
      }, 1000);
    } else if (isRecording && recordingTime === 0) {
      setIsRecording(false);
      setIsCompiling(true);
      triggerHaptic("success");
      
      // Simulate AI Report compilation
      setTimeout(() => {
        setIsCompiling(false);
        setStep(3);
        triggerHaptic("success");
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isRecording, recordingTime, t]);

  if (!show) return null;

  const handleSelectSymptom = (symptom) => {
    triggerHaptic("selection");
    setSelectedSymptom(symptom);
    setStep(2);
    setIsRecording(true);
    setRecordingTime(5);
  };

  const handleCreateServiceRequest = () => {
    triggerHaptic("success");
    if (onRequestCreated) {
      onRequestCreated({
        symptom: selectedSymptom,
        vehicle: vehicle
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Telemetry background pulse */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white flex items-center justify-center border border-black/5 dark:border-white/5 active-scale transition-all"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BrainCircuit size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Rapidsy Teşhis Asistanı
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-teal-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  AI Real-Time
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase mt-1">
                Akıllı Rehberli Teşhis & Servis Talebi
              </h2>
            </div>
          </div>
        </div>

        {/* Dynamic Wizard Steps */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Symptom Selector */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    Aracınızda gözlemlediğiniz ana arıza belirtisini seçin veya OBD-II kod sözlüğünde arama yapın.
                  </p>
                  {onOpenObdDictionary && (
                    <button
                      type="button"
                      onClick={onOpenObdDictionary}
                      className="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 text-[11px] font-black uppercase tracking-wider shrink-0 active-scale transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <BrainCircuit size={14} /> OBD-II SÖZLÜĞÜ
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {symptoms.map((symptom) => {
                    const SymptomIcon = symptom.icon;
                    return (
                      <button
                        key={symptom.id}
                        onClick={() => handleSelectSymptom(symptom)}
                        className="p-4 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 hover:border-amber-500/30 transition-all flex items-center justify-between gap-4 text-left active-scale group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 group-hover:text-amber-400 transition-colors">
                            <SymptomIcon size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{symptom.label}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{symptom.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            symptom.danger === t.high ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          }`}>
                            {symptom.danger} Risk
                          </span>
                          <ChevronRight size={16} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Live Microphone Waveform Sweeps */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center justify-center space-y-6 py-6"
              >
                {isRecording && (
                  <>
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest animate-pulse">
                        <Radio size={12} className="animate-spin" /> CANLI DİNLEME AKTİF
                      </div>
                      <h3 className="text-3xl font-mono font-black text-slate-900 dark:text-white mt-4">
                        00:0{recordingTime}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                        Telefonunuzu motor/tekerlek kısmına yakınlaştırın veya sesi yakalayın...
                      </p>
                    </div>

                    {/* Canvas Waveform */}
                    <div className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner">
                      <canvas
                        ref={canvasRef}
                        width={450}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 pointer-events-none" />
                    </div>

                    {/* Live Telemetry Output lines */}
                    <div className="w-full bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-black/5 dark:border-white/5 space-y-1.5 font-mono text-[9px] text-slate-500 dark:text-slate-400">
                      <p className="text-amber-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span> AI GERÇEK ZAMANLI TELEMETRİ:
                      </p>
                      {telemetrySignal.length > 0 ? (
                        telemetrySignal.map((sig, idx) => (
                          <div key={idx} className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                            <span>{sig.split(":")[0]}</span>
                            <span className="text-slate-900 dark:text-white font-black">{sig.split(":")[1]}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-600 italic">{t.waitingAudioStream}</p>
                      )}
                    </div>
                  </>
                )}

                {isCompiling && (
                  <div className="text-center space-y-4 py-8">
                    <Loader2 className="animate-spin text-amber-500 mx-auto" size={44} />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.aiDiagReportCompiling}</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Sinyal harmonik rezonans analizi tamamlandı. Tahribat derinlik ve parça masraf veritabanı sorgulanıyor...
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Premium AI Diagnostics Report */}
            {step === 3 && selectedSymptom && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Diagnostic Alert Card */}
                <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 self-start">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Olası Kronik Arıza
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-1.5 tracking-tight">
                      {selectedSymptom.possibleFault}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                      {selectedSymptom.recommendation}
                    </p>
                  </div>
                </div>

                {/* Technical Stats Details Table */}
                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-black/5 dark:border-white/5 overflow-hidden">
                  <div className="px-4 py-3 bg-white dark:bg-white/5 shadow-sm border-b border-black/5 dark:border-white/5 flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.techAnalysisReport}</span>
                    <span className="text-[9px] font-black text-teal-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> MİSAFİR GÜVENLİĞİ: ONAYLI
                    </span>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">{t.preDiagDamageType}</span>
                      <span className="text-slate-900 dark:text-white font-black uppercase tracking-tight">{selectedSymptom.label}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">{t.riskLevel}</span>
                      <span className={`font-black uppercase tracking-tight px-2 py-0.5 rounded ${
                        selectedSymptom.danger === t.high ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
                      }`}>{selectedSymptom.danger} {t.risk}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">{t.estimatedServiceTime}</span>
                      <span className="text-slate-900 dark:text-white font-black">{selectedSymptom.repairTime}</span>
                    </div>
                    
                    {/* Cost Breakdown Visual */}
                    <div className="border-t border-black/5 dark:border-white/5 pt-3 mt-2 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{t.estTotalCost}</span>
                        <span className="text-2xl font-black text-teal-400 tracking-tighter mt-1 block">
                          {selectedSymptom.estimatedCostRange}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-500 font-bold block">{t.laborAndPartsIncVAT}</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold block mt-1">{t.rapidsyMarketplaceGuaranteed}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => setStep(1)}
                    className="p-4 bg-white dark:bg-white/5 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active-scale"
                  >
                    YENİDEN TEST ET
                  </button>
                  <button 
                    onClick={handleCreateServiceRequest}
                    className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-orange-950/20 flex items-center justify-center gap-2 active-scale"
                  >
                    USTALARDAN TEKLİF AL <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GuidedDiagnostics;
