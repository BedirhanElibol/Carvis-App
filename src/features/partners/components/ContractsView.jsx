import React, { useState, useEffect } from "react";
import { Shield, FileText, CheckCircle2, User, Landmark, HelpCircle, ShieldAlert } from "lucide-react";
import { supabase } from "../../../supabaseClient";

export default function ContractsView({ currentUser }) {
  const [role, setRole] = useState(currentUser?.role || "partner");
  const [isAccepted, setIsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setRole(currentUser.role === "partner" ? "mechanic" : currentUser.role);
      setIsAccepted(currentUser.raw_user_meta_data?.accepted_contract || false);
    }
  }, [currentUser]);

  const handleAcceptContract = async () => {
    setLoading(true);
    try {
      const updatedMetaData = {
        ...currentUser.raw_user_meta_data,
        accepted_contract: true,
        contract_accepted_at: new Date().toISOString()
      };

      const { error } = await supabase.auth.updateUser({
        data: updatedMetaData
      });

      if (!error) {
        setIsAccepted(true);
      }
    } catch (err) {
      console.error("Error signing contract:", err);
    } finally {
      setLoading(false);
    }
  };

  const getContractDetails = () => {
    switch (role) {
      case "mechanic":
        return {
          title: "Oto Servis & Mekanik Bakım Hizmet Standartları Sözleşmesi",
          code: "MECH-CONT-2026-V4",
          steps: [
            "İş emri açılmalı, parça ve işçilik detayları sisteme girilmelidir.",
            "Tüm onarım süreçlerinin görselleri Rapidsy sistemine yüklenmelidir.",
            "Müşteriye dijital teslimat onay kodu (PIN) ile araç teslim edilmelidir."
          ],
          payment: "Müşteri aracı teslim alıp onayladığında veya teslimatı takip eden 3 iş günü içinde hak edilen tutar Rapidsy cüzdanına aktarılır.",
          documents: [
            "Esnaf Sanatkarlar / Ticaret Odası Kaydı",
            "Ustalık Belgesi veya TSE 12047 Yetki Belgesi",
            "İş Yeri Açma ve Çalışma Ruhsatı"
          ],
          contractText: `Rapidsy (şirket) ile Üye Oto Servis (ortak) arasında akdedilen bu sözleşme uyarınca; ortak, sunduğu tüm periyodik bakım, mekanik onarım ve arıza tespit hizmetlerinde orijinal veya muadil yedek parça kullanacağını, yaptığı işçiliklere 6 ay garanti vereceğini ve Rapidsy kullanıcılarına sabit fiyat garantisi sunacağını kabul ve taahhüt eder. Ödemeler müşteri dijital onayıyla serbest bırakılır.`
        };
      case "parts":
        return {
          title: "Yedek Parça Satış ve Teslimat Güvencesi Sözleşmesi",
          code: "PARTS-CONT-2026-V2",
          steps: [
            "Alınan siparişlerdeki OEM numarası ve araç uyumluluğu doğrulanmalıdır.",
            "Sipariş 24 saat içinde koruyucu ambalajla paketlenip kargolanmalıdır.",
            "Kargo takip kodu anında Rapidsy sipariş kayıtları ekranına girilmelidir."
          ],
          payment: "Alıcı kargoyu teslim alıp onayladıktan veya kargo teslim edilmesini izleyen 14 günlük yasal cayma süresi sonunda ödeme cüzdana aktarılır.",
          documents: [
            "Ticaret Sicil Gazetesi ve İmza Sirküleri",
            "Vergi Levhası",
            "Marka Distribütörlük veya Yetkili Satıcı Belgeleri"
          ],
          contractText: `Üye Yedek Parça Satıcısı, Rapidsy platformu üzerinden sergilediği tüm ilanların stok durumunu güncel tutmakla, OEM uyumluluğunu doğru beyan etmekle ve Tüketicinin Korunması Hakkında Kanun uyarınca 14 günlük yasal cayma ve koşulsuz iade hakkını tanımakla yükümlüdür. Kusurlu/hatalı parça gönderimlerinde kargo maliyeti satıcıya aittir.`
        };
      case "carwash":
        return {
          title: "Seyyar Oto Yıkama Çevre ve Hizmet Kalite Sözleşmesi",
          code: "WASH-CONT-2026-V3",
          steps: [
            "Müşterinin belirlediği konuma randevu saatinde seyyar ekip ulaştırılmalıdır.",
            "Yıkama esnasında Rapidsy onaylı çevre dostu ve su tasarruflu solüsyonlar kullanılmalıdır.",
            "İşlem bittiğinde müşteriden teslimat kodu alınmalıdır."
          ],
          payment: "Yıkama işlemi tamamlanıp alıcı tarafından onaylandığı anda hizmet bedeli Rapidsy cüzdan bakiyenize transfer edilir.",
          documents: [
            "Kimlik Fotokopisi ve Sabıka Kaydı",
            "Kullanılan Kimyasal Maddelerin MSDS (Güvenlik Bilgi) Raporları",
            "Vergi Mükellefiyeti / Esnaf Muafiyet Belgesi"
          ],
          contractText: `Seyyar Yıkama İş Ortağı, hizmet verdiği lokasyonlarda çevre kirliliğine yol açmayacak, atık su yönetmeliklerine uygun seyyar ekipman kullanacağını taahhüt eder. Araç boya ve kaportasına zarar verebilecek kalitesiz deterjanlar kullanılamaz. Olası hasarlardan seyyar yıkama sağlayıcısı doğrudan sorumludur.`
        };
      case "tow_truck":
        return {
          title: "Yol Yardım ve Acil Çekici Güvenlik Sözleşmesi",
          code: "TOW-CONT-2026-V1",
          steps: [
            "SOS çağrısı kabul edildikten sonra 15 dakika içinde olay yerine intikal edilmelidir.",
            "Araç yükleme esnasında kasko / çekici sigorta güvenlik standartları uygulanmalıdır.",
            "Araç, müşterinin belirttiği yetkili servise güvenle indirilmelidir."
          ],
          payment: "Araç varış noktasına teslim edilip Rapidsy mobil uygulaması üzerinden onay kodu okutulduğu anda ödeme hesabınıza aktarılır.",
          documents: [
            "K Karayolu Taşıma Yetki Belgesi",
            "SRC 3/4 Belgesi ve Psikoteknik Raporu",
            "Taşıyıcı Mali Mesuliyet (Çekici Kasko) Sigortası"
          ],
          contractText: `Çekici Hizmet Ortağı, çekim esnasında taşınan araca gelebilecek tüm fiziksel zararları kapsayan geçerli bir Taşıyıcı Mali Mesuliyet Sigortası bulundurmak zorundadır. Rapidsy üzerinden alınan çağrılarda standart kilometre başı çekim tarifesinin dışına çıkılamaz, ek ücret talep edilemez.`
        };
      case "insurance":
        return {
          title: "Dijital Sigortacılık İş Ortaklığı ve Risk Paylaşım Sözleşmesi",
          code: "INS-CONT-2026-V5",
          steps: [
            "Gelen teklif taleplerine en geç 10 dakika içinde risk analizli poliçe teklifi sunulmalıdır.",
            "Kaza/Hasar ihbarlarında dosya evrakları dijital panelden incelenip onaylanmalıdır.",
            "Rapidsy entegre oto servis ağına hasar onarım yönlendirmesi yapılmalıdır."
          ],
          payment: "Poliçe satışı gerçekleştikten sonra Rapidsy cüzdanına prim tutarı aktarılır.",
          documents: [
            "Hazine ve Maliye Bakanlığı Sigorta Acenteliği Uygunluk Belgesi",
            "Levha Kayıt Belgesi (TOBB)",
            "Mesleki Sorumluluk Sigortası Poliçesi"
          ],
          contractText: `Üye Sigorta Şirketi/Acentesi, Rapidsy kullanıcılarına SEDDK mevzuatına uygun, yasal teminatları eksiksiz poliçeler düzenlemekle mükelleftir. Hasar dosyası inceleme süreçleri 5 iş gününü geçemez, onaylanan hasar tazminat ödemeleri doğrudan anlaşmalı servislere veya müşteriye yasal sürede iletilir.`
        };
      case "valet":
      default:
        return {
          title: "Profesyonel Vale Hizmet ve Sorumluluk Güvencesi Sözleşmesi",
          code: "VALET-CONT-2026-V2",
          steps: [
            "Araç teslim alınırken 360 derece dış video/fotoğraf ile hasar tespiti yapılmalıdır.",
            "Araç sadece Rapidsy anlaşmalı güvenlik kameralı kapalı otopark alanlarına park edilmelidir.",
            "Teslimat aşamasında müşteriden güvenlik teslim PIN kodu doğrulanmalıdır."
          ],
          payment: "Araç sahibine sorunsuz teslim edilip teslimat kodu girildiğinde vale ücreti hesaba geçer.",
          documents: [
            "Sürücü Belgesi (En az 5 yıllık B sınıfı) ve Sabıka Kaydı",
            "Mesleki Sorumluluk ve Vale Üçüncü Şahıs Mali Mesuliyet Sigortası",
            "Güvenli Sürüş Eğitimi Sertifikası"
          ],
          contractText: `Rapidsy Vale Ortağı, teslim aldığı aracı trafik kurallarına uygun, güvenli şekilde kullanmakla ve sigortalı otopark alanına çekmekle yükümlüdür. Araçta vale kontrolündeyken meydana gelebilecek tüm hasar, trafik cezası ve kayıplardan vale şirketi/sürücüsü hukuken sorumludur.`
        };
    }
  };

  const details = getContractDetails();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Çalışma Koşulları & Yasal Sözleşmeler</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Rapidsy ekosisteminde güvenli ve yasal hizmet sunmak için uymanız gereken kurallar ve sözleşmeler.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Contract Card */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{details.code}</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-2 leading-tight uppercase">{details.title}</h2>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl text-xs">
              <Shield size={14} className="text-emerald-500" />
              <span className="font-bold text-slate-600 dark:text-slate-300">Yasal Güvenceli</span>
            </div>
          </div>

          {/* Legal Scroll Text */}
          <div className="bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 p-6 rounded-2xl h-64 overflow-y-auto text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans space-y-4">
            <p className="font-bold text-slate-800 dark:text-slate-200">1. TARAFLAR VE AMAÇ</p>
            <p>{details.contractText}</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">2. OPERASYONEL ADIMLAR VE YÖNTEMLER</p>
            <ul className="list-disc pl-4 space-y-2">
              {details.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            <p className="font-bold text-slate-800 dark:text-slate-200">3. ÖDEME VE HAKEDİŞ KURALLARI</p>
            <p>{details.payment}</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">4. MÜCBİR SEBEPLER VE ANLAŞMAZLIKLAR</p>
            <p>Hizmet sunumu esnasında oluşabilecek anlaşmazlıklarda Rapidsy Tahkim ve Hakem Heyeti incelemesi esas alınır. Taraflar bu kararlara uymayı peşinen taahhüt ederler.</p>
          </div>

          {/* Acceptance Action */}
          <div className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className={isAccepted ? "text-emerald-500" : "text-slate-400"} />
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase">SÖZLEŞME DURUMU</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{isAccepted ? "İmzalandı & Onaylandı" : "Onayınız Bekleniyor"}</p>
              </div>
            </div>
            <button
              onClick={handleAcceptContract}
              disabled={isAccepted || loading}
              className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black px-5 py-3 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-lg shadow-orange-500/20"
            >
              {loading ? "İmzalanıyor..." : isAccepted ? "Sözleşme İmzalandı" : "Sözleşmeyi İmzala"}
            </button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Required Documents */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-orange-500" /> Zorunlu Yasal Evraklar
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">Ortaklık statünüzün onaylı kalması için aşağıdaki evrakların güncel olarak sisteme yüklenmesi gerekmektedir:</p>
            <div className="space-y-2 pt-2">
              {details.documents.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Secure Trust Center Info */}
          <div className="bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10 rounded-xl p-6 space-y-3">
            <ShieldAlert size={20} className="text-blue-500" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Rapidsy Güvence Merkezi</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tüm işlemler Rapidsy yasal altyapısı, dijital hizmet sözleşmeleri ve entegre sigorta korumaları altında gerçekleştirilir. Müşteriler ve ortaklar arasındaki haklar eşit düzeyde korunur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
