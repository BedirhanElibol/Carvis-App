import React from "react";
import { motion } from "framer-motion";
import { Check, ShieldAlert } from "lucide-react";

const planDetails = {
  parking: {
    free: {
      title: "DENEME ABONELİĞİ",
      desc: "Otopark kapasitenizi sisteme kaydedin ve ilk 14 gün ücretsiz ilan verin.",
      price: "0 TL / 14 Gün",
      commission: "%0 Komisyon",
      features: [
        "Profil Oluşturma & Harita Gösterimi",
        "Kapasite & Doluluk Bilgisi Girişi",
        "Doğrudan Müşteri İletişimi",
      ]
    },
    pro: {
      title: "STANDART OTOPARK ABONELİĞİ",
      desc: "Doluluk yönetimini ve özel tarifelerinizi esnekçe yönetip müşteri ağınızı büyütün.",
      price: "999 TL / ay",
      commission: "%0 Komisyon",
      features: [
        "Sınırsız İlan & Harita Görünürlüğü",
        "Gelişmiş Kapasite Otomasyonu",
        "Özel Tarife & Fiyat Editörü",
        "Doğrudan Müşteri Randevuları",
      ]
    },
    premium: {
      title: "PRESTİJ OTOPARK ABONELİĞİ",
      desc: "Şehrin en popüler noktalarında harita üstünde en öne çıkan otopark olun.",
      price: "1.499 TL / ay",
      commission: "%0 Komisyon",
      features: [
        "Haritada En Üst Sıralarda Listelenme",
        "Bölgesel Harita Sponsorluğu",
        "Öne Çıkan Onaylı Partner Rozeti",
        "7/24 Öncelikli Operasyon Desteği",
      ]
    }
  },
  valet: {
    free: {
      title: "DENEME ABONELİĞİ",
      desc: "Kayıt olun, profilinizi oluşturun ve ilk 14 gün ücretsiz deneyin.",
      price: "0 TL / 14 Gün",
      commission: "%0 Komisyon",
      features: [
        "Profil & İletişim Kurulumu",
        "Harita Konum Listelemesi",
        "Müşteri Doğrudan Arama",
      ]
    },
    pro: {
      title: "PRO VALE ABONELİĞİ",
      desc: "Bölgenizdeki sürücülerin doğrudan size ulaşmasını sağlayın.",
      price: "999 TL / ay",
      commission: "%0 Komisyon",
      features: [
        "Sınırsız Vale Çağrı Bildirimi",
        "Öncelikli Bölgesel Çağrı Dağıtımı",
        "Doğrudan Müşteri İletişimi",
        "Performans & Değerlendirme Paneli",
      ]
    },
    premium: {
      title: "PREMIUM ELİT VALE ABONELİĞİ",
      desc: "Güvenilir premium vale ağında en yüksek harita önceliğine sahip olun.",
      price: "1.499 TL / ay",
      commission: "%0 Komisyon",
      features: [
        "Sınırsız Vale Çağrısı Kabulü",
        "Haritada En Yakın Vale Öncelikli Listelenme",
        "Onaylı Vale Kimlik Rozeti",
        "VIP Bölge Sponsorluğu",
      ]
    }
  },
  mechanic: {
    free: {
      title: "DENEME ABONELİĞİ",
      desc: "Profilinizi oluşturun, bölgenizdeki araç arıza taleplerine 14 gün ücretsiz teklif verin.",
      price: "0 TL / 14 Gün",
      commission: "%0 Komisyon",
      features: [
        "Profesyonel Servis Profili",
        "Müşteri Taleplerine Doğrudan Teklif",
        "Müşteri Yorum & Değerlendirmeleri",
      ]
    },
    pro: {
      title: "PRO USTA & SERVİS ABONELİĞİ",
      desc: "Müşteri randevularını ve iş emirlerini yönetin, bölgenizde dükkanınızı büyütün.",
      price: "1.499 TL / ay",
      commission: "%0 Komisyon",
      features: [
        "Sınırsız Arıza Teklifi Gönderme",
        "Gelişmiş Randevu Takvimi & İş Emri Paneli",
        "Müşteri İletişim Rehberi",
        "Dükkan İtibar ve Puan Paneli",
      ]
    },
    premium: {
      title: "PREMIUM LİDER SERVİS ABONELİĞİ",
      desc: "Bölgenizde aramalarda en üstte yer alan lider oto servis olun.",
      price: "2.499 TL / ay",
      commission: "%0 Komisyon",
      features: [
        "Arama Sonuçlarında En Üstte Listelenme",
        "Sınırsız Müşteri Eşleşmesi",
        "Carvis Onaylı Lider Servis Rozeti",
        "Öncelikli Müşteri Yönlendirmeleri",
      ]
    }
  },
  parts: {
    free: {
      title: "DENEME ABONELİĞİ",
      desc: "Yedek parça dükkanınızı açın, ilk 14 gün ücretsiz parça listeleyin.",
      price: "0 TL / 14 Gün",
      commission: "%0 Komisyon",
      features: [
        "Mağaza Profil Kurulumu",
        "Parça Liste Taleplerini Görme",
        "Doğrudan Müşteri İletişimi",
      ]
    },
    pro: {
      title: "PRO TEDARİKÇİ ABONELİĞİ",
      desc: "Parça listelemelerinizi yapın, doğrudan satış bağlantıları kurun.",
      price: "1.999 TL / ay",
      commission: "%0 Komisyon",
      features: [
        "Sınırsız Parça Teklifi Gönderme",
        "Toplu Stok Listeleme Paneli",
        "Kampanya & İndirim Duyuruları",
        "Doğrudan Satış Görüşmeleri",
      ]
    },
    premium: {
      title: "PREMIUM LİDER TEDARİKÇİ ABONELİĞİ",
      desc: "E-ticarette zirveye oynayın, onaylı yedek parçacı olarak lider konuma gelin.",
      price: "2.999 TL / ay",
      commission: "%0 Komisyon",
      features: [
        "Arama Sonuçlarında En Üst Sıra",
        "Bölgesel Harita Sponsorluğu",
        "Onaylı Tedarikçi Rozeti",
        "VIP Destek Hattı",
      ]
    }
  },
  carwash: {
    free: {
      title: "DENEME ABONELİĞİ",
      desc: "Profilinizi oluşturun, bölgenizdeki yıkama randevularını 14 gün ücretsiz alın.",
      price: "0 TL / 14 Gün",
      commission: "%0 Komisyon",
      features: [
        "Profil & Harita Kaydı",
        "Doğrudan İletişim",
        "Standart Bildirim Sistemi",
      ]
    },
    pro: {
      title: "PRO YIKAMA ABONELİĞİ",
      desc: "Sınırsız randevu alımı ve harita görünürlüğü ile dükkan müşteri sayınızı artırın.",
      price: "799 TL / ay",
      commission: "%0 Komisyon",
      features: [
        "Sınırsız Yıkama Randevusu Alımı",
        "Özel Bölgesel Hedefleme & Fiyatlama",
        "Müşteri Sadakat & Yorum Yönetimi",
        "Doğrudan Müşteri İletişimi",
      ]
    },
    premium: {
      title: "PREMIUM MOBİL YIKAMA ABONELİĞİ",
      desc: "Bölgenizdeki en görünür yıkama tesisi/mobil yıkamacı olarak öne çıkın.",
      price: "1.299 TL / ay",
      commission: "%0 Komisyon",
      features: [
        "Arama ve Haritada 1. Sıra Garantisi",
        "Onaylı Hizmet Sağlayıcı Rozeti",
        "Özel Kurumsal İlan Listelemesi",
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
          Aylık Üyelik Paketleri & Yasal Bildirim
        </h2>
        <p className="text-amber-400 font-extrabold text-xs bg-amber-500/10 border border-amber-500/20 px-6 py-3 rounded-2xl max-w-2xl mx-auto leading-relaxed mt-3">
          🚀 "Carvis işlemlerinizden HİÇBİR KOMİSYON ALMAZ (%0 Komisyon). Sadece aylık sabit üyelik ücreti ile sınırsız müşteri eşleşmesi elde edersiniz!"
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
            {tab === "free" ? "Deneme" : tab === "pro" ? "Pro Plan" : "Premium"}
          </button>
        ))}
      </div>

      {/* Plan Display Card */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-xl p-6 text-left max-w-xl mx-auto relative overflow-hidden transition-all duration-300">
        <div className="absolute top-6 right-6 px-3 py-1 rounded-xl bg-primary-600/15 border border-primary-500/20 text-primary-400 text-[8px] font-black uppercase tracking-widest">
          {selectedPlanTab === "free" ? "Başlangıç" : selectedPlanTab === "pro" ? "Popüler" : "Zirve & Liderlik"}
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
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sabit Abonelik</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{currentPlans[selectedPlanTab].price}</div>
          </div>
          <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 px-4 py-2 rounded-2xl">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Satış Komisyonu</div>
            <div className="text-lg font-black text-emerald-400">%0 KOMİSYON</div>
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
