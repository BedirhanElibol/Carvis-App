import React, { memo } from "react";
import { Star, CheckCircle2 } from "lucide-react";

const FeatureReviews = memo(({ language }) => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-16">
      {/* Left: Graphic mockup of Verified Reviews */}
      <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-teal-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
          <div>
            <span className="text-[8px] font-black text-teal-400 tracking-wider uppercase">{language === "tr" ? "SADECE GERÇEK DENEYİMLER" : "ONLY REAL EXPERIENCES"}</span>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {language === "tr" ? "DOĞRULANMIŞ USTA YORUMLARI" : "VERIFIED MECHANIC REVIEWS"}
            </h4>
          </div>
          <Star className="text-teal-400" size={18} />
        </div>

        {/* Reviews Mockup */}
        <div className="space-y-4 text-left">
          {/* Review 1 */}
          <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-md relative">
            <span className="absolute top-0 right-0 bg-teal-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg rounded-tr-xl">
              {language === "tr" ? "Doğrulanmış Müşteri" : "Verified Customer"}
            </span>
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium mb-2">
              {language === "tr"
                ? "Sanayide her gidişimde ekstra masraf çıkıyordu. Rapidsy üzerinden Maslak Pro'ya gittim, baştan ne dedilerse havuzdan o çekildi. Harika sistem."
                : "I used to get extra charges every time I visited a shop. Used Maslak Pro via Rapidsy, escrow paid exactly what was agreed upfront. Great system."}
            </p>
            <span className="text-[8px] font-black text-slate-400 uppercase">— Ahmet K. (Fiat Egea Sahibi)</span>
          </div>

          {/* Review 2 */}
          <div className="bg-white/50 dark:bg-[#070b18]/50 border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-inner relative opacity-90">
            <span className="absolute top-0 right-0 bg-teal-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg rounded-tr-xl">
              {language === "tr" ? "Doğrulanmış Müşteri" : "Verified Customer"}
            </span>
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium mb-2">
              {language === "tr"
                ? "Kadın bir sürücü olarak sanayiye gitmekten çekiniyordum. Rapidsy puanlarına bakarak seçim yaptım, çok saygılı ve dürüst hizmet aldım."
                : "As a woman driver, I hesitated going to mechanics. Chose based on Rapidsy ratings, received very respectful and honest service."}
            </p>
            <span className="text-[8px] font-black text-slate-400 uppercase">— Ayşe Y. (Renault Clio Sahibi)</span>
          </div>
        </div>
      </div>

      {/* Left: Pitch copy */}
      <div className="w-full lg:w-1/2 space-y-6 text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[9px] font-black text-teal-400 tracking-widest uppercase">
          {language === "tr" ? "SAHTE YORUMLARA YER YOK" : "NO FAKE REVIEWS"}
        </span>
        <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
          {language === "tr" ? "USTANIZI GERÇEK MÜŞTERİ DENEYİMLERİYLE SEÇİN" : "CHOOSE YOUR MECHANIC BASED ON REAL EXPERIENCES"}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
          {language === "tr"
            ? "Google Haritalar'daki sahte, satın alınmış usta yorumlarına güvenmeyin. Rapidsy'deki bir ustaya yorum yapabilmek için o ustanın Rapidsy üzerinden gerçekten hizmet vermiş ve havuz ödemesinin gerçekleşmiş olması gerekir. Sadece %100 doğrulanmış, faturası kesilmiş hizmetlerin yorumlarını okursunuz."
            : "Don't trust fake purchased reviews on Google Maps. To review a mechanic on Rapidsy, the service must be completed and paid through our escrow system. You only read 100% verified, invoiced real experiences."}
        </p>
        <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
            <span>{language === "tr" ? "Sadece İşlem Yaptırmış Müşterilerin Gerçek Yorumları" : "Only Real Reviews from Customers Who Completed Services"}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
            <span>{language === "tr" ? "Kalite Standartlarını Karşılamayan Ustaların Sistemden Çıkarılması" : "Removal of Mechanics Who Fail Quality Standards"}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
            <span>{language === "tr" ? "Araba Modeline Göre Filtrelenebilen Şeffaf Deneyimler" : "Transparent Experiences Filterable by Car Model"}</span>
          </li>
        </ul>
      </div>
    </div>
  );
});

FeatureReviews.displayName = 'FeatureReviews';
export default FeatureReviews;
