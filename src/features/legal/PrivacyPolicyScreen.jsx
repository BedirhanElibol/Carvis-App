import React from "react";
import { Bell, ChevronRight, Database, Lock, Mail, MapPin, Shield, Trash2 } from "lucide-react";

const Section = ({ icon: Icon, title, children }) => (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
        <Icon size={20} className="text-blue-400" />
      </div>
      <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
        {title}
      </h2>
    </div>
    <div className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

const PrivacyPolicyScreen = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-black/5 dark:border-white/5 px-5 py-12 text-center">
        <div className="inline-flex p-4 bg-blue-600/10 rounded-[2rem] border border-blue-500/20 mb-5">
          <Shield size={36} className="text-blue-400" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
          Gizlilik Politikası
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          Carvis — Akıllı Araç Platformu
        </p>
        <p className="text-slate-600 text-xs mt-2">
          Son Güncelleme: Nisan 2026 · KVKK & GDPR Uyumlu
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-10">
        <Section icon={Database} title="Topladığımız Veriler">
          <p>Carvis, aşağıdaki kişisel verileri toplar ve işler:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong className="text-slate-900 dark:text-white">Hesap Bilgileri:</strong> Ad,
              e-posta adresi, profil fotoğrafı (Google/Apple OAuth üzerinden)
            </li>
            <li>
              <strong className="text-slate-900 dark:text-white">Araç Bilgileri:</strong> Plaka,
              marka, model, km bilgisi (sizin eklediğiniz)
            </li>
            <li>
              <strong className="text-slate-900 dark:text-white">Konum Verisi:</strong> Yakındaki
              ustaları bulmak için anlık konum (izin vermeniz halinde)
            </li>
            <li>
              <strong className="text-slate-900 dark:text-white">Sipariş Geçmişi:</strong> Satın
              alımlar, teklifler, randevular
            </li>
          </ul>
        </Section>

        <Section icon={Lock} title="Verileriniz Nasıl Kullanılır">
          <ul className="list-disc pl-5 space-y-1">
            <li>Servis ve ürün siparişlerinizin yönetimi</li>
            <li>
              Yakındaki onaylı ustalar ve acil yardım servislerinin gösterimi
            </li>
            <li>Bildirimler (sipariş, teklif, randevu)</li>
            <li>Uygulama performansının iyileştirilmesi</li>
          </ul>
          <p className="mt-3">
            <strong className="text-slate-900 dark:text-white">Verilerinizi asla:</strong> üçüncü
            taraflara satmaz, reklam ağlarıyla paylaşmaz, izinsiz
            iletmeyiz.
          </p>
        </Section>

        <Section icon={MapPin} title="Konum Verisi">
          <p>
            Carvis, yakındaki usta ve yol yardım servislerini göstermek için
            cihazınızın konumuna erişim talep eder. Bu veriye yalnızca
            uygulamayı aktif kullandığınızda erişilir (<em>When In Use</em>).
            Konum verisini sunucularımızda depolamaz, üçüncü taraflarla
            paylaşmayız. İstediğiniz zaman iOS Ayarlar → Carvis → Konum
            bölümünden bu izni iptal edebilirsiniz.
          </p>
        </Section>

        <Section icon={Bell} title="Bildirimler">
          <p>
            Push bildirimleri; sipariş durumu, teklif kabul/red ve randevu
            hatırlatmaları için kullanılır. iOS cihazınızda bildirim iznini
            istediğiniz zaman Ayarlar → Carvis bölümünden kapatabilirsiniz.
          </p>
        </Section>

        <Section icon={Database} title="Üçüncü Taraf Servisler">
          <div className="space-y-3">
            {[
              {
                name: "Supabase (supabase.io)",
                desc: "Kimlik doğrulama, veritabanı ve dosya depolama. AB/ABD güvenli veri merkezi.",
                link: "https://supabase.com/privacy",
              },
              {
                name: "Google OAuth",
                desc: "Opsiyonel Google ile giriş. Google hesap adı ve e-posta alınır.",
                link: "https://policies.google.com/privacy",
              },
            ].map((s) => (
              <div
                key={s.name}
                className="bg-black/5 dark:bg-white/5 rounded-xl p-4 border border-black/5 dark:border-white/5"
              >
                <p className="text-slate-900 dark:text-white font-bold text-sm mb-1">
                  {s.name}
                </p>
                <p className="text-xs">{s.desc}</p>
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline mt-1 inline-flex items-center gap-1"
                >
                  Gizlilik politikası <ChevronRight size={12} />
                </a>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Trash2} title="Veri Silme ve KVKK Hakları">
          <p>6698 sayılı KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Verilerinize erişim talep etme</li>
            <li>Yanlış verilerin düzeltilmesini isteme</li>
            <li>Verilerinizin silinmesini talep etme</li>
            <li>Veri işlemeye itiraz etme</li>
          </ul>
          <p className="mt-3">
            Hesabınızı silmek veya tüm verilerinizin kaldırılmasını talep etmek
            için:{" "}
            <a
              href="mailto:privacy@carvis.app"
              className="text-blue-400 hover:underline ml-1"
            >
              privacy@carvis.app
            </a>{" "}
            adresine yazabilirsiniz. Talepler en geç 30 iş günü içinde
            yanıtlanır.
          </p>
        </Section>

        <Section icon={Mail} title="İletişim">
          <p>
            Gizlilikle ilgili sorularınız için:{" "}
            <a
              href="mailto:privacy@carvis.app"
              className="text-blue-400 hover:underline ml-1"
            >
              privacy@carvis.app
            </a>
          </p>
          <p className="mt-1">
            Veri Sorumlusu: Carvis Teknoloji A.Ş., Türkiye
          </p>
        </Section>

        <div className="mt-12 py-6 border-t border-black/10 dark:border-white/10 text-center text-slate-600 text-xs">
          <p>© 2026 Carvis. Tüm hakları saklıdır.</p>
          <p className="mt-1">
            Bu politika, Apple App Store ve Google Play gizlilik
            gereksinimlerine uygundur.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;
