import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGarage } from "../../context/GarageContext";
import DigitalPassport from "./DigitalPassport";

const VehicleProSettings = ({ isOpen, onClose, vehicle }) => {
  const { 
    updateVehicleDates, 
    expenses, 
    documents, 
    addExpense, 
    addDocument,
    getMaintenanceStatus 
  } = useGarage();

  const [formData, setFormData] = useState({
    inspectionDate: "",
    insuranceExpiry: "",
    lastMileage: 0,
    reminderEnabled: true,
    chassisNumber: "",
    insurancePolicyNo: "",
    lastTireChange: "",
    lastBatteryChange: "",
    lastOilChange: "",
    healthScore: 100,
  });

  const [activeTab, setActiveTab] = useState("settings"); // 'settings', 'expenses', 'documents', 'passport'
  const [isSaving, setIsSaving] = useState(false);

  // Add forms state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseData, setExpenseData] = useState({
    expense_type: "fuel",
    amount: "",
    mileage: "",
    notes: "",
  });

  const [showDocForm, setShowDocForm] = useState(false);
  const [docData, setDocData] = useState({
    name: "",
    document_type: "registration",
    file_url: "",
    expiry_date: "",
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        inspectionDate: vehicle.inspection_expiry_date || vehicle.inspection_date || "",
        insuranceExpiry: vehicle.insurance_expiry_date || vehicle.insurance_expiry || "",
        lastMileage: vehicle.km || 0,
        reminderEnabled: vehicle.reminder_enabled !== false,
        chassisNumber: vehicle.chassis_number || "",
        insurancePolicyNo: vehicle.insurance_policy_no || "",
        lastTireChange: vehicle.last_tire_change || "",
        lastBatteryChange: vehicle.last_battery_change || "",
        lastOilChange: vehicle.last_oil_change || "",
        healthScore: vehicle.health_score || 100,
      });
    }
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  // Dynamic Health Score Calculator
  const getDynamicHealthScore = () => {
    let score = formData.healthScore;
    const today = new Date();
    
    if (formData.inspectionDate && new Date(formData.inspectionDate) < today) {
      score -= 15;
    }
    if (formData.insuranceExpiry && new Date(formData.insuranceExpiry) < today) {
      score -= 15;
    }
    
    // Check component lives from dynamic helper
    const maintenanceStatus = getMaintenanceStatus(vehicle);
    if (maintenanceStatus) {
      maintenanceStatus.forEach(status => {
        if (status.value < 20) score -= 10;
      });
    }
    
    return Math.max(25, score);
  };

  const dynamicScore = getDynamicHealthScore();

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateVehicleDates(vehicle.id, {
      ...formData,
      healthScore: dynamicScore
    });
    setIsSaving(false);
    if (result.success) {
      onClose();
    }
  };

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseData.amount) return;
    const res = await addExpense({
      expense_type: expenseData.expense_type,
      amount: parseFloat(expenseData.amount),
      mileage: expenseData.mileage ? parseInt(expenseData.mileage) : null,
      notes: expenseData.notes,
      date: new Date().toISOString(),
    });
    if (res.data) {
      setExpenseData({ expense_type: "fuel", amount: "", mileage: "", notes: "" });
      setShowExpenseForm(false);
    }
  };

  const handleAddDocSubmit = async (e) => {
    e.preventDefault();
    if (!docData.name) return;
    const res = await addDocument({
      name: docData.name,
      document_type: docData.document_type,
      file_url: docData.file_url || "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500", // simulated preview doc
      expiry_date: docData.expiry_date ? new Date(docData.expiry_date).toISOString() : null,
    });
    if (res.data) {
      setDocData({ name: "", document_type: "registration", file_url: "", expiry_date: "" });
      setShowDocForm(false);
    }
  };

  const getExpenseIcon = (type) => {
    switch (type) {
      case "fuel": return <Icons.Fuel className="text-amber-500" />;
      case "service": return <Icons.Wrench className="text-primary-500" />;
      case "tax": return <Icons.FileText className="text-red-500" />;
      case "insurance": return <Icons.Shield className="text-emerald-500" />;
      case "cleaning": return <Icons.Sparkles className="text-cyan-500" />;
      default: return <Icons.CreditCard className="text-slate-400" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="glass-card w-full max-w-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-white uppercase">
                {vehicle.brand} {vehicle.model}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  GELİŞMİŞ SAĞLIK & PRO YÖNETİM
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-700"></span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${dynamicScore > 75 ? 'text-emerald-400' : dynamicScore > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                  SAĞLIK SKORU: %{dynamicScore}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <Icons.X size={24} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 p-1 bg-slate-900/50 rounded-2xl border border-white/5 mb-6 relative z-10 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-primary-600 text-white' : 'text-slate-500'}`}
            >
              <Icons.Settings size={14} className="inline mr-1" /> Sağlık ve Pro Ayarlar
            </button>
            <button 
              onClick={() => setActiveTab("expenses")}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'expenses' ? 'bg-primary-600 text-white' : 'text-slate-500'}`}
            >
              <Icons.CreditCard size={14} className="inline mr-1" /> Masraflarım
            </button>
            <button 
              onClick={() => setActiveTab("documents")}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'documents' ? 'bg-primary-600 text-white' : 'text-slate-500'}`}
            >
              <Icons.FolderClosed size={14} className="inline mr-1" /> Belge Kasası
            </button>
            <button 
              onClick={() => setActiveTab("passport")}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'passport' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
            >
              <Icons.ShieldCheck size={14} className="inline mr-1" /> Servis Karnesi
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Health Overview Gauge */}
                <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-950 rounded-3xl border border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-white uppercase tracking-tight">Dinamik Araç Sağlık Analizi</p>
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
                    <span className="absolute text-xs font-black text-white">%{dynamicScore}</span>
                  </div>
                </div>

                {/* Extended Settings Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Icons.Fingerprint size={12} /> Şasi Numarası
                    </label>
                    <input
                      type="text"
                      placeholder="TR-..."
                      value={formData.chassisNumber}
                      onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Icons.Shield size={12} /> Sigorta Poliçe No
                    </label>
                    <input
                      type="text"
                      placeholder="POL-12345..."
                      value={formData.insurancePolicyNo}
                      onChange={(e) => setFormData({ ...formData, insurancePolicyNo: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Icons.CalendarCheck size={12} /> TÜVTÜRK Muayene Vadesi
                    </label>
                    <input
                      type="date"
                      value={formData.inspectionDate}
                      onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all color-scheme-dark"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Icons.ShieldAlert size={12} /> Trafik Sigortası Vadesi
                    </label>
                    <input
                      type="date"
                      value={formData.insuranceExpiry}
                      onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all color-scheme-dark"
                    />
                  </div>
                </div>

                {/* Specific Component Changes */}
                <div className="p-6 bg-slate-900/40 rounded-3xl border border-white/5 space-y-4">
                  <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">PRO PARÇA DEĞİŞİM GÜNCELİ</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Son Lastik Değişimi</label>
                      <input 
                        type="date" 
                        value={formData.lastTireChange}
                        onChange={(e) => setFormData({ ...formData, lastTireChange: e.target.value })}
                        className="w-full bg-slate-950/60 border border-white/5 rounded-xl p-2 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary-500 color-scheme-dark"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Son Akü Değişimi</label>
                      <input 
                        type="date" 
                        value={formData.lastBatteryChange}
                        onChange={(e) => setFormData({ ...formData, lastBatteryChange: e.target.value })}
                        className="w-full bg-slate-950/60 border border-white/5 rounded-xl p-2 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary-500 color-scheme-dark"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Son Yağ Değişimi</label>
                      <input 
                        type="date" 
                        value={formData.lastOilChange}
                        onChange={(e) => setFormData({ ...formData, lastOilChange: e.target.value })}
                        className="w-full bg-slate-950/60 border border-white/5 rounded-xl p-2 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary-500 color-scheme-dark"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Icons.Gauge size={12} /> Güncel Kilometre
                    </label>
                    <input
                      type="number"
                      value={formData.lastMileage}
                      onChange={(e) => setFormData({ ...formData, lastMileage: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>

                  {/* Reminder Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 mt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-500/10 rounded-xl">
                        <Icons.Bell size={16} className="text-primary-500" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-tight">Akıllı Hatırlatıcılar</p>
                        <p className="text-[9px] text-slate-500 font-bold">Yaklaşan gün ve KM'lerde SMS/Push al.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFormData({ ...formData, reminderEnabled: !formData.reminderEnabled })}
                      className={`w-12 h-6 rounded-full transition-all relative ${formData.reminderEnabled ? 'bg-primary-600' : 'bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.reminderEnabled ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active-scale shadow-xl shadow-primary-900/20"
                >
                  {isSaving ? "Kaydediliyor..." : "AYARLARI KAYDET"}
                </button>
              </div>
            )}

            {activeTab === "expenses" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Araç Gider Takibi</h4>
                    <p className="text-[10px] text-slate-500 font-bold">Toplam harcama ve maliyet analizleri.</p>
                  </div>
                  <button 
                    onClick={() => setShowExpenseForm(!showExpenseForm)}
                    className="py-2.5 px-4 bg-primary-600 hover:bg-primary-500 rounded-xl text-white font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <Icons.Plus size={12} /> {showExpenseForm ? "VAZGEÇ" : "YENİ MASRAF EKLE"}
                  </button>
                </div>

                {/* Expense Quick Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">TOPLAM MASRAF</p>
                    <p className="text-xl font-black text-white mt-1">
                      ₺{expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">KAYIT SAYISI</p>
                    <p className="text-xl font-black text-white mt-1">{expenses.length}</p>
                  </div>
                </div>

                {showExpenseForm && (
                  <form onSubmit={handleAddExpenseSubmit} className="p-6 bg-slate-900/60 rounded-3xl border border-white/10 space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Masraf Tipi</label>
                        <select 
                          value={expenseData.expense_type}
                          onChange={(e) => setExpenseData({ ...expenseData, expense_type: e.target.value })}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none"
                        >
                          <option value="fuel">Akaryakıt</option>
                          <option value="service">Periyodik Bakım/Onarım</option>
                          <option value="tax">Vergi / Harç</option>
                          <option value="insurance">Kasko / Sigorta</option>
                          <option value="fine">Trafik Cezası</option>
                          <option value="cleaning">Temizlik / Yıkama</option>
                          <option value="other">Diğer Giderler</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Tutar (TL)</label>
                        <input 
                          type="number" 
                          required
                          placeholder="0.00"
                          value={expenseData.amount}
                          onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">İşlem Kilometresi (Opsiyonel)</label>
                        <input 
                          type="number" 
                          placeholder="Km bilgisi"
                          value={expenseData.mileage}
                          onChange={(e) => setExpenseData({ ...expenseData, mileage: e.target.value })}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Not / Detay</label>
                        <input 
                          type="text" 
                          placeholder="Örn: Opet kurşunsuz yakıt aldım"
                          value={expenseData.notes}
                          onChange={(e) => setExpenseData({ ...expenseData, notes: e.target.value })}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      KAYDET
                    </button>
                  </form>
                )}

                {/* Expense List */}
                <div className="space-y-3">
                  {expenses.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/20 rounded-2xl border border-dashed border-white/5">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Kayıtlı masraf bulunmamaktadır.</p>
                    </div>
                  ) : (
                    expenses.map((expense) => (
                      <div key={expense.id} className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                            {getExpenseIcon(expense.expense_type)}
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-white uppercase tracking-tight">
                              {expense.expense_type === 'fuel' ? 'Akaryakıt' : 
                               expense.expense_type === 'service' ? 'Bakım/Onarım' : 
                               expense.expense_type === 'tax' ? 'Vergi' : 
                               expense.expense_type === 'insurance' ? 'Sigorta' : 
                               expense.expense_type === 'fine' ? 'Ceza' : 
                               expense.expense_type === 'cleaning' ? 'Yıkama' : 'Diğer'}
                            </h5>
                            <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">
                              {new Date(expense.date).toLocaleDateString('tr-TR')} {expense.mileage && `• ${expense.mileage} KM`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-white">₺{parseFloat(expense.amount).toLocaleString('tr-TR')}</p>
                          {expense.notes && <p className="text-[8px] font-medium text-slate-400 max-w-[150px] truncate mt-0.5">{expense.notes}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Belge Kasası</h4>
                    <p className="text-[10px] text-slate-500 font-bold">Ruhsat, poliçe ve faturalarınızı şifreli saklayın.</p>
                  </div>
                  <button 
                    onClick={() => setShowDocForm(!showDocForm)}
                    className="py-2.5 px-4 bg-primary-600 hover:bg-primary-500 rounded-xl text-white font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <Icons.Plus size={12} /> {showDocForm ? "VAZGEÇ" : "YENİ BELGE EKLE"}
                  </button>
                </div>

                {showDocForm && (
                  <form onSubmit={handleAddDocSubmit} className="p-6 bg-slate-900/60 rounded-3xl border border-white/10 space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Belge Adı</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Örn: Trafik Sigorta Poliçesi"
                          value={docData.name}
                          onChange={(e) => setDocData({ ...docData, name: e.target.value })}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Belge Tipi</label>
                        <select 
                          value={docData.document_type}
                          onChange={(e) => setDocData({ ...docData, document_type: e.target.value })}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none"
                        >
                          <option value="registration">Ruhsat</option>
                          <option value="insurance">Sigorta Poliçesi</option>
                          <option value="inspection">Muayene Belgesi</option>
                          <option value="invoice">Fatura</option>
                          <option value="technician_report">Ekspertiz/Servis Raporu</option>
                          <option value="other">Diğer Belgeler</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Vade Bitiş Tarihi (Opsiyonel)</label>
                        <input 
                          type="date" 
                          value={docData.expiry_date}
                          onChange={(e) => setDocData({ ...docData, expiry_date: e.target.value })}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none color-scheme-dark"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Belge Dosya Yolu / Simüle Link</label>
                        <input 
                          type="text" 
                          placeholder="Simüle yükleme linki (Boş kalabilir)"
                          value={docData.file_url}
                          onChange={(e) => setDocData({ ...docData, file_url: e.target.value })}
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      KAYDET
                    </button>
                  </form>
                )}

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-slate-900/20 rounded-2xl border border-dashed border-white/5">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Kayıtlı doküman bulunmamaktadır.</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/5 rounded-full blur-2xl"></div>
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="p-2 bg-white/5 rounded-xl border border-white/5 text-primary-400">
                              <Icons.FileText size={16} />
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-400 px-2 py-1 rounded-md">
                              {doc.document_type === 'registration' ? 'Ruhsat' : 
                               doc.document_type === 'insurance' ? 'Sigorta' : 
                               doc.document_type === 'inspection' ? 'Muayene' : 
                               doc.document_type === 'invoice' ? 'Fatura' : 'Belge'}
                            </span>
                          </div>
                          <h5 className="text-xs font-black text-white uppercase tracking-tight line-clamp-1">{doc.name}</h5>
                          {doc.expiry_date && (
                            <p className="text-[8px] font-bold text-orange-400 uppercase mt-1">
                              VADE: {new Date(doc.expiry_date).toLocaleDateString('tr-TR')}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[8px] font-bold text-slate-600 uppercase">
                            {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                          </span>
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] font-black text-primary-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1"
                          >
                            BELGEYİ GÖR <Icons.ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "passport" && (
              <DigitalPassport vehicle={vehicle} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VehicleProSettings;
