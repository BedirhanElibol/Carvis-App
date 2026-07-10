import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Car, CircleCheck, Filter, CirclePlus, Heart, ShieldCheck } from 'lucide-react';
import { getBuyBoxWinner } from '../../utils/productUtils';
import { PART_CATEGORIES } from '../../constants/mockData';
import { useShop } from '../../context/ShopContext';
import { useUI } from '../../context/UIContext';
import { useGarage } from '../../context/GarageContext';
import FilterModal from '../../components/modals/FilterModal';

const ProductCard = React.memo(({ product, currentVehicle, isFavorite, toggleFavorite, addToCart, setSelectedProduct, winnerOffer }) => {
    const isCompatible = currentVehicle && product.compatibility?.some(comp => {
        const brandMatch = comp.brand.toLowerCase() === currentVehicle.brand.toLowerCase();
        const modelMatch = comp.model ? (comp.model.toLowerCase().includes(currentVehicle.model.toLowerCase()) || currentVehicle.model.toLowerCase().includes(comp.model.toLowerCase())) : true;
        return brandMatch && modelMatch;
    });

    return (
        <div onClick={() => setSelectedProduct(product)} className="glass-card p-3 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-2xl hover:border-primary-500/30 transition-all cursor-pointer group relative active-scale overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
                {product.certified && (
                    <div className="bg-primary-600 text-slate-900 dark:text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-primary-400/20 uppercase tracking-widest">
                        <ShieldCheck size={8} /> ONAYLI
                    </div>
                )}
                {isCompatible && (
                    <div className="bg-green-600 text-slate-900 dark:text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-green-400/20 uppercase tracking-widest">
                        <CircleCheck size={8} /> %100 UYUMLU
                    </div>
                )}
            </div>

            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }} className="absolute top-3 right-3 p-2 glass-card rounded-full text-slate-500 hover:text-red-500 transition-all z-10 shadow-lg border border-black/5 dark:border-white/5 active-scale">
                <Heart size={14} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
            </button>
            <div className="w-full h-36 bg-white dark:bg-slate-900/50 rounded-2xl mb-4 overflow-hidden border border-black/5 dark:border-white/5">
                <img src={product.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90 group-hover:opacity-100" alt={product.name} />
            </div>
            <div className="space-y-1 relative z-10 px-1">
                <p className="text-[9px] text-primary-500 font-black uppercase tracking-[0.15em] mb-0.5">{product.brand}</p>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-tight line-clamp-2 h-8">{product.name}</h4>
                <div className="flex justify-between items-end mt-3 border-t border-black/5 dark:border-white/5 pt-2">
                    <div>
                        <p className="text-[9px] text-slate-500 line-through">{((winnerOffer?.price || 0) * 1.2).toFixed(0)} ₺</p>
                        <p className="font-black text-base text-slate-900 dark:text-white">{(winnerOffer?.price || 0).toLocaleString()} ₺</p>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); addToCart(product, winnerOffer); }} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 rounded-xl hover:bg-slate-700 transition-all shadow-lg active-scale flex items-center justify-center gap-2">
                            <CirclePlus size={18} />
                            <span className="text-xs font-bold">Sepete Ekle</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {winnerOffer?.stock < 5 && winnerOffer?.stock > 0 && (
                <div className="absolute bottom-3 left-3 text-[9px] font-bold text-red-500 animate-pulse">
                    Son {winnerOffer.stock} ürün!
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.product.id === nextProps.product.id && 
           prevProps.isFavorite === nextProps.isFavorite &&
           prevProps.currentVehicle?.id === nextProps.currentVehicle?.id;
});const PartsScreen = () => {
    const navigate = useNavigate();
    const { t } = useUI();
    const {
        products,
        cart,
        toggleFavorite,
        favorites,
        addToCart,
        searchQuery,
        setSearchQuery,
        setSelectedProduct
    } = useShop();
    const { currentVehicle } = useGarage();

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterCriteria, setFilterCriteria] = useState({ min: '', max: '', stock: false, brand: '', model: '' });

    // Ensure cartCount is derived from cart length
    const cartCount = cart.length;

    if (!t) return null;

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const winnerOffer = getBuyBoxWinner(p.offers);
        const price = winnerOffer?.price || 0;

        const matchesMinPrice = filterCriteria.min ? price >= Number(filterCriteria.min) : true;
        const matchesMaxPrice = filterCriteria.max ? price <= Number(filterCriteria.max) : true;
        const matchesStock = filterCriteria.stock ? (winnerOffer?.stock > 0) : true;

        // Compatibility Check (Garage Vehicle OR Manual Filter)
        const filterBrand = filterCriteria.brand || currentVehicle?.brand;
        const filterModel = filterCriteria.model || currentVehicle?.model;

        let matchesVehicle = true;
        if (filterBrand || filterModel) {
            matchesVehicle = p.compatibility?.some(comp => {
                const brandMatch = filterBrand ? comp.brand.toLowerCase() === filterBrand.toLowerCase() : true;
                const modelMatch = filterModel ? (comp.model.toLowerCase().includes(filterModel.toLowerCase()) || filterModel.toLowerCase().includes(comp.model.toLowerCase())) : true;
                return brandMatch && modelMatch;
            });
        }

        return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesStock && matchesVehicle;
    });

    const isManualFiltering = filterCriteria.brand || filterCriteria.model;

    return (
        <div className="p-5 pb-32 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-3xl text-slate-900 dark:text-white italic tracking-tighter">{t.parts}</h3>
                <div onClick={() => navigate('/checkout')} className="relative p-3 glass-card rounded-2xl cursor-pointer hover:bg-black/10 dark:bg-white/10 transition-all active-scale shadow-2xl border border-black/10 dark:border-white/10">
                    <ShoppingBag size={24} className="text-primary-400" />
                    {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-accent-600 text-slate-900 dark:text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ring-2 ring-slate-900 animate-pulse">{cartCount}</span>}
                </div>
            </div>

            {(currentVehicle || isManualFiltering) && (
                <div className={`glass-card p-4 rounded-3xl border mb-6 flex items-center gap-4 animate-fade-in shadow-xl ${isManualFiltering && !currentVehicle ? 'border-orange-500/20 bg-orange-500/5' : 'border-primary-500/20 bg-primary-600/5'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${isManualFiltering && !currentVehicle ? 'bg-orange-600/10 border-orange-500/20' : 'bg-primary-600/10 border-primary-500/20'}`}>
                        <Car size={24} className={isManualFiltering && !currentVehicle ? 'text-orange-500' : 'text-primary-500'} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${isManualFiltering && !currentVehicle ? 'text-orange-500' : 'text-primary-500'}`}>
                                {isManualFiltering && !currentVehicle ? 'Manuel Filtre Aktif' : 'Master Match Aktif'}
                            </p>
                            <span className={`w-1 h-1 rounded-full animate-ping ${isManualFiltering && !currentVehicle ? 'bg-orange-500' : 'bg-primary-500'}`}></span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            Yalnızca <span className={isManualFiltering && !currentVehicle ? 'text-orange-400' : 'text-primary-400'}>
                                {filterCriteria.brand || currentVehicle?.brand} {filterCriteria.model || currentVehicle?.model}
                            </span> ile %100 uyumlu parçalar gösteriliyor.
                        </h4>
                    </div>
                    <CircleCheck size={20} className={isManualFiltering && !currentVehicle ? 'text-orange-500' : 'text-primary-500'} />
                </div>
            )}

            <div className="flex gap-2 mb-6 sticky top-0 z-20 py-2">
                <div className="flex-1 glass-card border border-black/10 dark:border-white/10 rounded-2xl flex items-center px-4 py-3.5 shadow-2xl focus-within:border-primary-500/50 transition-all backdrop-blur-xl">
                    <Search size={20} className="text-slate-500 mr-3" />
                    <input type="text" placeholder="Parça, marka veya kategori ara..." className="bg-transparent w-full outline-none text-sm text-slate-900 dark:text-white placeholder-slate-500 font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <button onClick={() => setShowFilterModal(true)} className={`p-4 rounded-2xl border transition-all active-scale shadow-2xl ${filterCriteria.min || filterCriteria.max || filterCriteria.stock ? 'bg-primary-600 border-primary-500 text-slate-900 dark:text-white' : 'glass-card border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}>
                    <Filter size={22} />
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {PART_CATEGORIES.map((cat, i) => (
                    <button key={i} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition shadow-md ${i === 0 ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map(product => {
                    const winnerOffer = getBuyBoxWinner(product.offers);
                    return (
                        <ProductCard 
                            key={product.id}
                            product={product}
                            currentVehicle={currentVehicle}
                            isFavorite={favorites.includes(product.id)}
                            toggleFavorite={toggleFavorite}
                            addToCart={addToCart}
                            setSelectedProduct={setSelectedProduct}
                            winnerOffer={winnerOffer}
                        />
                    );
                })}
            </div>

            {/* Filter Modal */}
            <FilterModal
                show={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                t={t}
                currentFilters={filterCriteria}
                onApply={(criteria) => setFilterCriteria(criteria)}
                onClear={() => setFilterCriteria({ min: '', max: '', stock: false, brand: '', model: '' })}
            />
        </div>
    );
};

export default PartsScreen;
