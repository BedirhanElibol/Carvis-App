-- ==========================================
-- CARVIS - CUMULATIVE FIX: SERVICE REQUESTS & QUOTES
-- "Relationship not found" ve "Missing Table" hatalarını çözer.
-- ==========================================

-- 1. ÖNCE: Service Requests (Talep) Tablosu (Quotes buna bağlı!)
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

-- RLS: Service Requests
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own requests" ON public.service_requests;
CREATE POLICY "Users manage own requests" ON public.service_requests
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins/Partners view requests" ON public.service_requests;
CREATE POLICY "Admins/Partners view requests" ON public.service_requests
    FOR SELECT USING (true); -- Şimdilik herkes (partnerler) görebilsin diye public read.


-- 2. SONRA: Quotes (Teklif) Tablosu Güncellemesi
-- Tablo varsa sütunları ekle, yoksa oluştur (MASTER_SCHEMA'da basit hali vardı)

ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS service_request_id bigint REFERENCES public.service_requests(id) ON DELETE CASCADE;

-- Detay Sütunları
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS price numeric, -- Frontend 'price' yolluyor
ADD COLUMN IF NOT EXISTS estimated_delivery_days integer,
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS description text,
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS warranty_months integer,
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS accepted_at timestamp with time zone;

-- Foreign Key Constraint İsimlerini Frontend'e Göre Ayarla
-- Frontend: profiles!quotes_customer_id_fkey
ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_customer_id_fkey;
ALTER TABLE public.quotes ADD CONSTRAINT quotes_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_seller_id_fkey;
ALTER TABLE public.quotes ADD CONSTRAINT quotes_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. RLS Politikaları (Quotes)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quotes visible to parties" ON public.quotes;
CREATE POLICY "Quotes visible to parties" ON public.quotes
    FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers create quotes" ON public.quotes;
CREATE POLICY "Sellers create quotes" ON public.quotes
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Customers update quotes" ON public.quotes;
CREATE POLICY "Customers update quotes" ON public.quotes
    FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = seller_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;

-- TAMAMLANDI
