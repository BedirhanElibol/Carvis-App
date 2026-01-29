-- ============================================================================
-- CARVIS - TRUE MASTER SCHEMA (v4.0 Final)
-- Tarih: 27.01.2026 (Gece Yarısı Operasyonu)
-- Amaç: Tek Dosya, Tam Çözüm. (One Script to Rule Them All)
-- ============================================================================

-- ⚠️ DİKKAT: BU SCRIPT "public" ŞEMASINI TAMAMEN SIFIRLAR.
-- VERİ KAYBI YAŞANIR. SADECE AUTH USER'LAR KALIR.

-- 1. ŞEMAYI SIFIRLA (The Purge)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- ============================================================================
-- 2. KULLANICI YÖNETİMİ (AUTH & PROFILES & WALLETS)
-- ============================================================================

-- Profiles Tablosu
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamp with time zone,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    website text,
    phone_number text,
    -- Profile Details (Added for Frontend Compatibility)
    company_name text,
    seller_rating decimal(2,1) DEFAULT 0.0,
    experience_years integer DEFAULT 0,

    role text DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'parking', 'valet', 'mechanic', 'admin', 'driver', 'dealer')),
    created_at timestamp with time zone DEFAULT now()
);

-- Wallets Tablosu (FinTech)
CREATE TABLE public.wallets (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  currency text DEFAULT 'TRY',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Wallet Transactions
CREATE TABLE public.wallet_transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wallet_id uuid REFERENCES public.wallets(user_id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL, 
  type text NOT NULL CHECK (type IN ('deposit', 'spending', 'refund', 'transfer', 'withdrawal', 'commission')),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  description text,
  reference_id text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS: Profiles & Wallets
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Helper Function: Admin Check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies (Profiles)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());

-- Policies (Wallets)
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON public.wallet_transactions FOR SELECT USING (wallet_id = auth.uid());
CREATE POLICY "Admins view all wallets" ON public.wallets FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins view all transactions" ON public.wallet_transactions FOR SELECT USING (public.is_admin());


-- ============================================================================
-- 3. MARKETPLACE (TALEPLER, TEKLİFLER, SİPARİŞLER)
-- ============================================================================

-- Service Requests (Müşteri Talepleri)
CREATE TABLE public.service_requests (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    plate text,
    brand text,
    model text,
    engine_code text,
    demand_type text CHECK (demand_type IN ('part', 'service')),
    description text,
    status text DEFAULT 'pending', -- pending, completed, cancelled
    created_at timestamp with time zone DEFAULT now()
);

-- Quotes (Satıcı Teklifleri)
CREATE TABLE public.quotes (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    
    -- İlişkiler
    service_request_id bigint CONSTRAINT quotes_service_request_id_fkey REFERENCES public.service_requests(id) ON DELETE CASCADE,
    customer_id uuid CONSTRAINT quotes_customer_id_fkey REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id uuid CONSTRAINT quotes_seller_id_fkey REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Teklif Detayları
    price numeric NOT NULL,
    description text,
    estimated_delivery_days integer,
    warranty_months integer DEFAULT 0,
    
    -- Durum
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    accepted_at timestamp with time zone,
    
    -- Eski 'details' jsonb'si (Legacy support gerekirse)
    details jsonb
);

-- Orders (Kesinleşen Siparişler)
CREATE TABLE public.orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quote_id bigint REFERENCES public.quotes(id) ON DELETE SET NULL,
  
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  commission_rate numeric DEFAULT 0.05,
  
  -- Generated Columns
  commission_amount numeric GENERATED ALWAYS AS (total_amount * commission_rate) STORED,
  seller_amount numeric GENERATED ALWAYS AS (total_amount * (1 - commission_rate)) STORED,
  
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled', 'refunded')),
  payment_method text DEFAULT 'paytr',
  
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  paid_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- Commissions (Platform Gelirleri)
CREATE TABLE public.commissions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id bigint REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS: Marketplace
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Policies (Service Requests)
CREATE POLICY "Users manage own requests" ON public.service_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read requests" ON public.service_requests FOR SELECT USING (true); -- Partnerler görebilsin

-- Policies (Quotes)
CREATE POLICY "Parties view quotes" ON public.quotes 
    FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = seller_id OR public.is_admin());
CREATE POLICY "Sellers create quotes" ON public.quotes 
    FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Parties update quotes" ON public.quotes 
    FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = seller_id);

-- Policies (Orders)
CREATE POLICY "Parties view orders" ON public.orders 
    FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = seller_id OR public.is_admin());
CREATE POLICY "Customers create orders" ON public.orders 
    FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Parties update orders" ON public.orders 
    FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = seller_id);


-- ============================================================================
-- 4. PARTNERLER (OTOPARK, VALE, OTO SERVİS)
-- ============================================================================

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
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.valet_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id uuid REFERENCES public.profiles(id) NOT NULL,
    business_name text NOT NULL,
    is_available boolean DEFAULT false,
    rating decimal(2,1) DEFAULT 5.0,
    created_at timestamptz DEFAULT now()
);

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

CREATE POLICY "Public read partners" ON public.parking_lots FOR SELECT USING (true);
CREATE POLICY "Owner manage parking" ON public.parking_lots FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public read valets" ON public.valet_services FOR SELECT USING (true);
CREATE POLICY "Owner manage valet" ON public.valet_services FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public read mechanics" ON public.mechanic_shops FOR SELECT USING (true);
CREATE POLICY "Owner manage mechanic" ON public.mechanic_shops FOR ALL USING (auth.uid() = owner_id);



-- ============================================================================
-- 4.b PARTNERLER EK (İLETİŞİM & AJANDA)
-- ============================================================================

-- Vehicles (Araçlar - Garaj Modülü İçin)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    plate text,
    brand text,
    model text,
    year integer,
    color text,
    vin text,
    fuel_type text,
    created_at timestamptz DEFAULT now()
);

-- Notifications (Bildirimler)
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text,
    message text,
    type text, -- info, success, warning, error
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Messages (Mesajlaşma)
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Appointments (Randevular)
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
    quote_id bigint REFERENCES public.quotes(id) ON DELETE SET NULL,
    appointment_date timestamptz,
    status text DEFAULT 'scheduled', -- scheduled, completed, cancelled
    created_at timestamptz DEFAULT now()
);

-- RLS: Araçlar, Bildirimler, Mesajlar, Randevular
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies (Vehicles)
CREATE POLICY "Users view own vehicles" ON public.vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own vehicles" ON public.vehicles FOR ALL USING (auth.uid() = user_id);

-- Policies (Notifications)
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System inserts notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Policies (Messages)
CREATE POLICY "Users read own messages" ON public.messages 
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users send messages" ON public.messages 
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Policies (Appointments)
CREATE POLICY "Users view appointments" ON public.appointments 
    FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = seller_id);
CREATE POLICY "Users manage appointments" ON public.appointments 
    FOR ALL USING (auth.uid() = customer_id OR auth.uid() = seller_id);


-- ============================================================================
-- 5. TRIGGERLAR (OTOMASYON)
-- ============================================================================

-- Trigger 1: Yeni User -> Profile + Wallet Oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Profile Oluştur
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  ) ON CONFLICT (id) DO NOTHING;

  -- Wallet Oluştur
  INSERT INTO public.wallets (user_id, balance) 
  VALUES (NEW.id, 0) 
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Trigger 2: Ödeme Tamamlanınca -> Para Dağıt (FinTech Core)
CREATE OR REPLACE FUNCTION public.distribute_order_revenue()
RETURNS TRIGGER AS $$
BEGIN
  -- Sadece 'paid' durumuna geçişte
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    
    -- Komisyon Kaydı
    INSERT INTO public.commissions (seller_id, order_id, amount, status)
    VALUES (NEW.seller_id, NEW.id, NEW.commission_amount, 'paid');
    
    -- Satıcı Cüzdanına Ekle
    UPDATE public.wallets 
    SET balance = balance + NEW.seller_amount, updated_at = now()
    WHERE user_id = NEW.seller_id;
    
    -- Satıcı Logu
    INSERT INTO public.wallet_transactions (wallet_id, amount, type, status, description, reference_id)
    VALUES (NEW.seller_id, NEW.seller_amount, 'deposit', 'completed', 'Sipariş Geliri #' || NEW.id, NEW.id::text);
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_paid_distribute
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.distribute_order_revenue();


-- ============================================================================
-- 6. VERİ KURTARMA & MİGRASYON (Migration Logic)
-- ============================================================================

-- Mevcut Auth User'ları Profile Tablosuna Geri Yükle (Sync)
INSERT INTO public.profiles (id, full_name, role, created_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email),
    COALESCE(raw_user_meta_data->>'role', 'customer'),
    created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role;

-- Eksik Walletları Tamamla
INSERT INTO public.wallets (user_id, balance)
SELECT id, 0 FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;


-- ============================================================================
-- 7. ADMIN YETKİLENDİRME (Auto-Grant)
-- ============================================================================

-- Sizin hesabınızı Admin yap
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"admin"')
WHERE email = 'bedirelibol7@gmail.com';

UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'bedirelibol7@gmail.com');


-- ============================================================================
-- 8. REALTIME (Canlı Veri)
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- TRUE MASTER SCHEMA FIRSAT VERMEYEN HATASIZ VERSION TAMAMLANDI.
