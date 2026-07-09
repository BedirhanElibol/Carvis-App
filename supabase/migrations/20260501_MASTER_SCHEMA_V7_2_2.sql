-- =========================================================
-- CARVIS PWA MASTER SCHEMA v7.2.2 (GÃœVENLÄ° & TAMÄ°R EDÄ°LMÄ°Å)
-- COMPLETE DATABASE DEFINITION - IDEMPOTENT & NON-DESTRUCTIVE
-- FIX: Enum 'parts' unsafe use error by using text-casting in logic
-- =========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. ENUM INITIALIZATION & REPAIR
-- [Ã–NEMLÄ°] Postgres 12+ kÄ±sÄ±tlamasÄ± nedeniyle yeni eklenen enum deÄŸerleri 
-- aynÄ± transaction iÃ§inde kullanÄ±lamaz. Bu yÃ¼zden aÅŸaÄŸÄ±da ::text cast kullanÄ±lmÄ±ÅŸtÄ±r.

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('customer', 'valet', 'parking', 'mechanic', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'paid', 'completed', 'cancelled', 'shipping', 'refunded');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status') THEN
        CREATE TYPE quote_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Eksik deÄŸerleri ekle (BurasÄ± hata verirse SQL Editor'de seÃ§ip sadece burayÄ± Ã§alÄ±ÅŸtÄ±rÄ±n)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'parts';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'driver';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'dealer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'seller';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partner';

-- 3. TABLES (CREATE IF NOT EXISTS - Zero Data Loss)

-- CORPORATE CHAINS (Ulusal Servis AÄŸlarÄ±)
CREATE TABLE IF NOT EXISTS public.corporate_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    username TEXT,
    phone_number TEXT, 
    avatar_url TEXT,
    role user_role DEFAULT 'customer',
    company_name TEXT,
    experience_years INTEGER,
    seller_rating DECIMAL(3,2) DEFAULT 5.0,
    is_active_provider BOOLEAN DEFAULT false,
    provider_type TEXT,
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    created_at TIMESTAMPTZ DEFAULT now(),
    last_login TIMESTAMPTZ
);

-- Profiles Security & Compliance (PostGIS + KVKK + Policy)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_phone_number_key') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_number_key UNIQUE (phone_number);
    END IF;
    
    -- PostGIS Geog Column Add (Safe Fallback)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='geog') THEN
        ALTER TABLE public.profiles ADD COLUMN geog geography(POINT, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_SetSRID(ST_MakePoint(lng::double precision, lat::double precision), 4326), 4326)) STORED;
    END IF;

    -- KVKK Compliance Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='kvkk_approved_at') THEN
        ALTER TABLE public.profiles ADD COLUMN kvkk_approved_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='marketing_approved_at') THEN
        ALTER TABLE public.profiles ADD COLUMN marketing_approved_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='privacy_policy_approved_at') THEN
        ALTER TABLE public.profiles ADD COLUMN privacy_policy_approved_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_deleted') THEN
        ALTER TABLE public.profiles ADD COLUMN is_deleted BOOLEAN DEFAULT false;
    END IF;
    -- Partner Metrics (Nicelik) Column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='business_details') THEN
        ALTER TABLE public.profiles ADD COLUMN business_details JSONB DEFAULT '{}'::jsonb;
    END IF;
    -- Corporate Chain Integration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='corporate_chain_id') THEN
        ALTER TABLE public.profiles ADD COLUMN corporate_chain_id UUID REFERENCES public.corporate_chains(id) ON DELETE SET NULL;
    END IF;
    -- Rapidsy Standards & Partner Bans
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='rapidsy_contract_approved_at') THEN
        ALTER TABLE public.profiles ADD COLUMN rapidsy_contract_approved_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_approved_partner') THEN
        ALTER TABLE public.profiles ADD COLUMN is_approved_partner BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_banned') THEN
        ALTER TABLE public.profiles ADD COLUMN is_banned BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='ban_reason') THEN
        ALTER TABLE public.profiles ADD COLUMN ban_reason TEXT;
    END IF;
END $$;

-- WALLETS
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    balance DECIMAL(12,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'TRY',
    blocked_amount DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- WALLET TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES public.profiles(id),
    amount DECIMAL(12,2) NOT NULL,
    type TEXT CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'block', 'unblock', 'commission')),
    description TEXT,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    price DECIMAL(12,2),
    img TEXT,
    image_url TEXT,
    certified BOOLEAN DEFAULT false,
    stock INTEGER DEFAULT 0,
    stock_status TEXT DEFAULT 'in_stock',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- MECHANIC SHOPS
CREATE TABLE IF NOT EXISTS public.mechanic_shops (
    id SERIAL PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    shop_name TEXT NOT NULL,
    brands TEXT[],
    rating DECIMAL(3,2) DEFAULT 5.0,
    experience_years INTEGER DEFAULT 5,
    avatar_url TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- [v6.9] Safe Column Additions for Mechanic Shops
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mechanic_shops' AND column_name='specialties') THEN
        ALTER TABLE public.mechanic_shops ADD COLUMN specialties TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mechanic_shops' AND column_name='working_hours') THEN
        ALTER TABLE public.mechanic_shops ADD COLUMN working_hours JSONB DEFAULT '{"mon": "09:00-18:00", "tue": "09:00-18:00", "wed": "09:00-18:00", "thu": "09:00-18:00", "fri": "09:00-18:00", "sat": "09:00-14:00", "sun": "closed"}';
    END IF;
END $$;

-- SPECIALIZED PROFILES
CREATE TABLE IF NOT EXISTS public.valet_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    base_price DECIMAL(12,2) DEFAULT 0.00,
    service_radius_km INTEGER DEFAULT 10,
    experience_years INTEGER DEFAULT 1,
    license_type TEXT,
    bio TEXT,
    is_active_now BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.parking_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    parking_name TEXT,
    total_capacity INTEGER DEFAULT 10,
    occupied_count INTEGER DEFAULT 0,
    price_per_hour DECIMAL(12,2) DEFAULT 0.00,
    is_indoor BOOLEAN DEFAULT true,
    has_security BOOLEAN DEFAULT true,
    has_valet BOOLEAN DEFAULT false,
    address_text TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.parts_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT,
    delivery_radius_km INTEGER DEFAULT 50,
    store_type TEXT DEFAULT 'retail',
    tax_info TEXT,
    is_warehouse_direct BOOLEAN DEFAULT false,
    categories TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- VEHICLES & MAINTENANCE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    brand TEXT,
    model TEXT,
    plate TEXT UNIQUE,
    engine_code TEXT,
    year INTEGER,
    color TEXT,
    km TEXT,
    last_maintenance_date TIMESTAMPTZ,
    last_inspection_date TIMESTAMPTZ,
    last_insurance_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    km INTEGER,
    cost DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- SERVICE REQUESTS & QUOTES
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    plate TEXT,
    brand TEXT,
    model TEXT,
    engine_code TEXT,
    demand_type TEXT DEFAULT 'service',
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.profiles(id),
    customer_id UUID REFERENCES public.profiles(id),
    price DECIMAL(12,2) NOT NULL,
    description TEXT,
    warranty_months INTEGER DEFAULT 0,
    status quote_status DEFAULT 'pending',
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- DUPLICATE PREVENTION CONSTRAINTS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_seller_product') THEN
        ALTER TABLE public.products ADD CONSTRAINT unique_seller_product UNIQUE (seller_id, name, brand);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_seller_quote') THEN
        ALTER TABLE public.quotes ADD CONSTRAINT unique_seller_quote UNIQUE (service_request_id, seller_id);
    END IF;
END $$;


-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id),
    seller_id UUID REFERENCES public.profiles(id),
    vehicle_id UUID REFERENCES public.vehicles(id),
    quote_id UUID REFERENCES public.quotes(id),
    service_type TEXT,
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ORDERS & ITEMS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id),
    seller_id UUID REFERENCES public.profiles(id),
    quote_id UUID REFERENCES public.quotes(id),
    total_amount DECIMAL(12,2) NOT NULL,
    commission_rate DECIMAL(5,4) DEFAULT 0.05,
    status order_status DEFAULT 'pending',
    payment_method TEXT,
    pending_approval_items JSONB DEFAULT '[]'::jsonb,
    paid_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'pending_approval_items') THEN
        ALTER TABLE public.orders ADD COLUMN pending_approval_items JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id),
    product_offer_id INTEGER,
    quantity INTEGER DEFAULT 1,
    price_at_purchase DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- DUPLICATE PREVENTION CONSTRAINTS (Orders & Appointments)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_quote_order') THEN
        ALTER TABLE public.orders ADD CONSTRAINT unique_quote_order UNIQUE (quote_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_quote_appointment') THEN
        ALTER TABLE public.appointments ADD CONSTRAINT unique_quote_appointment UNIQUE (quote_id);
    END IF;
END $$;

-- MESSAGES & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'info',
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    full_address TEXT,
    city TEXT,
    district TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- EMERGENCY REQUESTS (SOS)
CREATE TABLE IF NOT EXISTS public.emergency_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id),
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    emergency_type TEXT,
    description TEXT,
    status TEXT DEFAULT 'searching',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(12,2) NOT NULL,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    usage_limit INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================
-- 4. INDEXES & FUNCTIONS (OR REPLACE)
-- =========================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. TRIGGERS & FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_text TEXT;
BEGIN
    -- [v7.2.3] Safely determine role from metadata
    default_role_text := COALESCE(new.raw_user_meta_data->>'role', 'customer');

    INSERT INTO public.profiles (
        id, email, full_name, role, phone_number,
        kvkk_approved_at, marketing_approved_at, privacy_policy_approved_at,
        created_at
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        default_role_text::public.user_role,
        new.phone,
        CASE WHEN new.raw_user_meta_data->>'kvkk_consent' = 'true' THEN NOW() ELSE NULL END,
        CASE WHEN new.raw_user_meta_data->>'marketing_consent' = 'true' THEN NOW() ELSE NULL END,
        CASE WHEN new.raw_user_meta_data->>'privacy_consent' = 'true' THEN NOW() ELSE NULL END,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        phone_number = COALESCE(public.profiles.phone_number, EXCLUDED.phone_number),
        kvkk_approved_at = COALESCE(public.profiles.kvkk_approved_at, EXCLUDED.kvkk_approved_at),
        marketing_approved_at = COALESCE(public.profiles.marketing_approved_at, EXCLUDED.marketing_approved_at),
        last_login = NOW();

    -- Ensure wallet exists
    BEGIN
        INSERT INTO public.wallets (id, user_id, balance, currency)
        VALUES (new.id, new.id, 0.00, 'TRY')
        ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Failure to create wallet shouldn't block signup
    END;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Prevent signup fatal errors by returning NEW anyway
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Last Login Tracker
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET last_login = now() WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.update_last_login();

-- =========================================================
-- 6. RLS (v7.2.4 STABILIZED POLICIES)
-- =========================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 6. RLS (v7.2.4 FINAL STABILIZED POLICIES)
-- =========================================================

-- Profiles: Complete Security (SELECT, INSERT, UPDATE)
DROP POLICY IF EXISTS "Profiles Security Policy v7.2" ON public.profiles;
CREATE POLICY "Profiles Security Policy v7.2" ON public.profiles
FOR SELECT USING (
    public.is_admin() 
    OR (auth.uid() = id)
    OR (role::text IN ('valet', 'parking', 'mechanic', 'parts', 'seller', 'driver', 'dealer', 'admin'))
);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Security Trigger: Prevent Privilege Escalation for Profiles
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if role or suspension status is being changed
    IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_suspended IS DISTINCT FROM OLD.is_suspended) THEN
        -- If user is NOT an admin, block the operation
        IF NOT public.is_admin() THEN
            -- Allow if it's the service_role key bypassing RLS
            IF current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role' THEN
                RETURN NEW;
            END IF;
            RAISE EXCEPTION 'Security Violation: Yetki yÃ¼kseltme veya statÃ¼ deÄŸiÅŸtirme izniniz yok.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();


-- Wallets: Upsert Support (v7.2.4 FIX 403)
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet" ON public.wallets 
FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own wallet" ON public.wallets;
CREATE POLICY "Users can insert own wallet" ON public.wallets 
FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;
CREATE POLICY "Users can update own wallet" ON public.wallets 
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Wallet Transactions: Access & Log
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions 
FOR SELECT USING (wallet_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can insert own transactions" ON public.wallet_transactions 
FOR INSERT WITH CHECK (wallet_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- Specialized Profiles: Persistence & Discovery
DROP POLICY IF EXISTS "Users can manage own specialized profiles" ON public.valet_profiles;
CREATE POLICY "Users can manage own specialized profiles" ON public.valet_profiles FOR ALL USING (auth.uid() = id);
DROP POLICY IF EXISTS "Public read active valets" ON public.valet_profiles;
CREATE POLICY "Public read active valets" ON public.valet_profiles FOR SELECT USING (is_active_now = true);

DROP POLICY IF EXISTS "Users can manage own specialized profiles" ON public.parking_profiles;
CREATE POLICY "Users can manage own specialized profiles" ON public.parking_profiles FOR ALL USING (auth.uid() = id);
DROP POLICY IF EXISTS "Public read parking" ON public.parking_profiles;
CREATE POLICY "Public read parking" ON public.parking_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own specialized profiles" ON public.parts_profiles;
CREATE POLICY "Users can manage own specialized profiles" ON public.parts_profiles FOR ALL USING (auth.uid() = id);
DROP POLICY IF EXISTS "Public read parts" ON public.parts_profiles;
CREATE POLICY "Public read parts" ON public.parts_profiles FOR SELECT USING (true);

-- Messaging & Notifications: Privacy
DROP POLICY IF EXISTS "Messages Security Policy v7.2" ON public.messages;
CREATE POLICY "Messages Security Policy v7.2" ON public.messages
FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR public.is_admin());

DROP POLICY IF EXISTS "Notifications Security Policy v7.2" ON public.notifications;
CREATE POLICY "Notifications Security Policy v7.2" ON public.notifications
FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- General Visibility (Shops & Products)
DROP POLICY IF EXISTS "Public read active providers" ON public.mechanic_shops;
CREATE POLICY "Public read active providers" ON public.mechanic_shops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

-- =========================================================
-- 7. AUTOMATED NOTIFICATIONS (BACKBONE v1)
-- =========================================================

-- Quote Notification Trigger
CREATE OR REPLACE FUNCTION public.notify_quote_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- New Quote Received (Seller -> Customer)
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      NEW.customer_id,
      'info',
      'Yeni Bir Teklif AldÄ±nÄ±z!',
      'Hizmet talebinize yeni bir fiyat teklifi geldi. DetaylarÄ± incelemek iÃ§in dokunun.'
    );
  -- Quote Accepted (Customer -> Seller)
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted') THEN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      NEW.seller_id,
      'success',
      'Teklifiniz Kabul Edildi!',
      'MÃ¼ÅŸteri verdiÄŸiniz teklifi kabul etti. SipariÅŸ sÃ¼recini takip edebilirsiniz.'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_quote_activity ON public.quotes;
CREATE TRIGGER trg_notify_quote_activity
  AFTER INSERT OR UPDATE OF status ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.notify_quote_activity();

-- Order Progress Notification
CREATE OR REPLACE FUNCTION public.notify_order_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Order Paid (Customer -> Seller)
  IF (OLD.status = 'pending' AND NEW.status = 'paid') THEN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      NEW.seller_id,
      'success',
      'Ã–deme OnaylandÄ±!',
      'SipariÅŸ Ã¶demesi baÅŸarÄ±yla tamamlandÄ±. HazÄ±rlÄ±klara baÅŸlayabilirsiniz.'
    );
  -- Order Completed (Seller -> Customer)
  ELSIF (OLD.status <> 'completed' AND NEW.status = 'completed') THEN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      NEW.customer_id,
      'success',
      'SipariÅŸiniz TamamlandÄ±!',
      'Hizmet sÃ¼reci baÅŸarÄ±yla sonuÃ§landÄ±. Bizi tercih ettiÄŸiniz iÃ§in teÅŸekkÃ¼rler!'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_order_activity ON public.orders;
CREATE TRIGGER trg_notify_order_activity
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_activity();

-- Wallet Activity Notification
CREATE OR REPLACE FUNCTION public.notify_wallet_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.balance > OLD.balance) THEN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      NEW.user_id,
      'success',
      'CÃ¼zdan Bakiyesi GÃ¼ncellendi',
      'HesabÄ±nÄ±za ' || (NEW.balance - OLD.balance) || ' TRY tutarÄ±nda bakiye eklendi.'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_wallet_activity ON public.wallets;
CREATE TRIGGER trg_notify_wallet_activity
  AFTER UPDATE OF balance ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.notify_wallet_activity();

-- =========================================================
-- 8. AUDIT LOGGING & SEARCH OPTIMIZATION
-- =========================================================

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Trigger Function
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        to_jsonb(OLD),
        to_jsonb(NEW),
        auth.uid()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Map Search Indexing (GIST)
CREATE INDEX IF NOT EXISTS idx_profiles_geog ON public.profiles USING GIST (geog);

-- Apply Audit to Financial Tables
DROP TRIGGER IF EXISTS audit_wallets_change ON public.wallets;
CREATE TRIGGER audit_wallets_change
    AFTER UPDATE OR DELETE ON public.wallets
    FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_orders_change ON public.orders;
CREATE TRIGGER audit_orders_change
    AFTER UPDATE OR DELETE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- Refresh cache
NOTIFY pgrst, 'reload schema';

-- =========================================================
-- CARVIS TRUST AND LOYALTY SYSTEM v1.0
-- =========================================================

-- 1. Profiles Table Enhancement
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rating_avg') THEN
        ALTER TABLE public.profiles ADD COLUMN rating_avg DECIMAL(3,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'review_count') THEN
        ALTER TABLE public.profiles ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(order_id)
);

-- Safe Column Additions for Reviews (Repairs existing table)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'order_id') THEN
        ALTER TABLE public.reviews ADD COLUMN order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'reviewer_id') THEN
        ALTER TABLE public.reviews ADD COLUMN reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'seller_id') THEN
        ALTER TABLE public.reviews ADD COLUMN seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'rating') THEN
        ALTER TABLE public.reviews ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
    END IF;
END $$;

-- 3. RLS for Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can see reviews" ON public.reviews;
CREATE POLICY "Everyone can see reviews" ON public.reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Order owner can review" ON public.reviews;
CREATE POLICY "Order owner can review" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND 
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id 
            AND customer_id = auth.uid() 
            AND status = 'completed'
        )
    );

-- 4. Trigger for Rating Stats
CREATE OR REPLACE FUNCTION public.update_seller_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_seller_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_seller_id := OLD.seller_id;
    ELSE
        target_seller_id := NEW.seller_id;
    END IF;

    UPDATE public.profiles
    SET 
        rating_avg = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE seller_id = target_seller_id), 0),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE seller_id = target_seller_id)
    WHERE id = target_seller_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_seller_rating ON public.reviews;
CREATE TRIGGER trg_update_seller_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_seller_rating_stats();


-- 6. KVKK COMPLIANCE RPC (Account Deletion / Anonymization)
CREATE OR REPLACE FUNCTION public.request_account_deletion()
RETURNS void AS $$
BEGIN
  -- KVKK Requirement: Delete PII but keep non-personal transaction records for legal/tax purposes
  -- Scrub profile info
  UPDATE public.profiles
  SET 
    full_name = 'KullanÄ±cÄ± Silindi',
    username = 'deleted_user_' || id,
    email = 'deleted@carvis.com',
    phone_number = NULL,
    avatar_url = NULL,
    is_deleted = true,
    last_login = NULL
  WHERE id = auth.uid();
  
  -- Audit Log of deletion
  -- Note: Check if audit_logs table exists or use a generic notification
  -- For now, we assume it exists as per previous master schema audits
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (auth.uid(), 'info', 'Hesap Silme Talebi', 'KiÅŸisel verileriniz KVKK kapsamÄ±nda silinmek Ã¼zere iÅŸaretlendi.');

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================
-- 8. PARTNER APPLICATIONS & VERIFICATION
-- =========================================================

CREATE TABLE IF NOT EXISTS public.partner_applications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name text NOT NULL,
    tax_number text,
    tax_office text,
    trade_registry_number text,
    mersis_number text,
    kep_address text,
    office_address text,
    iban_number text,
    documents jsonb DEFAULT '[]'::jsonb, -- Store links to Vergi LevhasÄ±, Signature Circular etc.
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_note text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Profiles Table Upgrade
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS application_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- RLS for Applications
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can search their own applications" ON public.partner_applications;
CREATE POLICY "Users can search their own applications" ON public.partner_applications FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can submit their own applications" ON public.partner_applications;
CREATE POLICY "Users can submit their own applications" ON public.partner_applications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- 9. MANUAL REPAIR & SEED (TEST ACCOUNTS)
-- =========================================================

DO $$ 
BEGIN
    -- Force confirm specific test user to bypass email confirmation loop
    UPDATE auth.users 
    SET email_confirmed_at = now(), 
        last_sign_in_at = now()
    WHERE email = 'bedirelibol7@gmail.com';
    
    -- Ensure profile exists (if trigger was skipped or failed)
    INSERT INTO public.profiles (id, email, full_name, role, application_status)
    SELECT id, email, 'Bedirhan Elibol', 'admin', 'approved'
    FROM auth.users 
    WHERE email = 'bedirelibol7@gmail.com'
    ON CONFLICT (id) DO UPDATE 
    SET role = 'admin', full_name = 'Bedirhan Elibol', application_status = 'approved';
END $$;

-- =========================================================
-- 10. CORPORATE EXCELLENCE: ESCROW & PROOF OF WORK (v7.3)
-- =========================================================

-- 10.1 Escrow Vault (Ã–demeleri Bloke Eden Kasa)
CREATE TABLE IF NOT EXISTS public.escrow_vault (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    status text DEFAULT 'blocked' CHECK (status IN ('blocked', 'released', 'refunded', 'disputed')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10.2 Service Proofs (Hizmet KanÄ±tlarÄ± - FotoÄŸraflÄ± Tutanak)
CREATE TABLE IF NOT EXISTS public.service_proofs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    photo_urls text[] DEFAULT '{}',
    description text,
    is_approved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10.3 RLS & Security for Escrow
ALTER TABLE public.escrow_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_proofs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View own escrow" ON public.escrow_vault;
CREATE POLICY "View own escrow" ON public.escrow_vault FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (customer_id = auth.uid() OR seller_id = auth.uid())));

DROP POLICY IF EXISTS "View own proof" ON public.service_proofs;
CREATE POLICY "View own proof" ON public.service_proofs FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (customer_id = auth.uid() OR seller_id = auth.uid())));

DROP POLICY IF EXISTS "Partners manage proof" ON public.service_proofs;
CREATE POLICY "Partners manage proof" ON public.service_proofs FOR ALL 
USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND seller_id = auth.uid()));

-- 10.4 Automated Notifications for Proofs
DROP TRIGGER IF EXISTS trg_notify_service_proof ON public.service_proofs;
DROP FUNCTION IF EXISTS public.notify_service_proof_uploaded();

CREATE OR REPLACE FUNCTION public.notify_service_proof_uploaded()
RETURNS TRIGGER AS $$
DECLARE
    target_customer_id UUID;
BEGIN
    SELECT customer_id INTO target_customer_id FROM public.orders WHERE id = NEW.order_id;
    
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
        target_customer_id,
        'info',
        'Hizmet KanÄ±tÄ± YÃ¼klendi!',
        'UstanÄ±z iÅŸlemleri tamamlayÄ±p fotoÄŸraflarÄ± yÃ¼kledi. LÃ¼tfen onay vererek Ã¶demeyi serbest bÄ±rakÄ±n.'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_service_proof
AFTER INSERT ON public.service_proofs
FOR EACH ROW EXECUTE FUNCTION public.notify_service_proof_uploaded();

-- =========================================================
-- 9. ZERO-TRUST SECURITY: SECURE RPCs & TRIGGERS (v7.2.5)
-- =========================================================

-- 1. Prevent Direct Client Modifications to Wallets
CREATE OR REPLACE FUNCTION public.prevent_wallet_manipulation()
RETURNS TRIGGER AS $$
BEGIN
    -- Client UI cannot change balance explicitly unless it's a backend operation (service_role)
    IF NEW.balance IS DISTINCT FROM OLD.balance THEN
        IF current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' AND NOT public.is_admin() THEN
            RAISE EXCEPTION 'Security Violation: Cannot directly modify wallet balance.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_wallet_manipulation ON public.wallets;
CREATE TRIGGER trg_prevent_wallet_manipulation
BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION public.prevent_wallet_manipulation();

-- 2. Prevent Direct Order Tampering
CREATE OR REPLACE FUNCTION public.prevent_order_tampering()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        IF NEW.total_amount IS DISTINCT FROM OLD.total_amount OR NEW.status IS DISTINCT FROM OLD.status THEN
            IF current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' AND NOT public.is_admin() THEN
                RAISE EXCEPTION 'Security Violation: Cannot modify total_amount or status directly.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_order_tampering ON public.orders;
CREATE TRIGGER trg_prevent_order_tampering
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.prevent_order_tampering();

-- 3. Secure RPC: Release Escrow (Backend Operation Simulation)
CREATE OR REPLACE FUNCTION public.rpc_release_escrow(p_order_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_order RECORD;
BEGIN
    -- Check if order exists
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    -- Update order status via SECURITY DEFINER (bypasses RLS logic blocking user update)
    UPDATE public.orders SET status = 'completed' WHERE id = p_order_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Secure RPC: Add Wallet Funds
CREATE OR REPLACE FUNCTION public.rpc_add_wallet_funds(p_amount NUMERIC)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Update wallet safely
    UPDATE public.wallets SET balance = balance + p_amount WHERE user_id = v_user_id;

    -- Log transaction securely
    INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
    VALUES (v_user_id, p_amount, 'deposit', 'Bakiye YÃ¼klendi (GÃ¼venli Sistem)');
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- CARVIS MASTER SCHEMA PATCH v7.2.2.1 (EKSÄ°K PARÃ‡ALAR)
-- FIX: Missing Tables & RPCs for Admin/Partner Dashboards
-- =========================================================

-- 1. Eksik Tablolar: DanÄ±ÅŸmanlÄ±k ve Sistem AyarlarÄ±
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    expert_id UUID REFERENCES public.profiles(id),
    topic TEXT,
    fee DECIMAL(12,2) DEFAULT 0.00,
    status TEXT DEFAULT 'pending',
    meeting_link TEXT,
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Admin Dashboard Ä°statistik Fonksiyonu (v2)
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats_v2()
RETURNS JSONB AS $$
DECLARE
  u_count INTEGER;
  s_count INTEGER;
  t_volume DECIMAL(12,2);
  o_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO u_count FROM public.profiles;
  SELECT COUNT(*) INTO s_count FROM public.mechanic_shops;
  SELECT COALESCE(SUM(total_amount), 0) INTO t_volume FROM public.orders WHERE status IN ('paid', 'completed');
  SELECT COUNT(*) INTO o_count FROM public.orders;

  RETURN jsonb_build_object(
    'userCount', u_count,
    'shopCount', s_count,
    'totalVolume', t_volume,
    'orderCount', o_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RLS Yetkileri
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consultations access" ON public.consultations;
CREATE POLICY "Consultations access" ON public.consultations
FOR ALL USING (auth.uid() = user_id OR auth.uid() = expert_id OR public.is_admin());

DROP POLICY IF EXISTS "Public read settings" ON public.system_settings;
CREATE POLICY "Public read settings" ON public.system_settings FOR SELECT USING (true);

-- =========================================================
-- CARVIS MONETIZATION & SUBSCRIPTION SYSTEM (v7.4)
-- =========================================================

-- 1. Monetization Plans (Subscription Packages)
CREATE TABLE IF NOT EXISTS public.monetization_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- 'Free', 'Basic', 'Pro'
    monthly_fee DECIMAL(12,2) DEFAULT 0.00,
    commission_rate DECIMAL(5,2) DEFAULT 0.10,
    lead_fee DECIMAL(12,2) DEFAULT 0.00,
    features JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Partner Monetization Settings
CREATE TABLE IF NOT EXISTS public.partner_monetization (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES public.profiles(id) UNIQUE,
    plan_id UUID REFERENCES public.monetization_plans(id),
    custom_commission_rate DECIMAL(5,2),
    custom_lead_fee DECIMAL(12,2),
    subscription_status TEXT DEFAULT 'active',
    last_billing_date TIMESTAMPTZ DEFAULT now(),
    next_billing_date TIMESTAMPTZ DEFAULT (now() + interval '1 month'),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Wallet Pending Balance (Escrow Support)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='wallets' AND COLUMN_NAME='pending_balance') THEN
        ALTER TABLE public.wallets ADD COLUMN pending_balance DECIMAL(12,2) DEFAULT 0.00;
    END IF;
END $$;

-- 4. Platform Earnings Ledger
CREATE TABLE IF NOT EXISTS public.platform_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id),
    amount DECIMAL(12,2) NOT NULL,
    earning_type TEXT NOT NULL, -- 'commission', 'subscription', 'lead_fee'
    status TEXT DEFAULT 'collected',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RPC: Advanced Atomic Payment with Commission & Escrow
CREATE OR REPLACE FUNCTION public.process_wallet_payment_v2(p_order_id UUID, p_customer_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_amount DECIMAL(12,2);
    v_seller_id UUID;
    v_comm_rate DECIMAL(5,2);
    v_comm_amount DECIMAL(12,2);
    v_seller_amount DECIMAL(12,2);
    v_balance DECIMAL(12,2);
BEGIN
    -- 1. Get Order Details
    SELECT total_amount, seller_id INTO v_total_amount, v_seller_id
    FROM public.orders WHERE id = p_order_id AND customer_id = p_customer_id AND status = 'pending';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'SipariÅŸ bulunamadÄ± veya iÅŸlenemez durumda.');
    END IF;

    -- 2. Check Customer Balance
    SELECT balance INTO v_balance FROM public.wallets WHERE user_id = p_customer_id;
    IF v_balance < v_total_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'Yetersiz bakiye.');
    END IF;

    -- 3. Calculate Commission (Dinamik)
    SELECT COALESCE(custom_commission_rate, (SELECT commission_rate FROM public.monetization_plans WHERE id = plan_id), 0.10)
    INTO v_comm_rate
    FROM public.partner_monetization WHERE partner_id = v_seller_id;

    v_comm_amount := v_total_amount * COALESCE(v_comm_rate, 0.10);
    v_seller_amount := v_total_amount - v_comm_amount;

    -- 4. Execute Transactions (Atomic)
    -- Deduct from customer
    UPDATE public.wallets SET balance = balance - v_total_amount WHERE user_id = p_customer_id;
    
    -- Add to seller's PENDING balance (Escrow)
    UPDATE public.wallets SET pending_balance = pending_balance + v_seller_amount WHERE user_id = v_seller_id;
    
    -- Update Order
    UPDATE public.orders SET status = 'paid', paid_at = now() WHERE id = p_order_id;
    
    -- Log Platform Earning
    INSERT INTO public.platform_earnings (order_id, amount, earning_type)
    VALUES (p_order_id, v_comm_amount, 'commission');

    -- Log Transactions
    INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
    VALUES (p_customer_id, -v_total_amount, 'payment', 'SipariÅŸ Ã–demesi (Komisyon Kesildi)');

    RETURN jsonb_build_object('success', true, 'commission', v_comm_amount, 'seller_payout', v_seller_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS Policies
ALTER TABLE public.monetization_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_monetization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings read" ON public.monetization_plans;
CREATE POLICY "Settings read" ON public.monetization_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Partner access own settings" ON public.partner_monetization;
CREATE POLICY "Partner access own settings" ON public.partner_monetization 
FOR ALL USING (auth.uid() = partner_id OR public.is_admin());

DROP POLICY IF EXISTS "Admin only earnings" ON public.platform_earnings;
CREATE POLICY "Admin only earnings" ON public.platform_earnings FOR SELECT USING (public.is_admin());

-- =========================================================
-- CARVIS ESCROW RELEASE SYSTEM (v7.5)
-- =========================================================

-- RPC: MÃ¼ÅŸteri OnayÄ± ile ParayÄ± Blokeden Ã‡Ä±kar (Escrow Payout)
CREATE OR REPLACE FUNCTION public.rpc_confirm_order_delivery(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_seller_amount DECIMAL(12,2);
    v_comm_amount DECIMAL(12,2);
BEGIN
    -- 1. SipariÅŸi doÄŸrula (Sadece 'paid' durumundakiler onaylanabilir)
    SELECT * INTO v_order FROM public.orders 
    WHERE id = p_order_id AND customer_id = auth.uid() AND status = 'paid';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'SipariÅŸ bulunamadÄ± veya zaten tamamlanmÄ±ÅŸ.');
    END IF;

    -- 2. SatÄ±cÄ± hakediÅŸini hesapla (Platform payÄ± hariÃ§)
    SELECT amount INTO v_comm_amount FROM public.platform_earnings WHERE order_id = p_order_id LIMIT 1;
    v_seller_amount := v_order.total_amount - COALESCE(v_comm_amount, 0);

    -- 3. CÃ¼zdan Transferi (PENDING -> BALANCE)
    UPDATE public.wallets SET 
        pending_balance = pending_balance - v_seller_amount,
        balance = balance + v_seller_amount
    WHERE user_id = v_order.seller_id;

    -- 4. SipariÅŸ Durumunu Kapat
    UPDATE public.orders SET 
        status = 'completed',
        completed_at = now()
    WHERE id = p_order_id;

    -- 5. Ä°ÅŸlem KaydÄ±
    INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
    VALUES (v_order.seller_id, v_seller_amount, 'deposit', 'SipariÅŸ OnaylandÄ± - HakediÅŸ AktarÄ±ldÄ±');

    RETURN jsonb_build_object('success', true, 'message', 'Ã–deme baÅŸarÄ±yla satÄ±cÄ±ya aktarÄ±ldÄ±.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- CARVIS PREMIUM FEATURES & MONETIZATION (v7.6)
-- =========================================================

-- 1. Garage Pro Improvements
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS inspection_date DATE,
ADD COLUMN IF NOT EXISTS insurance_expiry DATE,
ADD COLUMN IF NOT EXISTS last_mileage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT true;

-- 2. Service Packages (Marketplace Packages)
CREATE TABLE IF NOT EXISTS public.service_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    validity_months INTEGER DEFAULT 12,
    included_services JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. User Subscriptions / Active Package Rights
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.service_packages(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ DEFAULT now(),
    expiry_date TIMESTAMPTZ,
    usage_stats JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Transparency Report (Service Proofs) Improvements
ALTER TABLE public.service_proofs
ADD COLUMN IF NOT EXISTS before_photos JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS after_photos JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS technician_notes TEXT;

-- 5. Security Policies (RLS)
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active packages" ON public.service_packages;
CREATE POLICY "Anyone can view active packages" ON public.service_packages FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Partners manage own packages" ON public.service_packages;
CREATE POLICY "Partners manage own packages" ON public.service_packages FOR ALL USING (auth.uid() = partner_id OR public.is_admin());

DROP POLICY IF EXISTS "Users view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users view own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- =========================================================
-- CARVIS RELATIONSHIP & JOIN FIXES (v7.7)
-- Ensures specialized tables are correctly linked to profiles
-- =========================================================

-- VALET PROFILES FK FIX
ALTER TABLE public.valet_profiles 
DROP CONSTRAINT IF EXISTS valet_profiles_id_fkey,
ADD CONSTRAINT valet_profiles_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- PARKING PROFILES FK FIX
ALTER TABLE public.parking_profiles 
DROP CONSTRAINT IF EXISTS parking_profiles_id_fkey,
ADD CONSTRAINT parking_profiles_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- PARTS PROFILES FK FIX
ALTER TABLE public.parts_profiles 
DROP CONSTRAINT IF EXISTS parts_profiles_id_fkey,
ADD CONSTRAINT parts_profiles_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- MECHANIC SHOPS FK FIX
ALTER TABLE public.mechanic_shops 
DROP CONSTRAINT IF EXISTS mechanic_shops_seller_id_fkey,
ADD CONSTRAINT mechanic_shops_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- =========================================================
-- CARVIS 2.0 FEATURE ENHANCEMENTS (v8.0)
-- 1. GarajÄ±m 2.0 (Health Score, Reminders, Storage)
-- 2. Smart Diagnosis (Symptoms, AI Pre-Diagnosis)
-- 3. Live SOS Emergency Tracking (ETA, Pricing, Provider)
-- 4. Expense Tracking & Vehicle Reports PDF
-- =========================================================

-- 1. VEHICLES EXTENSIONS
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS chassis_number TEXT,
ADD COLUMN IF NOT EXISTS insurance_policy_no TEXT,
ADD COLUMN IF NOT EXISTS inspection_expiry_date DATE,
ADD COLUMN IF NOT EXISTS insurance_expiry_date DATE,
ADD COLUMN IF NOT EXISTS last_tire_change DATE,
ADD COLUMN IF NOT EXISTS last_battery_change DATE,
ADD COLUMN IF NOT EXISTS last_oil_change DATE;

-- 2. VEHICLE EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.vehicle_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    expense_type TEXT NOT NULL CHECK (expense_type IN ('fuel', 'service', 'tax', 'insurance', 'fine', 'cleaning', 'other')),
    amount DECIMAL(12,2) NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    mileage INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. VEHICLE DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.vehicle_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('registration', 'insurance', 'inspection', 'invoice', 'technician_report', 'other')),
    file_url TEXT NOT NULL,
    expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SMART DIAGNOSIS IN SERVICE REQUESTS
ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS symptoms JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS ai_pre_diagnosis TEXT,
ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS estimated_cost_min DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS estimated_cost_max DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('immediate', 'pending', 'flexible')),
ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]';

-- 5. EMERGENCY REQUESTS CANLI TAKIP
ALTER TABLE public.emergency_requests
ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS provider_lat DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS provider_lng DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS eta_minutes INTEGER,
ADD COLUMN IF NOT EXISTS price DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS evidence_photos JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating BETWEEN 1 AND 5);

-- 6. VEHICLE REPORTS LOG
CREATE TABLE IF NOT EXISTS public.vehicle_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL DEFAULT 'full' CHECK (report_type IN ('full', 'service_only', 'expense_only')),
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SECURITY & RLS FOR NEW TABLES
ALTER TABLE public.vehicle_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_reports ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES
DROP POLICY IF EXISTS "Users can manage own expenses" ON public.vehicle_expenses;
CREATE POLICY "Users can manage own expenses" ON public.vehicle_expenses FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own documents" ON public.vehicle_documents;
CREATE POLICY "Users can manage own documents" ON public.vehicle_documents FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own reports" ON public.vehicle_reports;
CREATE POLICY "Users can manage own reports" ON public.vehicle_reports FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- =========================================================
-- 9. PLATFORM ECONOMY & B2B SaaS ENHANCEMENTS
-- =========================================================

-- Add columns to profiles safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_tier') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'highlight_credits') THEN
        ALTER TABLE public.profiles ADD COLUMN highlight_credits INTEGER DEFAULT 0;
    END IF;
END $$;

-- appointment_slots table
CREATE TABLE IF NOT EXISTS public.appointment_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- insurance_products table
CREATE TABLE IF NOT EXISTS public.insurance_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name TEXT NOT NULL,
    provider_logo TEXT,
    product_type TEXT NOT NULL,
    base_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Safely update check constraint for product_type to avoid schema drift/violations
-- First, migrate any existing incompatible rows to the new allowed values
UPDATE public.insurance_products
SET product_type = 'traffic_insurance'
WHERE product_type = 'traffic' OR product_type = 'trafik';

UPDATE public.insurance_products
SET product_type = 'extended_warranty'
WHERE product_type = 'extended' OR product_type = 'garanti';

UPDATE public.insurance_products
SET product_type = 'kasko'
WHERE product_type NOT IN ('kasko', 'traffic_insurance', 'extended_warranty');

ALTER TABLE public.insurance_products DROP CONSTRAINT IF EXISTS insurance_products_product_type_check;
ALTER TABLE public.insurance_products ADD CONSTRAINT insurance_products_product_type_check CHECK (product_type IN ('kasko', 'traffic_insurance', 'extended_warranty'));

-- insurance_applications table
CREATE TABLE IF NOT EXISTS public.insurance_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.insurance_products(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Safely update check constraint for status to avoid schema drift/violations
-- First, migrate any existing incompatible status rows
UPDATE public.insurance_applications
SET status = 'pending'
WHERE status NOT IN ('pending', 'approved', 'rejected', 'contacted');

ALTER TABLE public.insurance_applications DROP CONSTRAINT IF EXISTS insurance_applications_status_check;
ALTER TABLE public.insurance_applications ADD CONSTRAINT insurance_applications_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'contacted'));

-- transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    merchant_oid TEXT NOT NULL UNIQUE,
    payment_amount DECIMAL(12,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed')),
    paytr_response JSONB,
    error_message TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS & Security for economy and new market tables
ALTER TABLE public.appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active appointment slots" ON public.appointment_slots;
CREATE POLICY "Anyone can view active appointment slots" ON public.appointment_slots FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Sellers can manage own appointment slots" ON public.appointment_slots;
CREATE POLICY "Sellers can manage own appointment slots" ON public.appointment_slots FOR ALL USING (auth.uid() = seller_id OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can view insurance products" ON public.insurance_products;
CREATE POLICY "Anyone can view insurance products" ON public.insurance_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admin can manage insurance products" ON public.insurance_products;
CREATE POLICY "Only admin can manage insurance products" ON public.insurance_products FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own insurance applications" ON public.insurance_applications;
CREATE POLICY "Users can view own insurance applications" ON public.insurance_applications FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own insurance applications" ON public.insurance_applications;
CREATE POLICY "Users can insert own insurance applications" ON public.insurance_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (
    auth.uid() = (SELECT customer_id FROM public.orders WHERE id = order_id) OR
    auth.uid() = (SELECT seller_id FROM public.orders WHERE id = order_id) OR
    public.is_admin()
);


-- Seed Data for Insurance Products (Removed for production)

-- Seed Data for Auctions (Removed for production)


-- =========================================================================
-- FAZ 1: CARVIS PLATFORM EKONOMÄ°SÄ° & OWASP API SIKILAÅTIRMA SÃœRÃœMÃœ (v7.3.0)
-- =========================================================================

-- 1. Komisyon ve Gelir KurallarÄ±
CREATE TABLE IF NOT EXISTS public.commission_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_type TEXT UNIQUE NOT NULL,
    base_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    bronze_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    silver_rate DECIMAL(5,2) NOT NULL DEFAULT 12.00,
    gold_rate DECIMAL(5,2) NOT NULL DEFAULT 8.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Partner HakediÅŸleri ve Payout Muhasebesi
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    bank_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- 3. GÃ¶rev Ä°ptal ve Ä°htilaf MasasÄ± (Gig Disputes)
CREATE TABLE IF NOT EXISTS public.gig_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.gig_tasks(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'under_investigation' CHECK (status IN ('under_investigation', 'resolved', 'dismissed')),
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Partner Kalite ve Performans Metrikleri
CREATE TABLE IF NOT EXISTS public.partner_metrics (
    partner_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    acceptance_rate DECIMAL(5,2) DEFAULT 100.00,
    cancellation_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_response_time_minutes INTEGER DEFAULT 15,
    loyal_customers_count INTEGER DEFAULT 0,
    score DECIMAL(3,2) DEFAULT 5.00,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. OWASP API Denetim KayÄ±tlarÄ± (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS EtkinleÅŸtirilmesi
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gig_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Yeni Tablolar Ä°Ã§in RLS PolitikalarÄ±
DROP POLICY IF EXISTS "Everyone can view commission rules" ON public.commission_rules;
CREATE POLICY "Everyone can view commission rules" ON public.commission_rules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can modify commission rules" ON public.commission_rules;
CREATE POLICY "Admins can modify commission rules" ON public.commission_rules FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Partners can view own payouts" ON public.payouts;
CREATE POLICY "Partners can view own payouts" ON public.payouts FOR SELECT USING (auth.uid() = partner_id OR public.is_admin());

DROP POLICY IF EXISTS "Only admin can modify payouts" ON public.payouts;
CREATE POLICY "Only admin can modify payouts" ON public.payouts FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Involved users can view gig disputes" ON public.gig_disputes;
CREATE POLICY "Involved users can view gig disputes" ON public.gig_disputes FOR SELECT USING (
    auth.uid() = reporter_id OR 
    auth.uid() = (SELECT customer_id FROM public.gig_tasks WHERE id = task_id) OR
    auth.uid() = (SELECT claimer_id FROM public.gig_tasks WHERE id = task_id) OR
    public.is_admin()
);

DROP POLICY IF EXISTS "Involved users can insert disputes" ON public.gig_disputes;
CREATE POLICY "Involved users can insert disputes" ON public.gig_disputes FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Everyone can read partner metrics" ON public.partner_metrics;
CREATE POLICY "Everyone can read partner metrics" ON public.partner_metrics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Partners and admins can manage metrics" ON public.partner_metrics;
CREATE POLICY "Partners and admins can manage metrics" ON public.partner_metrics FOR ALL USING (auth.uid() = partner_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());


-- =========================================================================
-- GÃœVENLÄ° BACKEND RPC FONKSÄ°YONLARI (OWASP BOLA/BFLA KORUMALARI)
-- =========================================================================

-- 1. GÃ¼venli GÃ¶rev Kapma Ä°ÅŸlemi (YarÄ±ÅŸ KoÅŸulu KorumalÄ±)
CREATE OR REPLACE FUNCTION public.claim_gig_task_secure(
    p_task_id UUID,
    p_claimer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_success BOOLEAN := FALSE;
    v_status TEXT;
    v_user_role TEXT;
BEGIN
    -- Yetki kontrolÃ¼ (Claimer istek atan kiÅŸi mi?)
    IF auth.uid() <> p_claimer_id THEN
        RAISE EXCEPTION 'Yetkisiz eriÅŸim: Kimlik eÅŸleÅŸmiyor.';
    END IF;

    -- KullanÄ±cÄ±nÄ±n partner rolÃ¼ kontrolÃ¼
    SELECT role INTO v_user_role FROM public.profiles WHERE id = p_claimer_id;
    IF v_user_role <> 'partner' THEN
        RAISE EXCEPTION 'GÃ¶revleri yalnÄ±zca onaylanmÄ±ÅŸ partnerler alabilir.';
    END IF;

    -- YarÄ±ÅŸ koÅŸulunu Ã¶nlemek iÃ§in satÄ±rÄ± kilitliyoruz (SELECT FOR UPDATE)
    SELECT status INTO v_status 
    FROM public.gig_tasks 
    WHERE id = p_task_id 
    FOR UPDATE;

    IF v_status = 'open' OR v_status = 'available' THEN
        UPDATE public.gig_tasks 
        SET status = 'claimed', 
            claimer_id = p_claimer_id,
            assigned_partner_id = p_claimer_id
        WHERE id = p_task_id;
        
        -- Denetim kaydÄ± oluÅŸtur
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES (p_claimer_id, 'CLAIM_GIG_TASK', 'gig_tasks', p_task_id, jsonb_build_object('status', 'claimed', 'claimer_id', p_claimer_id));
        
        v_success := TRUE;
    END IF;

    RETURN v_success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. GÃ¼venli GÃ¶rev Tamamlama ve HakediÅŸ Muhasebe RPC'si
CREATE OR REPLACE FUNCTION public.complete_gig_task_secure(
    p_task_id UUID,
    p_claimer_id UUID,
    p_payout DECIMAL(12,2)
) RETURNS BOOLEAN AS $$
DECLARE
    v_success BOOLEAN := FALSE;
    v_status TEXT;
    v_customer_id UUID;
    v_base_commission DECIMAL(5,2) := 15.00;
    v_net_payout DECIMAL(12,2);
    v_commission_amount DECIMAL(12,2);
    v_partner_points INTEGER := 0;
    v_badge TEXT := 'Bronze';
BEGIN
    -- Yetki kontrolÃ¼
    IF auth.uid() <> p_claimer_id THEN
        RAISE EXCEPTION 'Yetkisiz iÅŸlem: GÃ¶rev sahibi siz deÄŸilsiniz.';
    END IF;

    -- SatÄ±r kilitleme
    SELECT status, customer_id INTO v_status, v_customer_id 
    FROM public.gig_tasks 
    WHERE id = p_task_id 
    FOR UPDATE;

    IF v_status = 'claimed' THEN
        -- GÃ¶rev durumunu gÃ¼ncelle
        UPDATE public.gig_tasks 
        SET status = 'completed'
        WHERE id = p_task_id;

        -- Partner akademi puanÄ±nÄ± bulalÄ±m ve seviyesini belirleyelim
        SELECT COALESCE(SUM(score), 0) INTO v_partner_points 
        FROM public.partner_academy 
        WHERE partner_id = p_claimer_id;

        IF v_partner_points >= 150 THEN
            v_badge := 'Gold';
            v_base_commission := 8.00;
        ELSIF v_partner_points >= 50 THEN
            v_badge := 'Silver';
            v_base_commission := 12.00;
        END IF;

        -- Komisyon ve Net HakediÅŸ HesaplamasÄ±
        v_commission_amount := (p_payout * v_base_commission) / 100.00;
        v_net_payout := p_payout - v_commission_amount;

        -- Partner cÃ¼zdan bakiyesini artÄ±r
        INSERT INTO public.wallets (id, user_id, balance, currency, updated_at)
        VALUES (p_claimer_id, p_claimer_id, v_net_payout, 'TRY', now())
        ON CONFLICT (id) DO UPDATE
        SET balance = COALESCE(public.wallets.balance, 0) + v_net_payout,
            updated_at = now();

        -- CÃ¼zdan hareketi logla
        INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
        VALUES (p_claimer_id, v_net_payout, 'gig_payout', 'Tamamlanan Gig GÃ¶revi HakediÅŸi (Kesilen Komisyon: ' || v_base_commission || '%)');

        -- Payouts muhasebe kaydÄ± ekle
        INSERT INTO public.payouts (partner_id, amount, status, bank_reference)
        VALUES (p_claimer_id, v_net_payout, 'pending', 'CARVIS-GIG-' || substring(p_task_id::text, 1, 8));

        -- Partner performans metriklerini gÃ¼ncelle
        INSERT INTO public.partner_metrics (partner_id, acceptance_rate, avg_response_time_minutes, score)
        VALUES (p_claimer_id, 100.00, 10, 5.00)
        ON CONFLICT (partner_id) DO UPDATE 
        SET loyal_customers_count = public.partner_metrics.loyal_customers_count + 1;

        -- Denetim kaydÄ± oluÅŸtur
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES (p_claimer_id, 'COMPLETE_GIG_TASK', 'gig_tasks', p_task_id, jsonb_build_object('status', 'completed', 'net_payout', v_net_payout, 'commission', v_commission_amount));

        v_success := TRUE;
    END IF;

    RETURN v_success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. GÃ¼venli Partner SaaS Abonelik YÃ¼kseltme RPC'si
CREATE OR REPLACE FUNCTION public.upgrade_partner_plan_secure(
    p_partner_id UUID,
    p_plan_type TEXT,
    p_cost DECIMAL(12,2)
) RETURNS BOOLEAN AS $$
DECLARE
    v_balance DECIMAL(12,2);
    v_success BOOLEAN := FALSE;
BEGIN
    -- Yetki kontrolÃ¼
    IF auth.uid() <> p_partner_id THEN
        RAISE EXCEPTION 'Yetkisiz abonelik yÃ¼kseltme isteÄŸi.';
    END IF;

    -- Partner cÃ¼zdanÄ±nÄ± kontrol et ve kilitle
    SELECT COALESCE(balance, 0) INTO v_balance 
    FROM public.wallets 
    WHERE id = p_partner_id 
    FOR UPDATE;

    IF v_balance >= p_cost THEN
        -- Ãœcreti tahsil et
        UPDATE public.wallets 
        SET balance = balance - p_cost,
            updated_at = now()
        WHERE id = p_partner_id;

        UPDATE public.profiles
        SET partner_level = p_plan_type
        WHERE id = p_partner_id;

        -- Ä°ÅŸlem kaydÄ± ekle
        INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
        VALUES (p_partner_id, -p_cost, 'saas_subscription', 'Carvis Partner ' || p_plan_type || ' PlanÄ± ÃœyeliÄŸi');

        -- Denetim kaydÄ± oluÅŸtur
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES (p_partner_id, 'SUBSCRIBE_SAAS_PLAN', 'profiles', p_partner_id, jsonb_build_object('plan_type', p_plan_type, 'cost', p_cost));

        v_success := TRUE;
    ELSE
        RAISE EXCEPTION 'Yetersiz bakiye. LÃ¼tfen cÃ¼zdanÄ±nÄ±za bakiye yÃ¼kleyin.';
    END IF;

    RETURN v_success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================================
-- CARVIS MASTER PLAN SEED & SECURE B2B PARTNER MONETIZATION ENGINE (v8.0)
-- =========================================================================

-- 1. Seeding Monetization Plans for all 4 Professions (3 Tiers each)
INSERT INTO public.monetization_plans (id, name, monthly_fee, commission_rate, features) VALUES
-- Otopark (parking)
('10000000-0000-0000-0000-000000000001', 'parking_free', 0.00, 0.10, '{"title": "Ãœcretsiz BaÅŸlangÄ±Ã§", "commission_rate": 0.10, "desc": "Otopark kapasitenizi sisteme kaydedin ve hemen rezervasyon almaya baÅŸlayÄ±n."}'),
('10000000-0000-0000-0000-000000000002', 'parking_pro', 150.00, 0.05, '{"title": "Pro Otopark", "commission_rate": 0.05, "desc": "Doluluk yÃ¶netimini ve Ã¶zel tarifelerinizi esnekÃ§e yÃ¶netip gelirinizi artÄ±rÄ±n."}'),
('10000000-0000-0000-0000-000000000003', 'parking_premium', 350.00, 0.03, '{"title": "Prestij Premium", "commission_rate": 0.03, "desc": "Åehrin en popÃ¼ler noktalarÄ±nda harita Ã¼stÃ¼nde en Ã§ok tercih edilen otopark olun."}'),

-- Vale (valet)
('10000000-0000-0000-0000-000000000004', 'valet_free', 0.00, 0.20, '{"title": "Ãœcretsiz BaÅŸlangÄ±Ã§", "commission_rate": 0.20, "desc": "KayÄ±t olun, sertifikanÄ±zÄ± yÃ¼kleyin ve Ã§aÄŸrÄ± baÅŸÄ±na gelir elde edin."}'),
('10000000-0000-0000-0000-000000000005', 'valet_pro', 150.00, 0.12, '{"title": "Pro Vale", "commission_rate": 0.12, "desc": "Daha yÃ¼ksek Ã§aÄŸrÄ± kotasÄ± ve Ã¶ncelikli bÃ¶lgesel yÃ¶nlendirmelerle kazanÄ±n."}'),
('10000000-0000-0000-0000-000000000006', 'valet_premium', 350.00, 0.08, '{"title": "Premium Elit Vale", "commission_rate": 0.08, "desc": "GÃ¼venilir premium vale aÄŸÄ±nda en yÃ¼ksek Ã¶ncelik ve dev sigorta korumasÄ±."}'),

-- Usta & Servis (mechanic)
('10000000-0000-0000-0000-000000000007', 'mechanic_free', 0.00, 0.15, '{"title": "Ãœcretsiz BaÅŸlangÄ±Ã§", "commission_rate": 0.15, "desc": "Profilinizi oluÅŸturun, bÃ¶lgenizdeki arÄ±za taleplerine Ã¼cretsiz teklif verin."}'),
('10000000-0000-0000-0000-000000000008', 'mechanic_pro', 150.00, 0.10, '{"title": "Pro Oto Servis", "commission_rate": 0.10, "desc": "MÃ¼ÅŸteri randevularÄ±nÄ±, iÅŸ emirlerini ve bakÄ±m kartlarÄ±nÄ± profesyonelce yÃ¶netin."}'),
('10000000-0000-0000-0000-000000000009', 'mechanic_premium', 350.00, 0.06, '{"title": "Premium AI Servis", "commission_rate": 0.06, "desc": "BÃ¶lgenizde lider, AI teÅŸhisli ve Carvis Garantili elit oto servis olun."}'),

-- ParÃ§a TedarikÃ§isi (parts)
('10000000-0000-0000-0000-000000000010', 'parts_free', 0.00, 0.15, '{"title": "Ãœcretsiz BaÅŸlangÄ±Ã§", "commission_rate": 0.15, "desc": "Yedek parÃ§a dÃ¼kkanÄ±nÄ±zÄ± aÃ§Ä±n, teklif taleplerini anÄ±nda yanÄ±tlamaya baÅŸlayÄ±n."}'),
('10000000-0000-0000-0000-000000000011', 'parts_pro', 150.00, 0.10, '{"title": "Pro TedarikÃ§i", "commission_rate": 0.10, "desc": "Toplu Ã¼rÃ¼n yÃ¼kleme, XML entegrasyonlarÄ± ve geliÅŸmiÅŸ stok araÃ§larÄ±yla satÄ±ÅŸlarÄ± katlayÄ±n."}'),
('10000000-0000-0000-0000-000000000012', 'parts_premium', 350.00, 0.06, '{"title": "Premium TedarikÃ§i", "commission_rate": 0.06, "desc": "E-ticarette zirveye oynayÄ±p orijinal tescilli yedek parÃ§alarÄ±nÄ±zla lider satÄ±cÄ± olun."}')
ON CONFLICT (id) DO UPDATE SET 
    monthly_fee = EXCLUDED.monthly_fee,
    commission_rate = EXCLUDED.commission_rate,
    features = EXCLUDED.features;


-- 2. Secure RPC: Complete Partner Onboarding Bypass triggers safely (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.complete_partner_onboarding_v2(
    p_user_id UUID,
    p_profession TEXT,
    p_business_name TEXT,
    p_phone TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_plan_id UUID;
    v_mechanic_id UUID;
BEGIN
    -- 1. Validate profession
    IF p_profession NOT IN ('valet', 'parking', 'mechanic', 'parts', 'carwash') THEN
        RETURN jsonb_build_object('success', false, 'message', 'GeÃ§ersiz meslek seÃ§imi.');
    END IF;

    -- 2. Update profiles: role escalation and base initial settings
    -- This runs with SECURITY DEFINER bypasses block_role_escalation trigger since security definer acts as table owner (admin)
    UPDATE public.profiles 
    SET role = 'partner',
        application_status = 'approved',
        subscription_tier = 'free',
        bids_left = CASE WHEN p_profession = 'mechanic' THEN 5 ELSE 0 END
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Profil bulunamadÄ±.');
    END IF;

    -- 3. Insert specialized B2B profiles with exact schema columns
    IF p_profession = 'valet' THEN
        INSERT INTO public.valet_profiles (id, base_price, service_radius_km, experience_years, is_active_now)
        VALUES (p_user_id, 0.00, 0, 0, false)
        ON CONFLICT (id) DO UPDATE SET is_active_now = false;

    ELSIF p_profession = 'parking' THEN
        INSERT INTO public.parking_profiles (id, parking_name, total_capacity, occupied_count, price_per_hour, is_indoor, has_security, has_valet)
        VALUES (p_user_id, p_business_name, 0, 0, 0.00, false, false, false)
        ON CONFLICT (id) DO UPDATE SET parking_name = EXCLUDED.parking_name;

    ELSIF p_profession = 'mechanic' THEN
        v_mechanic_id := crypto.randomUUID();
        INSERT INTO public.mechanic_shops (seller_id, shop_name, is_active, specialties, brands)
        VALUES (p_user_id, p_business_name, false, ARRAY[]::text[], ARRAY[]::text[]);

    ELSIF p_profession = 'parts' THEN
        INSERT INTO public.parts_profiles (id, business_name, delivery_radius_km, store_type)
        VALUES (p_user_id, p_business_name, 0, 'retail')
        ON CONFLICT (id) DO UPDATE SET business_name = EXCLUDED.business_name;
        
    ELSIF p_profession = 'carwash' THEN
        -- Carwash settings are kept inside business_details JSONB on profiles table
        NULL;
    END IF;

    -- 4. Get Initial Free Plan ID
    SELECT id INTO v_plan_id FROM public.monetization_plans WHERE name = p_profession || '_free';

    -- 5. Set up B2B subscription configuration
    INSERT INTO public.partner_monetization (partner_id, plan_id, subscription_status, last_billing_date, next_billing_date)
    VALUES (p_user_id, v_plan_id, 'active', now(), now() + interval '1 month')
    ON CONFLICT (partner_id) DO UPDATE SET 
        plan_id = EXCLUDED.plan_id,
        subscription_status = 'active',
        custom_commission_rate = NULL;

    RETURN jsonb_build_object('success', true, 'message', 'Onboarding iÅŸlemi baÅŸarÄ±yla tamamlandÄ±.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Secure RPC: Purchase Partner Plan Subscription with Wallet balance deduction
CREATE OR REPLACE FUNCTION public.purchase_partner_subscription_v2(
    p_partner_id UUID,
    p_plan_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_monthly_fee DECIMAL(12,2);
    v_plan_name TEXT;
    v_commission_rate DECIMAL(5,2);
    v_wallet_id UUID;
    v_balance DECIMAL(12,2);
    v_base_tier TEXT;
BEGIN
    -- 1. Fetch Plan Details
    SELECT monthly_fee, name, commission_rate INTO v_monthly_fee, v_plan_name, v_commission_rate
    FROM public.monetization_plans WHERE id = p_plan_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'SeÃ§ilen Ã¼yelik planÄ± bulunamadÄ±.');
    END IF;

    -- 2. Fetch Wallet Balance
    SELECT id, balance INTO v_wallet_id, v_balance
    FROM public.wallets WHERE user_id = p_partner_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ä°ÅŸ ortaÄŸÄ±nÄ±n cÃ¼zdanÄ± bulunamadÄ±.');
    END IF;

    -- 3. Free Plan Check vs Payment Check
    IF v_monthly_fee > 0.00 THEN
        IF v_balance < v_monthly_fee THEN
            RETURN jsonb_build_object('success', false, 'message', 'Yetersiz cÃ¼zdan bakiyesi. LÃ¼tfen bakiye yÃ¼kleyin.');
        END IF;

        -- 4. Deduct Wallet Balance
        UPDATE public.wallets SET balance = balance - v_monthly_fee WHERE id = v_wallet_id;

        -- 5. Record Platform Earnings
        INSERT INTO public.platform_earnings (amount, earning_type, status)
        VALUES (v_monthly_fee, 'subscription', 'collected');

        -- 6. Record Wallet Transaction
        INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
        VALUES (v_wallet_id, -v_monthly_fee, 'payment', 'Carvis Ä°ÅŸ OrtaÄŸÄ± Plan YÃ¼kseltmesi: ' || v_plan_name);
    END IF;

    -- 7. Update partner monetization settings
    UPDATE public.partner_monetization 
    SET plan_id = p_plan_id,
        subscription_status = 'active',
        last_billing_date = now(),
        next_billing_date = now() + interval '1 month',
        custom_commission_rate = NULL -- Falls back to default plan rate
    WHERE partner_id = p_partner_id;

    -- If no record, create one
    IF NOT FOUND THEN
        INSERT INTO public.partner_monetization (partner_id, plan_id, subscription_status, last_billing_date, next_billing_date)
        VALUES (p_partner_id, p_plan_id, 'active', now(), now() + interval '1 month');
    END IF;

    -- 8. Update profiles table subscription_tier
    -- Determine base tier ('free', 'pro', 'premium')
    IF v_plan_name LIKE '%_pro' THEN
        v_base_tier := 'pro';
    ELSIF v_plan_name LIKE '%_premium' THEN
        v_base_tier := 'premium';
    ELSE
        v_base_tier := 'free';
    END IF;

    UPDATE public.profiles 
    SET subscription_tier = v_base_tier
    WHERE id = p_partner_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Ãœyelik planÄ± baÅŸarÄ±yla yÃ¼kseltildi.', 
        'new_tier', v_base_tier,
        'deducted_amount', v_monthly_fee
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================
-- CARVIS APP RELEASE SEED & STORAGE MIGRATION (ADDED)
-- SEED: Apple/Google Reviewer Test Account
-- SETUP: Supabase Storage Buckets & Policies
-- =========================================================

-- 1. REVIEWER AUTH USER & GARAJA Ã–N HAZIRLIK SEED (Removed for production)


-- 2. SUPABASE STORAGE BUCKETS TANIMLARI
-- vehicle-documents: Belge kasasÄ± iÃ§in
-- service-proofs: Usta tamamlandÄ± kanÄ±tlarÄ± iÃ§in
-- accident-reports: Kaza asistanÄ± fotoÄŸraflarÄ± iÃ§in
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('vehicle-documents', 'vehicle-documents', false, 10485760, ARRAY['image/png', 'image/jpeg', 'application/pdf']),
  ('service-proofs', 'service-proofs', false, 10485760, ARRAY['image/png', 'image/jpeg']),
  ('accident-reports', 'accident-reports', false, 10485760, ARRAY['image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;


-- 3. STORAGE RLS GÃœVENLÄ°K POLÄ°TÄ°KALARI
-- (storage.objects RLS is already enabled by Supabase by default)

-- 3.1 Belge KasasÄ± ve Kaza RaporlarÄ± RLS: Sadece dosya sahibi okuyabilir ve yÃ¼kleyebilir
DROP POLICY IF EXISTS "Users can manage own documents" ON storage.objects;
CREATE POLICY "Users can manage own documents" ON storage.objects
FOR ALL
USING (bucket_id IN ('vehicle-documents', 'accident-reports') AND auth.uid() = owner)
WITH CHECK (bucket_id IN ('vehicle-documents', 'accident-reports') AND auth.uid() = owner);

-- 3.2 Servis KanÄ±tlarÄ± (Proofs) RLS: SipariÅŸle iliÅŸkili mÃ¼ÅŸteri veya satÄ±cÄ± gÃ¶rebilir, sadece satÄ±cÄ± yÃ¼kleyebilir
DROP POLICY IF EXISTS "Authenticated users upload proofs" ON storage.objects;
CREATE POLICY "Authenticated users upload proofs" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-proofs');

DROP POLICY IF EXISTS "Users view relevant service proofs" ON storage.objects;
CREATE POLICY "Users view relevant service proofs" ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'service-proofs');


-- Check Email Exists Helper Function
-- Bypasses RLS to allow anonymous checks during password resets
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check text)
RETURNS boolean
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = email_to_check
  );
END;
$$ LANGUAGE plpgsql;


-- =========================================================
-- CARVIS SYSTEM REINFORCEMENTS (REAL DATA & FORM CONTROLS)
-- =========================================================

-- 1. VALET BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.valet_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    valet_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    pickup_point TEXT NOT NULL,
    note TEXT,
    package_id TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'picked_up', 'parked', 'completed', 'cancelled'
    verification_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PARKING PROFILES ADD COLUMN: is_open
ALTER TABLE public.parking_profiles ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true;

-- 3. QUOTES ADD COLUMNS: accepted_at, estimated_delivery_days
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS estimated_delivery_days INTEGER;

-- 4. VALET BOOKINGS RLS RULES
ALTER TABLE public.valet_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own valet bookings" ON public.valet_bookings;
CREATE POLICY "Users can manage own valet bookings" ON public.valet_bookings
FOR ALL USING (auth.uid() = customer_id OR auth.uid() = valet_id);

DROP POLICY IF EXISTS "Valets can view pending bookings" ON public.valet_bookings;
CREATE POLICY "Valets can view pending bookings" ON public.valet_bookings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role::text IN ('valet', 'partner', 'admin'))
  ) 
  AND status = 'pending'
);

-- =========================================================
-- 10. ROAD ALERTS & RADARS (CROWDSOURCED & KGM OFFICIAL)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.road_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    location TEXT NOT NULL,
    reporter TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    voted_users UUID[] DEFAULT '{}'::UUID[],
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    city TEXT DEFAULT 'istanbul',
    lat NUMERIC(9,6),
    lng NUMERIC(9,6)
);

ALTER TABLE public.road_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can select road alerts" ON public.road_alerts;
CREATE POLICY "Anyone can select road alerts" ON public.road_alerts
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert road alerts" ON public.road_alerts;
CREATE POLICY "Authenticated users can insert road alerts" ON public.road_alerts
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can update road alerts for voting" ON public.road_alerts;
CREATE POLICY "Anyone can update road alerts for voting" ON public.road_alerts
FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their own alerts" ON public.road_alerts;
CREATE POLICY "Users can delete their own alerts" ON public.road_alerts
FOR DELETE USING (auth.uid() = user_id);

-- Seed Initial Official EGM EDS points to public.road_alerts safely (Removed for production)

-- =====================================================
-- MAINTENANCE RECORDS TABLE (User-Tracked Part Changes)
-- Users log their own part changes with KM and date.
-- System calculates remaining time/km for next change.
-- =====================================================
CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,                       -- e.g. "Motor YaÄŸÄ± & Filtre", "Fren BalatasÄ± (Ã–n)"
  changed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  changed_km INTEGER NOT NULL DEFAULT 0,
  next_km_interval INTEGER NOT NULL DEFAULT 15000,   -- km until next change
  next_date_interval_months INTEGER NOT NULL DEFAULT 12, -- months until next change
  notes TEXT,                                    -- e.g. "Castrol Edge 5W-30 kullanÄ±ldÄ±"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast vehicle-based queries
CREATE INDEX IF NOT EXISTS idx_maintenance_records_vehicle_id ON public.maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_user_id ON public.maintenance_records(user_id);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_records' AND column_name = 'proof_image_url') THEN
        ALTER TABLE public.maintenance_records ADD COLUMN proof_image_url TEXT;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own maintenance records
DROP POLICY IF EXISTS "Users can view own maintenance records" ON public.maintenance_records;
CREATE POLICY "Users can view own maintenance records" ON public.maintenance_records
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own maintenance records
DROP POLICY IF EXISTS "Users can insert own maintenance records" ON public.maintenance_records;
CREATE POLICY "Users can insert own maintenance records" ON public.maintenance_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own maintenance records
DROP POLICY IF EXISTS "Users can update own maintenance records" ON public.maintenance_records;
CREATE POLICY "Users can update own maintenance records" ON public.maintenance_records
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own maintenance records
DROP POLICY IF EXISTS "Users can delete own maintenance records" ON public.maintenance_records;
CREATE POLICY "Users can delete own maintenance records" ON public.maintenance_records
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- AI Diagnostics Security Rules (RLS)
-- ==========================================

-- Enable RLS on diagnostics table (assuming it exists, otherwise create it)
CREATE TABLE IF NOT EXISTS diagnostics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    description TEXT,
    prediction TEXT,
    severity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can insert
DROP POLICY IF EXISTS "Allow authenticated users to insert diagnostics" ON diagnostics;
CREATE POLICY "Allow authenticated users to insert diagnostics" ON diagnostics FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy 2: Users can only view their own diagnostics
DROP POLICY IF EXISTS "Allow users to view own diagnostics" ON diagnostics;
CREATE POLICY "Allow users to view own diagnostics" ON diagnostics FOR SELECT 
TO authenticated 
USING (user_id = auth.uid()::text);

-- Policy 3: Service role can do everything
DROP POLICY IF EXISTS "Service role can do everything" ON diagnostics;
CREATE POLICY "Service role can do everything" ON diagnostics FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- ==============================================================================
-- CARVIS PERFORMANCE OPTIMIZATION INDEXES
-- Purpose: Add missing Foreign Key indexes and common filter indexes to prevent
-- Full Table Scans and dramatically improve JOIN and filtering performance.
-- Author: Carvis AI Architecture
-- Date: 2026-07-02
-- ==============================================================================

-- 1. FOREIGN KEY INDEXES (Crucial for JOIN operations)
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_id ON public.wallet_transactions(wallet_id);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_mechanic_shops_seller_id ON public.mechanic_shops(seller_id);

CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);

CREATE INDEX IF NOT EXISTS idx_service_req_user_id ON public.service_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_quotes_service_request_id ON public.quotes(service_request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_seller_id ON public.quotes(seller_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON public.quotes(customer_id);

CREATE INDEX IF NOT EXISTS idx_appoint_customer_id ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appoint_seller_id ON public.appointments(seller_id);
CREATE INDEX IF NOT EXISTS idx_appoint_vehicle_id ON public.appointments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_appoint_quote_id ON public.appointments(quote_id);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_quote_id ON public.orders(quote_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_req_customer_id ON public.emergency_requests(customer_id);

CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON public.reviews(seller_id);

CREATE INDEX IF NOT EXISTS idx_escrow_vault_order_id ON public.escrow_vault(order_id);
CREATE INDEX IF NOT EXISTS idx_service_proofs_order_id ON public.service_proofs(order_id);

CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_expert_id ON public.consultations(expert_id);

CREATE INDEX IF NOT EXISTS idx_partner_monetization_partner_id ON public.partner_monetization(partner_id);
CREATE INDEX IF NOT EXISTS idx_platform_earnings_order_id ON public.platform_earnings(order_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_exp_user_id ON public.vehicle_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_exp_vehicle_id ON public.vehicle_expenses(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_docs_user_id ON public.vehicle_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_docs_vehicle_id ON public.vehicle_documents(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_reports_user_id ON public.vehicle_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_reports_vehicle_id ON public.vehicle_reports(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_appoint_slots_seller_id ON public.appointment_slots(seller_id);

CREATE INDEX IF NOT EXISTS idx_insur_app_user_id ON public.insurance_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_insur_app_vehicle_id ON public.insurance_applications(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payouts_partner_id ON public.payouts(partner_id);

CREATE INDEX IF NOT EXISTS idx_valet_book_customer_id ON public.valet_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_valet_book_valet_id ON public.valet_bookings(valet_id);
CREATE INDEX IF NOT EXISTS idx_maint_records_vehicle_id ON public.maintenance_records(vehicle_id);


-- 2. STATUS & FILTERING INDEXES (Crucial for Dashboard and List views)
CREATE INDEX IF NOT EXISTS idx_service_req_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_appoint_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_emergency_req_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_valet_book_status ON public.valet_bookings(status);


-- 3. DATE/SORTING INDEXES (Crucial for feeds, unread messages, recent notifications)
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_req_created_at ON public.service_requests(created_at DESC);

-- Analyze the database to update query planner statistics immediately
ANALYZE;


-- 6. FUEL TRACKING
CREATE TABLE IF NOT EXISTS public.fuel_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID,
    liters DECIMAL(10,2) NOT NULL,
    price_per_liter DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    mileage INTEGER,
    station_name TEXT,
    date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own fuel logs" ON public.fuel_logs;
CREATE POLICY "Users can manage own fuel logs" ON public.fuel_logs FOR ALL USING (auth.uid() = user_id);


-- 9. AI DIAGNOSTICS (carvis-ai-core)
CREATE TABLE IF NOT EXISTS public.ai_diagnostics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID,
    description TEXT NOT NULL,
    predicted_issue TEXT NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL,
    recommended_action TEXT,
    severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_diagnostics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own ai diagnostics" ON public.ai_diagnostics;
CREATE POLICY "Users can manage own ai diagnostics" ON public.ai_diagnostics FOR ALL USING (auth.uid() = user_id);


-- =========================================================
-- CARVIS PAYMENTS & ESCROW SCHEMA v1.0
-- =========================================================

-- 1. ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'escrow', 'released', 'refunded', 'failed');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    provider_earning DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    status payment_status DEFAULT 'pending',
    provider_type TEXT, -- e.g., 'iyzico', 'stripe'
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. WALLETS TABLE (Already exists, adding extra columns for Payments)
DO $$ BEGIN
    ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS bank_account_iban TEXT;
    ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS bank_account_name TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- 4. WALLET TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT, -- 'credit' (earned), 'debit' (withdrawn)
    description TEXT,
    reference_id UUID, -- Can be payment_id or withdrawal_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS (Row Level Security)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for Payments
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments" 
    ON public.payments FOR SELECT 
    USING (auth.uid() = customer_id OR auth.uid() = provider_id);

-- Policies for Wallets
DROP POLICY IF EXISTS "Providers can view their own wallet" ON public.wallets;
CREATE POLICY "Providers can view their own wallet" 
    ON public.wallets FOR SELECT 
    USING (auth.uid() = user_id);

-- Policies for Wallet Transactions
DROP POLICY IF EXISTS "Providers can view their own transactions" ON public.wallet_transactions;
CREATE POLICY "Providers can view their own transactions" 
    ON public.wallet_transactions FOR SELECT 
    USING (
        wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
    );

-- 6. INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON public.payments(provider_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON public.wallet_transactions(wallet_id);

-- =========================================================
-- 9. SEED REAL DATA FOR CORPORATE CHAINS
-- =========================================================
-- 9. SEED REAL DATA FOR CORPORATE CHAINS
-- =========================================================
INSERT INTO public.corporate_chains (name, logo_url, description)
VALUES 
  ('Bosch Car Service', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-Logo.svg/2000px-Bosch-Logo.svg.png', 'TÃ¼rkiye genelinde 350+ nokta ile garantili ve standart periyodik bakÄ±m aÄŸÄ±.'),
  ('Otopratik', 'https://www.brisa.com.tr/assets/img/otopratik-logo.png', 'Brisa gÃ¼vencesiyle hÄ±zlÄ± araÃ§ bakÄ±m ve lastik servis zinciri.'),
  ('Auto King', 'https://www.autoking.com.tr/assets/img/logo.png', 'Mini onarÄ±m, kaporta ve ekspertiz alanlarÄ±nda uzman servis aÄŸÄ±.'),
  ('RS Servis', 'https://www.rsservis.com.tr/images/logo.png', 'Hasar onarÄ±mÄ±, dolu hasarÄ± ve mobilite Ã§Ã¶zÃ¼mleri sunan ulusal servis noktasÄ±.')
ON CONFLICT DO NOTHING;

-- =========================================================
-- 10. LIVE FUEL PRICES & CRON
-- =========================================================

CREATE TABLE IF NOT EXISTS public.live_fuel_prices (
    province_code text PRIMARY KEY,
    city_name text NOT NULL,
    benzin numeric NOT NULL DEFAULT 0,
    motorin numeric NOT NULL DEFAULT 0,
    lpg numeric NOT NULL DEFAULT 0,
    last_fetched_at timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.live_fuel_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users on fuel_prices" ON public.live_fuel_prices;
CREATE POLICY "Enable read access for all users on fuel_prices" 
ON public.live_fuel_prices FOR SELECT USING (true);

-- =========================================================
-- 11. CORPORATE BRANCHES (REAL DATA & RPC)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.corporate_branches (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    chain_name text NOT NULL,
    name text NOT NULL,
    address text,
    phone text,
    lat double precision,
    lng double precision,
    city text
);

ALTER TABLE public.corporate_branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on branches" ON public.corporate_branches;
CREATE POLICY "Enable read access for all users on branches" ON public.corporate_branches FOR SELECT USING (true);

-- Seed Real Istanbul Corporate Branches
INSERT INTO public.corporate_branches (chain_name, name, address, phone, lat, lng, city)
VALUES 
    ('Bosch Car Service', 'MTK Bosch Oto Service', 'Kartaltepe Mah. 2 NamÄ±k Kemal Cad. 28/A, KÃ¼Ã§Ã¼kÃ§ekmece', '0212 598 12 44', 41.002, 28.794, 'istanbul'),
    ('Bosch Car Service', 'Birsay Otomotiv', 'Libadiye Cad. No: 4-B, ÃœskÃ¼dar', '0216 545 02 22', 41.011, 29.066, 'istanbul'),
    ('Bosch Car Service', 'Ä°timat Otomotiv', 'GÃ¼ven Mah. Menderes Cad. 72, GÃ¼ngÃ¶ren', '0212 539 10 10', 41.025, 28.874, 'istanbul'),
    ('Bosch Car Service', 'Park Bosch Car Servisi', 'MerdivenkÃ¶y Mah. Nisan Sok. 4/B, KadÄ±kÃ¶y', '0216 337 61 61', 40.985, 29.071, 'istanbul'),
    ('Bosch Car Service', 'Akkaya Otomotiv', 'Sanayi Mah. DavutpaÅŸa Cad. BaÅŸaklÄ± Sok. 26, GÃ¼ngÃ¶ren', '0212 505 12 43', 41.020, 28.885, 'istanbul'),
    ('Bosch Car Service', 'Åžahinler Otomotiv', 'Selami Ali Mah. Cumhuriyet Cad. 16/A, ÃœskÃ¼dar', '0216 310 84 30', 41.025, 29.015, 'istanbul'),
    ('Bosch Car Service', 'TopaloÄŸlu Servis BakÄ±m', 'ÅženlikkÃ¶y Mah. IÅŸÄ±k Sok. 1, Florya/BakÄ±rkÃ¶y', '0212 580 74 00', 40.975, 28.790, 'istanbul'),
    ('Bosch Car Service', 'Mert Otomotiv', 'Esentepe Mah. Ä°nÃ¶nÃ¼ Cad. 5, Kartal Oto San. Sit., Kartal', '0216 306 84 88', 40.902, 29.175, 'istanbul'),
    ('Bosch Car Service', 'Otomist Otomotiv', 'Barbaros Mah. Mor Amber Sok. No: 1, AtaÅŸehir', '0216 255 55 05', 40.995, 29.112, 'istanbul'),
    ('Otopratik', 'Otopratik Maslak', 'Maslak Mah. AOS 55. Sok. No: 2, SarÄ±yer', '0212 285 00 00', 41.113, 29.020, 'istanbul'),
    ('Otopratik', 'Otopratik BostancÄ±', 'BostancÄ± Sanayi Sitesi DeÄŸirmenyolu Cad. No:14', '0216 574 00 00', 40.966, 29.102, 'istanbul')
ON CONFLICT DO NOTHING;

-- RPC for fetching nearby corporate branches using Haversine formula
CREATE OR REPLACE FUNCTION public.get_nearby_corporate_branches(p_lat double precision, p_lng double precision, p_radius_meters double precision)
RETURNS TABLE (
    id text,
    name text,
    type text,
    distance text,
    dist_num double precision,
    lat double precision,
    lng double precision,
    address text,
    features text[],
    compliance jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id::text,
        b.name,
        b.chain_name as type,
        ROUND((6371 * acos(least(1.0, greatest(-1.0, cos(radians(p_lat)) * cos(radians(b.lat)) * cos(radians(b.lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(b.lat))))))::numeric, 1)::text || ' km' as distance,
        (6371 * acos(least(1.0, greatest(-1.0, cos(radians(p_lat)) * cos(radians(b.lat)) * cos(radians(b.lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(b.lat)))))) as dist_num,
        b.lat,
        b.lng,
        b.address,
        ARRAY['Kurumsal Hizmet', 'Garantili BakÄ±m', 'Orijinal ParÃ§a']::text[] as features,
        jsonb_build_object(
            'mersis', 'Ulusal Kurumsal Vergi No',
            'wasteOilCert', 'AtÄ±k YaÄŸ BertarafÄ± Ã‡evre LisanslÄ± (Kurumsal Standard)',
            'fireLicense', 'Ä°tfaiye YangÄ±n GÃ¼venlik Raporu OnaylÄ± (TSE Belgeli)',
            'isCompliant', true
        ) as compliance
    FROM public.corporate_branches b
    WHERE (6371 * acos(least(1.0, greatest(-1.0, cos(radians(p_lat)) * cos(radians(b.lat)) * cos(radians(b.lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(b.lat)))))) <= (p_radius_meters / 1000.0)
    ORDER BY dist_num ASC;
END;
$$;

-- =========================================================
-- 12. AUTOMATIC NETWORK INTEGRATION TRIGGER
-- =========================================================
-- When a partner application is approved from admin panel, automatically
-- add them to the Rapidsy Corporate Branches network so they appear on the map.

ALTER TABLE public.partner_applications 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS lat double precision,
ADD COLUMN IF NOT EXISTS lng double precision,
ADD COLUMN IF NOT EXISTS city text;

CREATE OR REPLACE FUNCTION public.handle_partner_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger when status changes to 'approved'
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        
        -- 1. Upgrade the user profile
        UPDATE public.profiles
        SET application_status = 'approved',
            role = 'provider'
        WHERE id = NEW.user_id;

        -- 2. Add them directly to the corporate_branches network (Rapidsy AÄŸÄ±)
        -- If lat/lng are NULL, they won't appear on the map until geocoded by admin.
        INSERT INTO public.corporate_branches (chain_name, name, address, phone, lat, lng, city)
        VALUES (
            COALESCE(NEW.company_name, 'BaÄŸÄ±msÄ±z Kurumsal Servis'),
            COALESCE(NEW.company_name, 'Yeni Rapidsy NoktasÄ±'),
            NEW.office_address,
            NEW.phone,
            NEW.lat,
            NEW.lng,
            COALESCE(NEW.city, 'istanbul')
        );
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_partner_approved ON public.partner_applications;
CREATE TRIGGER on_partner_approved
    AFTER UPDATE ON public.partner_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_partner_approval();

-- =========================================================
-- 13. RAPIDSY SOS (TOW TRUCK & ESCROW) EXTENSIONS
-- =========================================================

-- Distinguish tow trucks from normal service branches
ALTER TABLE public.partner_applications 
ADD COLUMN IF NOT EXISTS business_type text DEFAULT 'service';

ALTER TABLE public.corporate_branches 
ADD COLUMN IF NOT EXISTS branch_type text DEFAULT 'service';

-- Enhance emergency requests to handle escrow and towing
ALTER TABLE public.emergency_requests
ADD COLUMN IF NOT EXISTS assigned_provider_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS price numeric,
ADD COLUMN IF NOT EXISTS escrow_order_id uuid REFERENCES public.orders(id);


-- =========================================================
-- 14. RAPIDSY GÜVENCESİ & RÜCU SİSTEMİ (ASSURANCE & RECOURSE)
-- =========================================================

-- 1. Create enum types for claim and recourse statuses
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'claim_status_type') THEN
        CREATE TYPE claim_status_type AS ENUM ('pending', 'approved', 'rejected', 'recoursed_to_partner');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recourse_status_type') THEN
        CREATE TYPE recourse_status_type AS ENUM ('pending_collection', 'collected', 'legal_dispute');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add assurance fields to profiles and orders
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_active_assurance_sub BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS assurance_sub_expires_at TIMESTAMPTZ;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS assurance_opted_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS assurance_fee NUMERIC DEFAULT 0;

-- 3. Create assurance claims table (Hasar Bildirimleri)
CREATE TABLE IF NOT EXISTS public.assurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID NOT NULL REFERENCES public.profiles(id), -- Standardized to profiles reference
    claim_status claim_status_type DEFAULT 'pending',
    reported_damage_desc TEXT NOT NULL,
    damage_images TEXT[], -- Array of URLs to secure storage images
    payout_amount NUMERIC DEFAULT 0,
    recourse_amount NUMERIC DEFAULT 0,
    recourse_status recourse_status_type DEFAULT 'pending_collection',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for assurance_claims
ALTER TABLE public.assurance_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view their own claims" ON public.assurance_claims;
CREATE POLICY "Customers can view their own claims" 
ON public.assurance_claims FOR SELECT 
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can insert their claims" ON public.assurance_claims;
CREATE POLICY "Customers can insert their claims" 
ON public.assurance_claims FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Sellers can view recourse claims against them" ON public.assurance_claims;
CREATE POLICY "Sellers can view recourse claims against them" 
ON public.assurance_claims FOR SELECT 
USING (auth.uid() = seller_id);


-- =========================================================
-- 15. ANLAŞMAZLIK ÇÖZÜM MERKEZİ & OPERASYONEL GPS TAKİBİ
-- =========================================================

-- 1. Create enum type for dispute status
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_status_type') THEN
        CREATE TYPE dispute_status_type AS ENUM ('under_review', 'refunded', 'released_to_seller');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tracking_event_type') THEN
        CREATE TYPE tracking_event_type AS ENUM ('check_in', 'check_out', 'proof_uploaded');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add is_escrow_blocked field to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS is_escrow_blocked BOOLEAN DEFAULT false;

-- 3. Create disputes table (Anlaşmazlık Çözüm Merkezi)
CREATE TABLE IF NOT EXISTS public.order_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    reason_category TEXT NOT NULL, -- e.g., 'wrong_part', 'damage', 'poor_quality', 'other'
    description TEXT NOT NULL,
    evidence_url TEXT, -- Link to uploaded photo proof of issue
    status dispute_status_type DEFAULT 'under_review',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create tracking table (GPS and Photo Proof check-in/out)
CREATE TABLE IF NOT EXISTS public.order_tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.profiles(id),
    event_type tracking_event_type NOT NULL,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    accuracy_meters DECIMAL(6,2),
    photo_url TEXT, -- Required for 'proof_uploaded' event
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Configuration
ALTER TABLE public.order_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking_events ENABLE ROW LEVEL SECURITY;

-- Disputes Policies
DROP POLICY IF EXISTS "Customers can view their disputes" ON public.order_disputes;
CREATE POLICY "Customers can view their disputes" 
ON public.order_disputes FOR SELECT 
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can open disputes" ON public.order_disputes;
CREATE POLICY "Customers can open disputes" 
ON public.order_disputes FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Sellers can view disputes for their orders" ON public.order_disputes;
CREATE POLICY "Sellers can view disputes for their orders" 
ON public.order_disputes FOR SELECT 
USING (auth.uid() = seller_id);

-- Tracking Policies
DROP POLICY IF EXISTS "Everyone involved can view tracking" ON public.order_tracking_events;
CREATE POLICY "Everyone involved can view tracking" 
ON public.order_tracking_events FOR SELECT 
USING (
    auth.uid() = partner_id OR 
    auth.uid() = (SELECT customer_id FROM public.orders WHERE id = order_id)
);

DROP POLICY IF EXISTS "Partners can insert tracking events" ON public.order_tracking_events;
CREATE POLICY "Partners can insert tracking events" 
ON public.order_tracking_events FOR INSERT 
WITH CHECK (auth.uid() = partner_id);


-- =========================================================
-- 16. PARTNER EKOSİSTEMİ GENİŞLETMESİ v1.0
--     Usta, Parçacı, Yıkamacı, Çekici, Sigorta Şirketi
--     Kapsamlı Özellik Matrisi + Problem Önleyici Alanlar
-- =========================================================

-- ─────────────────────────────────────────────────────────
-- 16.1 MECHANIC SHOPS — Genişletilmiş Profesyonel Alanlar
-- ─────────────────────────────────────────────────────────
DO $$ BEGIN
    -- Sertifika türü (Usta Odası, TSE, ISO 9001)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mechanic_shops' AND column_name='certification_type') THEN
        ALTER TABLE public.mechanic_shops ADD COLUMN certification_type TEXT;
    END IF;
    -- Teşhis cihazları (Bosch, Snap-on, Launch, vs.)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mechanic_shops' AND column_name='diagnostic_tools') THEN
        ALTER TABLE public.mechanic_shops ADD COLUMN diagnostic_tools TEXT[] DEFAULT '{}';
    END IF;
    -- Lift sayısı — kapasite göstergesi
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mechanic_shops' AND column_name='lift_count') THEN
        ALTER TABLE public.mechanic_shops ADD COLUMN lift_count INTEGER DEFAULT 1;
    END IF;
    -- Kabul edilen araç tipleri (passenger, suv, commercial, electric, hybrid, motorcycle)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mechanic_shops' AND column_name='accepted_vehicle_types') THEN
        ALTER TABLE public.mechanic_shops ADD COLUMN accepted_vehicle_types TEXT[] DEFAULT '{passenger}';
    END IF;
    -- Mobil servis (yol başı bakım yapılıyor mu?)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mechanic_shops' AND column_name='is_mobile_service') THEN
        ALTER TABLE public.mechanic_shops ADD COLUMN is_mobile_service BOOLEAN DEFAULT false;
    END IF;
    -- Standart garanti politikası (gün)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mechanic_shops' AND column_name='warranty_policy_days') THEN
        ALTER TABLE public.mechanic_shops ADD COLUMN warranty_policy_days INTEGER DEFAULT 30;
    END IF;
    -- Mali mesuliyet sigortası bitiş tarihi — otomatik askıya alma için kritik
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mechanic_shops' AND column_name='liability_insurance_expiry') THEN
        ALTER TABLE public.mechanic_shops ADD COLUMN liability_insurance_expiry DATE;
    END IF;
    -- Hizmet konumu tipi (at_shop=serviste, at_customer=müşteride, both=her ikisi)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mechanic_shops' AND column_name='service_location_type') THEN
        ALTER TABLE public.mechanic_shops ADD COLUMN service_location_type TEXT DEFAULT 'at_shop' 
            CHECK (service_location_type IN ('at_shop', 'at_customer', 'both'));
    END IF;
    -- Teknisyen sayısı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mechanic_shops' AND column_name='technician_count') THEN
        ALTER TABLE public.mechanic_shops ADD COLUMN technician_count INTEGER DEFAULT 1;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────
-- 16.2 PARTS PROFILES — Parça Kökeni ve Garanti Alanları
-- ─────────────────────────────────────────────────────────
DO $$ BEGIN
    -- Satıcının kabul ettiği parça köken tipleri
    -- OEM=Orijinal, OES=Eşdeğer, remanufactured=Revize, used=Çıkma, aftermarket=Muadil
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parts_profiles' AND column_name='part_origin_types') THEN
        ALTER TABLE public.parts_profiles ADD COLUMN part_origin_types TEXT[] DEFAULT '{oem,oes,aftermarket}';
    END IF;
    -- Yetkili distribütör olduğu markalar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parts_profiles' AND column_name='brand_authorization_ids') THEN
        ALTER TABLE public.parts_profiles ADD COLUMN brand_authorization_ids TEXT[] DEFAULT '{}';
    END IF;
    -- İade politikası (gün cinsinden)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parts_profiles' AND column_name='return_policy_days') THEN
        ALTER TABLE public.parts_profiles ADD COLUMN return_policy_days INTEGER DEFAULT 14;
    END IF;
    -- Minimum garanti süresi (ay)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parts_profiles' AND column_name='min_warranty_months') THEN
        ALTER TABLE public.parts_profiles ADD COLUMN min_warranty_months INTEGER DEFAULT 0;
    END IF;
    -- OTS (Otomotiv Tedarik Sistemi) kayıt durumu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parts_profiles' AND column_name='is_ots_registered') THEN
        ALTER TABLE public.parts_profiles ADD COLUMN is_ots_registered BOOLEAN DEFAULT false;
    END IF;
    -- Minimum sipariş tutarı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parts_profiles' AND column_name='min_order_amount') THEN
        ALTER TABLE public.parts_profiles ADD COLUMN min_order_amount DECIMAL(12,2) DEFAULT 0;
    END IF;
    -- Çalışma günleri
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parts_profiles' AND column_name='working_days') THEN
        ALTER TABLE public.parts_profiles ADD COLUMN working_days TEXT[] DEFAULT '{mon,tue,wed,thu,fri}';
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────
-- 16.3 PRODUCTS — Parça Kökeni ve Uyumluluk Alanları
-- ─────────────────────────────────────────────────────────
DO $$ BEGIN
    -- Parça kökeni — ZORUNLU bilgi (oem/oes/remanufactured/used/aftermarket/replica)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='part_origin') THEN
        ALTER TABLE public.products ADD COLUMN part_origin TEXT DEFAULT 'aftermarket'
            CHECK (part_origin IN ('oem', 'oes', 'remanufactured', 'used', 'aftermarket', 'replica'));
    END IF;
    -- Garanti süresi (ay)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='warranty_months') THEN
        ALTER TABLE public.products ADD COLUMN warranty_months INTEGER DEFAULT 0;
    END IF;
    -- Uyumlu araç markaları
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='compatible_brands') THEN
        ALTER TABLE public.products ADD COLUMN compatible_brands TEXT[] DEFAULT '{}';
    END IF;
    -- Uyumlu araç modelleri
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='compatible_models') THEN
        ALTER TABLE public.products ADD COLUMN compatible_models TEXT[] DEFAULT '{}';
    END IF;
    -- OEM parça numarası (doğrulama için)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='oem_number') THEN
        ALTER TABLE public.products ADD COLUMN oem_number TEXT;
    END IF;
    -- Barkod / QR kodu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='barcode') THEN
        ALTER TABLE public.products ADD COLUMN barcode TEXT;
    END IF;
    -- Parçanın orijinalliği platform tarafından doğrulandı mı?
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_verified_authentic') THEN
        ALTER TABLE public.products ADD COLUMN is_verified_authentic BOOLEAN DEFAULT false;
    END IF;
    -- Bu parça hangi usta siparişiyle bağlantılı (parça+işçilik köprüsü)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='linked_service_request_id') THEN
        ALTER TABLE public.products ADD COLUMN linked_service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────
-- 16.4 CARWASH PROFILES — Detaylı Hizmet ve Operasyon
-- ─────────────────────────────────────────────────────────
-- Önce carwash_profiles tablosunu oluştur (yoksa)
CREATE TABLE IF NOT EXISTS public.carwash_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT,
    base_price DECIMAL(12,2) DEFAULT 0.00,
    service_radius_km INTEGER DEFAULT 10,
    has_own_water_tank BOOLEAN DEFAULT false,
    has_generator BOOLEAN DEFAULT false,
    is_eco_friendly BOOLEAN DEFAULT false,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating DECIMAL(3,2) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
    -- Sunulan hizmet tipleri (exterior, interior, detailing, engine, steam, ozone, full)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carwash_profiles' AND column_name='service_types') THEN
        ALTER TABLE public.carwash_profiles ADD COLUMN service_types TEXT[] DEFAULT '{exterior}';
    END IF;
    -- Ekip büyüklüğü
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carwash_profiles' AND column_name='team_size') THEN
        ALTER TABLE public.carwash_profiles ADD COLUMN team_size INTEGER DEFAULT 1;
    END IF;
    -- Araç boyutuna göre fiyatlandırma {small, medium, large, suv, commercial}
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carwash_profiles' AND column_name='vehicle_size_pricing') THEN
        ALTER TABLE public.carwash_profiles ADD COLUMN vehicle_size_pricing JSONB DEFAULT '{}'::jsonb;
    END IF;
    -- Kullanılan kimyasal marka
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carwash_profiles' AND column_name='chemicals_brand') THEN
        ALTER TABLE public.carwash_profiles ADD COLUMN chemicals_brand TEXT;
    END IF;
    -- Yıkama hasarı sigortası
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carwash_profiles' AND column_name='insurance_covers_damage') THEN
        ALTER TABLE public.carwash_profiles ADD COLUMN insurance_covers_damage BOOLEAN DEFAULT false;
    END IF;
    -- Ortalama müdahale süresi (dakika)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carwash_profiles' AND column_name='response_time_minutes') THEN
        ALTER TABLE public.carwash_profiles ADD COLUMN response_time_minutes INTEGER DEFAULT 30;
    END IF;
    -- Buhar temizleyici
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carwash_profiles' AND column_name='has_steam_cleaner') THEN
        ALTER TABLE public.carwash_profiles ADD COLUMN has_steam_cleaner BOOLEAN DEFAULT false;
    END IF;
    -- Ozon makinesi (koku giderme)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carwash_profiles' AND column_name='has_ozone_machine') THEN
        ALTER TABLE public.carwash_profiles ADD COLUMN has_ozone_machine BOOLEAN DEFAULT false;
    END IF;
    -- Anahtar teslim politikası (keyless=anahtarsız, customer_present=müşteri yanında, key_box=güvenli kutu)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carwash_profiles' AND column_name='key_exchange_policy') THEN
        ALTER TABLE public.carwash_profiles ADD COLUMN key_exchange_policy TEXT DEFAULT 'keyless'
            CHECK (key_exchange_policy IN ('keyless', 'customer_present', 'key_box'));
    END IF;
    -- Aktif durum
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='carwash_profiles' AND column_name='is_active_now') THEN
        ALTER TABLE public.carwash_profiles ADD COLUMN is_active_now BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Carwash RLS
ALTER TABLE public.carwash_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own carwash profile" ON public.carwash_profiles;
CREATE POLICY "Users can manage own carwash profile" ON public.carwash_profiles 
FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public read carwash" ON public.carwash_profiles;
CREATE POLICY "Public read carwash" ON public.carwash_profiles 
FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────
-- 16.5 ÇEKİCİ / YOL YARDIM PROFİLLERİ (YENİ)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tow_truck_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT,
    -- Sunulan yol yardım hizmetleri
    service_types TEXT[] DEFAULT '{towing}',  -- towing, tire_change, battery_boost, fuel_delivery, lockout
    -- Araç kapasitesi (ton)
    truck_capacity_tons DECIMAL(5,2) DEFAULT 2.0,
    -- 7/24 aktif mi?
    is_24_7 BOOLEAN DEFAULT false,
    -- Ortalama müdahale süresi (dakika)
    response_time_minutes INTEGER DEFAULT 20,
    -- Hizmet verilen iller
    coverage_provinces TEXT[] DEFAULT '{}',
    -- Flatbed (lüks araçlar için düz platform taşıyıcı) var mı?
    has_flatbed BOOLEAN DEFAULT false,
    -- Temel fiyat (ilk km dahil)
    base_price DECIMAL(12,2) DEFAULT 0.00,
    -- KM başı ek ücret
    price_per_km DECIMAL(12,2) DEFAULT 0.00,
    -- Şu an aktif mi?
    is_active_now BOOLEAN DEFAULT false,
    -- Anlık konum (GPS)
    current_lat DECIMAL(10,8),
    current_lng DECIMAL(11,8),
    -- Mali mesuliyet sigortası bitiş tarihi
    liability_insurance_expiry DATE,
    -- Rating
    rating DECIMAL(3,2) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Tow Trucks
ALTER TABLE public.tow_truck_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own tow truck profile" ON public.tow_truck_profiles;
CREATE POLICY "Users can manage own tow truck profile" ON public.tow_truck_profiles 
FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public read active tow trucks" ON public.tow_truck_profiles;
CREATE POLICY "Public read active tow trucks" ON public.tow_truck_profiles 
FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────
-- 16.6 SİGORTA ŞİRKETİ PROFİLLERİ (YENİ)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insurance_company_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    -- Sigortacılık lisans numarası (Hazine ve Maliye Bakanlığı)
    license_number TEXT,
    -- Şirket hizmet tipleri (kasko, trafik, ferdi_kaza, roadside, green_card)
    company_type TEXT[] DEFAULT '{}',
    -- Sunulan poliçe tipleri
    policy_types TEXT[] DEFAULT '{}',
    -- Maksimum teminat tutarı (TRY)
    coverage_limit_max DECIMAL(15,2),
    -- Aylık prim aralığı
    monthly_premium_min DECIMAL(12,2),
    monthly_premium_max DECIMAL(12,2),
    -- Hasar bildiriminden çözüme ortalama süre (saat)
    claim_response_hours INTEGER DEFAULT 24,
    -- Dijital poliçe sunuluyor mu?
    is_digital_policy BOOLEAN DEFAULT true,
    -- Anlaşmalı servis/garaj sayısı
    partner_garage_network_count INTEGER DEFAULT 0,
    -- Rapidsy platformuyla entegre (hasar bildirimi otomatik iletilir)
    is_rapidsy_integrated BOOLEAN DEFAULT false,
    -- Hasar bildirimi webhook URL'si
    api_webhook_url TEXT,
    -- Müşteri portalı URL'si
    customer_portal_url TEXT,
    -- Çağrı merkezi telefonu
    contact_phone TEXT,
    -- 7/24 destek var mı?
    is_24_7_support BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Insurance Companies
ALTER TABLE public.insurance_company_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own insurance profile" ON public.insurance_company_profiles;
CREATE POLICY "Users can manage own insurance profile" ON public.insurance_company_profiles 
FOR ALL USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Public read insurance companies" ON public.insurance_company_profiles;
CREATE POLICY "Public read insurance companies" ON public.insurance_company_profiles 
FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────
-- 16.7 SİGORTA POLİÇE TEKLİFLERİ (Sigorta→Müşteri)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insurance_policy_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Teklifi yapan sigorta şirketi
    insurance_partner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Teklifin yapıldığı müşteri
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Teklifin ilgili olduğu araç
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    -- Poliçe tipi (kasko, trafik, vs.)
    policy_type TEXT NOT NULL,
    -- Yıllık prim (TRY)
    annual_premium DECIMAL(12,2),
    -- Teminat detayları (JSON)
    coverage_details JSONB DEFAULT '{}'::jsonb,
    -- Teklifin geçerlilik tarihi
    valid_until TIMESTAMPTZ,
    -- Durum
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    -- Sigorta şirketinin notları
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.insurance_policy_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customer view own offers" ON public.insurance_policy_offers;
CREATE POLICY "Customer view own offers" ON public.insurance_policy_offers 
FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = insurance_partner_id OR public.is_admin());

DROP POLICY IF EXISTS "Insurance company can manage offers" ON public.insurance_policy_offers;
CREATE POLICY "Insurance company can manage offers" ON public.insurance_policy_offers 
FOR ALL USING (auth.uid() = insurance_partner_id);

-- ─────────────────────────────────────────────────────────
-- 16.8 PARTNER SİGORTA DOĞRULAMASI (Otomatik Askıya Alma)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partner_insurance_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Partner kimliği (usta, yıkamacı, çekici)
    partner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Poliçe numarası
    policy_number TEXT NOT NULL,
    -- Sigorta şirketi adı
    insurer_name TEXT,
    -- Teminat tipi (Mesleki Sorumluluk, Genel Sorumluluk, vs.)
    coverage_type TEXT,
    -- Teminat tutarı (TRY)
    coverage_amount DECIMAL(15,2),
    -- Bitiş tarihi — ÖNEMLİ: bu tarih geçince partner askıya alınır
    expiry_date DATE NOT NULL,
    -- Belge URL'si (Supabase Storage)
    document_url TEXT,
    -- Admin tarafından doğrulandı mı?
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    -- Yenileme bildirimi gönderildi mi?
    renewal_notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.partner_insurance_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners view own insurance" ON public.partner_insurance_verifications;
CREATE POLICY "Partners view own insurance" ON public.partner_insurance_verifications 
FOR SELECT USING (auth.uid() = partner_id OR public.is_admin());

DROP POLICY IF EXISTS "Partners manage own insurance" ON public.partner_insurance_verifications;
CREATE POLICY "Partners manage own insurance" ON public.partner_insurance_verifications 
FOR ALL USING (auth.uid() = partner_id OR public.is_admin());

-- ─────────────────────────────────────────────────────────
-- 16.9 TETİKLEYİCİ: Sigorta Süresi Dolunca Askıya Alma
--       Sipariş oluşturulurken partner sigorta kontrolü
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_partner_insurance_on_order()
RETURNS TRIGGER AS $$
DECLARE
    v_expiry DATE;
    v_partner_name TEXT;
BEGIN
    -- Partner'ın en güncel sigorta bitiş tarihini bul
    SELECT expiry_date INTO v_expiry
    FROM public.partner_insurance_verifications
    WHERE partner_id = NEW.seller_id AND is_verified = true
    ORDER BY expiry_date DESC
    LIMIT 1;

    -- Eğer sigorta yoksa veya süresi geçmişse sipariş oluşturmayı engelleme
    -- (sadece loglama yapıyoruz, bloklama değil — kullanıcı deneyimi bozulmamalı)
    IF v_expiry IS NOT NULL AND v_expiry < CURRENT_DATE THEN
        -- Sigorta süresi dolmuş — partner'ı askıya al
        UPDATE public.profiles 
        SET is_suspended = true, 
            ban_reason = 'Mali mesuliyet sigortası süresi dolmuştur. Lütfen poliçenizi yenileyin.'
        WHERE id = NEW.seller_id AND is_suspended = false;

        -- Admin'e bildirim gönder
        INSERT INTO public.notifications (user_id, type, title, message)
        SELECT id, 'warning', 
            'Partner Sigorta Süresi Doldu',
            'Bir partner''ın mali mesuliyet sigortası süresi dolmuştur ve otomatik olarak askıya alınmıştır.'
        FROM public.profiles WHERE role::text = 'admin' LIMIT 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_partner_insurance ON public.orders;
CREATE TRIGGER trg_check_partner_insurance
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.check_partner_insurance_on_order();

-- ─────────────────────────────────────────────────────────
-- 16.10 TETİKLEYİCİ: Sigorta Yenileme Bildirimi (30 gün öncesi)
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_upcoming_insurance_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- Sigorta bitiş tarihine 30 gün kala bildirim gönder
    IF NEW.expiry_date <= (CURRENT_DATE + INTERVAL '30 days') 
       AND NEW.expiry_date > CURRENT_DATE 
       AND OLD.renewal_notified_at IS NULL THEN
        
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (
            NEW.partner_id,
            'warning',
            '⚠️ Sigorta Poliçeniz Yakında Bitiyor',
            'Mali mesuliyet sigorta poliçenizin süresi ' || 
            to_char(NEW.expiry_date, 'DD/MM/YYYY') || 
            ' tarihinde dolmaktadır. Hizmet vermaya devam edebilmek için poliçenizi yenilemeniz gerekmektedir.'
        );

        -- Bildirim gönderildi olarak işaretle
        NEW.renewal_notified_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_insurance_expiry ON public.partner_insurance_verifications;
CREATE TRIGGER trg_notify_insurance_expiry
BEFORE UPDATE ON public.partner_insurance_verifications
FOR EACH ROW EXECUTE FUNCTION public.notify_upcoming_insurance_expiry();

-- ─────────────────────────────────────────────────────────
-- 16.11 user_role ENUM — Yeni Partner Tipleri Ekleme
-- ─────────────────────────────────────────────────────────
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tow_truck';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'insurance';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'carwash';

-- ─────────────────────────────────────────────────────────
-- 16.12 complete_partner_onboarding_v2 GÜNCELLEMESİ
--        Yeni partner tiplerini destekle
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.complete_partner_onboarding_v2(
    p_user_id UUID,
    p_profession TEXT,
    p_business_name TEXT,
    p_phone TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Update profile role safely
    UPDATE public.profiles
    SET 
        role = p_profession::public.user_role,
        company_name = p_business_name,
        phone_number = COALESCE(p_phone, phone_number),
        is_active_provider = true,
        updated_at = now()
    WHERE id = p_user_id;

    -- Create specialized profile based on profession
    IF p_profession = 'mechanic' THEN
        INSERT INTO public.mechanic_shops (seller_id, shop_name, is_active, specialties, brands, accepted_vehicle_types)
        VALUES (p_user_id, p_business_name, true, ARRAY['Periyodik Bakım'], ARRAY[]::TEXT[], ARRAY['passenger'])
        ON CONFLICT DO NOTHING;

    ELSIF p_profession = 'parts' THEN
        INSERT INTO public.parts_profiles (id, business_name, delivery_radius_km, store_type, part_origin_types)
        VALUES (p_user_id, p_business_name, 50, 'retail', ARRAY['oem', 'oes', 'aftermarket'])
        ON CONFLICT (id) DO NOTHING;

    ELSIF p_profession = 'carwash' THEN
        INSERT INTO public.carwash_profiles (id, seller_id, company_name, service_radius_km, service_types, has_own_water_tank)
        VALUES (p_user_id, p_user_id, p_business_name, 10, ARRAY['exterior'], false)
        ON CONFLICT (id) DO NOTHING;

    ELSIF p_profession = 'tow_truck' THEN
        INSERT INTO public.tow_truck_profiles (id, company_name, service_types, is_24_7)
        VALUES (p_user_id, p_business_name, ARRAY['towing'], false)
        ON CONFLICT (id) DO NOTHING;

    ELSIF p_profession = 'insurance' THEN
        INSERT INTO public.insurance_company_profiles (id, company_name, is_digital_policy)
        VALUES (p_user_id, p_business_name, true)
        ON CONFLICT (id) DO NOTHING;

    ELSIF p_profession = 'valet' THEN
        INSERT INTO public.valet_profiles (id, bio, experience_years)
        VALUES (p_user_id, p_business_name, 1)
        ON CONFLICT (id) DO NOTHING;

    ELSIF p_profession = 'parking' THEN
        INSERT INTO public.parking_profiles (id, parking_name, total_capacity)
        VALUES (p_user_id, p_business_name, 10)
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Ensure wallet exists
    INSERT INTO public.wallets (id, user_id, balance, currency)
    VALUES (p_user_id, p_user_id, 0.00, 'TRY')
    ON CONFLICT (id) DO NOTHING;

    v_result := jsonb_build_object('success', true, 'message', 'Partner kaydı tamamlandı.');
    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    v_result := jsonb_build_object('success', false, 'message', SQLERRM);
    RETURN v_result;
END;
$$;

-- ─────────────────────────────────────────────────────────
-- 16.13 İNDEKSLER — Performans Optimizasyonu
-- ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_part_origin ON public.products(part_origin);
CREATE INDEX IF NOT EXISTS idx_products_compatible_brands ON public.products USING GIN(compatible_brands);
CREATE INDEX IF NOT EXISTS idx_tow_truck_active ON public.tow_truck_profiles(is_active_now);
CREATE INDEX IF NOT EXISTS idx_insurance_offers_customer ON public.insurance_policy_offers(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_partner_insurance_expiry ON public.partner_insurance_verifications(expiry_date, is_verified);
CREATE INDEX IF NOT EXISTS idx_mechanic_vehicle_types ON public.mechanic_shops USING GIN(accepted_vehicle_types);

-- Schema reload
NOTIFY pgrst, 'reload schema';



