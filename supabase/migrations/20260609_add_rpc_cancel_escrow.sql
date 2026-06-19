-- Secure RPC: Cancel Escrow
CREATE OR REPLACE FUNCTION public.rpc_cancel_escrow(p_amount NUMERIC)
RETURNS BOOLEAN
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_wallet_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Invalid amount';
    END IF;

    -- Get the actual wallet ID
    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = v_user_id;

    IF v_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    -- Update wallet safely
    UPDATE public.wallets SET balance = balance + p_amount WHERE id = v_wallet_id;

    -- Log transaction securely
    INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
    VALUES (v_wallet_id, p_amount, 'refund', 'Bloke İptali (Güvenli Sistem)');

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
