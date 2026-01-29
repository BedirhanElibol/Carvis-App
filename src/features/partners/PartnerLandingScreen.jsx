import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Key, Wrench, Package, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RoleCard = ({ title, icon: Icon, color, desc, onClick }) => {
    // Dynamic color classes based on the 'color' prop
    const colorMap = {
        cyan: 'border-cyan-500/30 hover:border-cyan-400 bg-cyan-500/10 text-cyan-400',
        amber: 'border-amber-500/30 hover:border-amber-400 bg-amber-500/10 text-amber-400',
        orange: 'border-orange-500/30 hover:border-orange-400 bg-orange-500/10 text-orange-400',
        purple: 'border-purple-500/30 hover:border-purple-400 bg-purple-500/10 text-purple-400',
    };

    const themeClass = colorMap[color] || colorMap.cyan;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`cursor-pointer rounded-2xl border backdrop-blur-xl p-6 transition-all duration-300 flex flex-col justify-between h-48 ${themeClass}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-black/20">
                    <Icon size={32} />
                </div>
                <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
                <h3 className="text-2xl font-bold font-outfit text-white mb-1">{title}</h3>
                <p className="text-sm text-white/60 font-inter">{desc}</p>
            </div>
        </motion.div>
    );
};

const PartnerLandingScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="z-10 w-full max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-black font-outfit text-white mb-6 tracking-tight">
                        CARVIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">ENTERPRISE</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-inter">
                        İşletmeniz için tasarlanmış profesyonel yönetim paneli. Devam etmek için lütfen hizmet türünüzü seçin.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <RoleCard
                        title="Otopark"
                        desc="Kapasite, Tarife ve Doluluk Yönetimi"
                        icon={Car}
                        color="cyan"
                        onClick={() => navigate('/partner-login/parking')}
                    />
                    <RoleCard
                        title="Vale"
                        desc="Çağrı Karşılama ve Teslimat Takibi"
                        icon={Key}
                        color="amber"
                        onClick={() => navigate('/partner-login/valet')}
                    />
                    <RoleCard
                        title="Usta & Servis"
                        desc="Randevu, İş Emri ve Bakım Kartları"
                        icon={Wrench}
                        color="orange"
                        onClick={() => navigate('/partner-login/mechanic')}
                    />
                    <RoleCard
                        title="Parça Satıcısı"
                        desc="Stok, Sipariş ve Ürün Yönetimi"
                        icon={Package}
                        color="purple"
                        onClick={() => navigate('/partner-login/parts')}
                    />
                </div>

                <div className="mt-12 text-center">
                    <button onClick={() => navigate('/')} className="text-slate-500 hover:text-white transition-colors text-sm">
                        ← Müşteri Girişine Dön
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartnerLandingScreen;
