import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useWallet } from "../../context/WalletContext";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";

const WalletScreen = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { balance, escrowBalance, transactions, addFunds } = useWallet();
  const { showAlert } = useUI();
  const [showTopUp, setShowTopUp] = useState(false);

  const fullName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.full_name ||
    "Müşteri";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 relative overflow-hidden animate-fade-in">
      {/* Ambient Backgrounds */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app/profile")}
              className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale transition hover:bg-black/10 dark:bg-white/10"
            >
              <Icons.ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black font-sans uppercase tracking-tighter">
                Cüzdanım
              </h1>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-400">
            <Icons.Wallet size={20} />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6 relative z-10">
        {/* RAPIDSY CARD */}
        <div className="relative w-full h-56 rounded-[2.5rem] p-7 shadow-2xl overflow-hidden group border border-black/5 dark:border-white/5">
          {/* Background gradient & texture for card */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] group-hover:bg-primary-500/30 transition-all"></div>

          {/* Card Content */}
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-2 flex items-center gap-1.5 font-sans">
                  <Icons.ShieldCheck size={12} className="text-primary-400" />
                  RAPIDSY GÜVENCESİ
                </div>
                <div className="text-slate-900 dark:text-white text-4xl font-black font-sans tracking-tighter">
                  ₺
                  {balance.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white/40 group-hover:text-slate-900 dark:text-white transition-colors duration-500 font-sans uppercase">
                  RAPIDSY<span className="text-primary-500">PAY</span>
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1 font-sans">
                  Kart Sahibi
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
                  {fullName}
                </p>
              </div>
              {escrowBalance > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-2 px-3 rounded-xl text-right">
                  <p className="text-[8px] text-yellow-500 uppercase font-black tracking-widest mb-0.5 font-sans">
                    Blokede (Escrow)
                  </p>
                  <p className="text-sm font-black text-yellow-500 font-sans">
                    ₺
                    {escrowBalance.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowTopUp(true)}
            className="glass-card p-6 rounded-[2rem] border border-black/5 dark:border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-primary-600/10 hover:border-primary-500/30 transition-all active-scale group"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-slate-900 dark:text-white shadow-xl group-hover:scale-110 transition-transform">
              <Icons.Plus size={28} />
            </div>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-sans">
              Bakiye Yükle
            </span>
          </button>
          <button
            onClick={() =>
              showAlert(
                "Daha Fazla",
                "İşlem geçmişi ve cüzdan ayarları çok yakında burada olacak.",
                "info",
              )
            }
            className="glass-card p-6 rounded-[2rem] border border-black/5 dark:border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-black/5 dark:bg-white/5 transition-all active-scale group"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-black/10 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-xl group-hover:scale-110 transition-transform">
              <Icons.LayoutGrid size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-sans">
              Diğer İşlemler
            </span>
          </button>
        </div>

        {/* Transaction History */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-sans uppercase tracking-tighter">
              İşlem Gecmişi
            </h3>
            <div className="p-1 px-3 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-sans cursor-pointer hover:bg-black/10 dark:bg-white/10 transition-colors">
              Tümü
            </div>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-[2rem] border border-black/5 dark:border-white/5">
                <Icons.Inbox
                  size={40}
                  className="mx-auto text-slate-800 mb-3"
                />
                <p className="text-slate-500 text-xs font-sans font-bold uppercase tracking-widest">
                  Henüz bir işlem bulunmuyor
                </p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="glass-card p-4 rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between hover:border-black/10 dark:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        tx.type === "deposit" || tx.type === "refund"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : tx.type === "block"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {tx.type === "deposit" || tx.type === "refund" ? (
                        <Icons.ArrowDownLeft size={22} />
                      ) : (
                        <Icons.ArrowUpRight size={22} />
                      )}
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight font-sans">
                        {tx.description || tx.type}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 font-sans">
                        {new Date(tx.created_at).toLocaleDateString()} •{" "}
                        {new Date(tx.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-lg font-black text-right font-sans ${
                      tx.type === "deposit" || tx.type === "refund"
                        ? "text-emerald-400"
                        : tx.type === "block"
                          ? "text-yellow-500"
                          : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}₺
                    {Math.abs(tx.amount).toLocaleString("tr-TR")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mock TopUp Modal */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowTopUp(false)}
          ></div>
          <div className="bg-slate-50 dark:bg-slate-950 w-full sm:w-[400px] rounded-t-[3rem] sm:rounded-3xl border border-black/10 dark:border-white/10 relative z-10 animate-slide-up p-8 shadow-2xl">
            <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mx-auto mb-6 sm:hidden"></div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-sans uppercase tracking-tighter">
                Bakiye Yükle
              </h2>
              <button
                onClick={() => setShowTopUp(false)}
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-white bg-black/5 dark:bg-white/5 rounded-full transition-colors"
              >
                <Icons.X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-8">
              {[500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    addFunds(val);
                    setShowTopUp(false);
                    showAlert(
                      "Başarılı",
                      `${val} TL bakiyenize eklendi.`,
                      "success",
                    );
                  }}
                  className="bg-black/5 dark:bg-white/5 hover:bg-primary-600/20 border border-black/5 dark:border-white/5 hover:border-primary-500/50 text-slate-900 dark:text-white font-black py-4 rounded-2xl transition-all font-sans text-lg flex items-center justify-between px-6 group"
                >
                  <span>+{val.toLocaleString("tr-TR")} ₺</span>
                  <Icons.ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center pt-6 border-t border-black/5 dark:border-white/5 text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] gap-2 font-sans">
              <Icons.ShieldCheck size={14} className="text-emerald-500/50" />
              3D Secure & AES-256 Korumalı
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletScreen;
