import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";

const PackageManager = () => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPkg, setNewPkg] = useState({
    name: "",
    description: "",
    price: "",
    validity_months: 12,
    included_services: ""
  });

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_packages")
        .select("*")
        .eq("partner_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error("Fetch packages error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleAddPackage = async (e) => {
    e.preventDefault();
    try {
      const services = newPkg.included_services.split(",").map(s => s.trim()).filter(s => s !== "");
      
      const { error } = await supabase.from("service_packages").insert([{
        partner_id: currentUser.id,
        name: newPkg.name,
        description: newPkg.description,
        price: parseFloat(newPkg.price),
        validity_months: parseInt(newPkg.validity_months),
        included_services: services,
        is_active: true
      }]);

      if (error) throw error;

      showAlert("Başarılı", "Paketiniz oluşturuldu ve yayına alındı.", "success");
      setShowAddModal(false);
      setNewPkg({ name: "", description: "", price: "", validity_months: 12, included_services: "" });
      fetchPackages();
    } catch (error) {
      console.error("Add package error:", error);
      showAlert("Hata", "Paket oluşturulurken bir hata oluştu.", "error");
    }
  };

  const togglePackageStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from("service_packages")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      fetchPackages();
    } catch (error) {
      console.error("Toggle status error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-black/5 dark:border-white/5">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Servis Paketlerim</h3>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Abonelik bazlı gelir modelleri</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active-scale shadow-lg shadow-primary-900/20"
        >
          <Icons.Plus size={16} /> Yeni Paket Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Icons.Loader2 className="animate-spin mx-auto text-primary-500" size={32} />
          </div>
        ) : packages.length === 0 ? (
          <div className="col-span-full py-20 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-black/10 dark:border-white/10 text-center">
             <Icons.Package size={40} className="mx-auto text-slate-700 mb-4" />
             <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Henüz paketiniz bulunmuyor</p>
          </div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} className="glass-card p-6 rounded-[2rem] border border-black/5 dark:border-white/5 relative group overflow-hidden">
              <div className={`absolute top-0 left-0 bottom-0 w-1 ${pkg.is_active ? 'bg-primary-500' : 'bg-slate-700'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight uppercase leading-none">{pkg.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-lg text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {pkg.validity_months} Ay Geçerli
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${pkg.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {pkg.is_active ? 'YAYINDA' : 'PASİF'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">₺{pkg.price}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 italic">"{pkg.description}"</p>

              <div className="space-y-2 mb-6">
                 {pkg.included_services?.map((service, i) => (
                   <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                     <Icons.Check size={12} className="text-primary-500" /> {service}
                   </div>
                 ))}
              </div>

              <div className="flex gap-2">
                 <button 
                   onClick={() => togglePackageStatus(pkg.id, pkg.is_active)}
                   className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${pkg.is_active ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'}`}
                 >
                   {pkg.is_active ? 'DURDUR' : 'YAYINLA'}
                 </button>
                 <button className="p-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-white transition-all">
                    <Icons.Settings size={16} />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Package Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0f172a] w-full max-w-lg rounded-[2.5rem] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
              <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tighter">Yeni Servis Paketi</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-900 dark:text-white transition"><Icons.X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddPackage} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Paket Adı</label>
                <input 
                  required
                  value={newPkg.name}
                  onChange={e => setNewPkg({...newPkg, name: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-primary-500 transition-all outline-none" 
                  placeholder="Örn: Yıllık Periyodik Bakım Paketi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fiyat (₺)</label>
                  <input 
                    required
                    type="number"
                    value={newPkg.price}
                    onChange={e => setNewPkg({...newPkg, price: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-primary-500 transition-all outline-none" 
                    placeholder="2500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Geçerlilik (Ay)</label>
                  <select 
                    value={newPkg.validity_months}
                    onChange={e => setNewPkg({...newPkg, validity_months: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-primary-500 transition-all outline-none appearance-none"
                  >
                    <option value="1">1 Ay</option>
                    <option value="3">3 Ay</option>
                    <option value="6">6 Ay</option>
                    <option value="12">12 Ay</option>
                    <option value="24">24 Ay</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Açıklama</label>
                <textarea 
                  required
                  value={newPkg.description}
                  onChange={e => setNewPkg({...newPkg, description: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-primary-500 transition-all outline-none min-h-[100px]" 
                  placeholder="Paketin avantajlarından kısaca bahsedin..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dahil Hizmetler (Virgülle ayırın)</label>
                <textarea 
                  required
                  value={newPkg.included_services}
                  onChange={e => setNewPkg({...newPkg, included_services: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-primary-500 transition-all outline-none" 
                  placeholder="Yağ Değişimi, Filtre Kontrolü, Fren Testi..."
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary-900/30 active-scale"
              >
                PAKETİ OLUŞTUR VE YAYINLA
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageManager;
