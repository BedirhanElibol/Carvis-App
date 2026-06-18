import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { useUI } from "../../context/UIContext";
import AddressModal from "./AddressModal";

const CartDrawer = () => {
  const {
    cart,
    removeFromCart,
    checkout,
    isCartOpen,
    toggleCart,
    addresses,
    setAddresses,
    selectedAddress,
    setSelectedAddress,
    isProcessingCheckout,
  } = useShop();

  const { t, showAlert } = useUI();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressError, setAddressError] = useState(false);

  // Calculate totals - handle both parts and services
  const partsTotal = cart
    .filter((item) => item.itemType === "part")
    .reduce((sum, item) => sum + (item.selectedOffer?.price || 0), 0);

  const servicesTotal = cart
    .filter((item) => item.itemType === "service")
    .reduce((sum, item) => sum + (item.price || 0), 0);

  const total = partsTotal + servicesTotal;
  const partsCount = cart.filter((item) => item.itemType === "part").length;
  const servicesCount = cart.filter(
    (item) => item.itemType === "service",
  ).length;

  const handleAddAddress = (newAddr) => {
    const addrWithId = { ...newAddr, id: Date.now() };
    setAddresses([...addresses, addrWithId]);
    setSelectedAddress(addrWithId);
    setAddressError(false);
  };

  const handleCheckout = () => {
    if (!selectedAddress) {
      setAddressError(true);
      showAlert(
        "Adres Gerekli",
        "Lütfen teslimat adresinizi seçin.",
        "warning",
      );
      setTimeout(() => setAddressError(false), 2000);
      return;
    }
    checkout();
  };

  if (!isCartOpen || !t) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-[80] flex items-end sm:items-center justify-center backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-slate-900 w-full sm:w-[420px] h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 flex flex-col shadow-2xl animate-in slide-in-from-bottom-full duration-300 border border-white/10">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-xl text-white flex items-center gap-2 font-sans">
              <Icons.ShoppingBag className="text-primary-500" /> Sepetim (
              {cart.length})
            </h3>
            <button
              onClick={toggleCart}
              className="glass-card p-2 rounded-full hover:bg-white/10 border border-white/10"
            >
              <Icons.X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Summary Badges */}
          {cart.length > 0 && (
            <div className="flex gap-2 mb-4">
              {partsCount > 0 && (
                <div className="flex items-center gap-1.5 bg-primary-500/20 text-primary-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest font-sans">
                  <Icons.Package size={12} /> {partsCount} Parça
                </div>
              )}
              {servicesCount > 0 && (
                <div className="flex items-center gap-1.5 bg-accent-500/20 text-accent-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest font-sans">
                  <Icons.Wrench size={12} /> {servicesCount} Servis
                </div>
              )}
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-10">
                <Icons.ShoppingCart
                  size={48}
                  className="mx-auto mb-3 text-slate-600"
                />
                <p className="text-slate-500">Sepetin şimdilik boş.</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={item.uniqueId || index}
                  className="flex gap-3 items-start glass-card p-3 rounded-2xl border border-white/10 group"
                >
                  {/* Item Image/Icon */}
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.itemType === "service"
                        ? "bg-accent-500/20"
                        : "bg-slate-800"
                    }`}
                  >
                    {item.itemType === "service" ? (
                      <Icons.Wrench size={28} className="text-accent-400" />
                    ) : (
                      <img
                        src={item.img}
                        className="w-full h-full rounded-xl object-cover"
                        alt="product"
                      />
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-white line-clamp-1 font-sans">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {item.itemType === "service"
                            ? `${item.shopName || "Usta"} • ${item.mechanicName || "Servis"}`
                            : item.selectedOffer?.seller || "Satıcı"}
                        </p>
                      </div>
                      {/* Type Badge */}
                      <span
                        className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase flex-shrink-0 font-sans ${
                          item.itemType === "service"
                            ? "bg-accent-500/20 text-accent-400"
                            : "bg-primary-500/20 text-primary-400"
                        }`}
                      >
                        {item.itemType === "service" ? "Servis" : "Parça"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-black text-primary-400 text-lg font-sans">
                        {item.itemType === "service"
                          ? item.price
                          : item.selectedOffer?.price || 0}{" "}
                        ₺
                      </span>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-400 hover:text-red-300 bg-red-500/10 p-1.5 rounded-lg hover:bg-red-500/20 transition"
                      >
                        <Icons.Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Address Selection */}
          {cart.length > 0 && (
            <div className={`mb-4 ${addressError ? "animate-shake" : ""}`}>
              <button
                onClick={() => {
                  setShowAddressModal(true);
                  setAddressError(false);
                }}
                className={`w-full glass-card p-3 rounded-xl flex items-center justify-between hover:bg-primary-500/5 transition ${
                  addressError
                    ? "border-2 border-red-500 ring-2 ring-red-500/20"
                    : "border border-primary-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${addressError ? "bg-red-500/20 text-red-400" : "bg-primary-500/20 text-primary-400"}`}
                  >
                    <Icons.MapPin size={16} />
                  </div>
                  <div className="text-left">
                    <p
                      className={`text-xs font-bold font-sans ${addressError ? "text-red-400" : "text-white"}`}
                    >
                      {t.selectAddress || "Teslimat Adresi"}
                    </p>
                    <p
                      className={`text-xs truncate max-w-[180px] ${addressError ? "text-red-300" : "text-slate-500"}`}
                    >
                      {selectedAddress
                        ? selectedAddress.title +
                          " - " +
                          selectedAddress.fullAddress
                        : addressError
                          ? "⚠️ Lütfen adres seçin!"
                          : "Adres Seçin..."}
                    </p>
                  </div>
                </div>
                <Icons.ChevronRight
                  size={16}
                  className={addressError ? "text-red-400" : "text-slate-500"}
                />
              </button>
            </div>
          )}

          {/* Totals & Checkout */}
          <div className="border-t border-white/10 pt-4 mt-auto">
            {/* Breakdown */}
            {cart.length > 0 && (partsCount > 0 || servicesCount > 0) && (
              <div className="space-y-1 mb-3 text-sm">
                {partsCount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Parçalar ({partsCount})</span>
                    <span>{partsTotal.toLocaleString()} ₺</span>
                  </div>
                )}
                {servicesCount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Servisler ({servicesCount})</span>
                    <span>{servicesTotal.toLocaleString()} ₺</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 font-medium font-sans">Toplam Tutar</span>
              <span className="font-black text-2xl text-white font-sans">
                {total.toLocaleString()} ₺
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  if (!selectedAddress) {
                    setAddressError(true);
                    showAlert(
                      "Adres Gerekli",
                      "Lütfen teslimat adresinizi seçin.",
                      "warning"
                    );
                    setTimeout(() => setAddressError(false), 2000);
                    return;
                  }
                  handleCheckout();
                }}
                disabled={cart.length === 0 || isProcessingCheckout}
                className={`w-full text-white py-4 rounded-2xl font-black transition flex items-center justify-center gap-2 shadow-xl active-scale font-sans ${
                  !selectedAddress && cart.length > 0
                    ? "bg-slate-500 opacity-80"
                    : "bg-primary-600 hover:bg-primary-500 shadow-primary-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {isProcessingCheckout ? (
                  <Icons.Loader2 className="animate-spin" size={18} />
                ) : (
                  <Icons.CreditCard size={18} />
                )}
                {isProcessingCheckout
                  ? t.checkingPrice || "İşleniyor..."
                  : (!selectedAddress ? "Adres Seçin" : (t.buyNow || "Ödemeye Geç"))}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddressModal
        show={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        t={t}
        addresses={addresses}
        onSelectAddress={(addr) => {
          setSelectedAddress(addr);
          setShowAddressModal(false);
        }}
        onAddAddress={handleAddAddress}
      />
    </>
  );
};

export default CartDrawer;
