import React, { useState } from "react";
import * as Icons from "lucide-react";
import { OEM_CATALOG } from "../../../constants/mockData";

const ProductCatalogModal = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  if (!isOpen) return null;

  const categories = ["Tümü", ...new Set(OEM_CATALOG.map((item) => item.category))];

  const filteredCatalog = OEM_CATALOG.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tümü" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5 shrink-0 rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icons.BookOpen className="text-primary-500" /> OEM Hazır Katalog
            </h2>
            <p className="text-xs text-slate-500 mt-1">Hızlıca stok eklemek için hazır ürün listesinden seçim yapın.</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-slate-500 transition-colors"
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-black/10 dark:border-white/10 flex flex-col md:flex-row gap-4 shrink-0 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex-1 relative">
            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Ürün adı veya marka ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-primary-500 outline-none"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary-500 outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Catalog Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalog.map((product) => (
            <div key={product.id} className="glass-card rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden flex flex-col hover:border-primary-500/50 transition-colors group">
              <div className="h-32 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase">
                  {product.category}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[10px] text-primary-500 font-bold uppercase">{product.brand}</p>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight mt-0.5 line-clamp-2">{product.name}</h3>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 mb-4 line-clamp-2">{product.description}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-black text-lg text-slate-900 dark:text-white">₺{product.price}</span>
                  <button
                    onClick={() => {
                      onSelect(product);
                      onClose();
                    }}
                    className="bg-primary-600/10 hover:bg-primary-600 text-primary-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    <Icons.Plus size={14} /> SEÇ
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredCatalog.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
              <Icons.SearchX size={48} className="mb-4 opacity-50" />
              <p>Arama kriterlerine uygun ürün bulunamadı.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductCatalogModal;
