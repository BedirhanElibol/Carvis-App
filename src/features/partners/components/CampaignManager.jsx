import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Tag, Trash2, Eye, EyeOff, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { useUI } from '../../../context/UIContext';

const CampaignManager = () => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    discount_percent: '',
    valid_until: '',
    campaign_type: 'discount', // 'discount' | 'bundle' | 'seasonal'
  });

  const fetchCampaigns = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('seller_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (!error) setCampaigns(data || []);
    } catch (err) {
      console.error('CampaignManager fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showAlert('Hata', 'Lütfen kampanya başlığı girin.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('campaigns').insert([{
        seller_id: currentUser.id,
        title: form.title.trim(),
        description: form.description.trim(),
        discount_percent: form.discount_percent ? parseInt(form.discount_percent) : null,
        valid_until: form.valid_until || null,
        campaign_type: form.campaign_type,
        is_active: true,
      }]);

      if (error) throw error;
      showAlert('Başarılı', 'Kampanya yayınlandı!', 'success');
      setShowForm(false);
      setForm({ title: '', description: '', discount_percent: '', valid_until: '', campaign_type: 'discount' });
      fetchCampaigns();
    } catch (err) {
      console.error('Campaign create err:', err);
      showAlert('Hata', 'Kampanya oluşturulamadı.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (campaign) => {
    try {
      await supabase
        .from('campaigns')
        .update({ is_active: !campaign.is_active })
        .eq('id', campaign.id);
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, is_active: !c.is_active } : c));
    } catch (err) {
      console.error('Toggle campaign err:', err);
    }
  };

  const deleteCampaign = async (id) => {
    try {
      await supabase.from('campaigns').delete().eq('id', id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      showAlert('Silindi', 'Kampanya kaldırıldı.', 'success');
    } catch (err) {
      console.error('Delete campaign err:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Kampanya Motoru</h2>
          <p className="text-sm text-slate-500">Müşterilere özel teklifler ve indirimler oluşturun.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCampaigns} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white px-4 py-3 rounded-xl font-bold text-sm transition-all active-scale"
          >
            <Plus size={16} /> Kampanya Oluştur
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl border border-black/5 dark:border-white/5 space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20">
              <Sparkles size={18} className="text-primary-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Yeni Kampanya</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Başlık *</label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Örn: Yaz Bakım Kampanyası"
                className="mt-1 w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">İndirim %</label>
              <input
                type="number"
                value={form.discount_percent}
                onChange={e => setForm(p => ({ ...p, discount_percent: e.target.value }))}
                placeholder="Örn: 20"
                min="1" max="100"
                className="mt-1 w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Açıklama</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              placeholder="Kampanya detayları, şartlar ve koşullar..."
              className="mt-1 w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bitiş Tarihi</label>
              <input
                type="date"
                value={form.valid_until}
                onChange={e => setForm(p => ({ ...p, valid_until: e.target.value }))}
                className="mt-1 w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kampanya Tipi</label>
              <select
                value={form.campaign_type}
                onChange={e => setForm(p => ({ ...p, campaign_type: e.target.value }))}
                className="mt-1 w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 transition-colors"
              >
                <option value="discount">İndirim</option>
                <option value="bundle">Paket Deal</option>
                <option value="seasonal">Sezonluk</option>
                <option value="loyalty">Sadakat</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl font-bold text-sm text-slate-500 dark:text-slate-400 transition-all active-scale"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white rounded-2xl font-bold text-sm transition-all active-scale shadow-lg shadow-primary-500/20 disabled:opacity-50"
            >
              {submitting ? 'Yayınlanıyor...' : 'Kampanyayı Yayınla'}
            </button>
          </div>
        </form>
      )}

      {/* Campaigns List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-primary-400" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-xl border border-dashed border-black/10 dark:border-white/10">
          <Tag size={32} className="mx-auto text-slate-400 mb-3" />
          <p className="font-bold text-slate-500">Henüz kampanya yok</p>
          <p className="text-sm text-slate-400 mt-1">İlk kampanyanızı oluşturun, müşterileriniz görsün!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              className={`glass-card p-5 rounded-2xl border transition-all ${
                campaign.is_active
                  ? 'border-primary-500/30 bg-primary-500/5'
                  : 'border-black/5 dark:border-white/5 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    campaign.campaign_type === 'discount' ? 'bg-green-500/20 text-green-400' :
                    campaign.campaign_type === 'bundle' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {campaign.campaign_type}
                  </span>
                  {campaign.discount_percent && (
                    <span className="ml-2 text-[9px] font-black text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded uppercase">
                      %{campaign.discount_percent} İndirim
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleActive(campaign)}
                    className={`p-2 rounded-lg transition-all ${campaign.is_active ? 'text-green-400 bg-green-500/10' : 'text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-white/5'}`}
                  >
                    {campaign.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    className="p-2 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">{campaign.title}</h3>
              {campaign.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{campaign.description}</p>
              )}
              {campaign.valid_until && (
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                  Bitiş: {new Date(campaign.valid_until).toLocaleDateString('tr-TR')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
