-- Migration: Return Requests System
-- Creates the return_requests table for managing customer return/refund requests

-- Return Request Status Type
DO $$ BEGIN
    CREATE TYPE return_request_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Return Requests Table
CREATE TABLE IF NOT EXISTS public.return_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL DEFAULT 'other',
    description TEXT DEFAULT '',
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    refund_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    CONSTRAINT unique_return_per_order UNIQUE (order_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_customer_id ON public.return_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_seller_id ON public.return_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON public.return_requests(status);

-- RLS
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- Customers can view their own return requests
DROP POLICY IF EXISTS "Customers can view their returns" ON public.return_requests;
CREATE POLICY "Customers can view their returns" ON public.return_requests
    FOR SELECT USING (auth.uid() = customer_id);

-- Customers can create return requests for their orders
DROP POLICY IF EXISTS "Customers can create returns" ON public.return_requests;
CREATE POLICY "Customers can create returns" ON public.return_requests
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Sellers can view return requests for their orders
DROP POLICY IF EXISTS "Sellers can view return requests" ON public.return_requests;
CREATE POLICY "Sellers can view return requests" ON public.return_requests
    FOR SELECT USING (auth.uid() = seller_id);

-- Sellers can update return requests (approve/reject)
DROP POLICY IF EXISTS "Sellers can update return requests" ON public.return_requests;
CREATE POLICY "Sellers can update return requests" ON public.return_requests
    FOR UPDATE USING (auth.uid() = seller_id);

-- Admins full access
DROP POLICY IF EXISTS "Admins full access on return_requests" ON public.return_requests;
CREATE POLICY "Admins full access on return_requests" ON public.return_requests
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Add seller_reply columns to reviews table for partner review responses
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'seller_reply') THEN
        ALTER TABLE public.reviews ADD COLUMN seller_reply TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'seller_reply_at') THEN
        ALTER TABLE public.reviews ADD COLUMN seller_reply_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add attachment columns to messages table for chat file sharing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'attachment_url') THEN
        ALTER TABLE public.messages ADD COLUMN attachment_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'attachment_type') THEN
        ALTER TABLE public.messages ADD COLUMN attachment_type TEXT;
    END IF;
END $$;
