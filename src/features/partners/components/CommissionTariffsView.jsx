import React, { useState, useEffect } from "react";
import { Percent, HelpCircle, RefreshCw, Calculator, DollarSign } from "lucide-react";
import { supabase } from "../../../supabaseClient";

export default function CommissionTariffsView() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculator
  const [price, setPrice] = useState("");
  const [selectedCategoryRate, setSelectedCategoryRate] = useState(12);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("commission_rates")
        .select("*")
        .order("category", { ascending: true });

      if (!error && data) {
        setRates(data);
        if (data.length > 0) {
          setSelectedCategoryRate(Number(data[0].rate));
        }
      }
    } catch (err) {
      console.error("Error fetching commission rates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Calculation
  const commissionValue = price ? (Number(price) * selectedCategoryRate) / 100 : 0;
  const netEarnings = price ? Number(price) - commissionValue : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Komisyon Tarifeleri</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kategorilere göre Rapidsy komisyon oranlarını listeleyin ve hakediş hesaplayın.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rates Table */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Kategori Komisyon Oranları</h3>
            <button
              onClick={fetchRates}
              className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
          ) : rates.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Tarife bulunamadı.</p>
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {rates.map((r) => (
                <div key={r.id} className="py-3.5 flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{r.category}</span>
                  <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                    %{r.rate}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculator Sidebar */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 space-y-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Calculator size={18} className="text-emerald-500" /> Hakediş Hesaplayıcı
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Satış Fiyatı (₺)</label>
              <input
                type="number"
                placeholder="Örn: 1500"
                className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kategori Seçimi</label>
              <select
                className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                value={selectedCategoryRate}
                onChange={(e) => setSelectedCategoryRate(Number(e.target.value))}
              >
                {rates.map((r) => (
                  <option key={r.id} value={r.rate}>
                    {r.category} (%{r.rate})
                  </option>
                ))}
              </select>
            </div>

            {price && (
              <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Komisyon Kesintisi</span>
                  <span className="font-bold text-red-500">-₺{commissionValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-2 border-t border-black/5 dark:border-white/5 font-bold">
                  <span className="text-slate-900 dark:text-white">Alacağınız Tutar</span>
                  <span className="text-emerald-500">₺{netEarnings.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
