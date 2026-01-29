import React, { useState } from 'react';
import { Camera, ChevronRight, Check, Loader2 } from 'lucide-react';

const ProcessManager = ({ currentStatus, onUpdateStatus }) => {
    const [uploading, setUploading] = useState(false);

    const steps = [
        { id: 'pending', label: 'Talep Alındı', next: 'diagnosing', action: 'Teşhise Başla' },
        { id: 'diagnosing', label: 'Teşhis Ediliyor', next: 'repairing', action: 'Onarımı Başlat' },
        { id: 'repairing', label: 'Onarılıyor', next: 'quality_check', action: 'Kontrole Gönder' },
        { id: 'quality_check', label: 'Kontrol Ediliyor', next: 'completed', action: 'Teslime Hazırla' },
        { id: 'completed', label: 'Tamamlandı', next: null, action: null }
    ];

    const currentStep = steps.find(s => s.id === currentStatus) || steps[0];

    const handleNextStep = async () => {
        if (!currentStep.next) return;

        // Simulate API call
        setUploading(true);
        await new Promise(r => setTimeout(r, 1000));
        setUploading(false);

        onUpdateStatus(currentStep.next);
    };

    const handlePhotoUpload = () => {
        // Mock photo upload
        alert("Simülasyon: Kullanıcıya kamera açılır veya galeri seçtirilir.");
    };

    if (currentStatus === 'completed') {
        return (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-center gap-2 text-emerald-400">
                <Check size={20} />
                <span className="font-black uppercase text-xs tracking-widest">Süreç Tamamlandı</span>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Mevcut Durum</p>
                    <h4 className="text-white font-black text-sm">{currentStep.label}</h4>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary-600/20 flex items-center justify-center animate-pulse">
                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handlePhotoUpload}
                    className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 text-xs font-bold transition-all"
                >
                    <Camera size={16} />
                    Foto Ekle
                </button>

                <button
                    onClick={handleNextStep}
                    disabled={uploading}
                    className="flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary-900/40"
                >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : (
                        <>
                            {currentStep.action} <ChevronRight size={16} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProcessManager;
