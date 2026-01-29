import React from 'react';
import { Sparkles, ShoppingCart, Wrench, ChevronRight, Zap, Battery, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';

// AI-generated suggestions based on vehicle data
const getAISuggestions = (vehicle) => {
    if (!vehicle) return [];

    const km = parseInt(vehicle.km) || 0;
    const suggestions = [];

    // Mileage-based suggestions
    if (km > 50000) {
        suggestions.push({
            id: 1,
            type: 'part',
            icon: Filter,
            title: 'Yağ Filtresi Değişimi',
            reason: `${km.toLocaleString()} km'de yağ filtresi kontrol edilmeli`,
            price: '120₺ - 250₺',
            action: '/app/parts',
            urgency: 'medium',
            brand: vehicle.brand
        });
    }

    if (km > 80000) {
        suggestions.push({
            id: 2,
            type: 'service',
            icon: Zap,
            title: 'Bujiler Kontrol Edilmeli',
            reason: `${vehicle.brand} ${vehicle.model} için önerilen değişim zamanı`,
            price: '400₺ - 800₺',
            action: '/app/mechanics',
            urgency: 'low',
            brand: vehicle.brand
        });
    }

    if (km > 60000) {
        suggestions.push({
            id: 3,
            type: 'part',
            icon: Battery,
            title: 'Akü Durumu',
            reason: 'Ortalama akü ömrü 3-5 yıl, kontrol önerilir',
            price: '1.200₺ - 2.500₺',
            action: '/app/parts',
            urgency: 'high',
            brand: vehicle.brand
        });
    }

    // Brand-specific suggestions
    if (vehicle.brand === 'BMW' || vehicle.brand === 'Mercedes' || vehicle.brand === 'Audi') {
        suggestions.push({
            id: 4,
            type: 'service',
            icon: Wrench,
            title: 'Premium Bakım Paketi',
            reason: `${vehicle.brand} yetkili servis kalitesinde bakım`,
            price: '2.500₺ - 5.000₺',
            action: '/app/mechanics',
            urgency: 'low',
            brand: vehicle.brand
        });
    }

    return suggestions.slice(0, 3); // Max 3 suggestions
};

const AISuggestionCard = ({ vehicle }) => {
    const navigate = useNavigate();
    const { addServiceToCart } = useShop();
    const suggestions = getAISuggestions(vehicle);

    if (!vehicle || suggestions.length === 0) return null;

    const handleAction = (suggestion) => {
        if (suggestion.type === 'service') {
            // Add to cart and navigate
            addServiceToCart({
                id: suggestion.id,
                name: suggestion.title,
                description: suggestion.reason,
                price: parseInt(suggestion.price.replace(/[^\d]/g, '')) || 500,
                shopName: 'AI Önerisi',
                mechanicName: 'Otomatik Seçim'
            });
        } else {
            navigate(suggestion.action);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 px-1">
                <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-1.5 rounded-xl">
                    <Sparkles size={18} className="text-white" />
                </div>
                <h3 className="font-black text-white italic text-xl tracking-tighter">AI Önerileri</h3>
                <span className="text-[9px] font-black text-primary-400 bg-primary-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest ml-auto">
                    {vehicle.brand} {vehicle.model}
                </span>
            </div>

            {/* Suggestion Cards */}
            <div className="space-y-3">
                {suggestions.map(suggestion => {
                    const Icon = suggestion.icon;
                    const urgencyColors = {
                        high: 'border-red-500/30 bg-red-500/5',
                        medium: 'border-amber-500/30 bg-amber-500/5',
                        low: 'border-green-500/30 bg-green-500/5'
                    };
                    const urgencyBadge = {
                        high: { bg: 'bg-red-500', text: 'Acil' },
                        medium: { bg: 'bg-amber-500', text: 'Yakında' },
                        low: { bg: 'bg-green-500', text: 'Planla' }
                    };

                    return (
                        <div
                            key={suggestion.id}
                            onClick={() => handleAction(suggestion)}
                            className={`glass-card p-4 rounded-2xl border ${urgencyColors[suggestion.urgency]} cursor-pointer active-scale group transition-all hover:border-primary-500/50`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${suggestion.type === 'service' ? 'bg-accent-500/20' : 'bg-primary-500/20'
                                    }`}>
                                    <Icon size={24} className={suggestion.type === 'service' ? 'text-accent-400' : 'text-primary-400'} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-white text-sm">{suggestion.title}</h4>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full text-white ${urgencyBadge[suggestion.urgency].bg}`}>
                                            {urgencyBadge[suggestion.urgency].text}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-1">{suggestion.reason}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-primary-400 font-bold">{suggestion.price}</span>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 group-hover:text-primary-400 transition-colors">
                                            {suggestion.type === 'service' ? (
                                                <>
                                                    <ShoppingCart size={12} /> Sepete Ekle
                                                </>
                                            ) : (
                                                <>
                                                    Parçalara Git <ChevronRight size={12} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AISuggestionCard;
