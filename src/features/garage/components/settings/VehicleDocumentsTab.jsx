import React from "react";
import { Plus, FileText, ExternalLink } from "lucide-react";

const VehicleDocumentsTab = ({
  documents,
  showDocForm,
  setShowDocForm,
  docData,
  setDocData,
  handleAddDocSubmit
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Belge Kasası</h4>
          <p className="text-[10px] text-slate-500 font-bold">Ruhsat, poliçe ve faturalarınızı şifreli saklayın.</p>
        </div>
        <button 
          onClick={() => setShowDocForm(!showDocForm)}
          className="py-2.5 px-4 bg-primary-600 hover:bg-primary-500 rounded-xl text-slate-900 dark:text-white font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2"
        >
          <Plus size={12} /> {showDocForm ? "VAZGEÇ" : "YENİ BELGE EKLE"}
        </button>
      </div>

      {showDocForm && (
        <form onSubmit={handleAddDocSubmit} className="p-6 bg-white dark:bg-slate-900/60 rounded-xl border border-black/10 dark:border-white/10 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Belge Adı</label>
              <input 
                type="text" 
                required
                placeholder="Örn: Trafik Sigorta Poliçesi"
                value={docData.name}
                onChange={(e) => setDocData({ ...docData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Belge Tipi</label>
              <select 
                value={docData.document_type}
                onChange={(e) => setDocData({ ...docData, document_type: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="registration">Ruhsat</option>
                <option value="insurance">Sigorta Poliçesi</option>
                <option value="inspection">Muayene Belgesi</option>
                <option value="invoice">Fatura</option>
                <option value="technician_report">Ekspertiz/Servis Raporu</option>
                <option value="other">Diğer Belgeler</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Vade Bitiş Tarihi (Opsiyonel)</label>
              <input 
                type="date" 
                value={docData.expiry_date}
                onChange={(e) => setDocData({ ...docData, expiry_date: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none color-scheme-dark"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Belge Dosya Yolu / Simüle Link</label>
              <input 
                type="text" 
                placeholder="Simüle yükleme linki (Boş kalabilir)"
                value={docData.file_url}
                onChange={(e) => setDocData({ ...docData, file_url: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-slate-900 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            KAYDET
          </button>
        </form>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-white dark:bg-slate-900/20 rounded-2xl border border-dashed border-black/5 dark:border-white/5">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Kayıtlı doküman bulunmamaktadır.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl border border-black/5 dark:border-white/5 flex flex-col justify-between hover:border-black/10 dark:border-white/10 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/5 rounded-full blur-2xl"></div>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 text-primary-400">
                    <FileText size={16} />
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-400 px-2 py-1 rounded-md">
                    {doc.document_type === 'registration' ? 'Ruhsat' : 
                     doc.document_type === 'insurance' ? 'Sigorta' : 
                     doc.document_type === 'inspection' ? 'Muayene' : 
                     doc.document_type === 'invoice' ? 'Fatura' : 'Belge'}
                  </span>
                </div>
                <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">{doc.name}</h5>
                {doc.expiry_date && (
                  <p className="text-[8px] font-bold text-orange-400 uppercase mt-1">
                    VADE: {new Date(doc.expiry_date).toLocaleDateString('tr-TR')}
                  </p>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                <span className="text-[8px] font-bold text-slate-600 uppercase">
                  {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                </span>
                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[9px] font-black text-primary-400 hover:text-slate-900 dark:text-white uppercase tracking-widest transition-colors flex items-center gap-1"
                >
                  BELGEYİ GÖR <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VehicleDocumentsTab;
