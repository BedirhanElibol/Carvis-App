import React, { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { cn } from "../../lib/utils";
import { useAI } from "../../context/AIContext";
import { useGarage } from "../../context/GarageContext";
import { AI_SUGGESTIONS } from "../../constants/mockData";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/Core";
import AudioAnalyzer from "./AudioAnalyzer";
import InteractiveCarMap from "./components/InteractiveCarMap";
 
import { motion, AnimatePresence } from "framer-motion";

// Özel Analiz Kartı Bileşeni - Premium Holographic Design
const DamageAnalysisCard = ({ data, vehicleInfo }) => {
  return (
    <div className="relative group overflow-hidden">
      {/* Holographic Border Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-primary-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
      <div className="relative glass-card border border-white/10 bg-slate-900/90 p-8 rounded-[2.5rem] space-y-6 shadow-2xl backdrop-blur-3xl">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-red-500 to-primary-600 p-3 rounded-2xl shadow-lg shadow-red-900/40">
              <Icons.Wrench size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white uppercase text-xs tracking-widest font-sans">
                DIAGNOSTIC RAPORU
              </h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 font-sans">
                {vehicleInfo?.make} {vehicleInfo?.model} • ID: #
                {Math.floor(Math.random() * 9000) + 1000}
              </p>
            </div>
          </div>
          <Badge
            type={data.severity === "Yüksek" ? "error" : "warning"}
            className="text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 shadow-lg shadow-red-900/20 font-sans"
          >
            {data.severity} RİSK
          </Badge>
        </div>

        {/* Visual Fault Map Integration */}
        <div className="bg-slate-950/60 rounded-[2rem] p-6 border border-white/5 relative">
          <p className="absolute top-6 left-6 text-[8px] font-black text-slate-600 uppercase tracking-widest z-10 font-sans">
            Görsel Parça Analizi
          </p>
          <InteractiveCarMap
            activeZones={data.faultZones || ["engine"]}
            onZoneClick={() => {}}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5 group-hover:border-primary-500/30 transition-colors">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2 font-sans">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>{" "}
              Tespit Edilen Arıza
            </p>
            <h4 className="text-xl font-bold text-white tracking-tighter uppercase font-sans">
              {data.damageType}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-5 rounded-2xl border border-white/5">
              <Icons.Banknote className="text-emerald-500 mb-2" size={16} />
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1 font-sans">
                Tahmini Masraf
              </p>
              <p className="text-2xl font-bold text-emerald-400 tracking-tighter font-sans">
                {data.estimatedCost}{" "}
                <span className="text-xs text-slate-500 uppercase">TL</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-5 rounded-2xl border border-white/5">
              <Icons.Clock className="text-amber-500 mb-2" size={16} />
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1 font-sans">
                Servis Süresi
              </p>
              <p className="text-2xl font-bold text-amber-400 tracking-tighter font-sans">
                ~{data.time || "2-4"} SA
              </p>
            </div>
          </div>

          {/* AI Mechanic Insights */}
          <div className="bg-primary-600/5 p-5 rounded-2xl border border-primary-500/10 flex gap-4 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Icons.ShieldAlert size={60} />
            </div>
            <div className="p-2.5 bg-primary-500/10 rounded-xl shrink-0 border border-primary-500/20">
              <Icons.Lightbulb size={18} className="text-primary-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest mb-1 font-sans">
                AI MEKANİK TAVSİYESİ
              </p>
              <p className="text-xs text-slate-300 leading-relaxed font-bold font-sans">
                "{data.aiComment}"
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active-scale border border-white/10 font-sans">
            <Icons.Package size={14} /> PARÇA BUL
          </button>
          <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-500 hover:to-primary-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active-scale shadow-xl shadow-primary-900/40 border border-white/10 font-sans">
            USTA ÇAĞIR <Icons.ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AIChatScreen = () => {
  const navigate = useNavigate();
  const {
    messages,
    isTyping,
    analysisStatus,
    sendMessage,
    analyzeDamage,
    clearHistory,
  } = useAI();
  const { currentVehicle } = useGarage();
  const [showAudioAnalyzer, setShowAudioAnalyzer] = useState(false);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textOverride = null) => {
    const text = textOverride || inputText;
    if (!text.trim() || isTyping) return;
    setInputText("");
    await sendMessage(text);
  };

  const handleVoiceInput = () => {
    setShowAudioAnalyzer(true);
  };

  const handleImageUpload = () => {
    const sampleImageUrl =
      "https://images.unsplash.com/photo-1623136859341-37d402127278?q=80&w=600&auto=format&fit=crop";
    analyzeDamage(sampleImageUrl);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 relative overflow-hidden animate-fade-in font-sans">
      {/* Background elements */}
      <div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] bg-primary-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-[-5%] w-[400px] h-[400px] bg-accent-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="glass-card px-6 py-7 border-b border-white/5 sticky top-0 z-20 flex justify-between items-center backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 glass-card rounded-2xl text-slate-400 active-scale border border-white/10 hover:bg-white/5 transition-all"
          >
            <Icons.ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 blur-xl rounded-full opacity-40 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-primary-400 to-primary-600 p-3.5 rounded-2xl shadow-2xl border border-white/10 group overflow-hidden">
                <Icons.Sparkles
                  size={22}
                  className="text-white group-hover:rotate-12 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-1000"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white tracking-tighter leading-none uppercase text-xl font-sans">
                  AI MEKANİK
                </h2>
                <Badge
                  type="primary"
                  className="text-[7px] px-2 py-0.5 font-bold uppercase tracking-widest border-primary-500/40 font-sans"
                >
                  V2.0 PRO
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-sans">
                  {currentVehicle
                    ? `${currentVehicle.make} ${currentVehicle.model} BAĞLI`
                    : "ARACINI ANALİZ ET"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAudioAnalyzer(!showAudioAnalyzer)}
            className={cn(
              "p-3 rounded-2xl transition-all border active-scale shadow-xl font-black text-[10px] flex items-center gap-2 font-sans",
              showAudioAnalyzer
                ? "bg-primary-600 text-white border-primary-500 shadow-primary-900/40"
                : "glass-card text-slate-500 border-white/10 hover:text-white",
            )}
            title="Motor Sesi Analizi"
          >
            <Icons.Activity size={18} />
          </button>
          <button
            onClick={clearHistory}
            className="p-3 glass-card rounded-2xl text-slate-500 hover:text-red-500 border border-white/10 transition-all active-scale"
          >
            <Icons.Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Audio Analyzer Overlay */}
      <AnimatePresence>
        {showAudioAnalyzer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 mt-4 overflow-hidden"
          >
            <AudioAnalyzer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Scan Entry Point */}
      <div className="mx-6 mt-6 bg-slate-900/60 border border-white/5 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 z-10 group hover:border-primary-500/30 transition-all shadow-2xl backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center gap-5">
          <div className="bg-primary-500/10 p-4 rounded-2xl text-primary-400 group-hover:scale-110 transition-transform border border-primary-500/20 shadow-inner">
            <Icons.Camera size={26} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mb-1 flex items-center gap-2 font-sans">
              ULTRA-BİLİNÇ <Icons.Eye size={10} />
            </p>
            <h4 className="text-lg font-black text-white tracking-tighter uppercase font-sans">
              HASAR DERİNLİK ANALİZİ
            </h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 font-sans">
              Görsel ile anında maliyet ve parça tespiti
            </p>
          </div>
        </div>
        <button
          onClick={handleImageUpload}
          className="w-full md:w-auto bg-white text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl active-scale hover:bg-primary-500 hover:text-white transition-all font-sans"
        >
          TARAMAYA BAŞLA
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-48 relative z-0 no-scrollbar custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-30 select-none">
            <Icons.Bot size={60} className="text-slate-700 mb-4" />
            <h3 className="text-xl font-black tracking-tighter text-white uppercase mb-2 font-sans">
              Yapay Zeka Mekanik Hazır
            </h3>
            <p className="text-xs text-slate-500 font-bold max-w-xs uppercase tracking-widest leading-loose font-sans">
              Motor sesini dinletebilir, hasarlı bölgenin fotoğrafını
              gönderebilir veya aracınla ilgili teknik sorular sorabilirsin.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-5 duration-500`}
          >
            <div
              className={`max-w-[92%] ${m.type === "analysis" ? "w-full" : ""}`}
            >
              {m.type === "image" ? (
                <div className="relative rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl group">
                  <img
                    src={m.imageUrl}
                    alt="Damage"
                    className="max-w-full h-80 object-cover w-full scale-105 group-hover:scale-110 transition-transform duration-1000"
                  />
                  {isTyping && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-primary-500/20 animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_30px_#fff] animate-scan z-10"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)]"></div>
                    </div>
                  )}
                </div>
              ) : m.type === "analysis" ? (
                <DamageAnalysisCard
                  data={m.data}
                  vehicleInfo={currentVehicle}
                />
              ) : (
                <div
                  className={`p-6 rounded-[2.5rem] text-sm shadow-2xl relative border ${
                    m.sender === "user"
                      ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-none border-primary-500 shadow-primary-900/30"
                      : "glass-card border-white/5 text-slate-100 rounded-tl-none backdrop-blur-3xl"
                  }`}
                >
                  <p className="leading-relaxed font-bold tracking-tight text-base font-sans">
                    {m.text}
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-4 opacity-30">
                    <span className="text-[9px] font-black tracking-[0.25em] uppercase font-sans">
                      {new Date(m.timestamp || Date.now()).toLocaleTimeString(
                        "tr-TR",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in">
            <div className="glass-card border border-white/10 p-6 rounded-[2rem] rounded-tl-none flex items-center gap-5 shadow-2xl backdrop-blur-3xl bg-slate-900/40">
              <div className="flex gap-2">
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 bg-primary-500 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-primary-500 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-primary-500 rounded-full"
                ></motion.div>
              </div>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] font-sans">
                {analysisStatus === "uploading"
                  ? "VERİ AKIŞI BAŞLATILDI..."
                  : analysisStatus === "detecting"
                    ? "BİLEŞENLER TARANIYOR..."
                    : analysisStatus === "analyzing"
                      ? "HASAR DERİNLİĞİ ÖLÇÜLÜYOR..."
                      : analysisStatus === "finalizing"
                        ? "RAPOR DERLENİYOR..."
                        : "SİSTEM ANALİZ EDİYOR..."}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Overlay */}
      <div className="p-6 glass-card border-t border-white/5 absolute bottom-0 w-full backdrop-blur-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.8)] z-20 pb-12">
        {/* Suggestions */}
        <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
          {messages.length < 3 &&
            AI_SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="whitespace-nowrap bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl border border-white/5 hover:border-primary-500/40 hover:text-primary-400 transition-all active-scale shadow-lg hover:bg-slate-900/50 font-sans"
              >
                {s}
              </button>
            ))}
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1 bg-slate-950 border border-white/5 rounded-[2.5rem] flex items-center px-8 py-1.5 hover:border-primary-500/30 transition-all shadow-inner group">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-transparent border-none text-base text-white outline-none py-5 placeholder-slate-800 font-bold font-sans"
              placeholder="Motor sesimden arıza bul..."
            />
            <button
              onClick={handleVoiceInput}
              className="text-slate-600 hover:text-primary-500 transition-all ml-2 p-3.5 rounded-2xl active-scale bg-white/5 group-hover:bg-primary-500/10"
            >
              <Icons.Mic size={22} />
            </button>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className={cn(
              "w-16 h-16 rounded-2xl transition-all shadow-2xl active-scale flex items-center justify-center group font-sans",
              !inputText.trim() || isTyping
                ? "bg-slate-900 text-slate-800"
                : "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-primary-900/50",
            )}
          >
            <Icons.Send
              size={28}
              className={cn(
                "transition-transform group-hover:translate-x-1 group-hover:-translate-y-1",
                !inputText.trim() || isTyping
                  ? ""
                  : "drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]",
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatScreen;
