import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, Trash2 } from "lucide-react";
import { useShop } from "../../../context/ShopContext";
const CheckoutCartStep = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart } = useShop();
  return (
    <div className="space-y-4 animate-slide-up">
      {" "}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        {" "}
        <ShoppingBag className="text-primary-500" /> Sepetim (
        {cart.length} Ürün){" "}
      </h2>{" "}
      {cart.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-[2rem] border border-black/5 dark:border-white/5">
          {" "}
          <ShoppingBag
            size={48}
            className="mx-auto text-slate-600 mb-4 opacity-50"
          />{" "}
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Sepetinizde ürün bulunmuyor.
          </p>{" "}
          <button
            onClick={() => navigate("/market")}
            className="mt-4 text-primary-400 font-bold hover:underline"
          >
            {" "}
            Alışverişe Başla{" "}
          </button>{" "}
        </div>
      ) : (
        cart.map((item, idx) => (
          <div
            key={idx}
            className="glass-card p-4 rounded-xl border border-black/5 dark:border-white/5 flex gap-4 items-center"
          >
            {" "}
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 shrink-0">
              {" "}
              <img
                src={
                  item.img ||
                  item.image ||
                  "https://via.placeholder.com/100?text="
                }
                alt={item.name}
                className="w-full h-full object-cover"
              />{" "}
            </div>{" "}
            <div className="flex-1">
              {" "}
              <p className="text-[10px] text-primary-500 font-bold uppercase tracking-wider mb-1">
                {" "}
                {item.brand || item.shopName || "Servis"}{" "}
              </p>{" "}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
                {item.name}
              </h3>{" "}
              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 w-fit px-2 py-1 rounded-lg">
                {" "}
                <CheckCircle size={10} /> Tahmini Teslimat: Yarın{" "}
              </div>{" "}
            </div>{" "}
            <div className="text-right">
              {" "}
              <p className="text-lg font-black text-slate-900 dark:text-white mb-2">
                {(item.selectedOffer?.price || item.price).toLocaleString()} ₺
              </p>{" "}
              <button
                onClick={() => removeFromCart(idx)}
                className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors ml-auto"
              >
                {" "}
                <Trash2 size={14} />{" "}
              </button>{" "}
            </div>{" "}
          </div>
        ))
      )}{" "}
    </div>
  );
};
export default CheckoutCartStep;
