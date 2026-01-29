-- =====================================================================
-- CARVIS - FINAL CUMULATIVE FIX (v3.0)
-- Tarih: 28.01.2026
-- Amaç: Tüm parçalı düzeltmeleri (Quote, Wallet, Profile, Admin) tek dosyada toplar.
-- =====================================================================

-- 1. PROFİLLERİ KURTARMA (Auth -> Public Sync)
-- "Profil bulunamadı" hatasını çözer.
INSERT INTO public.profiles (id, full_name, role, created_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    COALESCE(raw_user_meta_data->>'role', 'customer') as role,
    created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;


-- 2. CÜZDANLARI GARANTİLE (Missing Wallets Fix)
CREATE TABLE IF NOT EXISTS public.wallets (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  currency text DEFAULT 'TRY',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Herkese cüzdan aç (Eksikse)
INSERT INTO public.wallets (user_id, balance)
SELECT id, 0 FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- İşlem Geçmişi Tablosu
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wallet_id uuid REFERENCES public.wallets(user_id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL, 
  type text NOT NULL CHECK (type IN ('deposit', 'spending', 'refund', 'transfer', 'withdrawal', 'commission')),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  description text,
  reference_id text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);


-- 3. TALEP (SERVICE REQUESTS) TABLOSU
CREATE TABLE IF NOT EXISTS public.service_requests (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    plate text,
    brand text,
    model text,
    engine_code text,
    demand_type text CHECK (demand_type IN ('part', 'service')),
    description text,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);


-- 4. TEKLİF (QUOTES) TABLOSU GÜNCELLEME
-- Tablo varsa eksik sütunları ekler (Safe Alter)

CREATE TABLE IF NOT EXISTS public.quotes (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS service_request_id bigint REFERENCES public.service_requests(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS price numeric,
ADD COLUMN IF NOT EXISTS estimated_delivery_days integer,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS warranty_months integer,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS accepted_at timestamp with time zone;

-- FK Constraints (İsimlendirme Garantisi)
DO $$
BEGIN
    -- Customer FK
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quotes_customer_id_fkey') THEN
        ALTER TABLE public.quotes ADD CONSTRAINT quotes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    -- Seller FK
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quotes_seller_id_fkey') THEN
        ALTER TABLE public.quotes ADD CONSTRAINT quotes_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 5. GÜVENLİK (RLS) POLİTİKALARI
-- Hepsini tek seferde açalım ve tanımlayalım

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Temizlik (Eski policy'leri kaldır ki çakışmasın)
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users manage own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Quotes visible to parties" ON public.quotes;

-- Create Policies
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (wallet_id = auth.uid());
CREATE POLICY "Users manage own requests" ON public.service_requests FOR ALL USING (auth.uid() = user_id);

-- Quotes: Customer, Seller ve Admin görebilir
CREATE POLICY "Quotes visible to parties" ON public.quotes
    FOR ALL USING (auth.uid() = customer_id OR auth.uid() = seller_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- 6. ADMIN YETKİSİ VERME (SİZİN İÇİN OTOMATİK)
-- E-posta adresinize (bedirelibol7@gmail.com) Admin yetkisi verir.

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb), 
    '{role}', 
    '"admin"'
)
WHERE email = 'bedirelibol7@gmail.com';

UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'bedirelibol7@gmail.com');


-- 7. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;

-- BİTTİ
