import React, { useState } from 'react';
import { Settings, X, Save, User, Phone, Store, CreditCard } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const SettingsModal = ({ show, onClose, t, currentUser, showAlert }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: currentUser?.user_metadata?.full_name || '',
        phone: currentUser?.user_metadata?.phone || '',
        company_name: currentUser?.user_metadata?.company_name || '',
    });

    if (!show || !t) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: formData.full_name,
                    phone: formData.phone,
                    company_name: formData.company_name
                }
            });

            if (error) throw error;

            // Profile tablosunu da güncelle (opsiyonel ama iyi olur)
            await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    company_name: formData.company_name
                })
                .eq('id', currentUser.id);

            showAlert("Başarılı", "Profiliniz güncellendi.", "success");
            onClose();
        } catch (error) {
            console.error(error);
            showAlert("Hata", "Güncelleme sırasında bir sorun oluştu.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleBecomeSeller = async () => {
        const confirm = window.confirm("Satıcı (Usta) moduna geçmek istiyor musunuz? Bu işlemden sonra teklif verebilirsiniz.");
        if (!confirm) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: 'seller' })
                .eq('id', currentUser.id);

            if (error) throw error;

            showAlert("Tebrikler!", "Artık bir satıcısınız. Dashboard'u yenileyin.", "success");
            onClose();
            window.location.reload(); // Rol değiştiği için uygulamayı yenilemek en temizi
        } catch (error) {
            console.error(error);
            showAlert("Hata", "İşlem sırasında bir sorun oluştu.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-200 border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black text-2xl text-white italic tracking-tighter flex items-center gap-3">
                        <Settings size={28} className="text-primary-500" /> {t.settings}
                    </h3>
                    <button onClick={onClose} className="bg-white/5 p-3 rounded-2xl hover:bg-white/10 border border-white/10 transition-all">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Profil Bilgileri */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Ad Soyad</label>
                            <div className="relative group">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-primary-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Telefon</label>
                            <div className="relative group">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-primary-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <button onClick={handleSave} disabled={loading} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary-600/20 active-scale disabled:opacity-50">
                            <Save size={18} /> {loading ? "Yükleniyor..." : "Bilgileri Kaydet"}
                        </button>

                        {currentUser?.user_metadata?.role !== 'seller' && (
                            <button onClick={handleBecomeSeller} disabled={loading} className="w-full bg-white/5 text-accent-500 border border-accent-500/20 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-accent-500/10 transition-all active-scale">
                                <Store size={18} /> Satıcı Moduna Geç (Usta/Servis)
                            </button>
                        )}
                    </div>

                    {/* AI Info */}
                    <div className="bg-primary-500/5 border border-primary-500/10 p-5 rounded-2xl">
                        <div className="flex gap-4">
                            <div className="bg-primary-500/10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CreditCard size={20} className="text-primary-500" />
                            </div>
                            <div className="text-[10px] leading-relaxed">
                                <p className="text-slate-200 font-black uppercase tracking-widest mb-1">AI API Status</p>
                                <p className="text-slate-500 font-medium italic">Yapay Zeka (AI) API anahtarı bu ortamda otomatik olarak sağlanmaktadır. Carvis AI asistanınız her zaman aktif.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
