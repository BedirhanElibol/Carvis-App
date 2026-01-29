-- ==========================================
-- CARVIS - SADECE EKSİK TABLOLAR (Güvenli Migration)
-- Mevcut şemayı bozmaz, sadece yeni tabloları ekler
-- ==========================================

-- 1. YENİ TİPLER (Sadece yoksa ekle)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status_type') THEN
    CREATE TYPE public.quote_status_type AS ENUM ('pending', 'accepted', 'rejected', 'expired');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status_type') THEN
    CREATE TYPE public.appointment_status_type AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM ('quote', 'order', 'appointment', 'message', 'system');
  END IF;
END $$;

-- 2. QUOTES TABLOSU (Sadece yoksa ekle)
CREATE TABLE IF NOT EXISTS public.quotes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_request_id bigint REFERENCES public.service_requests(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  estimated_delivery_days int,
  description text,
  warranty_months int DEFAULT 0,
  status public.quote_status_type DEFAULT 'pending',
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. APPOINTMENTS TABLOSU (Sadece yoksa ekle)
CREATE TABLE IF NOT EXISTS public.appointments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_id bigint REFERENCES public.vehicles(id) ON DELETE SET NULL,
  quote_id bigint REFERENCES public.quotes(id) ON DELETE SET NULL,
  appointment_date timestamp with time zone NOT NULL,
  service_type text NOT NULL,
  notes text,
  status public.appointment_status_type DEFAULT 'pending',
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. MESSAGES TABLOSU (Sadece yoksa ekle)
CREATE TABLE IF NOT EXISTS public.messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quote_id bigint REFERENCES public.quotes(id) ON DELETE SET NULL,
  order_id bigint REFERENCES public.orders(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. NOTIFICATIONS TABLOSU (Sadece yoksa ekle)
CREATE TABLE IF NOT EXISTS public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  quote_id bigint REFERENCES public.quotes(id) ON DELETE SET NULL,
  order_id bigint REFERENCES public.orders(id) ON DELETE SET NULL,
  appointment_id bigint REFERENCES public.appointments(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 6. RLS POLİTİKALARI (Sadece yoksa ekle)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Quotes politikaları
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Customers can view their quotes') THEN
    CREATE POLICY "Customers can view their quotes" ON public.quotes FOR SELECT USING (auth.uid() = customer_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Sellers can view their quotes') THEN
    CREATE POLICY "Sellers can view their quotes" ON public.quotes FOR SELECT USING (auth.uid() = seller_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Sellers can create quotes') THEN
    CREATE POLICY "Sellers can create quotes" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = seller_id);
  END IF;
END $$;

-- Notifications politikaları
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their notifications') THEN
    CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- 7. İNDEKSLER (Performans için)
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON public.quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_seller ON public.quotes(seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- TAMAMLANDI! ✅
