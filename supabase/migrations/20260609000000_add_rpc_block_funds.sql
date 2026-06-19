-- Secure RPC: Block Funds
CREATE OR REPLACE FUNCTION public.rpc_block_funds(p_amount NUMERIC, p_description TEXT DEFAULT 'İşlem İçin Bloke')
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_balance DECIMAL(12,2);
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Check balance with lock
    SELECT balance INTO v_balance FROM public.wallets WHERE user_id = v_user_id FOR UPDATE;

    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    -- Update wallet safely
    UPDATE public.wallets
    SET balance = balance - p_amount,
        blocked_amount = blocked_amount + p_amount
    WHERE user_id = v_user_id;

    -- Log transaction securely
    INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
    VALUES (v_user_id, p_amount, 'block', p_description);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
