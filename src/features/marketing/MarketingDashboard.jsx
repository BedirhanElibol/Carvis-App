import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  BuildingStorefrontIcon, 
  ChatBubbleLeftRightIcon,
  PlayIcon,
  StopIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const MarketingDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('İstanbul Oto Sanayi Yedek Parça');
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Subscribe to realtime changes
    const leadsSubscription = supabase
      .channel('public:whatsapp_leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_leads' }, () => {
        fetchData(); // Refresh on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsSubscription);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, campaignRes] = await Promise.all([
        supabase.from('whatsapp_leads').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('whatsapp_campaigns').select('*').limit(1).single()
      ]);
      
      if (leadsRes.data) setLeads(leadsRes.data);
      if (campaignRes.data) setCampaign(campaignRes.data);
    } catch (error) {
      console.error("Error fetching marketing data", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaign = async () => {
    if (!campaign) return;
    const { data } = await supabase
      .from('whatsapp_campaigns')
      .update({ is_active: !campaign.is_active })
      .eq('id', campaign.id)
      .select()
      .single();
      
    if (data) setCampaign(data);
  };

  const handleScrape = async () => {
    // In a real app, this would call a Supabase Edge Function which triggers your scraper.js
    // Since scraper.js is a local Node script in our setup, we mock the UI trigger here.
    setIsScraping(true);
    alert(`Backend'de '${searchQuery}' için tarama başlatılıyor. (Lokal servisi çalıştırdığınızdan emin olun)`);
    setTimeout(() => setIsScraping(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-500" />
            WhatsApp Büyüme Motoru
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sanayicilere ve toptancılara otomatik ulaşım sistemi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 border-t-4 border-green-500">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Bot Durumu</h2>
            
            {campaign ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Durum:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {campaign.is_active ? 'Aktif (Gönderiyor)' : 'Durduruldu'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Günlük Limit:</span>
                  <span className="text-sm text-gray-900">{campaign.daily_limit} Mesaj</span>
                </div>

                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Şablon Mesajı</label>
                  <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 font-mono">
                    {campaign.template_text}
                  </div>
                </div>

                <button
                  onClick={toggleCampaign}
                  className={`w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-900 dark:text-white ${campaign.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {campaign.is_active ? <><StopIcon className="w-5 h-5"/> Kampanyayı Durdur</> : <><PlayIcon className="w-5 h-5"/> Kampanyayı Başlat</>}
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Veritabanında kampanya kaydı bulunamadı. Lütfen SQL migration'ı çalıştırın.</div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
             <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MagnifyingGlassIcon className="w-5 h-5 text-indigo-500" />
                Yeni Müşteri Bul (Scrape)
             </h2>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700">Arama Terimi (Google Maps)</label>
                 <input
                   type="text"
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>
               <button
                  onClick={handleScrape}
                  disabled={isScraping}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-900 dark:text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isScraping ? 'Taranıyor...' : 'Aramayı Başlat'}
                </button>
             </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                <BuildingStorefrontIcon className="w-5 h-5 text-gray-400" />
                Potansiyel Müşteriler (Leads)
              </h3>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {leads.length} Kayıt
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firma Adı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Yükleniyor...</td></tr>
                  ) : leads.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Henüz müşteri kaydı bulunamadı. Scrape işlemini başlatın.</td></tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {lead.company_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.phone_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${lead.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' : 
                              lead.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {lead.status === 'pending' ? 'Bekliyor' : 
                             lead.status === 'contacted' ? 'Ulaşıldı' : lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute:'2-digit' }) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
