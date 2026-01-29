-- Add role column to profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'customer';
        ALTER TABLE public.profiles ADD CONSTRAINT check_roles CHECK (role IN ('customer', 'parking', 'valet', 'mechanic', 'admin'));
    END IF;
END $$;

-- Create parking_lots table
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

-- Enable RLS
ALTER TABLE public.parking_lots ENABLE ROW LEVEL SECURITY;

-- Policies (Drop first to avoid conflicts if rerunning)
DROP POLICY IF EXISTS "Public read access" ON public.parking_lots;
DROP POLICY IF EXISTS "Owner update access" ON public.parking_lots;
DROP POLICY IF EXISTS "Owner insert access" ON public.parking_lots;

CREATE POLICY "Public read access" ON public.parking_lots FOR SELECT USING (true);
CREATE POLICY "Owner update access" ON public.parking_lots FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owner insert access" ON public.parking_lots FOR INSERT WITH CHECK (auth.uid() = owner_id);
