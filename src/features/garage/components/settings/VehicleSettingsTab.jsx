import React from "react";
import { Bell, CalendarCheck, Fingerprint, Gauge, Shield, ShieldAlert } from "lucide-react";

const VehicleSettingsTab = ({ formData, setFormData, dynamicScore, isSaving, handleSave }) => {
  return (
    <div className="space-y-6">
      {/* Health Overview Gauge */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-950 rounded-3xl border border-black/5 dark:border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Dinamik Araç Sağlık Analizi</p>
          <p className="text-[10px] text-slate-500 font-medium">Bakım vadeleri ve muayene durumlarına göre skor güncellenir.</p>
        </div>
        <div className="relative flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r="28" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
            <circle 
              cx="32" 
              cy="32" 
              r="28" 
              className={`${dynamicScore > 75 ? 'stroke-emerald-500' : dynamicScore > 40 ? 'stroke-amber-500' : 'stroke-red-500'} transition-all duration-1000`} 
              strokeWidth="6" 
              fill="transparent"
              strokeDasharray={175.9}
              strokeDashoffset={175.9 - (175.9 * dynamicScore) / 100}
            />
          </svg>
          <span className="absolute text-xs font-black text-slate-900 dark:text-white">%{dynamicScore}</span>
        </div>
      </div>

      {/* Extended Settings Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Fingerprint size={12} /> Şasi Numarası
          </label>
          <input
            type="text"
            placeholder="TR-..."
            value={formData.chassisNumber}
            onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
            className="w-full bg-white dark:bg-slate-900/50 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield size={12} /> Sigorta Poliçe No
          </label>
          <input
            type="text"
            placeholder="POL-12345..."
            value={formData.insurancePolicyNo}
            onChange={(e) => setFormData({ ...formData, insurancePolicyNo: e.target.value })}
            className="w-full bg-white dark:bg-slate-900/50 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
            <CalendarCheck size={12} /> TÜVTÜRK Muayene Vadesi
          </label>
          <input
            type="date"
            value={formData.inspectionDate}
            onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
            className="w-full bg-white dark:bg-slate-900/50 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all color-scheme-dark"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert size={12} /> Trafik Sigortası Vadesi
          </label>
          <input
            type="date"
            value={formData.insuranceExpiry}
            onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
            className="w-full bg-white dark:bg-slate-900/50 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all color-scheme-dark"
          />
        </div>
      </div>

      {/* Specific Component Changes */}
      <div className="p-6 bg-white dark:bg-slate-900/40 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
        <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">PRO PARÇA DEĞİŞİM GÜNCELİ</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Son Lastik Değişimi</label>
            <input 
              type="date" 
              value={formData.lastTireChange}
              onChange={(e) => setFormData({ ...formData, lastTireChange: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-black/5 dark:border-white/5 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500 color-scheme-dark"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Son Akü Değişimi</label>
            <input 
              type="date" 
              value={formData.lastBatteryChange}
              onChange={(e) => setFormData({ ...formData, lastBatteryChange: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-black/5 dark:border-white/5 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500 color-scheme-dark"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Son Yağ Değişimi</label>
            <input 
              type="date" 
              value={formData.lastOilChange}
              onChange={(e) => setFormData({ ...formData, lastOilChange: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-black/5 dark:border-white/5 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500 color-scheme-dark"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Type (Ticari / Hususi) Rule Selector */}
      <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-white uppercase tracking-tight">Ruhsat & Kullanım Tipi (Muayene Kuralı)</p>
            <p className="text-[10px] text-slate-400 font-semibold">TÜVTÜK mevzuatına göre muayene ve bakım periyotlarını belirler.</p>
          </div>
          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${formData.isCommercial ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}`}>
            {formData.isCommercial ? 'TİCARİ ARAÇ (YILLIK)' : 'HUSUSİ OTOMOBİL (2 YILLIK)'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isCommercial: false })}
            className={`p-3.5 rounded-2xl border text-left transition-all ${!formData.isCommercial ? 'bg-cyan-500/10 border-cyan-500/50 text-white' : 'bg-slate-900/60 border-white/5 text-slate-500'}`}
          >
            <p className="text-xs font-black">🚗 Hususi Otomobil</p>
            <p className="text-[9px] text-slate-400 mt-1">Muayene: <strong className="text-cyan-400">2 Yılda Bir</strong></p>
            <p className="text-[9px] text-slate-400">Bakım: <strong className="text-cyan-400">15.000 KM</strong></p>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, isCommercial: true })}
            className={`p-3.5 rounded-2xl border text-left transition-all ${formData.isCommercial ? 'bg-amber-500/10 border-amber-500/50 text-white' : 'bg-slate-900/60 border-white/5 text-slate-500'}`}
          >
            <p className="text-xs font-black">🚚 Ticari Araç / Kamyonet</p>
            <p className="text-[9px] text-slate-400 mt-1">Muayene: <strong className="text-amber-400">Her 1 Yılda Bir</strong></p>
            <p className="text-[9px] text-slate-400">Bakım: <strong className="text-amber-400">10.000 KM</strong></p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-1.5">
            <Gauge size={12} /> Güncel Kilometre
          </label>
          <input
            type="number"
            value={formData.lastMileage}
            onChange={(e) => setFormData({ ...formData, lastMileage: e.target.value })}
            className="w-full bg-white dark:bg-slate-900/50 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>

        {/* Reminder Toggle */}
        <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 mt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-xl">
              <Bell size={16} className="text-primary-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Akıllı Hatırlatıcılar</p>
              <p className="text-[9px] text-slate-500 font-bold">Yaklaşan gün ve KM'lerde SMS/Push al.</p>
            </div>
          </div>
          <button 
            onClick={() => setFormData({ ...formData, reminderEnabled: !formData.reminderEnabled })}
            className={`w-12 h-6 rounded-full transition-all relative ${formData.reminderEnabled ? 'bg-primary-600' : 'bg-slate-100 dark:bg-slate-800'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.reminderEnabled ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-slate-900 dark:text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active-scale shadow-xl shadow-primary-900/20"
      >
        {isSaving ? "Kaydediliyor..." : "AYARLARI KAYDET"}
      </button>
    </div>
  );
};

export default VehicleSettingsTab;
