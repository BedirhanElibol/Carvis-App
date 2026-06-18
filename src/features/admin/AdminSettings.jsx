import React, { useState } from "react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";  
import { useUI } from "../../context/UIContext";

const AdminSettings = () => {
  const { showAlert } = useUI();
  const [settings, setSettings] = useState({
    commissionRate: 5,
    maintenanceMode: false,
    autoApprovePartners: false,
    platformName: "Rapidsy",
    supportEmail: "support@carvis.com",
  });

  const handleSave = () => {
    // In a real app, this would update a 'system_settings' table in Supabase
    showAlert("Başarılı", "Sistem ayarları güncellendi.", "success");
  };

  const settingSections = [
    {
      title: "Finansal Ayarlar",
      icon: Icons.Banknote,
      items: [
        {
          label: "Platform Komisyon Oranı (%)",
          description: "Tüm siparişlerden alınacak standart kesinti oranı.",
          value: settings.commissionRate,
          type: "number",
          onChange: (v) => setSettings({ ...settings, commissionRate: v }),
        },
      ],
    },
    {
      title: "Sistem Kontrolü",
      icon: Icons.Cpu,
      items: [
        {
          label: "Bakım Modu",
          description:
            "Aktif edildiğinde platform müşteri kullanımına kapanır.",
          value: settings.maintenanceMode,
          type: "toggle",
          onChange: (v) => setSettings({ ...settings, maintenanceMode: v }),
        },
        {
          label: "Partner Otomatik Onay",
          description:
            "Yeni kayıt olan partnerleri otomatik olarak sistemde aktif et.",
          value: settings.autoApprovePartners,
          type: "toggle",
          onChange: (v) => setSettings({ ...settings, autoApprovePartners: v }),
        },
      ],
    },
    {
      title: "İletişim & Kimlik",
      icon: Icons.Globe,
      items: [
        {
          label: "Uygulama Adı",
          description: "E-postalarda ve bildirimlerde görünecek ad.",
          value: settings.platformName,
          type: "text",
          onChange: (v) => setSettings({ ...settings, platformName: v }),
        },
        {
          label: "Destek E-postası",
          description: "Sistem mesajları ve destek talepleri için ana adres.",
          value: settings.supportEmail,
          type: "text",
          onChange: (v) => setSettings({ ...settings, supportEmail: v }),
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 p-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black font-sans text-white uppercase tracking-tighter leading-[1.2]">
            Sistem Ayarları
          </h1>
          <p className="text-slate-400 font-sans uppercase text-[10px] font-bold tracking-widest mt-1">
            Platform genelindeki küresel parametreler.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-black font-sans uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/50"
        >
          Değişiklikleri Kaydet
        </button>
      </div>

      <div className="space-y-6">
        {settingSections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                <section.icon size={18} />
              </div>
              <h3 className="font-black text-white font-sans uppercase tracking-widest text-xs">
                {section.title}
              </h3>
            </div>
            <div className="p-8 space-y-8">
              {section.items.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 last:pb-0 border-b last:border-0 border-white/5"
                >
                  <div className="max-w-md">
                    <p className="text-white font-bold text-sm mb-1">
                      {item.label}
                    </p>
                    <p className="text-slate-500 text-xs font-medium">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {item.type === "toggle" ? (
                      <button
                        aria-label={item.label}
                        onClick={() => item.onChange(!item.value)}
                        className={`w-14 h-8 rounded-full relative transition-colors ${item.value ? "bg-emerald-500" : "bg-slate-800"}`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${item.value ? "left-7" : "left-1"}`}
                        ></div>
                      </button>
                    ) : item.type === "number" ? (
                      <div className="relative">
                        <label htmlFor={`setting-${idx}-${i}`} className="sr-only">{item.label}</label>
                        <input
                          id={`setting-${idx}-${i}`}
                          type="number"
                          value={item.value}
                          onChange={(e) => item.onChange(e.target.value)}
                          className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white font-black text-center w-24 focus:border-red-500/50 focus:outline-none font-sans"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                          %
                        </span>
                      </div>
                    ) : (
                      <div className="w-full md:w-64">
                         <label htmlFor={`setting-${idx}-${i}`} className="sr-only">{item.label}</label>
                         <input
                          id={`setting-${idx}-${i}`}
                          type="text"
                          value={item.value}
                          onChange={(e) => item.onChange(e.target.value)}
                          className="bg-slate-900 border border-white/10 rounded-xl px-6 py-2.5 text-white font-medium focus:border-red-500/50 focus:outline-none w-full font-sans"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
