import React from "react";
import { Wrench, PiggyBank, FileCheck2, ArrowRight } from "lucide-react";

const LandingMechanicBidding = ({ language }) => {
  return (
    <section className="relative w-full py-24 md:py-32 bg-[#030712] overflow-hidden flex flex-col items-center">
      
      {/* Structural Minimal Lines */}
      <div className="absolute top-0 w-full h-[1px] bg-white/5"></div>
      
      <div className="max-w-7xl mx-auto w-full px-6 relative z-10">
        
        {/* Header Section */}
        <div className="mb-20 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-6">
              {language === "tr" ? "ARACINIZ İÇİN" : "FOR YOUR CAR,"} <br/>
              <span className="text-cyan-400">{language === "tr" ? "REKABETÇİ VE ŞEFFAF" : "COMPETITIVE & TRANSPARENT"}</span> <br/>
              {language === "tr" ? "PİYASA." : "MARKET."}
            </h2>
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
              {language === "tr" 
                ? "Kapalı kapılar ardındaki fahiş fiyatlar bitti. Arızanızı veya bakım ihtiyacınızı sisteme girin, bölgenizdeki ustalar size fiyat versin. Karar tamamen sizin." 
                : "No more hidden costs behind closed doors. Enter your repair need, let local mechanics bid on it. The decision is entirely yours."}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-cyan-500 font-bold uppercase tracking-widest text-sm">
            <span>{language === "tr" ? "SİSTEM NASIL ÇALIŞIR?" : "HOW IT WORKS?"}</span>
            <ArrowRight size={20} />
          </div>
        </div>

        {/* 3-Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="bg-[#0a0f24]/50 border border-white/5 hover:border-cyan-500/30 transition-colors p-8 rounded-2xl flex flex-col gap-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-9xl font-black text-white/[0.02] -translate-y-10 group-hover:text-cyan-500/[0.05] transition-colors pointer-events-none">
              1
            </div>
            <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center rounded-xl">
              <FileCheck2 size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">
                {language === "tr" ? "Talebi Oluştur" : "Create Request"}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {language === "tr" 
                  ? "Aracınızın plakasını veya şasesini girin. Bakım, onarım veya tespit ihtiyacınızı detaylandırın." 
                  : "Enter your license plate or VIN. Detail your maintenance, repair, or diagnostic needs."}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0a0f24]/50 border border-white/5 hover:border-cyan-500/30 transition-colors p-8 rounded-2xl flex flex-col gap-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-9xl font-black text-white/[0.02] -translate-y-10 group-hover:text-cyan-500/[0.05] transition-colors pointer-events-none">
              2
            </div>
            <div className="w-14 h-14 bg-white/5 border border-white/10 text-white flex items-center justify-center rounded-xl">
              <Wrench size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">
                {language === "tr" ? "Fiyat Topla" : "Collect Bids"}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {language === "tr" 
                  ? "Bölgenizdeki denetlenmiş servisler sadece işçilik ve orjinal parça üzerinden şeffaf fiyatlarını iletsin." 
                  : "Vetted services in your area submit their transparent prices strictly based on labor and original parts."}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0a0f24]/50 border border-white/5 hover:border-cyan-500/30 transition-colors p-8 rounded-2xl flex flex-col gap-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-9xl font-black text-white/[0.02] -translate-y-10 group-hover:text-cyan-500/[0.05] transition-colors pointer-events-none">
              3
            </div>
            <div className="w-14 h-14 bg-white/5 border border-white/10 text-white flex items-center justify-center rounded-xl">
              <PiggyBank size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">
                {language === "tr" ? "Güvenle Onayla" : "Approve Securely"}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {language === "tr" 
                  ? "En mantıklı teklifi seçin. Tutar havuz hesabında bloke edilir, iş bitmeden kimseye aktarılmaz." 
                  : "Choose the most logical bid. The amount is blocked in an escrow account, not transferred until the job is done."}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default LandingMechanicBidding;
