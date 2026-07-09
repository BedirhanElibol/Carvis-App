/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback , useMemo } from "react";
import { useUI } from "./UIContext";
import { useAuth } from "./AuthContext";
import { useWallet } from "./WalletContext";
import { supabase } from "../supabaseClient";
import { triggerHaptic } from "../utils/haptics";

export const ShopContext = createContext();

export const useShop = () => {
  return useContext(ShopContext);
};

export const ShopProvider = ({ children }) => {
  const { showAlert, t } = useUI();
  const { currentUser } = useAuth();
  const { blockFunds } = useWallet();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [sortBy, setSortBy] = useState("relevant"); // 'relevant', 'price_asc', 'price_desc', 'newest'

  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem("__SAFE_TOKEN_7__rapidsy_search__END_TOKEN_7___history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("__SAFE_TOKEN_7__rapidsy_search__END_TOKEN_7___history", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const addToSearchHistory = (query) => {
    if (!query || query.trim().length === 0) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((q) => q !== query);
      return [query, ...filtered].slice(0, 5); // Keep last 5
    });
  };

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        if (error.code !== "42501") console.error("Products fetch error:", error);
        setProducts([]);
        return;
      }

      const mappedData = (data || []).map((p) => {
        const name = p.name.toLowerCase();
        const category = (p.category || "").toLowerCase();

        let finalImg = p.image_url || p.img;
        if (!finalImg || finalImg.includes("placeholder")) {
          if (
            name.includes("fren") ||
            name.includes("balata") ||
            category.includes("fren")
          ) {
            finalImg = "/src/assets/products/brake_pads.png";
          } else if (
            name.includes("yağ") ||
            name.includes("oil") ||
            category.includes("yag")
          ) {
            finalImg = "/src/assets/products/engine_oil.png";
          } else if (
            name.includes("akü") ||
            name.includes("battery") ||
            category.includes("aku")
          ) {
            finalImg = "/src/assets/products/car_battery.png";
          } else {
            finalImg =
              "https://placehold.co/300x300/1e293b/FFFFFF?text=" +
              encodeURIComponent(p.name);
          }
        }
        return { ...p, img: finalImg };
      });
      setProducts(mappedData);
    } catch (error) {
      console.error("Products Exception:", error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, seller:seller_id(company_name)")
        .eq("customer_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code !== "42501" && error.code !== "42703") {
          console.error("Orders fetch error:", error);
        }
        setOrders([]);
        return;
      }
      setOrders(data || []);
    } catch (error) {
      console.error("Orders Exception:", error);
    }
  }, [currentUser?.id]);

  const fetchAddresses = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", currentUser.id);

      if (error) {
        if (error.code !== "42501") console.error("Addresses fetch error:", error);
        setAddresses([]);
        return;
      }
      setAddresses(data || []);
      if (data?.length > 0) setSelectedAddress(data[0]);
    } catch (error) {
      console.error("Addresses Exception:", error);
    }
  }, [currentUser?.id]);

  // Initial Data Fetch
  useEffect(() => {
    fetchProducts();
    if (currentUser) {
      fetchOrders();
      fetchAddresses();
    }
  }, [currentUser, fetchProducts, fetchOrders, fetchAddresses]);

  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = (product, selectedOffer) => {
    setCart((prev) => [
      ...prev,
      { ...product, selectedOffer, uniqueId: Date.now(), itemType: "part" },
    ]);
    triggerHaptic("light");
    showAlert(
      t.addToCart || "Sepete Eklendi",
      `${product.name} sepete eklendi.`,
      "success"
    );
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    triggerHaptic("light");
  };

  const addServiceToCart = (service) => {
    setCart((prev) => [
      ...prev,
      {
        id: service.id || Date.now(),
        name: service.name || service.title,
        description: service.description,
        price: service.price,
        mechanicName: service.mechanicName,
        shopName: service.shopName,
        img: service.image || "https://via.placeholder.com/100?text=🔧",
        uniqueId: Date.now(),
        itemType: "service",
      },
    ]);
    showAlert("Servis Eklendi", `${service.name || service.title} sepete eklendi.`, "success");
  };

  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const checkout = async ({ useWallet = false, installment = 1 } = {}) => {
    if (!currentUser) return showAlert("Hata", "Giriş yapmalısınız", "error");
    if (!selectedAddress) return showAlert("Hata", "Lütfen teslimat adresi seçin.", "warning");

    const subtotal = cart.reduce(
      (sum, item) => sum + (item.selectedOffer?.price || item.price || 0),
      0
    );
    const shipping = subtotal > 500 ? 0 : 49.9;
    let total = subtotal + shipping;

    if (installment === 3) total = total * 1.05;
    if (installment === 6) total = total * 1.1;

    if (useWallet) {
      const success = blockFunds(total, "Sipariş Ödemesi & Cüzdan Blokesi");
      if (!success) {
        showAlert("Yetersiz Bakiye", "Cüzdanınızda yeterli bakiye bulunmuyor.", "error");
        throw new Error("Insufficient funds");
      }
    }

    setIsProcessingCheckout(true);
    try {
      // 1. Önce siparişi "beklemede" olarak oluştur
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_id: currentUser.id,
            seller_id: cart[0]?.selectedOffer?.sellerId || currentUser.id,
            total_amount: total,
            status: "pending", // RPC ile 'paid' yapılacak
            payment_method: useWallet ? "rapidsy_wallet" : "credit_card",
          },
        ])
        .select();

      if (orderError) throw orderError;
      const orderId = orderData[0].id;

      // 2. Sipariş kalemlerini ekle
      const orderItems = cart.map((item) => ({
        order_id: orderId,
        product_id: typeof item.id === 'number' ? item.id : null,
        product_offer_id: item.selectedOffer?.id,
        quantity: 1,
        price_at_purchase: item.selectedOffer?.price || item.price,
      }));

      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
        if (itemsError) throw itemsError;
      }

      // 3. Eğer cüzdan ile ödeme ise atomik RPC'yi tetikle (Komisyon Destekli v2)
      if (useWallet) {
        const { data: rpcData, error: rpcError } = await supabase.rpc('process_wallet_payment_v2', {
          p_order_id: orderId,
          p_customer_id: currentUser.id
        });

        if (rpcError) throw rpcError;
        if (rpcData && !rpcData.success) throw new Error(rpcData.message);
      }

      setCart([]);
      setIsCartOpen(false);
      fetchOrders();
      triggerHaptic("success");
      showAlert("Başarılı", "Siparişiniz alındı ve ödeme yapıldı.", "success");
    } catch (error) {
      console.error("Checkout Error:", error);
      showAlert("Hata", "Sipariş tamamlanamadı: " + (error.message || "Bilinmeyen hata"), "error");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const value = useMemo(() => ({

    products,
    setProducts,
    orders,
    setOrders,
    cart,
    setCart,
    addToCart,
    addServiceToCart,
    removeFromCart,
    favorites,
    toggleFavorite,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    setSelectedProduct,
    isCartOpen,
    toggleCart,
    checkout,
    addresses,
    setAddresses,
    selectedAddress,
    setSelectedAddress,
    isProcessingCheckout,
    sortBy,
    setSortBy,
    searchHistory,
    addToSearchHistory,
  
  }), [products, orders, cart, addToCart, addServiceToCart, removeFromCart, favorites, toggleFavorite, searchQuery, selectedProduct, isCartOpen, toggleCart, checkout, addresses, selectedAddress, isProcessingCheckout, sortBy, searchHistory, addToSearchHistory]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
