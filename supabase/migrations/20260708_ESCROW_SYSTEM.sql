-- Migration: Escrow System
-- Created: 2026-07-08

CREATE TYPE public.escrow_status AS ENUM ('locked', 'released', 'disputed', 'refunded');

CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID, -- References orders if exists
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status public.escrow_status DEFAULT 'locked',
    pin_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own escrows" ON public.escrow_transactions
    FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = provider_id);

CREATE POLICY "Admin can view all escrows" ON public.escrow_transactions
    FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));

-- Secure RPC for releasing escrow
CREATE OR REPLACE FUNCTION public.release_escrow(
    p_escrow_id UUID,
    p_pin_code VARCHAR(6)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_escrow RECORD;
    v_wallet RECORD;
BEGIN
    -- 1. Check if escrow exists and is locked
    SELECT * INTO v_escrow FROM public.escrow_transactions 
    WHERE id = p_escrow_id AND status = 'locked'
    FOR UPDATE;

    IF v_escrow IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Escrow not found or not locked.');
    END IF;

    -- 2. Check PIN code (Only Customer Knows This)
    IF v_escrow.pin_code != p_pin_code THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid PIN code.');
    END IF;

    -- 3. Update escrow status to released
    UPDATE public.escrow_transactions 
    SET status = 'released', updated_at = NOW() 
    WHERE id = p_escrow_id;

    -- 4. Transfer funds to Provider's Wallet
    SELECT * INTO v_wallet FROM public.wallets WHERE owner_id = v_escrow.provider_id FOR UPDATE;
    
    IF v_wallet IS NULL THEN
        -- Create wallet if missing
        INSERT INTO public.wallets (owner_id, balance) 
        VALUES (v_escrow.provider_id, v_escrow.amount);
    ELSE
        -- Add balance
        UPDATE public.wallets 
        SET balance = balance + v_escrow.amount, updated_at = NOW()
        WHERE owner_id = v_escrow.provider_id;
    END IF;

    -- 5. Return success
    RETURN jsonb_build_object('success', true, 'message', 'Funds transferred securely.', 'amount', v_escrow.amount);
END;
$$;
