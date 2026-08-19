import React from "react";
import { Search, PenTool, ShieldCheck } from "lucide-react";

const LandingHowItWorks = ({ language }) => {
  return (
    <section className="w-full bg-slate-50 dark:bg-transparent transition-colors duration-500 py-24 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        
        <h2 className="text-3xl md:text-[40px] font-bold text-slate-900 dark:text-white tracking-tight mb-4">
          {language === "tr" 
            ? "Talepten Teslimata Dakikalar İçinde" 
            : "From Request to Delivery in Minutes"}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-20 max-w-2xl mx-auto">
          {language === "tr" 
            ? "Carvis, aracınız ile profesyonel ustalar arasındaki en güvenilir köprüdür." 
            : "Carvis is the most reliable bridge between your car and professional mechanics."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Decorative curved line behind the icons (desktop only) */}
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-slate-300 dark:via-white/10 to-transparent z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center relative z-10">
            {/* Top Icon */}
            <div className="w-16 h-16 rounded-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 flex items-center justify-center mb-8 shadow-sm dark:shadow-xl transition-colors">
              <Search className="text-blue-500 dark:text-blue-400" size={28} />
            </div>
            
            {/* Content Card */}
            <div className="bg-white dark:bg-[#0f1423] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-2xl p-8 text-left w-full flex-1 transition-colors">
              <h3 className="text-[17px] font-bold text-slate-900 dark:text-white mb-3">
                {language === "tr" ? "1. Talebinizi Oluşturun" : "1. Create Request"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-[14px] leading-relaxed">
                {language === "tr" 
                  ? "Aracınızın şase numarasını ve şikayetini girin. Özel bir açıklama yazmanıza veya uzun menülerden seçim yapmanıza gerek yok, sadece yazın." 
                  : "Enter your VIN and the issue. No need to write special descriptions or navigate long menus, just type."}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center relative z-10">
            {/* Top Icon */}
            <div className="w-16 h-16 rounded-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 flex items-center justify-center mb-8 shadow-sm dark:shadow-xl transition-colors">
              <PenTool className="text-blue-500 dark:text-blue-400" size={28} />
            </div>
            
            {/* Content Card */}
            <div className="bg-white dark:bg-[#0f1423] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-2xl p-8 text-left w-full flex-1 transition-colors">
              <h3 className="text-[17px] font-bold text-slate-900 dark:text-white mb-3">
                {language === "tr" ? "2. Rekabetçi Teklifleri Görün" : "2. See Competitive Bids"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-[14px] leading-relaxed">
                {language === "tr" 
                  ? "Bölgenizdeki ustalar anında talebinizi görür ve orijinal/muadil parça ile işçilik fiyatlarını kırarak size şeffaf teklifler sunar." 
                  : "Mechanics in your area instantly see your request and provide transparent bids broken down by OEM/aftermarket parts and labor."}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center relative z-10">
            {/* Top Icon */}
            <div className="w-16 h-16 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center mb-8 dark:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-colors">
              <ShieldCheck className="text-white dark:text-black" size={28} />
            </div>
            
            {/* Content Card */}
            <div className="bg-white dark:bg-[#0f1423] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-2xl p-8 text-left w-full flex-1 transition-colors">
              <h3 className="text-[17px] font-bold text-slate-900 dark:text-white mb-3">
                {language === "tr" ? "3. Seç ve Güvenle Öde" : "3. Choose & Pay Securely"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-[14px] leading-relaxed">
                {language === "tr" 
                  ? "Bütçenize uygun teklifi seçin. Havuz ödeme sistemimiz sayesinde, aracınız teslim edilene kadar paranız ustaya geçmez." 
                  : "Choose the bid that fits your budget. Thanks to our escrow system, your money is held until your car is delivered."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
