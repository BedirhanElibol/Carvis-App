import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";

const LandingScreen = () => {
  const { t, openModal, language, toggleLanguage, theme, toggleTheme } = useUI();
  const { currentUser, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  // Search, Location & Map Interaction States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("istanbul");
  const [hoveredPin, setHoveredPin] = useState(null);

  const handleGuestEntry = (query = "", city = "istanbul") => {
    loginAsGuest();
    navigate("/application/home", { state: { searchQuery: query, selectedCity: city } });
  };

  useEffect(() => {
    if (currentUser && !currentUser.isAnonymous) {
      if (currentUser.role === "admin") {
        navigate("/admin/dashboard");
      } else if (["parking", "valet", "mechanic", "parts"].includes(currentUser.role)) {
        navigate("/partner/dashboard");
      } else {
        navigate("/application/home");
      }
    }
  }, [currentUser, navigate]);


  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white overflow-x-hidden font-sans relative selection:bg-teal-500/30">
      
      {/* Dynamic Glow Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[5%] right-[10%] w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[15%] left-[5%] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[130px] animate-liquid"></div>
        <div className="absolute top-[40%] left-[25%] w-[550px] h-[550px] bg-orange-500/5 rounded-full blur-[140px] animate-pulse"></div>
      </div>

      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }}
      ></div>

      {/* Floating Glass Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto">
        <div className="w-full bg-white/75 dark:bg-[#0a0f1d]/75 backdrop-blur-xl border border-black/10 dark:border-white/10 px-4 md:px-8 py-3.5 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-black/50 dark:shadow-black/50">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <img
              src={logo}
              alt="Rapidsy Logo"
              className="h-8 md:h-12 w-auto object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/10 dark:bg-white/10 active:scale-95 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
            >
              <Icons.Globe size={18} />
              <span className="absolute bottom-1.5 text-[6px] font-black tracking-widest text-teal-400">
                {language?.toUpperCase()}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/10 dark:bg-white/10 active:scale-95 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
              title={theme === "dark" ? "Aydınlık Mod" : "Karanlık Mod"}
            >
              {theme === "dark" ? (
                <Icons.Sun size={18} className="text-amber-400" />
              ) : (
                <Icons.Moon size={18} className="text-slate-600 dark:text-slate-400" />
              )}
            </button>

            {/* Seller/Partner Page link */}
            <button
              onClick={() => navigate("/partner-login")}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-black/10 dark:bg-white/10 active:scale-95 transition-all"
            >
              <Icons.Store size={14} className="text-orange-400" />
              {t.becomePartner || "Partner Girişi"}
            </button>

            {/* Login button */}
            <button
              onClick={() => openModal("login", "customer")}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
            >
              {t.loginTitle || "Giriş Yap"}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Scrollable Area */}
      <div className="relative z-10 pt-28 md:pt-36 flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="w-full max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
          {/* Subtle tag badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md mb-6 shadow-inner"
          >
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
              ⚡ TÜRKİYE'NİN İLK YENİ NESİL OTO PLATFORMU
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-7xl font-black tracking-tight uppercase max-w-4xl leading-[1.05] mb-6"
          >
            TÜRKİYE'NİN AKILLI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-500 to-orange-400 drop-shadow-[0_0_30px_rgba(20,184,166,0.2)]">
              OTO ASİSTANI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-slate-500 dark:text-slate-400 font-medium text-center max-w-2xl text-base md:text-xl tracking-tight leading-relaxed mb-8"
          >
            Teklif toplama, parça tedariği, akıllı arıza tespiti ve usta randevuları artık tek çatı altında. Rapidsy ile aracınızı cebinizden kolayca yönetin.
          </motion.p>

          {/* Hero Search Panel (Mindbody Inspired) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-4xl mx-auto px-2 md:px-0 mb-10"
          >
            <div className="bg-white/90 dark:bg-[#0a0f24]/90 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-3xl p-3 md:p-4 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-3 relative z-20">
              
              {/* Search Query Input */}
              <div className="flex-1 relative group">
                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-teal-400 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Hangi hizmeti arıyorsunuz? (Örn: Periyodik Bakım)" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#030712] border border-black/10 dark:border-white/10 rounded-2xl py-4.5 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Location Selector */}
              <div className="w-full md:w-[240px] relative group">
                <Icons.MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-orange-400 transition-colors" size={20} />
                <select 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#030712] border border-black/10 dark:border-white/10 rounded-2xl py-4.5 pl-12 pr-10 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="istanbul">İstanbul</option>
                  <option value="ankara">Ankara</option>
                  <option value="izmir">İzmir</option>
                </select>
                <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
              </div>

              {/* Search Button */}
              <button
                onClick={() => handleGuestEntry(searchQuery, searchLocation)}
                className="w-full md:w-auto px-8 py-4.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-none shrink-0 group"
              >
                HİZMET BUL
                <Icons.ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

            </div>

            {/* Quick Categories below search */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-6">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mr-2">POPÜLER:</span>
              {[
                { name: "Oto Servis", icon: Icons.Wrench, color: "text-teal-400" },
                { name: "Vale Hizmeti", icon: Icons.Key, color: "text-amber-400" },
                { name: "Parça Marketi", icon: Icons.Package, color: "text-emerald-400" },
                { name: "Yol Yardım", icon: Icons.AlertTriangle, color: "text-rose-400" }
              ].map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleGuestEntry(cat.name, searchLocation)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-black/5 dark:border-white/5 hover:border-black/20 dark:border-white/20 transition-all cursor-pointer group"
                >
                  <cat.icon size={12} className={cat.color} />
                  <span className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:text-white">{cat.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* INTERACTIVE MAP PREVIEW (Nearby Providers with Hover Pins) */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-24 relative">
          <div className="text-center mb-12">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-orange-400">RAPIDSY AĞI</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight uppercase">
              ÇEVRENİZDEKİ NOKTALAR
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-4 text-sm md:text-base leading-relaxed">
              Rapidsy sadece uygulamanızda değil, şehrinizin her yerinde. Onaylı servis noktaları her zaman yakınınızda.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 h-[600px] w-full">
            {/* Left Column: Provider Cards */}
            <div className="w-full lg:w-[400px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { id: "pin-1", name: "Maslak Pro Servis", type: "Oto Servis", dist: "1.2 km", rating: 4.9 },
                { id: "pin-2", name: "Borusan Oto Maslak", type: "Yetkili Servis", dist: "2.4 km", rating: 4.8 },
                { id: "pin-3", name: "Ostim Yıldız Otomotiv", type: "Oto Servis", dist: "3.1 km", rating: 4.8 },
                { id: "pin-4", name: "Express Vale", type: "Vale Hizmeti", dist: "0.5 km", rating: 5.0 },
              ].map((prov, i) => (
                <div 
                  key={i}
                  onMouseEnter={() => setHoveredPin(prov.id)}
                  onMouseLeave={() => setHoveredPin(null)}
                  onClick={() => openModal("login", "customer")}
                  className={`bg-white/80 dark:bg-[#0a0f24]/80 border ${hoveredPin === prov.id ? 'border-orange-500/50 bg-black/10 dark:bg-white/10' : 'border-black/5 dark:border-white/5 hover:border-black/20 dark:border-white/20'} p-5 rounded-3xl transition-all cursor-pointer group flex flex-col gap-3 shadow-xl backdrop-blur-md`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-tight text-sm group-hover:text-orange-400 transition-colors">{prov.name}</h4>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-1">{prov.type}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg border border-black/5 dark:border-white/5">
                      <Icons.Star size={10} className="text-yellow-400 fill-yellow-400" />
                      {prov.rating}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{prov.dist}</span>
                    <button className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:text-white flex items-center gap-1 transition-colors">
                      İNCELE <Icons.ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Interactive SVG Map */}
            <div className="flex-1 bg-slate-50 dark:bg-[#050814] border border-black/10 dark:border-white/10 rounded-[2.5rem] relative overflow-hidden shadow-2xl flex items-center justify-center p-4">
              {/* Map background grid/texture */}
              <div 
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: "40px 40px"
                }}
              ></div>
              
              {/* Simulated Map Paths */}
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 100 0 Q 150 150 300 200 T 500 400" stroke="white" strokeWidth="2" fill="none" />
                <path d="M 0 300 Q 200 250 400 300 T 800 150" stroke="white" strokeWidth="4" fill="none" />
                <path d="M 400 0 L 400 600" stroke="white" strokeWidth="1" strokeDasharray="5,5" fill="none" />
              </svg>

              {/* Central pulsing user location */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.8)] z-10">
                <div className="absolute inset-0 w-full h-full rounded-full bg-teal-400 animate-ping opacity-75"></div>
              </div>
              <span className="absolute top-[calc(50%+12px)] left-1/2 -translate-x-1/2 text-[9px] font-black text-teal-400 uppercase tracking-widest mt-2">KONUMUNUZ</span>

              {/* Pins overlay */}
              {[
                { id: "pin-1", top: "25%", left: "30%", color: "bg-orange-500" },
                { id: "pin-2", top: "35%", left: "60%", color: "bg-blue-500" },
                { id: "pin-3", top: "70%", left: "45%", color: "bg-emerald-500" },
                { id: "pin-4", top: "60%", left: "75%", color: "bg-amber-500" },
              ].map((pin, i) => (
                <div 
                  key={i}
                  className={`absolute w-6 h-6 rounded-full ${pin.color} border-2 border-white dark:border-[#050814] shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 flex items-center justify-center cursor-pointer z-20 ${hoveredPin === pin.id ? 'scale-150 z-30 ring-4 ring-black/10 dark:ring-white/20' : 'scale-100 hover:scale-125'}`}
                  style={{ top: pin.top, left: pin.left }}
                  onMouseEnter={() => setHoveredPin(pin.id)}
                  onMouseLeave={() => setHoveredPin(null)}
                >
                  <Icons.MapPin size={12} className="text-slate-900 dark:text-white" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW RAPIDSY WORKS (3-Step Stepper) */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-28">
          <div className="bg-white/60 dark:bg-[#0a0f24]/60 border border-black/5 dark:border-white/5 rounded-[3rem] p-10 md:p-16 space-y-12 relative overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-400">NASIL ÇALIŞIR?</span>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-3 uppercase tracking-tight">3 Adımda Kolayca Yönetin</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mt-12">
              <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-0.5 bg-black/10 dark:bg-white/10 pointer-events-none z-0"></div>
              {[
                { step: "01", title: "İhtiyacını Belirt", desc: "Arama kutusundan veya yapay zeka asistanımızla aracınızın ihtiyacını belirtin.", icon: Icons.Search, color: "from-teal-500 to-blue-500" },
                { step: "02", title: "Teklifleri İncele", desc: "Bulunduğunuz konuma en yakın onaylı servislerden anında fiyat ve teklif alın.", icon: Icons.List, color: "from-blue-500 to-cyan-500" },
                { step: "03", title: "Güvenle Randevu Al", desc: "Teklifleri karşılaştırın, size en uygun olanı seçip güvenli ödeme ile randevunuzu kesinleştirin.", icon: Icons.CalendarCheck, color: "from-cyan-500 to-emerald-500" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center relative z-10 group">
                  <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${item.color} text-slate-900 dark:text-white flex items-center justify-center shadow-2xl group-hover:-translate-y-2 transition-transform duration-300 mb-6 border border-black/10 dark:border-white/10`}>
                    <item.icon size={32} />
                  </div>
                  <div className="space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[9px] font-mono font-black text-slate-600 dark:text-slate-300 tracking-widest uppercase">ADIM {item.step}</span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-[260px] mx-auto">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS / TRUST SIGNALS */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-24">
          <div className="bg-gradient-to-r from-white to-slate-50 dark:from-[#070b19] dark:to-[#0a1024] border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                  10k+
                </span>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-2">Aktif Araç</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-orange-400">
                  500+
                </span>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-2">Onaylı Usta & Servis</p>
              </div>

              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-500">
                  %99.8
                </span>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-2">Güvenli Ödeme</p>
              </div>

              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500">
                  24/7
                </span>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-2">Yapay Zeka Teşhisi</p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM BUSINESS PORTAL CTA */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-28 text-center relative">
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-white to-slate-50 dark:from-[#090e21] dark:to-[#040713] border border-black/10 dark:border-white/10 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
              <span className="text-orange-400 text-xs font-black uppercase tracking-widest mb-4">
                İŞLETMENİZ İÇİN RAPIDSY
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                OTO SERVİSİNİZİ VE MAĞAZANIZI DİJİTALLEŞTİRİN
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed mb-8">
                Parça satıcısı, vale firması, otopark işletmecisi veya usta olun; Rapidsy Business ile işlerinizi, tekliflerinizi ve faturalarınızı tek tıkla yönetmeye başlayın.
              </p>
              
              <button
                onClick={() => navigate("/partner-login")}
                className="group px-8 py-4.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-none"
              >
                <Icons.Store size={18} className="text-orange-100 group-hover:rotate-6 transition-transform" />
                İşletmenizi Kaydedin
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="w-full border-t border-black/5 dark:border-white/5 py-12 bg-slate-100 dark:bg-[#02050c]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Rapidsy Logo" className="h-6 md:h-8 w-auto object-contain" />
              <span className="text-slate-400 text-sm font-medium ml-2">© 2026</span>
            </div>
            
            <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
              <a href="/privacy-policy" className="hover:text-slate-900 dark:text-white transition-colors">Gizlilik Politikası</a>
              <span>•</span>
              <a href="#" onClick={(e) => { e.preventDefault(); openModal("kvkk"); }} className="hover:text-slate-900 dark:text-white transition-colors">KVKK Metni</a>
              <span>•</span>
              <span className="text-slate-600">v2.5.0-premium</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
};

export default LandingScreen;
