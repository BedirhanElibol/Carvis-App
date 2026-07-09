-- 20260711_rapidsy_assurance_schema.sql
-- Rapidsy Assurance & Recourse (Rücu) System

-- 1. Create enum types for claim and recourse statuses
DO $$ BEGIN
    CREATE TYPE claim_status_type AS ENUM ('pending', 'approved', 'rejected', 'recoursed_to_partner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE recourse_status_type AS ENUM ('pending_collection', 'collected', 'legal_dispute');
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
    seller_id UUID NOT NULL REFERENCES public.sellers(id),
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

CREATE POLICY "Customers can view their own claims" 
ON public.assurance_claims FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can insert their claims" 
ON public.assurance_claims FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Sellers can view recourse claims against them" 
ON public.assurance_claims FOR SELECT 
USING (auth.uid() = seller_id);
