import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Car, Droplet, Key, Package, Wrench, ShieldAlert, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const RoleCard = ({ title, icon: Icon, color, desc, onClick }) => {
  // Glow settings based on color
  const colorMap = {
    cyan: {
      border: "border-cyan-500/20 hover:border-cyan-400/50",
      bg: "bg-cyan-500/5 hover:bg-cyan-500/10",
      text: "text-cyan-400",
      glow: "rgba(6, 182, 212, 0.15)",
      badge: "from-cyan-500 to-blue-600"
    },
    amber: {
      border: "border-amber-500/20 hover:border-amber-400/50",
      bg: "bg-amber-500/5 hover:bg-amber-500/10",
      text: "text-amber-400",
      glow: "rgba(245, 158, 11, 0.15)",
      badge: "from-amber-500 to-orange-600"
    },
    orange: {
      border: "border-orange-500/20 hover:border-orange-400/50",
      bg: "bg-orange-500/5 hover:bg-orange-500/10",
      text: "text-orange-400",
      glow: "rgba(249, 115, 22, 0.15)",
      badge: "from-orange-500 to-red-600"
    },
    emerald: {
      border: "border-emerald-500/20 hover:border-teal-400/50",
      bg: "bg-emerald-500/5 hover:bg-emerald-500/10",
      text: "text-teal-400",
      glow: "rgba(16, 185, 129, 0.15)",
      badge: "from-emerald-500 to-teal-600"
    },
    blue: {
      border: "border-blue-500/20 hover:border-blue-400/50",
      bg: "bg-blue-500/5 hover:bg-blue-500/10",
      text: "text-blue-400",
      glow: "rgba(59, 130, 246, 0.15)",
      badge: "from-blue-500 to-indigo-600"
    },
  };

  const currentTheme = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      className={`cursor-pointer rounded-[2rem] border backdrop-blur-xl p-6 transition-all duration-300 flex flex-col justify-between h-56 relative overflow-hidden group ${currentTheme.border} ${currentTheme.bg}`}
      onClick={onClick}
    >
      {/* Background glow on card hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at top left, ${currentTheme.glow}, transparent 70%)`
        }}
      ></div>

      <div className="relative z-10 flex justify-between items-start">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentTheme.badge} text-slate-900 dark:text-white shadow-lg shadow-black/20`}>
          <Icon size={26} />
        </div>
        <div className={`w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:text-white group-hover:bg-black/10 dark:bg-white/10 transition-all active:scale-90`}>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-black font-sans text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  );
};

const PartnerLandingScreen = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[130px] animate-liquid" />
      </div>

      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }}
      ></div>

      <div className="z-10 w-full max-w-6xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md mb-6 shadow-inner"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
              CARVIS BUSINESS PORTAL
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-black font-sans text-slate-900 dark:text-white mb-6 tracking-tight uppercase"
          >
            CARVIS{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 tracking-tighter ">
              ENTERPRISE
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed font-medium"
          >
            İşletmeniz için tasarlanmış profesyonel yönetim paneli. Devam etmek
            için lütfen hizmet türünüzü seçin ve oturum açın.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
        >

          <RoleCard
            title="Usta & Servis"
            desc="İş emri yönetim kartları, servis randevuları, müşteri onaylı bakım kartları."
            icon={Wrench}
            color="orange"
            onClick={() => navigate("/partner-login/mechanic")}
          />
          <RoleCard
            title="Parça Satıcısı"
            desc="Stok seviyesi güncellemeleri, yedek parça sipariş takibi ve ürün kataloğu yönetimi."
            icon={Package}
            color="emerald"
            onClick={() => navigate("/partner-login/parts")}
          />
          <RoleCard
            title="Seyyar Yıkama"
            desc="Mobil yıkama randevuları, lokasyon bazlı talepler ve hizmet paketleri yönetimi."
            icon={Droplet}
            color="cyan"
            onClick={() => navigate("/partner-login/carwash")}
          />

          <RoleCard
            title="Sigorta Şirketi"
            desc="Kasko, trafik ve roadside poliçe teklifleri yönetimi ve Rapidsy entegrasyonu."
            icon={Shield}
            color="blue"
            onClick={() => navigate("/partner-login/insurance")}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => {
              if (currentUser) {
                navigate("/application/home");
              } else {
                navigate("/");
              }
            }}
            className="text-slate-500 hover:text-slate-900 dark:text-white transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2 mx-auto cursor-pointer"
          >
            <ArrowLeft size={14} />
            Uygulamaya Geri Dön
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerLandingScreen;
