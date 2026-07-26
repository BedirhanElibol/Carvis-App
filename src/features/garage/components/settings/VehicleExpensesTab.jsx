import React from "react";
import { Plus, Fuel, Wrench, FileText, Shield, Sparkles, CreditCard } from "lucide-react";

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

const VehicleExpensesTab = ({ 
  expenses, 
  showExpenseForm, 
  setShowExpenseForm, 
  expenseData, 
  setExpenseData, 
  handleAddExpenseSubmit 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Araç Gider Takibi</h4>
          <p className="text-[10px] text-slate-500 font-bold">Toplam harcama ve maliyet analizleri.</p>
        </div>
        <button 
          onClick={() => setShowExpenseForm(!showExpenseForm)}
          className="py-2.5 px-4 bg-primary-600 hover:bg-primary-500 rounded-xl text-slate-900 dark:text-white font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2"
        >
          <Plus size={12} /> {showExpenseForm ? "VAZGEÇ" : "YENİ MASRAF EKLE"}
        </button>
      </div>

      {/* Expense Quick Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-black/5 dark:border-white/5">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">TOPLAM MASRAF</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₺{expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString('tr-TR')}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-black/5 dark:border-white/5">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">KAYIT SAYISI</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{expenses.length}</p>
        </div>
      </div>

      {showExpenseForm && (
        <form onSubmit={handleAddExpenseSubmit} className="p-6 bg-white dark:bg-slate-900/60 rounded-3xl border border-black/10 dark:border-white/10 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Masraf Tipi</label>
              <select 
                value={expenseData.expense_type}
                onChange={(e) => setExpenseData({ ...expenseData, expense_type: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="fuel">Akaryakıt</option>
                <option value="service">Periyodik Bakım/Onarım</option>
                <option value="tax">Vergi / Harç</option>
                <option value="insurance">Kasko / Sigorta</option>
                <option value="fine">Trafik Cezası</option>
                <option value="cleaning">Temizlik / Yıkama</option>
                <option value="other">Diğer Giderler</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Tutar (TL)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                value={expenseData.amount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setExpenseData({ ...expenseData, amount: val < 0 ? 0 : e.target.value });
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">İşlem Kilometresi (Opsiyonel)</label>
              <input 
                type="number" 
                min="0"
                placeholder="Km bilgisi"
                value={expenseData.mileage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setExpenseData({ ...expenseData, mileage: val < 0 ? 0 : e.target.value });
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Not / Detay</label>
              <input 
                type="text" 
                placeholder="Örn: Opet kurşunsuz yakıt aldım"
                value={expenseData.notes}
                onChange={(e) => setExpenseData({ ...expenseData, notes: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-slate-900 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            KAYDET
          </button>
        </form>
      )}

      {/* Expense List */}
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900/20 rounded-2xl border border-dashed border-black/5 dark:border-white/5">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Kayıtlı masraf bulunmamaktadır.</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="p-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between hover:border-black/10 dark:border-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                  {getExpenseIcon(expense.expense_type)}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {expense.expense_type === 'fuel' ? 'Akaryakıt' : 
                     expense.expense_type === 'service' ? 'Bakım/Onarım' : 
                     expense.expense_type === 'tax' ? 'Vergi' : 
                     expense.expense_type === 'insurance' ? 'Sigorta' : 
                     expense.expense_type === 'fine' ? 'Ceza' : 
                     expense.expense_type === 'cleaning' ? 'Yıkama' : 'Diğer'}
                  </h5>
                  <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">
                    {new Date(expense.date).toLocaleDateString('tr-TR')} {expense.mileage && `• ${expense.mileage} KM`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 dark:text-white">₺{parseFloat(expense.amount).toLocaleString('tr-TR')}</p>
                {expense.notes && <p className="text-[8px] font-medium text-slate-500 dark:text-slate-400 max-w-[150px] truncate mt-0.5">{expense.notes}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VehicleExpensesTab;
