import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useUI } from "../../../context/UIContext";

const MechanicServices = () => {
  const { showAlert } = useUI();
  const [showModal, setShowModal] = useState(false);
  const [services, setServices] = useState([
    {
      id: 1,
      name: "Periyodik Bakım (Benzinli)",
      price: 1500,
      duration: "90 dk",
      includes: [
        "Motor Yağı",
        "Yağ Filtresi",
        "Hava Filtresi",
        "Genel Kontrol",
      ],
    },
    {
      id: 2,
      name: "Fren Balatası Değişimi (Ön)",
      price: 800,
      duration: "45 dk",
      includes: ["İşçilik", "Balata Spreyi"],
    },
    {
      id: 3,
      name: "Kışlık Bakım Paketi",
      price: 600,
      duration: "30 dk",
      includes: ["Antifriz", "Lastik Kontrolü", "Akü Ölçümü"],
    },
  ]);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    duration: "",
    includes: "",
  });

  const handleAddService = (e) => {
    e.preventDefault();
    const service = {
      id: Date.now(),
      ...newService,
      price: Number(newService.price),
      includes: newService.includes.split(",").map((i) => i.trim()),
    };
    setServices([service, ...services]);
    setShowModal(false);
    setNewService({ name: "", price: "", duration: "", includes: "" });
    showAlert("Başarılı", "Hizmet paketi eklendi.", "success");
  };

  const handleDelete = (id) => {
    if (window.confirm("Bu hizmeti kaldırmak istediğinize emin misiniz?")) {
      setServices(services.filter((s) => s.id !== id));
      showAlert("Silindi", "Hizmet paketi kaldırıldı.", "info");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
            Servis Hizmetleri
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Müşterilerinize sunduğunuz paketleri düzenleyin
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white px-5 py-3 rounded-xl font-bold text-sm shadow-xl active-scale flex items-center gap-2"
        >
          <Icons.Plus size={18} /> YENİ HİZMET EKLE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="glass-card p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:border-primary-500/30 transition-all group relative"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Icons.Wrench size={80} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg pr-4">
                {service.name}
              </h3>
              <div className="bg-primary-500/10 px-3 py-1 rounded-lg text-primary-400 font-black text-lg whitespace-nowrap">
                {service.price} ₺
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold mb-4">
              <Icons.Clock size={14} /> {service.duration}
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              <Icons.ShieldCheck size={14} /> Garantili İşçilik
            </div>
            <div className="space-y-2 mb-6">
              {service.includes.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                  {item}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-black/5 dark:border-white/5">
              <button className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                <Icons.Edit2 size={14} /> DÜZENLE
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="w-10 h-9 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center transition-colors"
              >
                <Icons.Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.Wrench className="text-primary-500" /> Yeni Hizmet Paketi
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
              >
                <Icons.X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddService} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
                  Hizmet Adı
                </label>
                <input
                  required
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none transition-colors"
                  placeholder="Örn: Detaylı İç Temizlik"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
                    Fiyat (₺)
                  </label>
                  <input
                    required
                    type="number"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({ ...newService, price: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none transition-colors"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
                    Süre
                  </label>
                  <input
                    required
                    value={newService.duration}
                    onChange={(e) =>
                      setNewService({ ...newService, duration: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none transition-colors"
                    placeholder="Örn: 60 dk"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
                  Kapsam (Virgülle ayırın)
                </label>
                <textarea
                  required
                  value={newService.includes}
                  onChange={(e) =>
                    setNewService({ ...newService, includes: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none transition-colors h-24 resize-none"
                  placeholder="Örn: Pasta, Cila, Boya Koruma"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white font-bold py-4 rounded-xl shadow-xl active-scale flex items-center justify-center gap-2"
              >
                <Icons.Save size={18} /> KAYDET
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicServices;
