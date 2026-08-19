import React, { useState, useEffect } from "react";
import { Landmark, CheckCircle, Percent, Plus, X, AlertCircle } from "lucide-react";
import { supabase } from "../../../supabaseClient";

export default function PartnerLoanView({ currentUser }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [amount, setAmount] = useState(100000);
  const [maturity, setMaturity] = useState(12);

  const fetchLoans = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("partner_loans")
        .select("*")
        .eq("seller_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLoans(data);
      }
    } catch (err) {
      console.error("Error fetching partner loans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [currentUser]);

  const handleApplyLoan = async (e) => {
    e.preventDefault();
    setError("");
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("partner_loans")
        .insert([{
          seller_id: currentUser.id,
          amount: Number(amount),
          maturity_months: Number(maturity),
          interest_rate: 1.99,
          status: "pending"
        }]);

      if (error) throw error;

      setIsModalOpen(false);
      fetchLoans();
    } catch (err) {
      setError(err.message || "Kredi başvurusu gönderilemedi.");
    } finally {
      setActionLoading(false);
    }
  };

  // Calculator
  const interestRate = 1.99; // %1.99 aylık faiz oranı
  const monthlyInterest = interestRate / 100;
  const monthlyPayment = (amount * monthlyInterest * Math.pow(1 + monthlyInterest, maturity)) / (Math.pow(1 + monthlyInterest, maturity) - 1);
  const totalRepayment = monthlyPayment * maturity;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">İş Ortağım Kredisi</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">İşletmenizin nakit ihtiyaçları için özel faiz oranlarıyla esnaf kredisi başvurusu yapın.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-orange-500/20"
        >
          <Plus size={16} /> Kredi Başvurusu Yap
        </button>
      </div>

      {/* Grid: Promo & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Loan Applications */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 lg:col-span-2 space-y-6">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Kredi Başvuru Geçmişi</h3>
          
          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
          ) : loans.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Landmark size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-xs">Aktif veya geçmiş bir kredi başvurunuz bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white">₺{Number(loan.amount).toLocaleString("tr-TR")}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Vade: {loan.maturity_months} Ay · Faiz: %{loan.interest_rate}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    loan.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : loan.status === "pending"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-red-500/10 text-red-500"
                  }`}>
                    {loan.status === "pending" ? "İnceleniyor" : loan.status === "approved" ? "Onaylandı" : "Reddedildi"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Promo Sidebar */}
        <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-xl p-6 space-y-4">
          <div className="bg-orange-500/10 w-10 h-10 rounded-xl flex items-center justify-center">
            <Landmark size={20} className="text-orange-500" />
          </div>
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">Rapidsy Finans Çözümleri</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Esnaf ortaklarımıza özel, bankalar birliği iş birliğiyle sağlanan %1.99'dan başlayan faiz oranları ile 3.5 Milyon TL'ye varan kredi fırsatlarından yararlanın.
          </p>
          <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <p>· Evraksız, kefilsiz anında onay</p>
            <p>· Esnek ödeme planları</p>
            <p>· Kredi Pazaryeri karşılaştırmalı teklifler</p>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-md rounded-xl p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-xl font-black mb-4 uppercase">Kredi Talep Formu</h3>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs flex items-center gap-2"><AlertCircle size={14} />{error}</div>}
            
            <form onSubmit={handleApplyLoan} className="space-y-6">
              {/* Amount Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                  <label htmlFor="loan-amount-slider">Kredi Tutarı</label>
                  <span className="text-orange-500">₺{Number(amount).toLocaleString("tr-TR")}</span>
                </div>
                <input
                  id="loan-amount-slider"
                  type="range"
                  min="20000"
                  max="1000000"
                  step="10000"
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>20.000 ₺</span>
                  <span>1.000.000 ₺</span>
                </div>
              </div>

              {/* Maturity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                  <label htmlFor="loan-maturity-slider">Vade</label>
                  <span className="text-orange-500">{maturity} Ay</span>
                </div>
                <input
                  id="loan-maturity-slider"
                  type="range"
                  min="6"
                  max="36"
                  step="6"
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  value={maturity}
                  onChange={(e) => setMaturity(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>6 Ay</span>
                  <span>36 Ay</span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Aylık Faiz Oranı</span>
                  <span className="font-bold text-slate-900 dark:text-white">%1.99</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Aylık Taksit</span>
                  <span className="font-bold text-slate-900 dark:text-white">₺{monthlyPayment.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-2 border-t border-black/5 dark:border-white/5 font-bold">
                  <span className="text-slate-900 dark:text-white">Toplam Geri Ödeme</span>
                  <span className="text-orange-600">₺{totalRepayment.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-colors shadow-lg shadow-orange-500/20"
              >
                {actionLoading ? "Gönderiliyor..." : "Başvuruyu Tamamla"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
