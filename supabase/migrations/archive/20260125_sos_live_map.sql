-- ==========================================
-- SOS 2.0 & CANLI HARİTA ALTYAPISI
-- ==========================================

-- 1. Profiles Tablosu Güncelleme
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS lat numeric(10, 7),
ADD COLUMN IF NOT EXISTS lng numeric(10, 7),
ADD COLUMN IF NOT EXISTS is_active_provider boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS provider_type text; -- 'mechanic', 'tow_truck', 'mobile_fixer'

-- 2. Service Requests Tablosuna Konum Desteği
ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS lat numeric(10, 7),
ADD COLUMN IF NOT EXISTS lng numeric(10, 7);

-- 3. Acil Yardım (SOS) Tablosu
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Konum ve Detay
  lat numeric(10, 7) NOT NULL,
  lng numeric(10, 7) NOT NULL,
  description text,
  emergency_type text NOT NULL, -- 'engine_failure', 'tire_puncture', 'accident', 'battery_dead'
  
  -- Durum
  status text DEFAULT 'searching', -- 'searching', 'assigned', 'completed', 'cancelled'
  assigned_provider_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS Politikaları
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own emergency requests" 
ON public.emergency_requests FOR SELECT 
USING (auth.uid() = customer_id OR auth.uid() = assigned_provider_id);

CREATE POLICY "Users can create emergency requests" 
ON public.emergency_requests FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Providers can view searching requests" 
ON public.emergency_requests FOR SELECT 
USING (status = 'searching');

-- Realtime Aktivasyonu
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_emergency_lat_lng ON public.emergency_requests(lat, lng);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(lat, lng) WHERE is_active_provider = true;
