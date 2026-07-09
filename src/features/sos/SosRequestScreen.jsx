import React, { useState } from "react";
import { ArrowLeft, ShieldAlert, MapPin, Navigation, Truck, CreditCard, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { SosService } from "../../services/SosService";
import LocationMap from "../../components/ui/LocationMap";

const SosRequestScreen = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  
  const [step, setStep] = useState("location"); // location, payment, searching, found
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [price, setPrice] = useState(SosService.BASE_PRICE);
  
  // Hardcoded Istanbul location for demo
  const userLocation = { lat: 41.0082, lng: 28.9784 };

  const handleRequest = async () => {
    if (!description.trim()) {
      showAlert("Hata", "Lütfen durumunuzu kısaca açıklayın (Örn: Lastik patladı, akü bitti).", "error");
      return;
    }

    setLoading(true);
    // distanceKm is just a demo value here. In a real app, calculate route from tow truck.
    const distanceKm = 10; 
    
    const res = await SosService.requestTowTruck(
      currentUser?.id || 'demo-user-id',
      userLocation.lat,
      userLocation.lng,
      distanceKm,
      description
    );

    setLoading(false);

    if (res.success) {
      setOrderId(res.orderId);
      setPrice(res.price);
      setStep("payment");
    } else {
      showAlert("Hata", "Çekici talebi oluşturulamadı: " + res.error, "error");
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    const res = await SosService.confirmPayment(orderId);
    setLoading(false);

    if (res.success) {
      setStep("searching");
      showAlert("Ödeme Başarılı", "Tutar güvenli havuza (Escrow) alındı. Çekici aranıyor.", "success");
      
      // Simulate tow truck finding after 3 seconds
      setTimeout(() => {
        setStep("found");
      }, 3000);
    } else {
      showAlert("Ödeme Hatası", "Ödeme alınamadı: " + res.error, "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white pb-32">
      {/* Header */}
      <div className="px-6 py-4.5 flex items-center gap-4 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0f24]/80 backdrop-blur-xl sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2 text-red-500">
          <ShieldAlert size={20} />
          <h1 className="font-black text-lg tracking-tight uppercase">Acil Çekici</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-6 space-y-6 mt-4">
        
        {step === "location" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">Konumunuzu Doğrulayın</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Çekicinin size ulaşabilmesi için konumunuzu doğru seçtiğinizden emin olun.</p>
              
              <div className="h-48 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-white/10">
                <LocationMap center={userLocation} zoom={13} readOnly />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <MapPin size={32} className="text-red-500" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Araç Durumu</h2>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Örn: Aracım çalışmıyor, D-100 karayolunda sağ şeritte kaldım..."
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 min-h-[120px] focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <button 
              onClick={handleRequest}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg p-5 rounded-2xl shadow-xl shadow-red-500/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Truck />}
              Çekici Talep Et
            </button>
          </div>
        )}

        {step === "payment" && (
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
              <CreditCard size={32} />
            </div>
            <h2 className="text-2xl font-black mb-2">Güvenli Ödeme (Escrow)</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              Çekici ücretiniz Rapidsy Güvenli Havuzuna (Escrow) aktarılır. Çekici size ulaşıp aracı hedefe teslim edene kadar para çekiciye aktarılmaz. İletişim bilgileriniz ödeme sonrası paylaşılır.
            </p>
            
            <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500">Çekici Ücreti</span>
                <span className="font-bold text-xl">{price} TL</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-200 dark:border-white/10 pt-2 mt-2">
                <span>Rapidsy Komisyonu (%15)</span>
                <span>Dahildir</span>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg p-5 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Kredi Kartı İle Öde"}
            </button>
          </div>
        )}

        {step === "searching" && (
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-12 shadow-sm text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 bg-red-500/40 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Navigation size={32} className="text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-black mb-2 animate-pulse">Çekici Aranıyor...</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Ödemeniz güvenli havuza alındı. Çevrenizdeki onaylı çekicilerle iletişim kuruluyor.
            </p>
          </div>
        )}

        {step === "found" && (
          <div className="bg-white dark:bg-white/5 border border-emerald-500/30 rounded-3xl p-8 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
              <CheckCircle size={40} />
            </div>
            
            <h2 className="text-2xl font-black mb-2 text-emerald-500">Çekici Bulundu!</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8 text-sm">
              "Kardeşler Oto Çekici" talebinizi kabul etti. Sizinle iletişime geçecekler.
            </p>

            <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-6 mb-6 text-left border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-white/10 rounded-xl flex items-center justify-center">
                  <Truck size={24} className="text-slate-500" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Kardeşler Oto Çekici</h4>
                  <p className="text-slate-500 text-sm">0532 123 45 67</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate("/app")}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold p-4 rounded-2xl shadow-xl"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SosRequestScreen;
