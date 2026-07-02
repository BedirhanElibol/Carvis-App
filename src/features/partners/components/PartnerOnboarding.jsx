import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useUI } from "../../../context/UIContext";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../supabaseClient";

const PartnerOnboarding = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState(null); // 'valet', 'parking', 'mechanic', 'parts'
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 3 states
  const [selectedPlanTab, setSelectedPlanTab] = useState("free");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedTrust, setAcceptedTrust] = useState(false);
  const [acceptedBank, setAcceptedBank] = useState(false);

  const professions = [
    {
      id: "valet",
      title: "Vale Uzmanı",
      icon: Icons.Key,
      desc: "Anlık vale taleplerini alın, araç transferlerini güvenle yapın.",
      color: "amber",
      gradient: "from-amber-500/10 to-orange-500/5",
      border: "hover:border-amber-500/30",
    },
    {
      id: "parking",
      title: "Otopark İşletmesi",
      icon: Icons.Car,
      desc: "Otopark kapasitenizi sisteme kaydedip doluluğu ve ciroyu artırın.",
      color: "cyan",
      gradient: "from-cyan-500/10 to-blue-500/5",
      border: "hover:border-cyan-500/30",
    },
    {
      id: "mechanic",
      title: "Oto Servis & Bakım",
      icon: Icons.Wrench,
      desc: "Servis randevularını yönetin, AI teşhisli teklifler gönderin.",
      color: "orange",
      gradient: "from-orange-500/10 to-red-500/5",
      border: "hover:border-orange-500/30",
    },
    {
      id: "parts",
      title: "Parça Tedarikçisi",
      icon: Icons.Package,
      desc: "Yedek parça stoklarınızı listeleyin, teklif taleplerini yanıtlayın.",
      color: "emerald",
      gradient: "from-emerald-500/10 to-teal-500/5",
      border: "hover:border-emerald-500/30",
    },
    {
      id: "carwash",
      title: "Seyyar Yıkama",
      icon: Icons.Droplet,
      desc: "Mobil yıkama araçlarınızla müşterilerin kapısına giderek hizmet verin.",
      color: "cyan",
      gradient: "from-cyan-500/10 to-blue-500/5",
      border: "hover:border-cyan-500/30",
    },
  ];

  const planDetails = {
    parking: {
      free: {
        title: "ÜCRETSİZ BAŞLANGIÇ",
        desc: "Otopark kapasitenizi sisteme kaydedin ve hemen rezervasyon almaya başlayın.",
        price: "0 TL / ay",
        commission: "%10 Rezervasyon Komisyonu",
        features: [
          "Profil Oluşturma & Harita Gösterimi",
          "Kapasite & Doluluk Bilgisi Girişi",
          "Standart Bildirim Akışı",
        ]
      },
      pro: {
        title: "PRO OTOPARK",
        desc: "Doluluk yönetimini ve özel tarifelerinizi esnekçe yönetip gelirinizi artırın.",
        price: "150 TL / ay",
        commission: "%5 Rezervasyon Komisyonu",
        features: [
          "Sınırsız Rezervasyon Alımı",
          "Gelişmiş Kapasite Otomasyonu",
          "Özel Tarife & Fiyat Editörü",
          "Detaylı Finansal Raporlar",
        ]
      },
      premium: {
        title: "PRESTİJ PREMIUM",
        desc: "Şehrin en popüler noktalarında harita üstünde en çok tercih edilen otopark olun.",
        price: "350 TL / ay",
        commission: "%3 Rezervasyon Komisyonu",
        features: [
          "Haritada En Üst Sıralarda Listelenme",
          "Bölgesel Reklam & Harita Sponsorluğu",
          "Carvis Trust B2B Güven Rozeti",
          "7/24 Öncelikli Operasyon Desteği",
        ]
      }
    },
    valet: {
      free: {
        title: "ÜCRETSİZ BAŞLANGIÇ",
        desc: "Kayıt olun, sertifikanızı yükleyin ve çağrı başına gelir elde edin.",
        price: "0 TL / ay",
        commission: "%20 Çağrı Başı Komisyon",
        features: [
          "Profil & Sertifika Kurulumu",
          "Sınırlı Vale Çağrısı Alımı",
          "Standart Bildirim Sistemi",
        ]
      },
      pro: {
        title: "PRO VALE",
        desc: "Daha yüksek çağrı kotası ve öncelikli bölgesel yönlendirmelerle kazanın.",
        price: "150 TL / ay",
        commission: "%12 Çağrı Başı Komisyon",
        features: [
          "Gelişmiş Aylık Çağrı Kotası",
          "Öncelikli Bölgesel Çağrı Dağıtımı",
          "Güvenli Vale Kimlik Doğrulama Rozeti",
          "Puan & Performans Analiz Raporu",
        ]
      },
      premium: {
        title: "PREMIUM ELİT VALE",
        desc: "Güvenilir premium vale ağında en yüksek öncelik ve dev sigorta koruması.",
        price: "350 TL / ay",
        commission: "%8 Çağrı Başı Komisyon",
        features: [
          "Sınırsız Vale Çağrısı Kabulü",
          "Haritada En Yakın Vale Öncelikli Listelenme",
          "Carvis Trust Eğitim Sertifikalı Vale Rozeti",
          "Araç Teslim Hasarsızlık Garantisi Desteği",
        ]
      }
    },
    mechanic: {
      free: {
        title: "ÜCRETSİZ BAŞLANGIÇ",
        desc: "Profilinizi oluşturun, bölgenizdeki araç arıza taleplerine ücretsiz teklif verin.",
        price: "0 TL / ay",
        commission: "%15 İş Başarı Komisyonu",
        features: [
          "Profesyonel Servis Profili",
          "Ayda 5 Arıza Teklifi Gönderme",
          "Müşteri Yorum & Değerlendirmeleri",
        ]
      },
      pro: {
        title: "PRO OTO SERVİS",
        desc: "Müşteri randevularını, iş emirlerini ve bakım kartlarını profesyonelce yönetin.",
        price: "150 TL / ay",
        commission: "%10 İş Başarı Komisyonu",
        features: [
          "Ayda 50 Arıza Teklifi Gönderme",
          "Gelişmiş Randevu Takvimi & İş Emri Paneli",
          "Dijital Bakım Kartları & Müşteri CRM",
          "Aylık Finansal Verimlilik Raporları",
        ]
      },
      premium: {
        title: "PREMIUM AI SERVİS",
        desc: "Bölgenizde lider, AI teşhisli ve Carvis Garantili elit oto servis olun.",
        price: "350 TL / ay",
        commission: "%6 İş Başarı Komisyonu",
        features: [
          "Sınırsız Arıza Teklifi Gönderme",
          "Arama Sonuçlarında En Üstte Listelenme",
          "Carvis Trust Rozeti & Kalite Taahhütü",
          "Öncelikli Müşteri Yönlendirmeleri",
        ]
      }
    },
    parts: {
      free: {
        title: "ÜCRETSİZ BAŞLANGIÇ",
        desc: "Yedek parça dükkanınızı açın, teklif taleplerini anında yanıtlamaya başlayın.",
        price: "0 TL / ay",
        commission: "%15 Satış Komisyonu",
        features: [
          "Mağaza Profil Kurulumu",
          "10 Ürün/Stok Listeleme Sınırı",
          "Standart Sipariş Yönetimi",
        ]
      },
      pro: {
        title: "PRO TEDARİKÇİ",
        desc: "Toplu ürün yükleme, XML entegrasyonları ve gelişmiş stok araçlarıyla satışları katlayın.",
        price: "150 TL / ay",
        commission: "%10 Satış Komisyonu",
        features: [
          "500 Ürün/Stok Listeleme Sınırı",
          "Toplu Ürün Yükleme & XML Entegrasyonu",
          "Kampanya & Özel İndirim Tanımlama",
          "Stok & Sipariş Takip Paneli",
        ]
      },
      premium: {
        title: "PREMIUM TEDARİKÇİ",
        desc: "E-ticarette zirveye oynayıp orijinal tescilli yedek parçalarınızla lider satıcı olun.",
        price: "350 TL / ay",
        commission: "%6 Satış Komisyonu",
        features: [
          "Haritada En Üst Sıralarda Listelenme",
          "Bölgesel Reklam & Harita Sponsorluğu",
          "Carvis Trust B2B Güven Rozeti",
          "7/24 Öncelikli Operasyon Desteği",
        ]
      }
    },
    carwash: {
      free: {
        title: "ÜCRETSİZ BAŞLANGIÇ",
        desc: "Profilinizi oluşturun, bölgenizdeki yıkama taleplerine anında yanıt verin.",
        price: "0 TL / ay",
        commission: "%15 Hizmet Komisyonu",
        features: [
          "Profil & Harita Kaydı",
          "Aylık Sınırlı Rezervasyon Kabulü",
          "Standart Bildirim Sistemi",
        ]
      },
      pro: {
        title: "PRO YIKAMACI",
        desc: "Sınırsız randevu alımı ve gelişmiş tarife planlamaları ile müşteri ağınızı genişletin.",
        price: "150 TL / ay",
        commission: "%10 Hizmet Komisyonu",
        features: [
          "Sınırsız Randevu Alımı",
          "Özel Bölgesel Hedefleme & Fiyatlama",
          "Müşteri Sadakat & Yorum Yönetimi",
          "Aylık Detaylı Gelir Raporları",
        ]
      },
      premium: {
        title: "PREMIUM MOBİL YIKAMA",
        desc: "Bölgenizdeki en güvenilir premium seyyar yıkamacı olarak 1. sırada yer alın.",
        price: "350 TL / ay",
        commission: "%6 Hizmet Komisyonu",
        features: [
          "Carvis Trust Hijyen & Güven Rozeti",
          "Arama ve Haritada 1. Sıra Garantisi",
          "Özel Kurumsal Anlaşmalı İş Yönlendirmeleri",
          "Gelişmiş CRM ve Müşteri Paneli",
        ]
      }
    }
  };

  const handleNext = () => {
    if (step === 1 && !profession) {
      showAlert("Hata", "Lütfen bir meslek seçimi yapınız.", "error");
      return;
    }
    if (step === 2 && (!businessName || !phone)) {
      showAlert("Hata", "Lütfen gerekli alanları doldurunuz.", "error");
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!acceptedTerms || !acceptedTrust || !acceptedBank) {
      showAlert("Hata", "Lütfen tüm katılım ve güvenlik koşullarını onaylayınız.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      showAlert("Bilgi", "Başvurunuz kaydediliyor ve profiliniz güncelleniyor...", "info");

      // 1. First, attempt to use the secure SECURITY DEFINER RPC to bypass client-side triggers and prevent role escalation issues
      const { data: rpcData, error: rpcError } = await supabase.rpc("complete_partner_onboarding_v2", {
        p_user_id: currentUser.id,
        p_profession: profession,
        p_business_name: businessName,
        p_phone: phone
      });

      if (rpcError) {
        // Fallback: If RPC does not exist in the database (code 42883), use the client-side queries
        // ensuring we omit the non-existent 'is_active_now' columns from parking_profiles, mechanic_shops, and parts_profiles
        if (rpcError.code === "42883") {
          console.warn("complete_partner_onboarding_v2 RPC not found. Falling back to client-side updates.");

          const { error: profileError } = await supabase
            .from("profiles")
            .update({ 
              role: "partner",
              subscription_tier: "free"
            })
            .eq("id", currentUser.id);

          if (profileError) throw profileError;

          let tableName = "";
          let payload = {};
          
          switch (profession) {
            case "valet":
              tableName = "valet_profiles";
              payload = {
                id: currentUser.id,
                is_active_now: true,
                service_radius_km: 15,
                experience_years: 3
              };
              break;
            case "parking":
              tableName = "parking_profiles";
              payload = {
                id: currentUser.id,
                parking_name: businessName,
                total_capacity: 50,
                occupied_count: 0,
                price_per_hour: 30.00,
                is_indoor: true,
                has_security: true,
                has_valet: false
              };
              break;
            case "mechanic":
              tableName = "mechanic_shops";
              payload = {
                id: crypto.randomUUID(),
                seller_id: currentUser.id,
                shop_name: businessName,
                is_active: true,
                specialties: ["Periyodik Bakım", "Fren Sistemleri"],
                brands: ["BMW", "Audi", "Volkswagen", "Mercedes"]
              };
              break;
            case "parts":
              tableName = "parts_profiles";
              payload = {
                id: currentUser.id,
                business_name: businessName,
                delivery_radius_km: 50,
                store_type: "retail"
              };
              break;
            case "carwash":
              tableName = "carwash_profiles";
              payload = {
                id: currentUser.id,
                seller_id: currentUser.id,
                company_name: businessName,
                service_radius_km: 10,
                has_own_water_tank: true,
                has_generator: true,
                is_eco_friendly: true
              };
              break;
            default:
              break;
          }

          if (tableName) {
            const { error: specError } = await supabase
              .from(tableName)
              .insert(payload);

            if (specError) throw specError;
          }

          // Insert into partner_monetization client-side fallback
          const targetPlanName = `${profession}_free`;
          const { data: targetPlan } = await supabase
            .from("monetization_plans")
            .select("id")
            .eq("name", targetPlanName)
            .maybeSingle();

          if (targetPlan) {
            await supabase
              .from("partner_monetization")
              .insert({
                partner_id: currentUser.id,
                plan_id: targetPlan.id,
                subscription_status: "active"
              });
          }
        } else {
          throw rpcError;
        }
      } else if (rpcData && !rpcData.success) {
        throw new Error(rpcData.message);
      }

      showAlert("Başarılı", "Tebrikler! Carvis B2B Ortağı oldunuz. Dijital garaj ve kokpitiniz hazırlandı.", "success");
      
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error(err);
      showAlert("Hata", err.message || "Kayıt sırasında bir hata oluştu.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPlans = planDetails[profession] || planDetails.parking;

  return (
    <div className="glass-card p-10 rounded-[3rem] border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/50 shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
      {/* Background decorations */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-600/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Stepper Indicators */}
      <div className="flex items-center justify-between mb-10 max-w-md mx-auto relative z-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
              step >= s ? 'bg-primary-600 text-slate-900 dark:text-white shadow-lg shadow-primary-600/20' : 'bg-black/5 dark:bg-white/5 text-slate-500 border border-black/5 dark:border-white/5'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 rounded-full transition-all ${step > s ? 'bg-primary-600' : 'bg-black/5 dark:bg-white/5'}`}></div>}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: PROFESSION SELECTION */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 relative z-10 text-center"
          >
            <div>
              <span className="text-[9px] font-black tracking-widest text-primary-400 uppercase">AŞAMA 1</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1 mb-2 font-sans">
                Mesleğinizi Seçin
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold max-w-md mx-auto leading-relaxed">
                Carvis ekosisteminde hangi rolde gelir kazanıp hizmet sunmak istediğinizi belirtin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {professions.map((prof) => {
                const isSelected = profession === prof.id;
                const Icon = prof.icon;
                return (
                  <button
                    key={prof.id}
                    onClick={() => setProfession(prof.id)}
                    className={`p-6 rounded-3xl border transition-all text-left flex items-start gap-4 ${prof.border} ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-500/5 shadow-[0_0_15px_rgba(37,99,235,0.05)]' 
                        : 'border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-950/30'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl bg-black/20 text-slate-900 dark:text-white border border-black/5 dark:border-white/5`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-base tracking-tight uppercase font-sans">{prof.title}</h4>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-1">{prof.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                onClick={handleNext}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] active-scale"
              >
                DEVAM ET
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: BUSINESS DETAILS */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 relative z-10 text-center"
          >
            <div>
              <span className="text-[9px] font-black tracking-widest text-primary-400 uppercase">AŞAMA 2</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1 mb-2 font-sans">
                İşletme Bilgileri
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold max-w-md mx-auto leading-relaxed">
                Hizmetlerinizin yayına alınması için resmi ve iletişim bilgilerinizi giriniz.
              </p>
            </div>

            <div className="space-y-4 text-left max-w-md mx-auto">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">İşletme veya Ünvan Adı</label>
                <div className="bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl flex items-center px-4">
                  <Icons.Briefcase size={16} className="text-slate-500 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Örn: Garaj Otomotiv Ltd. Şti."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white w-full py-4 uppercase tracking-wider"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Telefon Numarası</label>
                <div className="bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl flex items-center px-4">
                  <Icons.Phone size={16} className="text-slate-500 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Örn: 0555 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white w-full py-4 uppercase tracking-wider"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Ek Hizmet Açıklaması</label>
                <div className="bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl flex items-center px-4">
                  <Icons.FileText size={16} className="text-slate-500 mr-2" />
                  <textarea 
                    placeholder="Sunduğunuz marka ve uzmanlık servisleri hakkında kısa açıklama..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    className="bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white w-full py-4 uppercase tracking-wider resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <button 
                onClick={handleBack}
                className="px-8 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                GERİ DÖN
              </button>
              <button 
                onClick={handleNext}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] active-scale"
              >
                DEVAM ET
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: WELCOME PLAN PRESENTATION & TRUST CONDITIONS */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 relative z-10 text-center"
          >
            <div>
              <span className="text-[9px] font-black tracking-widest text-primary-400 uppercase">AŞAMA 3</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1 mb-2 font-sans">
                Üyelik Planları & Güven Ağı
              </h2>
              <p className="text-amber-400 font-extrabold text-xs bg-amber-500/10 border border-amber-500/20 px-6 py-3 rounded-2xl max-w-2xl mx-auto leading-relaxed mt-3">
                📢 "Carvis'te iş almaya ücretsiz başlayın. İşleriniz büyüdükçe daha fazla görünürlük, daha düşük komisyon ve profesyonel araçlar açılır."
              </p>
            </div>

            {/* Interactive Tab Switcher for Plan Preview */}
            <div className="flex justify-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-black/5 dark:border-white/5 w-fit mx-auto">
              {["free", "pro", "premium"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedPlanTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedPlanTab === tab
                      ? "bg-primary-600 text-slate-900 dark:text-white shadow-lg shadow-primary-600/15"
                      : "text-slate-500 hover:text-slate-900 dark:text-white"
                  }`}
                >
                  {tab === "free" ? "Free Tier" : tab === "pro" ? "Pro Plan" : "Premium"}
                </button>
              ))}
            </div>

            {/* Plan Display Card */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-3xl p-6 text-left max-w-xl mx-auto relative overflow-hidden transition-all duration-300">
              <div className="absolute top-6 right-6 px-3 py-1 rounded-xl bg-primary-600/15 border border-primary-500/20 text-primary-400 text-[8px] font-black uppercase tracking-widest">
                {selectedPlanTab === "free" ? "Başlangıç" : selectedPlanTab === "pro" ? "Hacimli İşler" : "Zirve & Liderlik"}
              </div>
              <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">ÖNİZLEME</span>
              <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase mt-1 mb-2 font-sans">
                {currentPlans[selectedPlanTab].title}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed mb-4">
                {currentPlans[selectedPlanTab].desc}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
                <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 px-4 py-2 rounded-2xl">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sabit Ücret</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">{currentPlans[selectedPlanTab].price}</div>
                </div>
                <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 px-4 py-2 rounded-2xl">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Komisyon Oranı</div>
                  <div className="text-lg font-black text-emerald-400">{currentPlans[selectedPlanTab].commission}</div>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-bold">
                {currentPlans[selectedPlanTab].features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Icons.Check size={14} className="text-primary-500" />
                    {feat}
                  </li>
                ))}
              </ul>
              
              {selectedPlanTab === "free" && (
                <div className="mt-6 text-center bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest py-3.5 rounded-2xl font-sans">
                  🚀 Başvurunuz Sonrası Bu Ücretsiz Planla Başlayacaksınız!
                </div>
              )}
            </div>

            {/* Terms and Conditions / Trust Network Agreement */}
            <div className="space-y-4 max-w-xl mx-auto bg-black/20 border border-black/5 dark:border-white/5 rounded-3xl p-6 text-left">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Icons.ShieldAlert size={14} className="text-primary-500" /> Güvenlik ve Katılım Koşulları
              </h5>
              
              {/* Carvis B2B Güven Ağı Katılım Koşulları (Critical/Highlighted, especially for valet/mechanic) */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-black/10 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-primary-600 focus:ring-primary-500/20"
                />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:text-white transition-colors">
                    Carvis B2B Güven Ağı Katılım Koşulları'nı okudum ve taahhüt ederim.
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 leading-relaxed mt-0.5">
                    {(profession === "valet" || profession === "mechanic") 
                      ? "⚠️ Vale ve Oto Bakım servisleri için arka plan kontrolü, ehliyet/usta sertifikası ve hizmet sigortası garantisi katılım koşuluna dahildir."
                      : "Carvis iş ortaklığı ekosistem standartları ve hizmet kalitesi kuralları."}
                  </p>
                </div>
              </label>

              {/* Quality & Trust Commitment */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={acceptedTrust}
                  onChange={(e) => setAcceptedTrust(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-black/10 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-primary-600 focus:ring-primary-500/20"
                />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:text-white transition-colors">
                    Carvis B2B Hizmet Kalitesi ve Sigorta Taahhüdünü onaylıyorum.
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 leading-relaxed mt-0.5">
                    Müşteri memnuniyetini korumak, hasarsızlık ve güvenilirlik standartlarını sağlamak amacıyla hizmet vermeyi kabul ediyorum.
                  </p>
                </div>
              </label>

              {/* Bank Transfer Guarantee */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={acceptedBank}
                  onChange={(e) => setAcceptedBank(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-black/10 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-primary-600 focus:ring-primary-500/20"
                />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:text-white transition-colors">
                    Hakediş ve Banka Hesap Bilgilerinin Doğruluğunu taahhüt ederim.
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 leading-relaxed mt-0.5">
                    E-fatura kesim ve ödeme transferlerinin yapılabilmesi için doğru IBAN ve işletme bilgilerini ileteceğimi kabul ediyorum.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-6 flex justify-between max-w-xl mx-auto">
              <button 
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-8 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                GERİ DÖN
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || !acceptedTerms || !acceptedTrust || !acceptedBank}
                className={`px-8 py-3 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center gap-2 ${
                  (acceptedTerms && acceptedTrust && acceptedBank) 
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    BAŞVURU GÖNDERİLİYOR
                  </>
                ) : (
                  "BAŞVURUYU GÖNDER VE HESABI AÇ"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerOnboarding;
