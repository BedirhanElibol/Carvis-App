import React from "react";
import { motion } from "framer-motion";
import { Check, ShieldAlert } from "lucide-react";

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
        "Rapidsy Trust Güven Rozeti",
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
        "Rapidsy Trust Eğitim Sertifikalı Vale Rozeti",
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
      desc: "Bölgenizde lider, AI teşhisli ve Rapidsy Garantili elit oto servis olun.",
      price: "350 TL / ay",
      commission: "%6 İş Başarı Komisyonu",
      features: [
        "Sınırsız Arıza Teklifi Gönderme",
        "Arama Sonuçlarında En Üstte Listelenme",
        "Rapidsy Trust Rozeti & Kalite Taahhütü",
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
        "Rapidsy Trust Güven Rozeti",
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
        "Rapidsy Trust Hijyen & Güven Rozeti",
        "Arama ve Haritada 1. Sıra Garantisi",
        "Özel Kurumsal Anlaşmalı İş Yönlendirmeleri",
        "Gelişmiş CRM ve Müşteri Paneli",
      ]
    }
  }
};

const PlansAndTrustStep = ({
  profession,
  selectedPlanTab,
  setSelectedPlanTab,
  acceptedTerms,
  setAcceptedTerms,
  acceptedTrust,
  setAcceptedTrust,
  acceptedBank,
  setAcceptedBank,
  isSubmitting,
  handleBack,
  handleSubmit
}) => {
  const currentPlans = planDetails[profession] || planDetails.parking;

  return (
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
          📢 "Rapidsy'te iş almaya ücretsiz başlayın. İşleriniz büyüdükçe daha fazla görünürlük, daha düşük komisyon ve profesyonel araçlar açılır."
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
      <div className="bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-xl p-6 text-left max-w-xl mx-auto relative overflow-hidden transition-all duration-300">
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
            <div className="text-lg font-black text-teal-400">{currentPlans[selectedPlanTab].commission}</div>
          </div>
        </div>

        <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-bold">
          {currentPlans[selectedPlanTab].features.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <Check size={14} className="text-primary-500" />
              {feat}
            </li>
          ))}
        </ul>
        
        {selectedPlanTab === "free" && (
          <div className="mt-6 text-center bg-emerald-500/5 border border-emerald-500/10 text-teal-400 text-[10px] font-black uppercase tracking-widest py-3.5 rounded-2xl font-sans">
            Başvurunuz Sonrası Bu Ücretsiz Planla Başlayacaksınız!
          </div>
        )}
      </div>

      {/* Terms and Conditions / Trust Network Agreement */}
      <div className="space-y-4 max-w-xl mx-auto bg-black/20 border border-black/5 dark:border-white/5 rounded-xl p-6 text-left">
        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <ShieldAlert size={14} className="text-primary-500" /> Güvenlik ve Katılım Koşulları
        </h5>
        
        {/* Rapidsy Güven Ağı Katılım Koşulları */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-black/10 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-primary-600 focus:ring-primary-500/20"
          />
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:text-white transition-colors">
              Rapidsy Güven Ağı Katılım Koşulları'nı okudum ve taahhüt ederim.
            </p>
            <p className="text-[10px] font-semibold text-slate-500 leading-relaxed mt-0.5">
              {(profession === "valet" || profession === "mechanic") 
                ? "⚠️ Vale ve Oto Bakım servisleri için arka plan kontrolü, ehliyet/usta sertifikası ve hizmet sigortası garantisi katılım koşuluna dahildir."
                : "Rapidsy iş ortaklığı ekosistem standartları ve hizmet kalitesi kuralları."}
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
              Rapidsy Hizmet Kalitesi ve Sigorta Taahhüdünü onaylıyorum.
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
          className={`px-8 py-3 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${
            (acceptedTerms && acceptedTrust && acceptedBank) 
              ? "bg-teal-500 hover:bg-emerald-500 shadow-teal-500/20"
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
  );
};

export default PlansAndTrustStep;
