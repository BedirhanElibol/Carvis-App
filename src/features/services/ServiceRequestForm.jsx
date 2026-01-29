import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGarage } from '../../context/GarageContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Car, FileText, Send } from 'lucide-react';

const ServiceRequestForm = () => {
    const navigate = useNavigate();
    const { vehicles, currentVehicle } = useGarage();
    const { currentUser } = useAuth();
    const { showAlert } = useUI();

    const [formData, setFormData] = useState({
        vehicle_id: currentVehicle?.id || '',
        plate: currentVehicle?.plate || '',
        brand: currentVehicle?.brand || '',
        model: currentVehicle?.model || '',
        engine_code: '',
        demand_type: 'part', // 'part' veya 'service'
        description: '',
    });

    const [loading, setLoading] = useState(false);

    const handleVehicleChange = (e) => {
        const vehicleId = e.target.value;
        const selectedVehicle = vehicles.find(v => v.id === parseInt(vehicleId));

        if (selectedVehicle) {
            setFormData({
                ...formData,
                vehicle_id: selectedVehicle.id,
                plate: selectedVehicle.plate,
                brand: selectedVehicle.brand,
                model: selectedVehicle.model,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.description.trim()) {
            showAlert('Hata', 'Lütfen talep açıklaması girin.', 'error');
            return;
        }

        if (!formData.plate) {
            showAlert('Hata', 'Lütfen bir araç seçin.', 'error');
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('service_requests')
                .insert([{
                    user_id: currentUser.id,
                    plate: formData.plate,
                    brand: formData.brand,
                    model: formData.model,
                    engine_code: formData.engine_code || null,
                    demand_type: formData.demand_type,
                    description: formData.description,
                    status: 'pending',
                }])
                .select()
                .single();

            if (error) throw error;

            showAlert(
                'Başarılı',
                'Talebiniz oluşturuldu! Satıcılar size teklif gönderecek.',
                'success'
            );

            // Bildirim oluştur (opsiyonel - satıcılara bildirim gönderilebilir)
            await supabase
                .from('notifications')
                .insert([{
                    user_id: currentUser.id,
                    type: 'system',
                    title: 'Talep Oluşturuldu',
                    message: `${formData.brand} ${formData.model} için talebiniz alındı.`,
                }]);

            navigate('/quotes');
        } catch (error) {
            console.error('Error creating service request:', error);
            showAlert('Hata', 'Talep oluşturulamadı. Lütfen tekrar deneyin.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Yeni Talep Oluştur</h1>
                        <p className="text-xs text-slate-400">Parça veya servis talebi</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Araç Seçimi */}
                <div className="glass-card p-5 rounded-2xl border border-white/10">
                    <label className="flex items-center gap-2 text-sm font-bold mb-3">
                        <Car size={18} className="text-primary-500" />
                        Araç Seçin
                    </label>
                    <select
                        value={formData.vehicle_id}
                        onChange={handleVehicleChange}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none"
                        required
                    >
                        <option value="">Araç seçin...</option>
                        {vehicles.map(vehicle => (
                            <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.brand} {vehicle.model} - {vehicle.plate}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Motor Kodu (Opsiyonel) */}
                <div className="glass-card p-5 rounded-2xl border border-white/10">
                    <label className="text-sm font-bold mb-3 block">
                        Motor Kodu <span className="text-slate-500">(Opsiyonel)</span>
                    </label>
                    <input
                        type="text"
                        value={formData.engine_code}
                        onChange={(e) => setFormData({ ...formData, engine_code: e.target.value })}
                        placeholder="Örn: 1.6 TDI, 1.5 TSI"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                    />
                </div>

                {/* Talep Tipi */}
                <div className="glass-card p-5 rounded-2xl border border-white/10">
                    <label className="text-sm font-bold mb-3 block">Talep Tipi</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, demand_type: 'part' })}
                            className={`p-4 rounded-xl font-semibold transition-all ${formData.demand_type === 'part'
                                ? 'bg-primary-500 text-white'
                                : 'glass-card text-slate-400'
                                }`}
                        >
                            Parça Talebi
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, demand_type: 'service' })}
                            className={`p-4 rounded-xl font-semibold transition-all ${formData.demand_type === 'service'
                                ? 'bg-primary-500 text-white'
                                : 'glass-card text-slate-400'
                                }`}
                        >
                            Servis Talebi
                        </button>
                    </div>
                </div>

                {/* Açıklama */}
                <div className="glass-card p-5 rounded-2xl border border-white/10">
                    <label className="flex items-center gap-2 text-sm font-bold mb-3">
                        <FileText size={18} className="text-primary-500" />
                        Talep Açıklaması
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={
                            formData.demand_type === 'part'
                                ? 'Örn: Ön fren balatası ve disk lazım. Fren pedalında titreşim var.'
                                : 'Örn: Periyodik bakım yaptırmak istiyorum. Yağ, filtre değişimi.'
                        }
                        rows={5}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none resize-none"
                        required
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        Detaylı açıklama yaparsanız daha doğru teklifler alırsınız.
                    </p>
                </div>

                {/* Bilgilendirme */}
                <div className="glass-card p-4 rounded-2xl border border-primary-500/30 bg-primary-500/5">
                    <p className="text-sm text-slate-300">
                        <span className="font-bold text-primary-400">💡 İpucu:</span> Talebinizi oluşturduktan sonra satıcılar size teklif gönderecek. Teklifleri karşılaştırıp en uygununu seçebilirsiniz.
                    </p>
                </div>

                {/* Gönder Butonu */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-500 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white active-scale disabled:opacity-50"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <Send size={20} />
                            Talebi Gönder
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ServiceRequestForm;
