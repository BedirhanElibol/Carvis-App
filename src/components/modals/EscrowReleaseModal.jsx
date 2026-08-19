import React, { useState } from 'react';
import { Wallet, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

const BaseModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

        <div className="flex gap-2 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              aria-label={`PIN kodu hanesi ${index + 1}`}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-10 h-14 text-center text-xl font-bold bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-transparent focus:border-blue-500 outline-none text-slate-900 dark:text-white"
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg w-full">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success ? (
          <div className="flex items-center justify-center gap-2 text-green-500 font-bold w-full py-3 bg-green-50 dark:bg-green-500/10 rounded-xl">
            <CheckCircle2 size={20} />
            İşlem Başarılı!
          </div>
        ) : (
          <button
            onClick={handleVerify}
            disabled={isLoading || pin.join('').length !== 6}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <><Loader2 className="animate-spin" size={20} /> İşleniyor...</>
            ) : (
              'Ödemeyi Onayla ve Aktar'
            )}
          </button>
        )}
      </div>
    </BaseModal>
  );
};

export default EscrowReleaseModal;
