-- ==========================================
-- CARVIS - FINTECH WALLET SCHEMA
-- Cüzdan ve İşlem Geçmişi için Tablolar
-- ==========================================

-- 1. WALLETS TABLOSU
-- Her kullanıcının (Satıcı veya Müşteri) bir cüzdanı olur.
CREATE TABLE IF NOT EXISTS public.wallets (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  currency text DEFAULT 'TRY',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. WALLET_TRANSACTIONS TABLOSU
-- Bakiye hareketlerini tutar (Yükleme, Harcama, İade)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wallet_id uuid REFERENCES public.wallets(user_id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL, -- Pozitif (Giriş) veya Negatif (Çıkış) olabilir
  type text NOT NULL CHECK (type IN ('deposit', 'spending', 'refund', 'transfer', 'withdrawal')),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  description text,
  reference_id text, -- Sipariş No veya PayTR OID
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. RLS GÜVENLİK AYARLARI

-- Wallets için
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
CREATE POLICY "Users can view their own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Sadece sistem bakiyeyi değiştirebilir (Güvenlik için Client tarafına kapalı)
-- Doğrudan UPDATE/INSERT policy eklemiyoruz, Function üzerinden yönetilecek.

-- Wallet Transactions için
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view their transactions" ON public.wallet_transactions
  FOR SELECT USING (wallet_id = auth.uid());

-- 4. OTOMATİK CÜZDAN OLUŞTURMA (TRIGGER)
-- Yeni bir user profili oluştuğunda cüzdanı da oluşsun
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mevcut profile trigger'ına ek olarak veya ayrı bir trigger
DROP TRIGGER IF EXISTS on_profile_created_wallet ON public.profiles;
CREATE TRIGGER on_profile_created_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- 5. MEVCUT KULLANICILAR İÇİN CÜZDAN OLUŞTURMA
-- Eğer migration çalıştığında zaten userlar varsa onlar için de oluştur
INSERT INTO public.wallets (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- 6. REALTIME AKTİVASYONU
-- Bakiye değişimini anlık görmek için
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;

-- TAMAMLANDI
