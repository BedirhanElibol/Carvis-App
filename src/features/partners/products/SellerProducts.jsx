import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useSeller } from "../../../context/SellerContext";

const SellerProducts = () => {
  const { sellerProducts, addProduct, deleteProduct, addingProduct } = useSeller();
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    price: "",
    stock: "",
    category: "Genel",
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (addingProduct) return;
    
    const success = await addProduct({
      name: newProduct.name,
      brand: newProduct.brand,
      price: newProduct.price,
      stock: newProduct.stock,
      category: newProduct.category,
    });
    
    if (success) {
      setShowModal(false);
      setNewProduct({
        name: "",
        brand: "",
        price: "",
        stock: "",
        category: "Genel",
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
            Yedek Parça İlanları
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Satıştaki ürünlerinizi yönetin
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white px-5 py-3 rounded-xl font-bold text-sm shadow-xl active-scale flex items-center gap-2"
        >
          <Icons.Plus size={18} /> YENİ İLAN EKLE
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-black/5 dark:border-white/5">
          <p className="text-slate-500 text-xs font-bold uppercase">
            Aktif İlan
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{sellerProducts.length}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-black/5 dark:border-white/5">
          <p className="text-slate-500 text-xs font-bold uppercase">
            Toplam Stok
          </p>
          <p className="text-2xl font-black text-primary-400">
            {sellerProducts.reduce((acc, p) => acc + (p.stock || 0), 0)}
          </p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-black/5 dark:border-white/5">
          <p className="text-slate-500 text-xs font-bold uppercase">
            Düşük Stok
          </p>
          <p className="text-2xl font-black text-orange-400">
            {sellerProducts.filter((p) => p.stock < 10).length}
          </p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-black/5 dark:border-white/5">
          <p className="text-slate-500 text-xs font-bold uppercase">
            Toplam Değer
          </p>
          <p className="text-2xl font-black text-green-400">
            {sellerProducts
              .reduce((acc, p) => acc + (p.price * p.stock || 0), 0)
              .toLocaleString()}{" "}
            ₺
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 glass-card px-4 py-3 rounded-xl border border-black/5 dark:border-white/5 flex items-center gap-3">
          <Icons.Search size={18} className="text-slate-500" />
          <input
            type="text"
            placeholder="Ürün adı, marka veya kategori ara..."
            className="bg-transparent w-full outline-none text-slate-900 dark:text-white text-sm placeholder:text-slate-600"
          />
        </div>
        <button className="glass-card w-12 flex items-center justify-center rounded-xl border border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
          <Icons.Filter size={18} />
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellerProducts.map((product) => (
          <div
            key={product.id}
            className="glass-card group p-4 rounded-2xl border border-black/5 dark:border-white/5 hover:border-primary-500/30 transition-all hover:bg-black/5 dark:bg-white/5"
          >
            <div className="relative aspect-video bg-white dark:bg-slate-900 rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-black/5 dark:border-white/5">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icons.Package size={40} className="text-slate-700" />
              )}
              <div className="absolute top-2 right-2 bg-slate-50 dark:bg-slate-950/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-900 dark:text-white border border-black/10 dark:border-white/10">
                {product.stock} Adet
              </div>
            </div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">
                  {product.brand}
                </p>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
                  {product.name}
                </h3>
              </div>
              <p className="font-black text-lg text-slate-900 dark:text-white">{product.price} ₺</p>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
              <button className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                <Icons.Edit2 size={14} /> DÜZENLE
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="w-10 h-9 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center transition-colors"
              >
                <Icons.Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.Package className="text-primary-500" /> Yeni İlan Oluştur
              </h2>
              <button
                onClick={() => !addingProduct && setShowModal(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white disabled:opacity-50"
                disabled={addingProduct}
              >
                <Icons.X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
                    Ürün Adı
                  </label>
                  <input
                    required
                    disabled={addingProduct}
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none transition-colors disabled:opacity-50"
                    placeholder="Örn: Ön Fren Balatası"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
                    Marka
                  </label>
                  <input
                    required
                    disabled={addingProduct}
                    value={newProduct.brand}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, brand: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none transition-colors disabled:opacity-50"
                    placeholder="Örn: Bosch"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
                    Kategori
                  </label>
                  <select
                    disabled={addingProduct}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none transition-colors appearance-none disabled:opacity-50"
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                  >
                    <option>Genel</option>
                    <option>Fren Sistemi</option>
                    <option>Motor Parçaları</option>
                    <option>Elektrik</option>
                    <option>Kaporta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
                    Fiyat (₺)
                  </label>
                  <div className="relative">
                    <Icons.DollarSign
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      required
                      disabled={addingProduct}
                      type="number"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl pl-9 pr-4 py-3 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none transition-colors disabled:opacity-50"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">
                    Stok
                  </label>
                  <input
                    required
                    disabled={addingProduct}
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-primary-500 outline-none transition-colors disabled:opacity-50"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="border border-dashed border-black/20 dark:border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-black/5 dark:bg-white/5 transition-colors cursor-pointer group">
                <Icons.Image
                  size={32}
                  className="mb-2 group-hover:text-primary-500 transition-colors"
                />
                <span className="text-xs font-bold">Görsel Yükle (Tıkla)</span>
              </div>
              <button
                type="submit"
                disabled={addingProduct}
                className="w-full bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white font-bold py-4 rounded-xl shadow-xl active-scale flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingProduct ? (
                  <>
                    <Icons.Loader2 size={18} className="animate-spin" /> YAYINLANIYOR...
                  </>
                ) : (
                  <>
                    <Icons.Save size={18} /> İLANI YAYINLA
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
