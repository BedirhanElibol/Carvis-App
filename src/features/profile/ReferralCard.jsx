import React, { useState } from 'react';
import { Gift, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { triggerHaptic } from '../../utils/haptics';

const ReferralCard = () => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [copied, setCopied] = useState(false);

  if (!currentUser || currentUser.isAnonymous) return null;

  // Generate code from user ID suffix or profile metadata
  const referralCode = currentUser.id ? `CRV-${currentUser.id.substring(0, 8).toUpperCase()}` : 'CRV-WELCOME';
  const referralLink = `https://carvis.app/join?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      triggerHaptic('light');
      showAlert("Başarılı", "Davet linki panoya kopyalandı!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showAlert("Hata", "Link kopyalanamadı.", "error");
    }
  };

  const handleShare = async () => {
    triggerHaptic('medium');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Carvis Arkadaş Daveti',
          text: `Carvis ile araç bakımını dijitalleştir, sen de kazan! Kayıt olurken davet kodumu kullan: ${referralCode}`,
          url: referralLink,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="glass-card p-6 rounded-[2.5rem] border border-primary-500/20 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent shadow-2xl relative overflow-hidden group">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl group-hover:scale-120 transition-transform"></div>
      
      <div className="flex gap-4 items-start relative z-10">
        <div className="bg-primary-500/10 p-3.5 rounded-2xl border border-primary-500/20 shadow-lg text-primary-400 group-hover:rotate-12 transition-transform">
          <Gift size={24} />
        </div>
        <div className="flex-1">
          <span className="text-[9px] font-black text-primary-400 bg-primary-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 w-fit mb-2">
            <Sparkles size={10} /> DAVET PROGRAMI
          </span>
          <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tighter leading-tight">
            Arkadaşını Davet Et, ₺100 Kazan!
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Davet linkinle üye olan her arkadaşın ilk hizmetini tamamladığında, ikiniz de <strong>₺100 Cüzdan Kredisi</strong> kazanırsınız.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 relative z-10">
        {/* Code Box */}
        <div className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
          <span>{referralCode}</span>
          <button 
            onClick={handleCopy}
            className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active-scale"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl active-scale transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary-900/10 border border-primary-500/20"
        >
          <Share2 size={14} /> Paylaş
        </button>
      </div>
    </div>
  );
};

export default ReferralCard;
