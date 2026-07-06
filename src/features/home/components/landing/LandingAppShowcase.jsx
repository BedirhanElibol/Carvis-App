import React, { memo } from "react";
import { Car, Clock, Wrench, ChevronRight, SearchCheck, FileText, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingAppShowcase = memo(({t, language}) => {
  return (
    <>
        {/* INTERACTIVE APP SHOWCASE (Görsel Tanıtım Kokpiti) */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-28 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-teal-500">
              {language === "tr" ? "BENZERSİZ TEKNOLOJİ" : "UNIQUE TECHNOLOGY"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight uppercase">
              {language === "tr" ? "ARACINIZIN TÜM YAŞAM DÖNGÜSÜ TEK BİR PANELDE" : "EVERYTHING ABOUT YOUR VEHICLE IN ONE PANEL"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mt-4 text-sm md:text-base font-semibold leading-relaxed">
              {language === "tr" 
                ? "Carvis, dükkan dükkan gezmeden arıza bildirimi yapıp teklifleri karşılaştırdığınız, yedek parçaları listelediğiniz ve servis sürecinizi yönettiğiniz dijital kokpitinizdir."
                : "Carvis is your digital cockpit where you report faults, compare quotes, list spare parts, and manage your service history without visiting shops."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: App Screen Mockup (Sanal Kokpit) */}
            <div className="lg:col-span-7 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-emerald-500/20 rounded-[3rem] p-6 md:p-10 shadow-2xl dark:shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-teal-500/10 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              {/* Virtual App Header */}
              <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg text-white font-black text-xs">
                    C
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">CARVIS MOBİL KOKPİT</h4>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {language === "tr" ? "ARAÇ ASİSTANI AKTİF" : "VEHICLE ASSISTANT ACTIVE"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 px-2.5 py-1 rounded-xl text-slate-500">
                  v2.5
                </span>
              </div>

              {/* Grid inside Virtual App */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                
                {/* Panel 1: Akıllı Garaj / Araç Kartı */}
                <div className="bg-white/80 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-3xl p-5 shadow-lg backdrop-blur-xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">GARAJIM / MEVCUT ARAÇ</span>
                    <Car className="text-teal-400" size={16} />
                  </div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">FIAT EGEA 1.4 FIRE</h4>
                  <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5">34 ABC 123 • 42,500 KM</p>
                  
                  {/* Maintenance Progress Bar */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-black">
                      <span className="text-slate-500">{language === "tr" ? "PERİYODİK BAKIMA KALAN" : "NEXT SERVICE IN"}</span>
                      <span className="text-orange-500">2,500 KM</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>

                  {/* Vehicle Log Items */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold py-1 border-b border-black/5 dark:border-white/5">
                      <span className="text-slate-500">{language === "tr" ? "Tahmini Yakıt Ort." : "Est. Fuel Avg"}</span>
                      <span className="text-blue-500 font-black">6.8 L/100km</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold py-1">
                      <span className="text-slate-500">{language === "tr" ? "Sonraki Muayene" : "Next Inspection"}</span>
                      <span className="text-emerald-500 font-black">12 Ekim 2026</span>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Aktif Servis Talepleri */}
                <div className="bg-white/80 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-3xl p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                        {language === "tr" ? "AKTİF TALEPLER / DURUM" : "ACTIVE REQUESTS / STATUS"}
                      </span>
                      <Clock className="text-amber-500" size={16} />
                    </div>
                    <div className="space-y-3.5 mt-2">
                      <div className="p-3 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl text-left">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {language === "tr" ? "Balata Değişimi" : "Brake Pad Replacement"}
                          </span>
                          <span className="text-[8px] font-black tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                            {language === "tr" ? "Teklifler Alındı" : "Quotes Received"}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold">{language === "tr" ? "Ön disk ve balata kontrolü/değişimi" : "Front disc & pad inspection"}</p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl text-left opacity-75">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {language === "tr" ? "Yağ & Filtre Bakımı" : "Oil & Filter Change"}
                          </span>
                          <span className="text-[8px] font-black tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                            {language === "tr" ? "Tamamlandı" : "Completed"}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold">{language === "tr" ? "10,000 km periyodik bakım seti" : "10,000 km periodic service kit"}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini action badge */}
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[9px] font-black text-amber-500">
                    <span>{language === "tr" ? "TEKLİFLERİ KARŞILAŞTIR" : "COMPARE QUOTES"}</span>
                    <ChevronRight size={10} />
                  </div>
                </div>

                {/* Panel 3: Buy Box Yedek Parça */}
                <div className="md:col-span-2 bg-white/80 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-3xl p-5 shadow-lg backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Wrench size={24} className="text-amber-500" />
                    </div>
                    <div className="text-left">
                      <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        🏆 BUY BOX EN UYGUN TEKLİF
                      </span>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight mt-1">
                        {language === "tr" ? "Fren Disk & Balata Takımı" : "Brake Disc & Pad Kit"}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold">{language === "tr" ? "Orijinal Yedek Parça + Garantili Montaj Dahil" : "OEM Spare Parts + Guaranteed Installation"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-black/5 dark:border-white/5">
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">TOPLAM TUTAR</span>
                      <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">₺2.450</div>
                    </div>
                    <button 
                      onClick={() => navigate("/application/home")}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 cursor-pointer border-none"
                    >
                      {language === "tr" ? "ONAYLA VE AL" : "CONFIRM & GET"}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Feature Highlights (Güzellemeler) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {[
                {
                  icon: SearchCheck,
                  title: language === "tr" ? "Teklif Karşılaştırın, Tasarruf Edin" : "Compare Quotes, Save Money",
                  desc: language === "tr" 
                    ? "Aracınızın hasarı veya periyodik bakımı için onlarca servise gitmeyin. Carvis, yakınınızdaki onaylı dükkanlardan anında fiyat teklifi toplar. Fiyatları, puanları ve garanti sürelerini tek ekrandan şeffafça karşılaştırın."
                    : "Don't visit dozens of mechanics for car repair. Carvis gathers instant price quotes from verified local shops. Compare prices, ratings, and warranty periods transparently from one single dashboard.",
                  color: "text-teal-400 bg-teal-400/10 border-teal-500/10",
                  highlight: language === "tr" ? "Yarı Yarıya Tasarruf" : "Save Up To 50%"
                },
                {
                  icon: FileText,
                  title: language === "tr" ? "Dijital Arıza Bildirimi ve Takibi" : "Digital Fault Reporting & Tracking",
                  desc: language === "tr" 
                    ? "Aracınızda oluşan hasar, arıza veya bakım ihtiyaçlarını sisteme girin. Parça veya detayları ekleyerek servislerin durumu doğrudan anlamasını sağlayın ve nokta atışı teklifler toplayın."
                    : "Report vehicle damage, faults, or service needs online. Add parts or notes to let local mechanics understand your issue immediately and send highly accurate quotes.",
                  color: "text-cyan-400 bg-cyan-400/10 border-cyan-500/10",
                  highlight: language === "tr" ? "Kolay Talep Takibi" : "Easy Request Tracking"
                },
                {
                  icon: Lock,
                  title: language === "tr" ? "Sürpriz Maliyet Yok, Carvis Güvencesi" : "No Surprise Costs, Carvis Guarantee",
                  desc: language === "tr" 
                    ? "Sanayi dükkanlarında sürpriz ek masraflarla veya fahiş fiyatlarla karşılaşmaya son. Hizmet bedeli siz işi onaylayana kadar güvenli havuz hesabımızda tutulur. İş bittiğinde, usta onaylandığında ödeme aktarılır."
                    : "No more unexpected extra costs or inflated bills at repair shops. The service fee is held securely in our escrow account until you approve the job. Payment is released only when you confirm satisfaction.",
                  color: "text-orange-400 bg-orange-400/10 border-orange-500/10",
                  highlight: language === "tr" ? "%100 Güvenli Havuz Ödemesi" : "100% Escrow Protection"
                }
              ].map((val, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-emerald-500/10 hover:border-slate-300 dark:hover:border-emerald-500/40 rounded-3xl p-6 transition-all hover:translate-x-1 duration-300 flex items-start gap-4 relative overflow-hidden backdrop-blur-md dark:shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                >
                  <div className={`w-12 h-12 rounded-2xl ${val.color} border flex items-center justify-center shrink-0`}>
                    <val.icon size={22} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{val.title}</h4>
                      <span className="text-[8px] font-black tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full uppercase">
                        {val.highlight}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {val.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

    </>
  );
});

LandingAppShowcase.displayName = 'LandingAppShowcase';
export default LandingAppShowcase;
