import React from "react";
import { FileText, Shield, ChevronRight, CheckCircle2, AlertCircle, Scale, Mail } from "lucide-react";

const Section = ({ icon: Icon, title, children }) => (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
        <Icon size={20} className="text-cyan-400" />
      </div>
      <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
        {title}
      </h2>
    </div>
    <div className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed space-y-2 font-sans">
      {children}
    </div>
  </div>
);

const TermsOfServiceScreen = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-[#060b14] border-b border-black/5 dark:border-white/5 px-5 py-12 text-center">
        <div className="inline-flex p-4 bg-cyan-500/10 rounded-[2rem] border border-cyan-500/20 mb-5">
          <Scale size={36} className="text-cyan-400" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
          Kullanım Koşulları
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Rapidsy Marketplace & Dijital Garaj Hizmet Sözleşmesi
        </p>
        <p className="text-slate-500 text-xs mt-2 font-mono">
          Son Güncelleme: 2026 · T.C. Ticaret Bakanlığı & 6502 Sayılı TKHK Uyumlu
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-10">
        <Section icon={FileText} title="1. Genel Hükümler">
          <p>
            İşbu Kullanım Koşulları, <strong>Rapidsy Teknoloji A.Ş.</strong> ("Rapidsy" veya "Platform") tarafından sunulan mobil ve web tabanlı dijital araç bakım, yedek parça, ekspertiz, vale ve otopark pazar yeri hizmetlerinin kullanım şartlarını düzenlemektedir.
          </p>
          <p className="mt-2">
            Platforma erişerek, hesap oluşturarak veya sunulan hizmetleri kullanarak işbu sözleşmenin tüm şartlarını kayıtsız şartsız kabul etmiş sayılırsınız.
          </p>
        </Section>

        <Section icon={CheckCircle2} title="2. Üyelik ve Hizmet Kullanımı">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Üyelik kişiye özeldir. Üye, hesabına erişim için kullandığı şifre ve bilgilerin güvenliğinden kendisi sorumludur.</li>
            <li>Platformda araç ekleme, dijital araç pasaportu oluşturma, yedek parça siparişi verme ve usta teklifi toplama işlemleri yapılabilmektedir.</li>
            <li>Hizmet alıcılar (Müşteriler) verdikleri araç (plaka, km, marka/model) bilgilerinin doğruluğunu beyan ederler.</li>
          </ul>
        </Section>

        <Section icon={Scale} title="3. Satıcı ve Hizmet Veren Yükümlülükleri">
          <p>
            Rapidsy bünyesindeki tüm servisler, ustalar, oto yıkamalar, vale ve yedek parça satıcıları ("Partnerler") kendi hizmet kalitelerinden ve mevzuata uygunluklarından doğrudan sorumludur.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Satılan yedek parçalar orijinal veya onaylı muadil standartlara uygun olmalıdır.</li>
            <li>Verilen hizmetlerde 6502 sayılı Tüketicinin Korunması Hakkında Kanun hükümleri esastır.</li>
          </ul>
        </Section>

        <Section icon={AlertCircle} title="4. Ödeme ve İptal/İade Politikası">
          <p>
            Platform üzerinden yapılan payments (kredi kartı, cüzdan, online ödeme) 3D Secure ve SSL korumalı altyapılar üzerinden güvenle gerçekleşir.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong>Yedek Parça İadesi:</strong> Ürün tesliminden itibaren 14 gün içinde cayma hakkı mevcuttur (özel imalat hariç).</li>
            <li><strong>Servis İptali:</strong> Randevu saatinden 2 saat öncesine kadar yapılan iptallerde ödeme kesintisiz iade edilir.</li>
          </ul>
        </Section>

        <Section icon={Shield} title="5. Fikri Mülkiyet ve Sorumluluk Sınırları">
          <p>
            Rapidsy logosu, yazılımı, algoritması, tasarımı ve dijital araç pasaportu formatı Rapidsy Teknoloji A.Ş.'ye aittir. İzinsiz kopyalanamaz veya ticari amaçla kullanılamaz.
          </p>
        </Section>

        <Section icon={Mail} title="6. İletişim">
          <p>
            Kullanım koşulları ve hukuki talepleriniz için bize ulaşabilirsiniz:{" "}
            <a href="mailto:destek@rapidsy.app" className="text-cyan-400 hover:underline font-bold">
              destek@rapidsy.app
            </a>
          </p>
        </Section>

        <div className="mt-12 py-6 border-t border-black/10 dark:border-white/10 text-center text-slate-500 text-xs font-mono">
          <p>© 2026 Rapidsy Teknoloji A.Ş. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServiceScreen;
