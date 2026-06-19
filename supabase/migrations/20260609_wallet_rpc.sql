CREATE OR REPLACE FUNCTION public.rpc_block_wallet_funds(p_amount NUMERIC)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_balance DECIMAL(12,2);
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT balance INTO v_balance FROM public.wallets WHERE user_id = v_user_id;
    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    UPDATE public.wallets
    SET balance = balance - p_amount,
        blocked_amount = blocked_amount + p_amount
    WHERE user_id = v_user_id;

    INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
    VALUES (v_user_id, p_amount, 'block', 'İşlem İçin Bloke');

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.rpc_release_wallet_funds(p_amount NUMERIC)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_blocked_amount DECIMAL(12,2);
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT blocked_amount INTO v_blocked_amount FROM public.wallets WHERE user_id = v_user_id;
    IF v_blocked_amount < p_amount THEN
        RAISE EXCEPTION 'Insufficient blocked amount';
    END IF;

    UPDATE public.wallets
    SET blocked_amount = blocked_amount - p_amount
    WHERE user_id = v_user_id;

    INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
    VALUES (v_user_id, p_amount, 'payment', 'İşlem Tamamlandı');

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.rpc_cancel_escrow(p_amount NUMERIC)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_blocked_amount DECIMAL(12,2);
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT blocked_amount INTO v_blocked_amount FROM public.wallets WHERE user_id = v_user_id;
    IF v_blocked_amount < p_amount THEN
        RAISE EXCEPTION 'Insufficient blocked amount';
    END IF;

    UPDATE public.wallets
    SET blocked_amount = blocked_amount - p_amount,
        balance = balance + p_amount
    WHERE user_id = v_user_id;

    INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
    VALUES (v_user_id, p_amount, 'unblock', 'Bloke İptali');

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
