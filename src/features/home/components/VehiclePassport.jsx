import React, { useState } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VehiclePassport = ({ vehicle, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, timeline, documents, analytics
  const [copied, setCopied] = useState(false);

  if (!vehicle) return null;

  const handleCopyChassis = () => {
    navigator.clipboard.writeText(vehicle.chassis_no || "WBA3A5C5XFK000000");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock data for high fidelity presentation
  const mockServiceHistory = [
    { date: "12.04.2026", type: "Periyodik Bakım", partner: "Ayan Oto Servis", price: "4,250 ₺", mileage: "84,200 km", icon: Icons.Wrench },
    { date: "05.12.2025", type: "Fren Disk & Balata Değişimi", partner: "Güven Fren", price: "2,800 ₺", mileage: "78,900 km", icon: Icons.ShieldAlert },
    { date: "18.08.2025", type: "Akü Değişimi (Varta 72Ah)", partner: "Elektrikçi Hasan", price: "1,950 ₺", mileage: "72,100 km", icon: Icons.Zap },
    { date: "22.04.2025", type: "Mevsimlik Lastik Rotasyonu", partner: "Michelin Bayi", price: "600 ₺", mileage: "67,400 km", icon: Icons.Compass }
  ];

  const mockDocuments = [
    { name: "TÜVTÜRK Muayene Raporu.pdf", date: "15.04.2026", size: "1.2 MB", category: "Muayene" },
    { name: "Kasko Sigorta Poliçesi - Allianz.pdf", date: "10.01.2026", size: "2.4 MB", category: "Sigorta" },
    { name: "Periyodik Bakım Faturası.pdf", date: "12.04.2026", size: "850 KB", category: "Fatura" }
  ];

  const mockAnalytics = {
    oilLife: 74, // %
    brakeLife: 40, // %
    tireWear: 82, // %
    batteryHealth: 92 // %
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Background Pattern */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-indigo-500/10 via-slate-900/0 to-slate-900 pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-slate-900 dark:text-white flex items-center justify-center border border-black/5 dark:border-white/5 active-scale transition-all"
        >
          <Icons.X size={20} />
        </button>

        {/* Header Section */}
        <div className="p-8 pb-4 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Icons.FileText size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Carvis Araç Pasaportu
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Resmi Hafıza
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase mt-2">
                {vehicle.brand} {vehicle.model}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-0.5 rounded text-[10px] border border-slate-300 dark:border-slate-700 font-mono font-black uppercase">
                  {vehicle.plate || "34 CVS 202"}
                </span>
                • Şase: 
                <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">{vehicle.chassis_no || "WBA3A5C5XFK000000"}</span>
                <button 
                  onClick={handleCopyChassis}
                  className="p-1 hover:bg-white dark:bg-white/5 shadow-sm rounded text-indigo-400 hover:text-slate-900 dark:text-white transition-all active-scale"
                  title="Kopyala"
                >
                  {copied ? <Icons.Check size={14} className="text-emerald-400" /> : <Icons.Copy size={14} />}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-8 border-b border-black/5 dark:border-white/5 flex gap-2 overflow-x-auto relative z-10 scrollbar-none">
          {[
            { id: "overview", label: "Genel Durum", icon: Icons.Compass },
            { id: "timeline", label: "Hafıza & Zaman Tüneli", icon: Icons.History },
            { id: "documents", label: "Belge Kasası", icon: Icons.FileLock2 },
            { id: "analytics", label: "AI Teşhis Öngörüsü", icon: Icons.Brain }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 text-xs font-black uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all ${
                  isActive 
                    ? "border-indigo-500 text-slate-900 dark:text-white" 
                    : "border-transparent text-slate-500 hover:text-slate-600 dark:text-slate-300"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10 min-h-[350px]">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Health Overview Ring */}
                <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20 flex flex-col items-center justify-center text-center">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Genel Sağlık Puanı</h4>
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle cx="72" cy="72" r="62" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                      <circle 
                        cx="72" 
                        cy="72" 
                        r="62" 
                        stroke="rgb(99, 102, 241)" 
                        strokeWidth="12" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 62}
                        strokeDashoffset={(2 * Math.PI * 62) * (1 - 0.96)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="text-center z-10">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">%96</span>
                      <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1">Kusursuz</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed mt-6">
                    Mekanik, elektrik ve yasal tüm bakımlarınız Carvis standartlarına uygundur.
                  </p>
                </div>

                {/* Left Side Quick Info */}
                <div className="md:col-span-2 space-y-6">
                  {/* Detailed Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Kilometre", val: `${vehicle.mileage || "84.200"} km`, icon: Icons.Gauge },
                      { label: "Son Bakım", val: "12.04.2026", icon: Icons.Wrench },
                      { label: "Muayene Tarihi", val: "15.06.2027", icon: Icons.CalendarCheck },
                      { label: "Kasko Durumu", val: "Aktif", icon: Icons.ShieldCheck },
                      { label: "Yedek Anahtar", val: "Mevcut", icon: Icons.Key },
                      { label: "Motor Gücü", val: "190 HP", icon: Icons.Workflow }
                    ].map((spec, i) => {
                      const SpecIcon = spec.icon;
                      return (
                        <div key={i} className="p-5 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 flex flex-col justify-between">
                          <SpecIcon className="text-indigo-400 mb-4" size={20} />
                          <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">{spec.label}</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1 block">{spec.val}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Smart Advice Panel */}
                  <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex gap-4">
                    <Icons.Lightbulb className="text-indigo-400 flex-shrink-0" size={24} />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Carvis Dijital Öneri</h4>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                        Aracınızın kasko bitiş tarihi yaklaşmaktadır. Kasko & Trafik Sigortası sekmesinden Carvis özel partner tekliflerini şimdiden %30 indirimle alabilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "timeline" && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">KRONOLOJİK ARŞİV</h4>
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                    <Icons.Lock size={12} /> Blokzincir Tabanlı Korumalı Veritabanı
                  </span>
                </div>

                <div className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-8 py-2">
                  {mockServiceHistory.map((item, index) => {
                    const EventIcon = item.icon;
                    return (
                      <div key={index} className="relative group">
                        {/* Bullet Circle */}
                        <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-all shadow-lg">
                          <EventIcon size={12} />
                        </div>
                        {/* Event Card */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{item.date}</span>
                            <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">{item.type}</h4>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{item.partner} • {item.mileage}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-base font-black text-slate-900 dark:text-white">{item.price}</span>
                            <button className="px-4 py-2 bg-white dark:bg-white/5 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                              Faturayı Gör
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">DİJİTAL BELGELERİM</h4>
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center gap-2">
                    <Icons.Plus size={14} /> Yeni Belge Yükle
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockDocuments.map((doc, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 hover:border-indigo-500/20 transition-all flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                          <Icons.File size={20} />
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{doc.category}</span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5 uppercase tracking-tight">{doc.name}</h4>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{doc.date} • {doc.size}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="w-10 h-10 bg-white dark:bg-white/5 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl flex items-center justify-center transition-all active-scale">
                          <Icons.Download size={16} />
                        </button>
                        <button className="w-10 h-10 bg-white dark:bg-white/5 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl flex items-center justify-center transition-all active-scale">
                          <Icons.Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI TAHMİNSEK PARÇA AŞINMALARI</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Progress Items */}
                  <div className="space-y-5 bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 rounded-3xl p-6">
                    {[
                      { name: "Kalan Motor Yağ Ömrü", val: mockAnalytics.oilLife, color: "bg-indigo-500" },
                      { name: "Kalan Fren Balata Kalınlığı", val: mockAnalytics.brakeLife, color: "bg-orange-500" },
                      { name: "Lastik Diş Aşınma Durumu", val: mockAnalytics.tireWear, color: "bg-emerald-500" },
                      { name: "Akü Sağlık Durumu (SoH)", val: mockAnalytics.batteryHealth, color: "bg-cyan-500" }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                          <span className="text-slate-500 dark:text-slate-400">{item.name}</span>
                          <span className="text-slate-900 dark:text-white">%{item.val}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white dark:bg-white/5 shadow-sm overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Diagnostic warnings */}
                  <div className="space-y-4">
                    <div className="p-6 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex gap-4">
                      <Icons.AlertTriangle className="text-orange-400 flex-shrink-0" size={24} />
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Aşınma Alarmı: Fren Balatası</h4>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                          Fren balatası kalan ömrü %40'a inmiştir. Güvenliğiniz için sonraki 2.500 km içinde yetkili bir Carvis partneri ile fren disk & balata kontrolü randevusu planlamanızı öneririz.
                        </p>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex gap-4">
                      <Icons.Sparkles className="text-emerald-400 flex-shrink-0" size={24} />
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Kusursuz Akü Seviyesi</h4>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                          Akünüzün marş akımı (SoH) %92 düzeyindedir. Kış aylarında herhangi bir sorun çıkarmayacağı AI algoritmalarımızla doğrulanmıştır.
                        </p>
                      </div>
                    </div>
                  </div>
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
