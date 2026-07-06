import React, { useState, useEffect } from "react";
import { Bell, CalendarCheck, CreditCard, ExternalLink, FileText, Fingerprint, FolderClosed, Fuel, Gauge, Plus, Settings, Shield, ShieldAlert, ShieldCheck, Sparkles, Wrench, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGarage } from "../../context/GarageContext";
import DigitalPassport from "./DigitalPassport";
import VehicleSettingsTab from "./components/settings/VehicleSettingsTab";
import VehicleExpensesTab from "./components/settings/VehicleExpensesTab";
import VehicleDocumentsTab from "./components/settings/VehicleDocumentsTab";

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
      case "fuel": return <Fuel className="text-amber-500" />;
      case "service": return <Wrench className="text-primary-500" />;
      case "tax": return <FileText className="text-red-500" />;
      case "insurance": return <Shield className="text-emerald-500" />;
      case "cleaning": return <Sparkles className="text-cyan-500" />;
      default: return <CreditCard className="text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/60 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="glass-card w-full max-w-2xl rounded-[2.5rem] border border-black/10 dark:border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
                {vehicle.brand} {vehicle.model}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  GELİŞMİŞ SAĞLIK & PRO YÖNETİM
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-700"></span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${dynamicScore > 75 ? 'text-teal-400' : dynamicScore > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                  SAĞLIK SKORU: %{dynamicScore}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 dark:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 p-1 bg-white dark:bg-slate-900/50 rounded-2xl border border-black/5 dark:border-white/5 mb-6 relative z-10 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-primary-600 text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              <Settings size={14} className="inline mr-1" /> Sağlık ve Pro Ayarlar
            </button>
            <button 
              onClick={() => setActiveTab("expenses")}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'expenses' ? 'bg-primary-600 text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              <CreditCard size={14} className="inline mr-1" /> Masraflarım
            </button>
            <button 
              onClick={() => setActiveTab("documents")}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'documents' ? 'bg-primary-600 text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              <FolderClosed size={14} className="inline mr-1" /> Belge Kasası
            </button>
            <button 
              onClick={() => setActiveTab("passport")}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'passport' ? 'bg-indigo-600 text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              <ShieldCheck size={14} className="inline mr-1" /> Servis Karnesi
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
            {activeTab === "settings" && (
              <VehicleSettingsTab 
                formData={formData} 
                setFormData={setFormData} 
                dynamicScore={dynamicScore} 
                isSaving={isSaving} 
                handleSave={handleSave} 
              />
            )}

            {activeTab === "expenses" && (
              <VehicleExpensesTab 
                expenses={expenses}
                showExpenseForm={showExpenseForm}
                setShowExpenseForm={setShowExpenseForm}
                expenseData={expenseData}
                setExpenseData={setExpenseData}
                handleAddExpenseSubmit={handleAddExpenseSubmit}
              />
            )}

            {activeTab === "documents" && (
              <VehicleDocumentsTab 
                documents={documents}
                showDocForm={showDocForm}
                setShowDocForm={setShowDocForm}
                docData={docData}
                setDocData={setDocData}
                handleAddDocSubmit={handleAddDocSubmit}
              />
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
