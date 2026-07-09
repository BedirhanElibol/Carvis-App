-- =========================================================
-- 14. CARWASH & PARKING & VALET EXTENSIONS
-- =========================================================

-- 1. VALET BOOKINGS UPDATE (Add escrow_order_id, price, assigned_provider_id)
ALTER TABLE public.valet_bookings ADD COLUMN IF NOT EXISTS escrow_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;
ALTER TABLE public.valet_bookings ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE public.valet_bookings ADD COLUMN IF NOT EXISTS assigned_provider_id UUID REFERENCES public.profiles(id);

-- 2. PARKING RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.parking_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    parking_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    escrow_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.parking_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own parking reservations" ON public.parking_reservations
FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = parking_id);

CREATE POLICY "Users can insert their own parking reservations" ON public.parking_reservations
FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own parking reservations" ON public.parking_reservations
FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = parking_id);

CREATE INDEX IF NOT EXISTS idx_parking_res_customer ON public.parking_reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_parking_res_parking ON public.parking_reservations(parking_id);

-- 3. CARWASH REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.carwash_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    escrow_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    location_lat NUMERIC(10,8) NOT NULL,
    location_lng NUMERIC(11,8) NOT NULL,
    address_text TEXT,
    wash_type TEXT NOT NULL CHECK (wash_type IN ('interior', 'exterior', 'full', 'premium')),
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.carwash_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own carwash requests" ON public.carwash_requests
FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = provider_id);

CREATE POLICY "Users can insert their own carwash requests" ON public.carwash_requests
FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own carwash requests" ON public.carwash_requests
FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = provider_id);

CREATE INDEX IF NOT EXISTS idx_carwash_req_customer ON public.carwash_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_carwash_req_provider ON public.carwash_requests(provider_id);

-- Trigger functionality for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parking_reservations_updated_at
    BEFORE UPDATE ON public.parking_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carwash_requests_updated_at
    BEFORE UPDATE ON public.carwash_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
