import React, { useState, useEffect } from "react";
import { ArrowLeft, Copy, Loader2, Package, Ticket } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useUI } from "../../context/UIContext";
import { useNavigate } from "react-router-dom";
import PackageStore from "./PackageStore";

const CampaignsScreen = () => {
  const { t, showAlert } = useUI();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("coupons"); // coupons or packages
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data, error } = await supabase
          .from("coupons")
          .select("*")
          .eq("is_active", true);
        if (error) throw error;
        setCoupons(data || []);
      } catch (error) {
        console.error("Kupon hatası:", error);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    showAlert("Kopyalandı", `${code} kodu panoya kopyalandı!`, "success");
  };

  if (!t) return null;

  return (
    <div className="p-5 pb-32 space-y-6 min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-primary-600/10 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center gap-4 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-3 glass-card rounded-2xl text-slate-900 dark:text-white active-scale border border-black/10 dark:border-white/10"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter uppercase">
            {activeTab === "coupons" ? "FIRSATLAR" : "SERVİS PAKETLERİ"}
          </h3>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">
            Carvis Avantajlar Dünyası
          </p>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex p-1.5 bg-white dark:bg-slate-900/50 rounded-[1.5rem] border border-black/5 dark:border-white/5 relative z-10">
        <button
          onClick={() => setActiveTab("coupons")}
          className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
            activeTab === "coupons"
              ? "bg-orange-600 text-slate-900 dark:text-white shadow-lg shadow-orange-900/40"
              : "text-slate-500 hover:text-slate-500 dark:text-slate-400"
          }`}
        >
          <Ticket size={14} /> Kuponlar
        </button>
        <button
          onClick={() => setActiveTab("packages")}
          className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
            activeTab === "packages"
              ? "bg-primary-600 text-slate-900 dark:text-white shadow-lg shadow-primary-900/40"
              : "text-slate-500 hover:text-slate-500 dark:text-slate-400"
          }`}
        >
          <Package size={14} /> Paketler
        </button>
      </div>

      <div className="relative z-10">
        {activeTab === "packages" ? (
          <PackageStore />
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="animate-spin mx-auto text-orange-500" size={40} />
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-20 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-black/10 dark:border-white/10">
                <Ticket size={40} className="mx-auto text-slate-600 mb-4" />
                <p className="text-sm font-bold text-slate-500">Aktif kupon bulunamadı.</p>
              </div>
            ) : (
              coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="glass-card rounded-[2rem] border border-black/10 dark:border-white/10 shadow-xl overflow-hidden relative group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-orange-500 to-red-600"></div>
                  <div className="p-6 pl-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-lg text-slate-900 dark:text-white leading-tight">
                          {coupon.description}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
                          GEÇERLİLİK: {new Date(coupon.valid_until).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-3xl text-orange-500 tracking-tighter">
                          {coupon.discount_type === "percentage"
                            ? `%${coupon.discount_value}`
                            : `${coupon.discount_value}₺`}
                        </span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          İNDİRİM
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3 items-center bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                      <code className="font-mono font-black text-orange-400 text-xl flex-1 text-center tracking-[0.3em]">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => copyCoupon(coupon.code)}
                        className="bg-orange-600/20 text-orange-500 p-3 rounded-xl hover:bg-orange-600/30 transition active-scale border border-orange-500/20"
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsScreen;
