export const getBuyBoxWinner = (offers) => {
  if (!offers || offers.length === 0) return null;

  const scoredOffers = offers.map((offer) => {
    let score = 0;

    // Fiyat Skoru (Düşük fiyat avantajdır)
    const priceWeight = 60;
    const maxPrice = Math.max(...offers.map((o) => o.price));
    const minPrice = Math.min(...offers.map((o) => o.price));

    if (maxPrice === minPrice) {
      score += priceWeight;
    } else {
      score += ((maxPrice - offer.price) / (maxPrice - minPrice)) * priceWeight;
    }

    // Reyting Skoru (Yüksek puan avantajdır)
    const ratingWeight = 25;
    score += (offer.rating / 5) * ratingWeight;

    // Stok Skoru (Stok varsa avantaj)
    const stockWeight = 10;
    if (offer.stock > 10) score += stockWeight;
    else if (offer.stock > 0) score += 5;

    // Teslimat Skoru (Hızlı teslimat avantaj)
    const deliveryWeight = 5;
    if (offer.deliveryTime === 1) score += deliveryWeight;
    else if (offer.deliveryTime <= 3) score += 2;

    return { ...offer, buyBoxScore: Math.round(score) };
  });

  // En yüksek skorlu olanı bul
  const winner = scoredOffers.sort((a, b) => b.buyBoxScore - a.buyBoxScore)[0];
  return { ...winner, isBuyBoxWinner: true };
};
