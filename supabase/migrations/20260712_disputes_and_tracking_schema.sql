-- 20260712_disputes_and_tracking_schema.sql
-- Rapidsy Dispute Resolution & GPS Tracking System

-- 1. Create enum type for dispute status
DO $$ BEGIN
    CREATE TYPE dispute_status_type AS ENUM ('under_review', 'refunded', 'released_to_seller');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tracking_event_type AS ENUM ('check_in', 'check_out', 'proof_uploaded');
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
