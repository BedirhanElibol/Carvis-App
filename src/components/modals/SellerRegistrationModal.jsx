import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { supabase } from "../../supabaseClient";

// Document requirements configuration based on business type
const DOCUMENT_REQUIREMENTS = {
  parts: {
    label: "Yedek Parça",
    docs: [
      { id: "tax_plate", label: "Vergi Levhası", required: true },
      { id: "signature_circular", label: "İmza Sirküleri", required: true },
      { id: "activity_cert", label: "Faaliyet Belgesi", required: false },
      {
        id: "title_deed",
        label: "Tapu / Kira Kontratı (Dükkan)",
        required: true,
      },
    ],
  },
  mechanic: {
    label: "Servis / Tamirhane",
    docs: [
      { id: "tax_plate", label: "Vergi Levhası", required: true },
      {
        id: "business_license",
        label: "İşyeri Açma ve Çalışma Ruhsatı",
        required: true,
      },
      { id: "mastership_cert", label: "Ustalık Belgesi", required: true },
      {
        id: "title_deed",
        label: "Tapu / Kira Kontratı (Dükkan)",
        required: true,
      },
    ],
  },
  parking: {
    label: "Otopark İşletmesi",
    docs: [
      { id: "tax_plate", label: "Vergi Levhası", required: true },
      {
        id: "parking_license",
        label: "Otopark İşletme Ruhsatı",
        required: true,
      },
      {
        id: "title_deed",
        label: "Tapu / Kira Kontratı (Mülkiyet)",
        required: true,
      },
      {
        id: "insurance",
        label: "Zorunlu Mali Sorumluluk Sigortası",
        required: false,
      },
    ],
  },
  valet: {
    label: "Vale Hizmeti",
    docs: [
      { id: "tax_plate", label: "Vergi Levhası", required: true },
      { id: "valet_contract", label: "Vale Hizmet Sözleşmesi", required: true },
      {
        id: "myk_cert",
        label: "MYK Mesleki Yeterlilik Belgesi",
        required: true,
      },
      { id: "insurance", label: "Sigorta Poliçesi", required: true },
    ],
  },
};

const SellerRegistrationModal = ({
  show,
  onClose,
  t,
  onCompleteRegistration,
  showAlert,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: "",
    tax_id: "",
    category: "parts",
    city: "",
    address: "",
    files: {}, 
    business_details: {
      capacity: "",
      staff_count: "",
      expertise: [],
      working_hours: "09:00 - 18:00",
      brands: "",
      insurance_limit: ""
    }
  });

  const [isKvkkAccepted, setIsKvkkAccepted] = useState(false);
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setFormData((prev) => ({ ...prev, currentStep: 1, files: {} }));
      setIsKvkkAccepted(false);
      setIsPrivacyAccepted(false);
    }
  }, [show]);

  if (!show || !t) return null;

  const currentReqs =
    DOCUMENT_REQUIREMENTS[formData.category] || DOCUMENT_REQUIREMENTS.parts;

  const handleFileChange = (docId, file) => {
    setFormData((prev) => ({
      ...prev,
      files: { ...prev.files, [docId]: file },
    }));
  };

  const validateStep1 = () => {
    if (!formData.company_name || !formData.tax_id || !formData.city || !formData.address) {
      showAlert("Hata", "Lütfen tüm temel alanları doldurunuz.", "warning");
      return false;
    }
    const missingDocs = currentReqs.docs
      .filter((doc) => doc.required && !formData.files[doc.id])
      .map((doc) => doc.label);

    if (missingDocs.length > 0) {
      showAlert("Eksik Belge", `Lütfen zorunlu belgeleri yükleyiniz: ${missingDocs.join(", ")}`, "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isKvkkAccepted || !isPrivacyAccepted) {
      showAlert("Zorunlu Onay", "Lütfen yasal metinleri onaylayın.", "warning");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum açılamadı.");

      const uploadedFiles = {};
      for (const [docId, file] of Object.entries(formData.files)) {
        if (!file) continue;
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${docId}_${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("partner-documents").upload(filePath, file);
        if (uploadError) throw uploadError;
        uploadedFiles[docId] = filePath;
      }

      // Remove direct role escalation. 
      // Update profile with pending status and applied role.
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          application_status: "pending",
          applied_role: formData.category,
          verification_status: "pending",
          company_name: formData.company_name,
          tax_id: formData.tax_id,
          verification_documents: uploadedFiles,
          business_details: formData.business_details,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Submit to Partner Applications to be reviewed by Admin
      const { error: appError } = await supabase.from("partner_applications").insert({
        user_id: user.id,
        company_name: formData.company_name,
        tax_number: formData.tax_id,
        office_address: formData.address,
        status: "pending",
      });

      if (appError) console.error("Partner app insert issue:", appError);

      showAlert("Başvuru Alındı", "Detaylı başvurunuz alındı ve inceleme sürecine başlandı.", "success");
      if (onCompleteRegistration) onCompleteRegistration();
      onClose();
    } catch (error) {
      showAlert("Hata", error.message || "Kayıt hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">İşletme Adı</label>
          <input type="text" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Kategori</label>
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, files: {} })} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm">
            {Object.entries(DOCUMENT_REQUIREMENTS).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Vergi / TC No</label>
          <input type="text" value={formData.tax_id} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })} required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Şehir</label>
          <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Açık Adres</label>
          <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm h-20 resize-none"></textarea>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Icons.FileText size={20} className="text-orange-500" /> Gerekli Belgeler
        </h3>
        <div className="space-y-3">
          {currentReqs.docs.map((doc) => (
            <div key={doc.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-orange-200 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-700 truncate">{doc.label}</span>
                  {doc.required && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Zorunlu</span>}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  {formData.files[doc.id] ? <span className="text-green-600 font-bold flex items-center gap-1"><Icons.CheckCircle size={12} /> {formData.files[doc.id].name}</span> : <span>Henüz yüklenmedi</span>}
                </div>
              </div>
              <div className="relative">
                <input type="file" id={`file-${doc.id}`} className="hidden" onChange={(e) => e.target.files[0] && handleFileChange(doc.id, e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
                <label htmlFor={`file-${doc.id}`} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${formData.files[doc.id] ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800 shadow-md hover:shadow-lg active:scale-95"}`}>
                  {formData.files[doc.id] ? "Değiştir" : "Yükle"} <Icons.Upload size={14} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button type="button" onClick={() => validateStep1() && setCurrentStep(2)} className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 group shadow-xl">
        Kapasite Bilgilerine Geç <Icons.ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 mb-4">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
          <Icons.Zap size={20} className="text-orange-500" /> İşletme Nicelikleri
        </h3>
        <p className="text-xs text-slate-500 mt-1">İşletmenizin kapasitesini detaylandırarak güvenilirliğinizi artırın.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formData.category === "mechanic" && (
          <>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Lift Sayısı</label>
              <input type="number" placeholder="Örn: 4" value={formData.business_details.capacity} onChange={(e) => setFormData({...formData, business_details: {...formData.business_details, capacity: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Usta Sayısı</label>
              <input type="number" placeholder="Örn: 6" value={formData.business_details.staff_count} onChange={(e) => setFormData({...formData, business_details: {...formData.business_details, staff_count: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm" />
            </div>
          </>
        )}

        {formData.category === "parking" && (
          <>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Toplam Araç Kapasitesi</label>
              <input type="number" placeholder="Örn: 100" value={formData.business_details.capacity} onChange={(e) => setFormData({...formData, business_details: {...formData.business_details, capacity: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Güvenlik Sistemi (Kamera)</label>
              <select onChange={(e) => setFormData({...formData, business_details: {...formData.business_details, security: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm">
                <option value="yes">Var (7/24 Aktif)</option>
                <option value="no">Yok</option>
              </select>
            </div>
          </>
        )}

        {formData.category === "parts" && (
          <>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Desteklenen Marka Sayısı</label>
              <input type="number" placeholder="Örn: 15" value={formData.business_details.brands} onChange={(e) => setFormData({...formData, business_details: {...formData.business_details, brands: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Kendi Kurye Hizmeti</label>
              <select onChange={(e) => setFormData({...formData, business_details: {...formData.business_details, courier: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm">
                <option value="yes">Var</option>
                <option value="no">Yok</option>
              </select>
            </div>
          </>
        )}

        {formData.category === "valet" && (
          <>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Şoför Sayısı</label>
              <input type="number" placeholder="Örn: 12" value={formData.business_details.staff_count} onChange={(e) => setFormData({...formData, business_details: {...formData.business_details, staff_count: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Sigorta Teminat Tutarı (₺)</label>
              <input type="text" placeholder="Örn: 1.000.000" value={formData.business_details.insurance_limit} onChange={(e) => setFormData({...formData, business_details: {...formData.business_details, insurance_limit: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm" />
            </div>
          </>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-black/5 dark:border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Icons.ShieldCheck size={18} className="text-orange-500" /> Yasal Onaylar
        </h3>
        <label className="flex items-start gap-4 cursor-pointer group">
          <input type="checkbox" checked={isKvkkAccepted} onChange={(e) => setIsKvkkAccepted(e.target.checked)} className="peer hidden" />
          <div className="w-6 h-6 border-2 border-black/10 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-950 peer-checked:bg-orange-600 peer-checked:border-orange-600 transition-all flex items-center justify-center shrink-0 mt-0.5">
            <Icons.Check size={14} className="text-slate-900 dark:text-white opacity-0 peer-checked:opacity-100" />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-tight">Partner KVKK Aydınlatma Metni'ni okudum, verilerimin işlenmesini kabul ediyorum.</span>
        </label>
        <label className="flex items-start gap-4 cursor-pointer group">
          <input type="checkbox" checked={isPrivacyAccepted} onChange={(e) => setIsPrivacyAccepted(e.target.checked)} className="peer hidden" />
          <div className="w-6 h-6 border-2 border-black/10 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-950 peer-checked:bg-orange-600 peer-checked:border-orange-600 transition-all flex items-center justify-center shrink-0 mt-0.5">
            <Icons.Check size={14} className="text-slate-900 dark:text-white opacity-0 peer-checked:opacity-100" />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-tight">İş Ortağı Gizlilik Sözleşmesi'ni onaylıyorum.</span>
        </label>
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={() => setCurrentStep(1)} className="flex-1 bg-slate-100 text-slate-900 p-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-md">Geri</button>
        <button type="submit" disabled={loading} className="flex-[2] bg-orange-600 hover:bg-orange-500 text-slate-900 dark:text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-orange-950/20 disabled:opacity-50">
          {loading ? <Icons.Loader2 className="animate-spin mx-auto" size={24} /> : "Başvuruyu Gönder"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="p-8">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            <Icons.X size={20} className="text-slate-500" />
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${currentStep === 1 ? "bg-orange-500" : "bg-slate-200 transition-all"}`}></span>
              <span className={`w-3 h-3 rounded-full ${currentStep === 2 ? "bg-orange-500" : "bg-slate-200 transition-all"}`}></span>
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Aşama {currentStep} / 2</span>
            </div>
            <div className="bg-orange-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border border-orange-200">
              <Icons.Store size={28} className="text-orange-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              {t.sellerRegTitle || "Partner Başvurusu"}
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Gerekli belgeleri ve işletme kapasitesini paylaşarak aramıza katılın.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 ? renderStep1() : renderStep2()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerRegistrationModal;
