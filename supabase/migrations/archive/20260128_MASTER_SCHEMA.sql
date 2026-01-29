-- ============================================================================
-- CARVIS MASTER SCHEMA (v2.0)
-- Oluşturulma Tarihi: 28.01.2026
-- Amaç: Tüm veritabanını sıfırlayarak (Clean Slate) çakışmaları önlemek.
-- Kapsam: Auth, Profiles, Cüzdanlar (FinTech), Siparişler (Marketplace), Partnerler.
-- ============================================================================

-- ⚠️ DİKKAT: BU SCRIPT VERİ KAYBINA YOL AÇAR. "public" ŞEMASINI SIFIRLAR.

-- 1. ŞEMAYI SIFIRLA (RESET)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- ============================================================================
-- 1. AUTH & PROFILES (Kullanıcı Yönetimi)
-- ============================================================================

-- Profiles tablosu (Supabase Auth ile senkronize)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamp with time zone,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    website text,
    phone_number text,
    -- Role: 'admin', 'customer', 'parking', 'valet', 'mechanic'
    role text DEFAULT 'customer' CHECK (role IN ('customer', 'parking', 'valet', 'mechanic', 'admin')),
    created_at timestamp with time zone DEFAULT now()
);

-- RLS: Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper Function: Admin Kontrolü
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admin Policies (Süper Yetki)
CREATE POLICY "Admins can update everyone" ON public.profiles FOR UPDATE USING (public.is_admin());

-- Trigger: Yeni kullanıcı oluşunca Profile oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer') -- Varsayılan customer, ama metadata'dan gelebilir
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 2. FINTECH (Cüzdan & Para)
-- ============================================================================

-- Wallets (Her kullanıcının 1 cüzdanı olur)
CREATE TABLE public.wallets (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  currency text DEFAULT 'TRY',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Wallet Transactions (Hesap Hareketleri)
CREATE TABLE public.wallet_transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wallet_id uuid REFERENCES public.wallets(user_id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL, 
  type text NOT NULL CHECK (type IN ('deposit', 'spending', 'refund', 'transfer', 'withdrawal', 'commission')),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  description text,
  reference_id text, -- Sipariş ID veya PayTR OID
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS: FinTech
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (wallet_id = auth.uid());

-- Admin Policies
CREATE POLICY "Admins view wallets" ON public.wallets FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins view transactions" ON public.wallet_transactions FOR SELECT USING (public.is_admin());

-- Trigger: Her profile için cüzdan oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();


-- ============================================================================
-- 3. MARKETPLACE & ORDERS (Sipariş Yönetimi)
-- ============================================================================

-- Quotes tablosu (Opsiyonel: Teklifler için)
CREATE TABLE public.quotes (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    -- Basitleştirilmiş, detaylar JSONB olabilir
    details jsonb
);

-- Orders Tablosu
CREATE TABLE public.orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quote_id bigint REFERENCES public.quotes(id) ON DELETE SET NULL,
  
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  commission_rate numeric DEFAULT 0.05 CHECK (commission_rate >= 0 AND commission_rate <= 1),
  
  -- Generated Columns (Otomatik Hesap)
  commission_amount numeric GENERATED ALWAYS AS (total_amount * commission_rate) STORED,
  seller_amount numeric GENERATED ALWAYS AS (total_amount * (1 - commission_rate)) STORED,
  
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled', 'refunded')),
  payment_method text DEFAULT 'paytr',
  
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  paid_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- Commissions Tablosu (Platform Gelir Takibi)
CREATE TABLE public.commissions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id bigint REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Transactions (Gateway Logs - PayTR)
CREATE TABLE public.transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id bigint REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  merchant_oid text UNIQUE NOT NULL,
  paytr_token text UNIQUE,
  payment_amount numeric NOT NULL,
  payment_status text DEFAULT 'pending',
  paytr_response jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS: Marketplace
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies (Orders)
CREATE POLICY "Users view own orders" ON public.orders 
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = seller_id);
CREATE POLICY "Customers create orders" ON public.orders 
  FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users update own orders" ON public.orders 
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = seller_id);
  
-- Admin Policies (Orders)
CREATE POLICY "Admins view orders" ON public.orders FOR SELECT USING (public.is_admin());

-- Policies (Transactions)
-- Kullanıcı kendi siparişine ait logları görebilsin
CREATE POLICY "Users view order transactions" ON public.transactions 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = transactions.order_id AND (orders.customer_id = auth.uid() OR orders.seller_id = auth.uid()))
  );
  
-- ============================================================================
-- 4. PARTNER EKOSİSTEMİ (Otopark, Vale, Usta)
-- ============================================================================

-- Parking Lots
CREATE TABLE public.parking_lots (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id uuid REFERENCES public.profiles(id) NOT NULL,
    name text NOT NULL,
    capacity integer DEFAULT 100,
    current_occupancy integer DEFAULT 0,
    price_hourly decimal(10,2) DEFAULT 0,
    location_lat float,
    location_lng float,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Valet Services
CREATE TABLE public.valet_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id uuid REFERENCES public.profiles(id) NOT NULL,
    business_name text NOT NULL,
    is_available boolean DEFAULT false,
    current_lat float,
    current_lng float,
    rating decimal(2,1) DEFAULT 5.0,
    created_at timestamptz DEFAULT now()
);

-- Mechanic Shops
CREATE TABLE public.mechanic_shops (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id uuid REFERENCES public.profiles(id) NOT NULL,
    shop_name text NOT NULL,
    address text,
    is_open boolean DEFAULT true,
    rating decimal(2,1) DEFAULT 5.0,
    location_lat float,
    location_lng float,
    created_at timestamptz DEFAULT now()
);

-- RLS: Partners
ALTER TABLE public.parking_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valet_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_shops ENABLE ROW LEVEL SECURITY;

-- Simple Policies: Public Read, Owner Write/Update
CREATE POLICY "Public read parking" ON public.parking_lots FOR SELECT USING (true);
CREATE POLICY "Owner update parking" ON public.parking_lots FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owner insert parking" ON public.parking_lots FOR INSERT WITH CHECK (auth.uid() = owner_id);
-- (Admin Policies eklenebilir ama şu anlık public read yeterli)
CREATE POLICY "Admins view parking" ON public.parking_lots FOR SELECT USING (public.is_admin());

-- (Diğerleri için de benzer Owner pattern'i uygulanabilir, yer tasarrufu için kısa tutuldu)
CREATE POLICY "Public read valet" ON public.valet_services FOR SELECT USING (true);
CREATE POLICY "Owner write valet" ON public.valet_services FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public read mechanic" ON public.mechanic_shops FOR SELECT USING (true);
CREATE POLICY "Owner write mechanic" ON public.mechanic_shops FOR ALL USING (auth.uid() = owner_id);


-- ============================================================================
-- 5. TRIGGER LOGIC: SİPARİŞ TAMAMLANINCA PARA DAĞITIMI
-- ============================================================================

CREATE OR REPLACE FUNCTION public.distribute_order_revenue()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_wallet uuid;
BEGIN
  -- Sadece 'paid' durumuna ilk kez geçişte çalış
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    
    -- 1. Komisyon Kaydı (Platform Geliri)
    INSERT INTO public.commissions (seller_id, order_id, amount, status)
    VALUES (NEW.seller_id, NEW.id, NEW.commission_amount, 'paid');
    
    -- 2. Satıcıya Para Aktar (Cüzdanın varlığından eminiz çünkü trigger ile oluşturduk)
    UPDATE public.wallets 
    SET balance = balance + NEW.seller_amount, updated_at = now()
    WHERE user_id = NEW.seller_id;
    
    -- 3. İşlem Kaydı (Satıcı Geliri)
    INSERT INTO public.wallet_transactions (wallet_id, amount, type, status, description, reference_id)
    VALUES (
        NEW.seller_id, 
        NEW.seller_amount, 
        'deposit', 
        'completed', 
        'Hizmet Geliri (Sipariş #' || NEW.id || ')', 
        NEW.id::text
    );
    
    -- 4. Admin Bakiyesi (Opsiyonel: Eğer sistemin de bir cüzdanı varsa oraya komisyon yatırılabilir)
    -- Şu anlık sadece commissions tablosunda tutuyoruz.

  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_paid_distribute_revenue
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.distribute_order_revenue();

-- ============================================================================
-- 6. INDEXES & PERFORMANCE
-- ============================================================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);
CREATE INDEX idx_parking_geom ON public.parking_lots(location_lat, location_lng);

-- 7. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_lots;

-- MASTER SCHEMA COMPLETED
