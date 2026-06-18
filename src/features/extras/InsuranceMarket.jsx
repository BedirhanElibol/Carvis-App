import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useGarage } from "../../context/GarageContext";
import { supabase } from "../../supabaseClient";

const InsuranceMarket = () => {
  const { showAlert } = useUI();
  const { currentUser } = useAuth();
  const { currentVehicle } = useGarage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("insurance_products").select("*");
      if (!error && data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleApply = async (product) => {
    if (!currentUser) return showAlert("Hata", "Lütfen giriş yapın.", "error");
    if (!currentVehicle) return showAlert("Hata", "Lütfen önce bir araç seçin.", "error");

    try {
      const { error } = await supabase.from("insurance_applications").insert([{
        user_id: currentUser.id,
        vehicle_id: currentVehicle.id,
        product_id: product.id,
        status: "pending"
      }]);
      if (error) throw error;
      showAlert("Başarılı", "Sigorta talebiniz alındı, uzman ekibimiz sizi arayacak.", "success");
    } catch (err) {
      console.error(err);
      showAlert("Hata", "Talep oluşturulamadı.", "error");
    }
  };

  return (
    <div className="p-5 pb-32 space-y-8 animate-fade-in text-white font-sans">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-accent-500/20 rounded-lg">
             <Icons.ShieldCheck size={20} className="text-accent-500" />
           </div>
           <span className="text-[10px] font-black text-accent-500 uppercase tracking-[0.3em]">Rapidsy Protection</span>
        </div>
        <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Sigorta Marketi</h3>
        <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
          Aracınız için en uygun kasko ve trafik sigortası tekliflerini tek panelden yönetin.
        </p>
      </div>

      {currentVehicle && (
        <div className="glass-card p-4 rounded-2xl border border-primary-500/20 bg-primary-500/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Icons.Car size={20} className="text-primary-400" />
             <p className="text-[11px] font-black uppercase text-slate-300">
               {currentVehicle.brand} {currentVehicle.model} <span className="text-primary-500">İÇİN TEKLİFLER</span>
             </p>
           </div>
           <Icons.CheckCircle2 size={16} className="text-primary-400" />
        </div>
      )}

      {/* Insurance Products */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 opacity-50 text-[10px] font-black uppercase tracking-widest">
            Teklifler yükleniyor...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 opacity-50 text-[10px] font-black uppercase tracking-widest">
            Şu anda listelenen sigorta teklifi bulunmuyor
          </div>
        ) : products.map((p) => (
          <div key={p.id} className="glass-card p-6 rounded-[2.5rem] border border-white/5 bg-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 transition-transform group-hover:scale-125 duration-700"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{p.provider_logo}</div>
                <div>
                  <h4 className="font-black text-white text-lg tracking-tighter">{p.provider_name}</h4>
                  <p className="text-[10px] text-primary-400 font-black uppercase tracking-widest">
                    {p.product_type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Başlangıç Fiyatı</p>
                <p className="text-2xl font-black text-white tracking-tighter">{p.base_price.toLocaleString()} ₺</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-3">
              <button className="flex-1 glass-card border border-white/10 hover:bg-white/5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                DETAYLAR
              </button>
              <button 
                onClick={() => handleApply(p)}
                className="flex-1 bg-white text-slate-950 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale hover:bg-accent-500 hover:text-white transition-all shadow-xl"
              >
                BAŞVURU YAP
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="p-6 bg-slate-900/50 rounded-[2.5rem] border border-white/5 text-center">
        <Icons.Info size={24} className="text-slate-500 mx-auto mb-3" />
        <p className="text-[10px] text-slate-500 leading-relaxed font-sans uppercase tracking-tight">
          Teklifler araç yaşınıza ve hasar geçmişinize göre değişiklik gösterebilir. <br />
          Tüm başvurular sigorta uzmanlarımız tarafından incelenir.
        </p>
      </div>
    </div>
  );
};

export default InsuranceMarket;
