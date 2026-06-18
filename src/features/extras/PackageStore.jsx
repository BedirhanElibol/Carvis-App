import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

const PackageStore = () => {
  const { showAlert } = useUI();
  const { currentUser } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from("service_packages")
          .select("*, partners:partner_id(full_name, avatar_url)")
          .eq("is_active", true);
        if (error) throw error;
        setPackages(data || []);
      } catch (error) {
        console.error("Paket hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleBuy = async (pkg) => {
    if (!currentUser) {
      showAlert("Hata", "Lütfen önce giriş yapın.", "error");
      return;
    }

    setBuyingId(pkg.id);
    try {
      // 1. Cüzdan kontrolü ve ödeme (process_wallet_payment_v2 kullanacağız)
      const { error } = await supabase.rpc('process_wallet_payment_v2', {
        p_customer_id: currentUser.id,
        p_seller_id: pkg.partner_id,
        p_amount: pkg.price,
        p_order_id: null, // Paket alımları için order_id opsiyonel olabilir veya yeni bir order oluşturulabilir
        p_is_subscription: true
      });

      if (error) throw error;

      // 2. Abonelik kaydı oluştur
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .insert([{
          user_id: currentUser.id,
          package_id: pkg.id,
          expiry_date: new Date(new Date().setMonth(new Date().getMonth() + (pkg.validity_months || 12))),
          usage_stats: pkg.included_services // Hakları başlat
        }]);

      if (subError) throw subError;

      showAlert("Tebrikler!", `${pkg.name} başarıyla satın alındı. Paket haklarınız garajınıza eklendi.`, "success");
    } catch (error) {
      console.error("Satın alma hatası:", error);
      showAlert("Hata", error.message || "Ödeme sırasında bir sorun oluştu.", "error");
    } finally {
      setBuyingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Icons.Loader2 className="animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-6">
      {packages.map((pkg) => (
        <motion.div
          key={pkg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2.5rem] border border-white/10 overflow-hidden relative group shadow-2xl"
        >
          {/* Header Image/Gradient */}
          <div className="h-32 bg-gradient-to-br from-primary-600/40 to-accent-600/40 relative">
            <div className="absolute inset-0 backdrop-blur-sm"></div>
            <div className="absolute bottom-4 left-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Icons.Package size={24} className="text-white" />
              </div>
              <div>
                <h4 className="font-black text-xl text-white tracking-tight leading-none">{pkg.name}</h4>
                <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-1">
                  {pkg.partners?.full_name || "Yetkili Servis"}
                </p>
              </div>
            </div>
            <div className="absolute top-4 right-6 bg-slate-950/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                {pkg.validity_months} AY GEÇERLİ
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {pkg.description || "Bu paket ile aracınızın periyodik bakımlarını ve ihtiyaçlarını indirimli fiyatlarla karşılayabilirsiniz."}
            </p>

            {/* Included Services Tags */}
            <div className="flex flex-wrap gap-2">
              {Array.isArray(pkg.included_services) ? pkg.included_services.map((svc, i) => (
                <span key={i} className="text-[9px] font-black bg-white/5 text-slate-400 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-tighter">
                  ✓ {svc.replace('_', ' ')}
                </span>
              )) : (
                 <span className="text-[9px] font-black bg-white/5 text-slate-400 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-tighter">
                  Tam Bakım Paketi
                </span>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">FİYAT</span>
                <span className="text-2xl font-black text-white">{pkg.price} ₺</span>
              </div>
              <button
                onClick={() => handleBuy(pkg)}
                disabled={buyingId === pkg.id}
                className="bg-white text-slate-950 px-8 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active-scale disabled:opacity-50 flex items-center gap-2"
              >
                {buyingId === pkg.id ? <Icons.Loader2 className="animate-spin" size={16} /> : <Icons.CreditCard size={16} />}
                HEMEN AL
              </button>
            </div>
          </div>
        </motion.div>
      ))}

      {packages.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
          <Icons.Inbox size={40} className="mx-auto text-slate-600 mb-4" />
          <p className="text-sm font-bold text-slate-500">Şu an aktif servis paketi bulunmamaktadır.</p>
        </div>
      )}
    </div>
  );
};

export default PackageStore;
