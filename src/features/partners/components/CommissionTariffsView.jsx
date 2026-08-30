import React from "react";
import { CheckCircle2, ShieldCheck, DollarSign, Sparkles } from "lucide-react";

export default function CommissionTariffsView() {
  const subscriptionPlans = [
    { category: "Oto Servis & Usta", rate: "0%", subFee: "1.499 ₺ / ay", status: "Aktif Abonelik" },
    { category: "Oto Yedek Parçacı", rate: "0%", subFee: "1.999 ₺ / ay", status: "Aktif Abonelik" },
    { category: "Oto Yıkama Hizmetleri", rate: "0%", subFee: "799 ₺ / ay", status: "Aktif Abonelik" },
    { category: "7/24 Yol Yardım & Çekici", rate: "0%", subFee: "999 ₺ / ay", status: "Aktif Abonelik" },
    { category: "VIP Vale & Otopark", rate: "0%", subFee: "999 ₺ / ay", status: "Aktif Abonelik" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Abonelik & Komisyon Tarifeleri</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Carvis %0 Komisyon modeli ile çalışır. Tüm kazancınız tamamen sizde kalır.</p>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">%0 Komisyon Garantisi</h3>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Carvis müşterilerinizden veya satışlarınızdan hiçbir kesinti yapmaz. Yalnızca sabit aylık paket ücreti ödersiniz.
            </p>
          </div>
        </div>
        <div className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl whitespace-nowrap">
          Tüm Kazanç Sizin
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subscription Table */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Kategori Bazlı Paket Tarifeleri</h3>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/5">
            {subscriptionPlans.map((item, idx) => (
              <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs block">{item.category}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{item.subFee}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> {item.rate} Komisyon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 space-y-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary-500" /> Platform Modeli
          </h3>

          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-4 bg-slate-50 dark:bg-black/30 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">Doğrudan Ödeme Alın</span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Müşteri ödemeleri doğrudan iş yerinizde (nakit, kredi kartı vb.) siz alırsınız. Carvis arada para tutmaz ve bloke koymaz.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-black/30 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">Sınırsız Teklif & İlan</span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Aboneliğiniz süresince sınırsız müşteri eşleşmesi yapabilir, müşteri listenizi dilediğiniz gibi genişletebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

