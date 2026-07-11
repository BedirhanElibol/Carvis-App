import React, { memo } from "react";
import { Layers, Star, Package, CheckCircle2 } from "lucide-react";

const FeatureMechanics = memo(({ language }) => {
  return (
    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
      {/* Right: Graphic mockup of quotes and compatible parts */}
      <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
          <div>
            <span className="text-[8px] font-black text-amber-500 tracking-wider uppercase">{language === "tr" ? "ŞEFFAF FİYAT TAHMİNİ & ONAY" : "TRANSPARENT ESTIMATES & APPROVAL"}</span>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {language === "tr" ? "USTA TEKLİFLERİ & ŞEFFAF KEŞİF" : "MECHANIC QUOTES & DISCOVERY"}
            </h4>
          </div>
          <Layers className="text-amber-500" size={18} />
        </div>

        {/* Service Request Card */}
        <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 mb-4 shadow-md text-left">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">{language === "tr" ? "FİYAT TEKLİFİ ALINAN HİZMET" : "REQUESTED SERVICE"}</span>
          <div className="flex justify-between items-center">
            <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase">Fiat Egea • 10.000 KM Bakımı</h5>
            <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">{language === "tr" ? "3 Teklif" : "3 Quotes"}</span>
          </div>
        </div>

        {/* Quotes Comparison list */}
        <div className="space-y-2 mb-4 text-left">
          <div className="flex justify-between items-center p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div>
              <span className="text-[9px] font-black text-slate-900 dark:text-white">Maslak Pro Servis</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[8px] font-bold text-slate-500">4.9 (124 yorum)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit ml-auto mb-1">{language === "tr" ? "En İyi Teklif" : "Best Offer"}</span>
              <span className="text-xs font-mono font-black text-teal-400">₺2.100</span>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-xl opacity-75">
            <div>
              <span className="text-[9px] font-black text-slate-900 dark:text-white">Ostim Yıldız Otomotiv</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[8px] font-bold text-slate-500">4.8 (82 yorum)</span>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-slate-900 dark:text-white">₺2.400</span>
          </div>
        </div>

        {/* Compatible Parts check */}
        <div className="p-3 bg-white/50 dark:bg-[#070b18]/50 border border-black/5 dark:border-white/10 rounded-xl flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <Package className="text-slate-400" size={16} />
            <div>
              <span className="text-[9px] font-black text-slate-900 dark:text-white">{language === "tr" ? "Fil Filtre Bakım Seti" : "Fil Filter Service Kit"}</span>
              <p className="text-[8px] text-slate-500 font-bold">{language === "tr" ? "Aracınızla %100 Uyumlu OEM Parça" : "100% Compatible OEM Part"}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-black text-slate-900 dark:text-white">₺980</span>
        </div>
      </div>

      {/* Left: Pitch copy */}
      <div className="w-full lg:w-1/2 space-y-6 text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 tracking-widest uppercase">
          {language === "tr" ? "AKILLI PAZARYERİ VE SEÇİM" : "SMART MARKETPLACE & MATCH"}
        </span>
        <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
          {language === "tr" ? "USTA TEKLİFLERİ VE ONAYLI İŞLEM SÜRECİ" : "MECHANIC QUOTES & APPROVED REPAIRS"}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
          {language === "tr"
            ? "Aracınızın tamiri için dükkan dükkan gezmeyin. Rapidsy ile usta talebi oluşturarak yakınınızdaki servislerden şeffaf fiyat tahminleri toplayın. Araç başında çıkan ekstra masraflar, sizin dijital onayınız olmadan işleme alınmaz. Fiyatları, müşteri puanlarını karşılaştırın ve kontrolü elinizde tutun."
            : "Stop wandering around mechanic shops. Create a request to receive transparent estimated quotes from local mechanics. Extra costs discovered during inspection will not proceed without your digital approval. Compare ratings and keep control."}
        </p>
        <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
            <span>{language === "tr" ? "Doğrulanmış Servislerden Rekabetçi Fiyat Teklifleri" : "Competitive Price Quotes from Verified Mechanics"}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
            <span>{language === "tr" ? "Araca Özel %100 Uyumlu Yedek Parça Listeleme" : "100% Compatible Spare Parts Listed per Vehicle"}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
            <span>{language === "tr" ? "Şeffaf Puan ve Yorumlarla Karşılaştırmalı Fiyat Analizi" : "Price Analysis with Transparent Ratings & Reviews"}</span>
          </li>
        </ul>
      </div>
    </div>
  );
});

FeatureMechanics.displayName = 'FeatureMechanics';
export default FeatureMechanics;
