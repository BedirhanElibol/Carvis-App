-- 20260709_partner_kyc_schema.sql
-- KYC and Legal Liability Protection for Partners

-- 1. Create a custom type for KYC Status if not exists
DO $$ BEGIN
    CREATE TYPE kyc_status_type AS ENUM ('unverified', 'pending_review', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add KYC columns to sellers table
ALTER TABLE public.sellers 
ADD COLUMN IF NOT EXISTS kyc_status kyc_status_type DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS criminal_record_url TEXT,
ADD COLUMN IF NOT EXISTS competence_cert_url TEXT,
ADD COLUMN IF NOT EXISTS tax_plate_url TEXT,
ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT,
ADD COLUMN IF NOT EXISTS insurance_expiry_date DATE,
ADD COLUMN IF NOT EXISTS legal_terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS legal_terms_ip_address TEXT;

-- 3. Create Audit Trail table for legal agreements
CREATE TABLE IF NOT EXISTS public.partner_legal_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    agreement_type TEXT NOT NULL, -- e.g., 'liability_waiver', 'kvkk', 'distance_selling'
    agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    document_version TEXT NOT NULL
);

-- RLS for legal agreements
ALTER TABLE public.partner_legal_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own agreements" 
ON public.partner_legal_agreements FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Partners can insert their own agreements" 
ON public.partner_legal_agreements FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- System/Admin policies can be added here
