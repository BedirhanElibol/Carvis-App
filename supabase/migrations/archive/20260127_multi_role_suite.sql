-- 1. Add roles to profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'customer';
        ALTER TABLE public.profiles ADD CONSTRAINT check_roles CHECK (role IN ('customer', 'parking', 'valet', 'mechanic', 'admin'));
    END IF;
END $$;

-- 2. Create parking_lots table
CREATE TABLE IF NOT EXISTS public.parking_lots (
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

-- 3. Create valet_services table (Uber-style)
CREATE TABLE IF NOT EXISTS public.valet_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id uuid REFERENCES public.profiles(id) NOT NULL,
    business_name text NOT NULL, -- e.g. "Ahmet Vale"
    is_available boolean DEFAULT false,
    current_lat float,
    current_lng float,
    rating decimal(2,1) DEFAULT 5.0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Create mechanic_shops table
CREATE TABLE IF NOT EXISTS public.mechanic_shops (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id uuid REFERENCES public.profiles(id) NOT NULL,
    shop_name text NOT NULL,
    address text,
    specialties text[], -- e.g. ["BMW", "Motor", "Elektrik"]
    is_open boolean DEFAULT true,
    rating decimal(2,1) DEFAULT 5.0,
    location_lat float,
    location_lng float,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. Enable RLS and Policies for ALL tables
ALTER TABLE public.parking_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valet_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_shops ENABLE ROW LEVEL SECURITY;

-- Parking Policies
CREATE POLICY "Public read parking" ON public.parking_lots FOR SELECT USING (true);
CREATE POLICY "Owner update parking" ON public.parking_lots FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owner insert parking" ON public.parking_lots FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Valet Policies
CREATE POLICY "Public read valet" ON public.valet_services FOR SELECT USING (true);
CREATE POLICY "Owner update valet" ON public.valet_services FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owner insert valet" ON public.valet_services FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Mechanic Policies
CREATE POLICY "Public read mechanic" ON public.mechanic_shops FOR SELECT USING (true);
CREATE POLICY "Owner update mechanic" ON public.mechanic_shops FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owner insert mechanic" ON public.mechanic_shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
