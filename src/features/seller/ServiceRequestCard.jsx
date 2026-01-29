import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Car, FileText, ArrowRight } from 'lucide-react';

const ServiceRequestCard = ({ request }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/seller/quote-create/${request.id}`)}
            className="glass-card p-5 rounded-2xl border border-white/10 cursor-pointer active-scale transition-all hover:bg-white/5"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold">
                            <Clock size={14} />
                            Yeni Talep
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                        {request.brand} {request.model}
                    </h3>
                    <p className="text-sm text-slate-400 font-mono">{request.plate}</p>
                </div>
                <div className="text-right">
                    <div className="bg-primary-500/10 text-primary-400 px-3 py-1 rounded-lg text-xs font-bold">
                        {request.demand_type === 'part' ? 'Parça' : 'Servis'}
                    </div>
                </div>
            </div>

            {/* Description */}
            {request.description && (
                <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                    {request.description}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="text-xs text-slate-500">
                    {new Date(request.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
                <div className="flex items-center gap-1 text-primary-400 text-sm font-semibold">
                    Teklif Ver
                    <ArrowRight size={16} />
                </div>
            </div>
        </div>
    );
};

export default ServiceRequestCard;
