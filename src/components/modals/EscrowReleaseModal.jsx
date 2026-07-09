import React, { useState } from 'react';
import { Wallet, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

const BaseModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/5">
          <h2 className="font-black text-base text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

const EscrowReleaseModal = ({ isOpen, onClose, amount, customerName, transactionId, onRelease }) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePinChange = (index, value) => {
    if (value.length > 1) return; // single digit only
    if (!/^\d*$/.test(value)) return; // numbers only

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async () => {
    const fullPin = pin.join('');
    if (fullPin.length !== 6) {
      setError('Lütfen 6 haneli kodu eksiksiz girin.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // API call simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate validation
      if (fullPin === '482159') {
        setSuccess(true);
        setTimeout(() => {
          onRelease && onRelease();
          onClose();
        }, 2000);
      } else {
        setError('Geçersiz PIN kodu. Lütfen müşterinizden doğru kodu isteyin.');
      }
    } catch (err) {
      setError('Sistem hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Havuzdaki Bakiyeyi Aktar">
      <div className="flex flex-col items-center justify-center p-4">
        
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-blue-500/5">
          <Wallet className="w-8 h-8 text-blue-500" />
        </div>
        
        <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-2">
          Ödemeyi Cüzdana Çek
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 max-w-sm">
          Müşteriniz <span className="font-bold text-orange-500">{customerName}</span>'in havuzda bekleyen <span className="font-bold text-slate-700 dark:text-slate-200">{amount} ₺</span> tutarındaki ödemesini cüzdanınıza aktarmak için müşteriden iş bitim onay kodunu (PIN) isteyin.
        </p>

        {success ? (
          <div className="w-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-6 flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <p className="text-emerald-700 dark:text-emerald-400 font-bold text-center">Ödeme başarıyla cüzdanınıza aktarıldı!</p>
          </div>
        ) : (
          <>
            {/* PIN Inputs */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`pin-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 text-center text-2xl font-mono font-black rounded-xl border ${error ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-500' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'} outline-none transition-all`}
                />
              ))}
            </div>

            {error && (
              <div className="w-full mb-4 flex items-center justify-center gap-2 text-red-500 text-sm font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button 
              onClick={handleVerify}
              disabled={isLoading || pin.join('').length !== 6}
              className="w-full mt-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Doğrulanıyor...</>
              ) : (
                'Onayla ve Bakiyeyi Aktar'
              )}
            </button>
          </>
        )}
      </div>
    </BaseModal>
  );
};

export default EscrowReleaseModal;
