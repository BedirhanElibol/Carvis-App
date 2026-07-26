/**
 * Copart / IAA Replica 2-Phase Bidding & Proxy Bidding Engine
 * Features:
 * 1. Pre-Bid Phase (Proxy Bidding): Automatically increments bid with smallest step up to user's max budget.
 * 2. Live Auction Phase: Fast 45-second clock window to prevent last-second sniping.
 * 3. Closing Modes: 'pure_sale', 'on_minimum_bid', 'on_approval' (allows Seller Counter Bid).
 * 4. Access & Deposit Control: Caps max bid power based on user deposit.
 */

const BID_INCREMENT_STEPS = [
  { min: 0, max: 1000, step: 50 },
  { min: 1000, max: 5000, step: 100 },
  { min: 5000, max: 20000, step: 250 },
  { min: 20000, max: 100000, step: 500 },
  { min: 100000, max: 1000000, step: 1000 }
];

export function getBidIncrement(currentPrice = 0) {
  const match = BID_INCREMENT_STEPS.find(s => currentPrice >= s.min && currentPrice < s.max);
  return match ? match.step : 500;
}

export function calculateProxyBid({
  currentHighestBid = 1000,
  userMaxProxyBid = 5000,
  userDeposit = 10000
}) {
  // Deposit limit check (User max bidding power = deposit * 10)
  const maxAllowedBiddingPower = userDeposit * 10;
  const effectiveUserMax = Math.min(userMaxProxyBid, maxAllowedBiddingPower);

  const step = getBidIncrement(currentHighestBid);
  const nextRequiredBid = currentHighestBid + step;

  if (effectiveUserMax < nextRequiredBid) {
    return {
      canBid: false,
      newBidAmount: currentHighestBid,
      message: `Maksimum depozito limitiniz (₺${maxAllowedBiddingPower.toLocaleString("tr-TR")}) gerekli asgari teklif adımına (₺${nextRequiredBid.toLocaleString("tr-TR")}) yetmiyor.`
    };
  }

  return {
    canBid: true,
    newBidAmount: nextRequiredBid,
    userMaxProxyBid: effectiveUserMax,
    incrementStep: step,
    message: `Proxy Bidding aktif: Teklifiniz ₺${nextRequiredBid.toLocaleString("tr-TR")} seviyesine otomatik yükseltildi.`
  };
}

export function evaluateAuctionClosing({
  saleType = "on_approval", // 'pure_sale', 'on_minimum_bid', 'on_approval'
  highestBid = 15000,
  reservePrice = 18000
}) {
  if (saleType === "pure_sale") {
    return {
      status: "SOLD",
      winnerPrice: highestBid,
      message: "Pure Sale: En yüksek teklif otomatik olarak ihaleyi kazandı!"
    };
  }

  if (saleType === "on_minimum_bid") {
    const isMet = highestBid >= reservePrice;
    return {
      status: isMet ? "SOLD" : "RESERVE_NOT_MET",
      winnerPrice: isMet ? highestBid : null,
      message: isMet ? "Asgari fiyat barajı geçildi, teklif onaylandı!" : "Asgari fiyat barajına ulaşılamadı."
    };
  }

  // On Approval (Allows Counter Bid)
  const isApproved = highestBid >= reservePrice;
  return {
    status: isApproved ? "APPROVED" : "PENDING_SELLER_APPROVAL",
    winnerPrice: highestBid,
    canCounterBid: !isApproved,
    suggestedCounterBid: Math.round(reservePrice),
    message: isApproved
      ? "Satıcı onayladı! İşlem tamamlandı."
      : `Satıcı Onayında: Satıcı ₺${reservePrice.toLocaleString("tr-TR")} Karşı Teklif (Counter Bid) gönderebilir.`
  };
}
