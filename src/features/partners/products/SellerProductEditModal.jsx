import React, { useState, useEffect, useMemo } from "react";
import { DollarSign, Edit2, Loader2, Package, Save, X } from "lucide-react";
import { useSeller } from "../../../context/SellerContext";
import { CAR_DATA } from "../../../constants/mockData";

const SellerProductEditModal = ({ isOpen, onClose, product }) => {
  const { updateProduct } = useSeller();
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    price: "",
    stock: "",
    description: ""
  });
  const [compatibilities, setCompatibilities] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  const availableModels = useMemo(() => {
    if (!selectedBrand) return [];
    return CAR_DATA.find((c) => c.brand === selectedBrand)?.models || [];
  }, [selectedBrand]);

  const handleAddCompatibility = () => {
    if (selectedBrand && selectedModel) {
      const exists = compatibilities.some(
        (c) => c.brand === selectedBrand && c.model === selectedModel
      );
      if (!exists) {
        setCompatibilities([...compatibilities, { brand: selectedBrand, model: selectedModel }]);
      }
      setSelectedModel("");
    }
  };

  const handleRemoveCompatibility = (index) => {
    setCompatibilities(compatibilities.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (product) {
      setEditForm({
        price: product.price || "",
        stock: product.stock || "",
        description: product.description || ""
      });
      setCompatibilities(product.compatibility || []);
      setSelectedBrand("");
      setSelectedModel("");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const success = await updateProduct(product.id, {
      price: parseFloat(editForm.price),
      stock: parseInt(editForm.stock),
      description: editForm.description,
      compatibility: compatibilities
    });
    setIsUpdating(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit2 className="text-primary-500" size={20} /> İlanı Düzenle
          </h2>
          <button
            onClick={() => !isUpdating && onClose()}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
            disabled={isUpdating}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 pb-2 border-b border-black/5 dark:border-white/5 flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-black/5 dark:border-white/5">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={24} className="text-slate-500" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{product.brand}</p>
            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{product.name}</h3>
            <p className="text-[10px] text-slate-500">{product.category}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
                Fiyat (₺)
              </label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="number"
                  disabled={isUpdating}
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl pl-9 pr-4 py-3 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none transition-colors disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
                Mevcut Stok
              </label>
              <input
                required
                type="number"
                disabled={isUpdating}
                value={editForm.stock}
                onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
              Ürün Açıklaması
            </label>
            <textarea
              rows={3}
              disabled={isUpdating}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none transition-colors disabled:opacity-50 resize-none"
              placeholder="Ürün hakkında teknik detaylar..."
            />
          </div>
          
          {/* Araç Uyum Bilgisi */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
              Uyumlu Araçlar (Compatibility)
            </label>
            <div className="flex gap-2">
              <select
                disabled={isUpdating}
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel("");
                }}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs outline-none focus:border-primary-500"
              >
                <option value="">Marka Seçin</option>
                {CAR_DATA.map((c) => (
                  <option key={c.brand} value={c.brand}>{c.brand}</option>
                ))}
              </select>

              <select
                disabled={isUpdating || !selectedBrand}
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs outline-none focus:border-primary-500"
              >
                <option value="">Model Seçin</option>
                {availableModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddCompatibility}
                disabled={!selectedBrand || !selectedModel}
                className="bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                Ekle
              </button>
            </div>

            {compatibilities.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {compatibilities.map((comp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-primary-500/10 border border-primary-500/30 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter"
                  >
                    {comp.brand} {comp.model}
                    <button
                      type="button"
                      onClick={() => handleRemoveCompatibility(idx)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white font-bold py-4 rounded-xl shadow-xl active-scale flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {isUpdating ? (
              <><Loader2 size={18} className="animate-spin" /> GÜNCELLENİYOR...</>
            ) : (
              <><Save size={18} /> DEĞİŞİKLİKLERİ KAYDET</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerProductEditModal;
