import React, { useState, useEffect } from 'react';
import { X, Store, Loader2, Save, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

// Document requirements configuration based on business type
const DOCUMENT_REQUIREMENTS = {
    parts: {
        label: "Yedek Parça",
        docs: [
            { id: 'tax_plate', label: "Vergi Levhası", required: true },
            { id: 'signature_circular', label: "İmza Sirküleri", required: true },
            { id: 'activity_cert', label: "Faaliyet Belgesi", required: false },
            { id: 'title_deed', label: "Tapu / Kira Kontratı (Dükkan)", required: true }
        ]
    },
    mechanic: {
        label: "Servis / Tamirhane",
        docs: [
            { id: 'tax_plate', label: "Vergi Levhası", required: true },
            { id: 'business_license', label: "İşyeri Açma ve Çalışma Ruhsatı", required: true },
            { id: 'mastership_cert', label: "Ustalık Belgesi", required: true },
            { id: 'title_deed', label: "Tapu / Kira Kontratı (Dükkan)", required: true }
        ]
    },
    parking: {
        label: "Otopark İşletmesi",
        docs: [
            { id: 'tax_plate', label: "Vergi Levhası", required: true },
            { id: 'parking_license', label: "Otopark İşletme Ruhsatı", required: true },
            { id: 'title_deed', label: "Tapu / Kira Kontratı (Mülkiyet)", required: true },
            { id: 'insurance', label: "Zorunlu Mali Sorumluluk Sigortası", required: false }
        ]
    },
    valet: {
        label: "Vale Hizmeti",
        docs: [
            { id: 'tax_plate', label: "Vergi Levhası", required: true },
            { id: 'valet_contract', label: "Vale Hizmet Sözleşmesi", required: true },
            { id: 'myk_cert', label: "MYK Mesleki Yeterlilik Belgesi", required: true },
            { id: 'insurance', label: "Sigorta Poliçesi", required: true }
        ]
    }
};

const SellerRegistrationModal = ({ show, onClose, t, onCompleteRegistration, showAlert }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        tax_id: '',
        category: 'parts', 
        city: '',
        address: '',
        files: {} // Stores file objects: { tax_plate: File, ... }
    });

    // Reset form when modal opens
    useEffect(() => {
        if (show) {
            setFormData(prev => ({ ...prev, files: {} }));
        }
    }, [show]);

    if (!show || !t) return null;

    const currentReqs = DOCUMENT_REQUIREMENTS[formData.category] || DOCUMENT_REQUIREMENTS.parts;

    const handleFileChange = (docId, file) => {
        setFormData(prev => ({
            ...prev,
            files: {
                ...prev.files,
                [docId]: file
            }
        }));
    };

    const validateForm = () => {
        // Check required documents
        const missingDocs = currentReqs.docs
            .filter(doc => doc.required && !formData.files[doc.id])
            .map(doc => doc.label);

        if (missingDocs.length > 0) {
            showAlert("Eksik Belge", `Lütfen zorunlu belgeleri yükleyiniz: ${missingDocs.join(', ')}`, "warning");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            // In a real app, we would upload files here first
            console.log("Submitting with files:", formData.files);
            
            await onCompleteRegistration(formData);
            showAlert("Başarılı", "Partner başvurunuz ve belgeleriniz alındı! Onay sürecinden sonra bilgilendirileceksiniz.", "success");
            onClose();
        } catch {
            showAlert("Hata", "Kayıt sırasında bir sorun oluştu.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="p-8">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20} className="text-slate-500" /></button>

                    <div className="mb-8">
                        <div className="bg-orange-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border border-orange-200">
                            <Store size={28} className="text-orange-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">{t.sellerRegTitle || "Partner Başvurusu"}</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Gerekli belgeleri yükleyerek Carvis iş ortağı olun.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">İşletme Adı</label>
                                <input
                                    type="text"
                                    value={formData.company_name}
                                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">Kategori</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value, files: {} })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                >
                                    {Object.entries(DOCUMENT_REQUIREMENTS).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">Vergi / TC No</label>
                                <input
                                    type="text"
                                    value={formData.tax_id}
                                    onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">Şehir</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">Açık Adres</label>
                                <textarea
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm h-20 resize-none"
                                ></textarea>
                            </div>
                        </div>

                        {/* Document Upload Section */}
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-orange-500" />
                                Gerekli Belgeler
                            </h3>
                            
                            <div className="space-y-3">
                                {currentReqs.docs.map((doc) => (
                                    <div key={doc.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-orange-200 transition-colors">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm text-slate-700 truncate">{doc.label}</span>
                                                {doc.required ? (
                                                    <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Zorunlu</span>
                                                ) : (
                                                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Opsiyonel</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                                {formData.files[doc.id] ? (
                                                    <span className="text-green-600 font-bold flex items-center gap-1">
                                                        <CheckCircle size={12} /> {formData.files[doc.id].name}
                                                    </span>
                                                ) : (
                                                    <span>Henüz yüklenmedi</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                id={`file-${doc.id}`}
                                                className="hidden" 
                                                onChange={(e) => {
                                                    if(e.target.files[0]) handleFileChange(doc.id, e.target.files[0]);
                                                }}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                            />
                                            <label 
                                                htmlFor={`file-${doc.id}`}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                                                    formData.files[doc.id] 
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg active:scale-95'
                                                }`}
                                            >
                                                {formData.files[doc.id] ? 'Değiştir' : 'Yükle'}
                                                <Upload size={14} />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-4 flex items-start gap-2 bg-blue-50 p-3 rounded-xl">
                                <AlertCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-600 leading-tight">Yüklenen belgeler KVKK kapsamında şifrelenerek saklanır ve sadece onay süreci için kullanılır.</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active-scale disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={20} /> Başvuruyu Tamamla</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellerRegistrationModal;
