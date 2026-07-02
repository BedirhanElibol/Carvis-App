import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBuyBoxWinner } from '../../utils/productUtils';
import { useShop } from '../../context/ShopContext';
import { useUI } from '../../context/UIContext';
import { useProductQna } from '../../hooks/useProductQna';

import ProductHero from './components/ProductHero';
import ProductOffers from './components/ProductOffers';
import ProductQnA from './components/ProductQnA';

const ProductDetailScreen = () => {
    const { id } = useParams();
    const { products } = useShop();
    const { t } = useUI();
    const [product, setProduct] = useState(null);

    // Modern React Pattern: Custom Hook for Data Fetching & Business Logic
    const { qnaList, asking, askQuestion } = useProductQna(product?.id);

    useEffect(() => {
        const found = products.find(p => p.id === id);
        setProduct(found);
    }, [id, products]);

    if (!t) return null;
    
    if (!product) return (
        <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    // Data Transformations (can be moved to useMemo if expensive)
    const offersSorted = product.offers ? product.offers.map(o => ({ ...o, isBuyBoxWinner: false })) : [];
    const winnerOffer = getBuyBoxWinner(offersSorted) || { price: 0, seller: "Stok Yok", stock: 0 };
    const buyBoxPrice = winnerOffer.price;
    const scoredOffers = offersSorted.map(offer => {
        return offersSorted.find(o => o.sellerId === offer.sellerId) || offer;
    }).sort((a, b) => (b.buyBoxScore || 0) - (a.buyBoxScore || 0));

    return (
        <div className="p-5 pb-32 space-y-6 animate-fade-in relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
            {/* 1. Presentational: Hero, Image, Core Price */}
            <ProductHero 
                product={product} 
                winnerOffer={winnerOffer} 
                buyBoxPrice={buyBoxPrice} 
                t={t} 
            />

            {/* 2. Presentational: All Seller Offers */}
            <ProductOffers 
                scoredOffers={scoredOffers} 
                t={t} 
            />

            {/* 3. Container/Presentational Hybrid: Q&A */}
            <ProductQnA 
                winnerOffer={winnerOffer} 
                qnaList={qnaList} 
                asking={asking} 
                onAskQuestion={askQuestion} 
            />
        </div>
    );
};

export default ProductDetailScreen;
