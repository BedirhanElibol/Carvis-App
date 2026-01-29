import React, { useState } from 'react';
import { X, Mail, Lock, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const RegisterModal = ({ show, onClose, t, onSwitchToLogin, showAlert, loginIntent }) => {
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (!show || !t) return null;

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: { data: { full_name: formData.fullName, role: loginIntent || 'customer' } }
            });
            if (error) throw error;
            showAlert("Başarılı", t.registerSuccess || "Kayıt başarılı! Lütfen e-postanı onayla.", "success");
            onClose();
        } catch (error) {
            showAlert("Hata", error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20} className="text-slate-500" /></button>
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">{t.registerTitle}</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">{loginIntent === 'seller' ? "Satıcı hesabı oluştur." : "Rapidsy dünyasına katıl."}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <input type="text" placeholder="Ad Soyad" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm" />
                        </div>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                            <input type="email" placeholder={t.emailPlaceholder} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm" />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                            <input type={showPassword ? "text" : "password"} placeholder={t.passwordPlaceholder} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 pr-12 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-500 text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-primary-900/20 flex items-center justify-center gap-3 active-scale mt-4 h-16 disabled:opacity-70">
                            {loading ? <Loader2 className="animate-spin" size={24} /> : <><UserPlus size={20} /> {t.registerTitle}</>}
                        </button>
                    </form>
                    <div className="mt-8 text-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <p className="text-xs text-slate-500 font-bold mb-3">{t.haveAccount || "Zaten hesabın var mı?"}</p>
                        <button onClick={onSwitchToLogin} className="text-primary-600 font-black text-xs uppercase tracking-widest hover:underline">{t.loginTitle}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;
