import React, { useState } from "react";
import * as Icons from "lucide-react";
 
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "../../context/WalletContext";

const TopUpModal = ({ isOpen, onClose }) => {
  const { addFunds } = useWallet();
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleTopUp = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    setIsProcessing(true);
    
    const success = await addFunds(Number(amount));
    if (success) {
      onClose();
    }
    setIsProcessing(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex py-10 justify-center items-end md:items-center bg-black/60 backdrop-blur-sm"
      >
        <div className="absolute inset-0" onClick={onClose}></div>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="relative bg-slate-900 border border-white/10 w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-white/5 rounded-full hover:bg-white/10"
          >
            <Icons.X size={20} className="text-white" />
          </button>

          <h2 className="text-xl font-bold text-white font-sans mb-2 flex items-center gap-2">
            <Icons.Wallet size={24} className="text-primary-400" />
            Bakiye Yükle
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Kredi kartınızla anında güvenli bakiye yükleyebilirsiniz.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                Yüklenecek Tutar (TL)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Örn: 1000"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-bold text-xl mt-1 focus:border-primary-500 focus:outline-none placeholder-slate-700"
              />
            </div>

            {/* Quick Amounts */}
            <div className="flex gap-2">
              {[500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold hover:bg-white/10"
                >
                  +{val} ₺
                </button>
              ))}
            </div>

            {/* Mock Card Input */}
            <div className="pt-4 pb-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Kayıtlı Kart
              </label>
              <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl mt-1">
                <Icons.CreditCard className="text-slate-400" />
                <div>
                  <p className="text-white font-bold text-sm">
                    •••• •••• •••• 4242
                  </p>
                  <p className="text-slate-500 text-xs">Garanti BBVA - Bonus</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleTopUp}
              disabled={isProcessing || !amount || Number(amount) <= 0}
              className="w-full mt-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
            >
              {isProcessing ? (
                "İşleniyor..."
              ) : (
                <>
                  <Icons.ShieldCheck size={20} />
                  Güvenli Ödeme Yap
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TopUpModal;
