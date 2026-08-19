import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HeartOff, Package, ShieldCheck, ShoppingBag, Trash2, Wrench } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { useUI } from "../../context/UIContext";
import { getBuyBoxWinner } from "../../utils/productUtils";
import EmptyState from "../../components/shared/EmptyState";
import { triggerHaptic } from "../../utils/haptics";

const FavoritesScreen = () => {
  const navigate = useNavigate();
  const { products, favorites, toggleFavorite, addToCart } = useShop();
  const { showAlert } = useUI();

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  const handleAddToCart = (product) => {
    const winner = getBuyBoxWinner(product.offers);
    addToCart(product, winner);
    triggerHaptic("success");
    showAlert(
      "Sepete Eklendi",
      `${product.name} sepetinize eklendi.`,
      "success",
    );
  };

  const handleRemoveFavorite = (id) => {
    toggleFavorite(id);
    triggerHaptic("light");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-20 glass-card px-5 py-5 border-b border-black/5 dark:border-white/5 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 glass-card rounded-2xl text-slate-500 dark:text-slate-400 active-scale-95 border border-black/10 dark:border-white/10"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="font-black text-slate-900 dark:text-white tracking-tighter text-lg uppercase">
            Favorilerim
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {favoriteProducts.length} ürün kaydedildi
          </p>
        </div>
      </div>

      <div className="p-5">
        {favoriteProducts.length === 0 ? (
          <div className="glass-card p-10 rounded-[3rem] border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/40 text-center flex flex-col items-center justify-center relative overflow-hidden">
            
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-[1.75rem] border border-black/5 dark:border-white/5 flex items-center justify-center text-primary-400 mb-6 relative">
              <div className="absolute inset-0 bg-primary-500 blur-lg rounded-full opacity-10 animate-pulse"></div>
              <HeartOff size={36} className="relative z-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-sans">
              Favoriniz Bulunmuyor
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed max-w-sm mt-3 font-sans uppercase">
              Kaydettiğiniz hiçbir parça veya usta bulunmuyor. Hemen ekosisteme göz atın!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-8">
              <button
                onClick={() => {
                  triggerHaptic("medium");
                  navigate("/app/mechanics");
                }}
                className="flex-1 py-4 bg-primary-600/10 hover:bg-primary-600/20 text-primary-400 border border-primary-500/20 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active-scale font-sans flex items-center justify-center gap-2"
              >
                <Wrench size={14} /> Yakındaki Ustalar
              </button>
              <button
                onClick={() => {
                  triggerHaptic("medium");
                  navigate("/app/parts");
                }}
                className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-slate-900 dark:text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active-scale font-sans flex items-center justify-center gap-2"
              >
                <Package size={14} /> Parçaları İncele
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteProducts.map((product) => {
              const winner = getBuyBoxWinner(product.offers);
              const price = winner?.price || product.price || 0;
              return (
                <div
                  key={product.id}
                  className="glass-card p-4 rounded-[2rem] border border-black/5 dark:border-white/5 flex gap-4 group hover:border-primary-500/20 transition-all"
                >
                  {/* Product Image */}
                  <div
                    onClick={() => navigate(`/app/product/${product.id}`)}
                    className="w-24 h-24 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer border border-black/5 dark:border-white/5"
                  >
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-primary-500 font-black uppercase tracking-widest">
                        {product.brand}
                      </p>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {product.name}
                      </h4>
                      {product.certified && (
                        <span className="text-[8px] font-black text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 inline-flex items-center gap-1 mt-1">
                          <ShieldCheck size={8} /> SERTİFİKALI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {price.toLocaleString("tr-TR")} ₺
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemoveFavorite(product.id)}
                          className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 active:scale-90 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="p-2 bg-primary-600 text-slate-900 dark:text-white rounded-xl hover:bg-primary-500 active:scale-90 transition-all shadow-lg shadow-primary-900/30"
                        >
                          <ShoppingBag size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesScreen;
