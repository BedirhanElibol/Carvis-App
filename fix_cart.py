import re

with open("src/components/modals/CartDrawer.jsx", "r", encoding="utf-8") as f:
    content = f.read()

search_block = """            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessingCheckout}
              className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black hover:bg-primary-500 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary-900/50 active-scale font-sans"
            >
              {isProcessingCheckout ? (
                <Icons.Loader2 className="animate-spin" size={18} />
              ) : (
                <Icons.CreditCard size={18} />
              )}
              {isProcessingCheckout
                ? t.checkingPrice || "İşleniyor..."
                : t.buyNow || "Ödemeye Geç"}
            </button>"""

replace_block = """            <div className="relative group">
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || isProcessingCheckout}
                className={`w-full text-white py-4 rounded-2xl font-black transition flex items-center justify-center gap-2 shadow-xl active-scale font-sans ${
                  !selectedAddress && cart.length > 0
                    ? "bg-slate-500 hover:bg-slate-400 opacity-80"
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
                  : t.buyNow || "Ödemeye Geç"}
              </button>
              
              {!selectedAddress && cart.length > 0 && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl before:content-[''] before:absolute before:-bottom-1 before:left-1/2 before:-translate-x-1/2 before:w-2 before:h-2 before:bg-red-500 before:rotate-45">
                  Lütfen önce teslimat adresi seçin
                </div>
              )}
            </div>"""

if search_block in content:
    new_content = content.replace(search_block, replace_block)
    with open("src/components/modals/CartDrawer.jsx", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Success")
else:
    print("Search block not found")

