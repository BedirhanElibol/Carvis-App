-- =========================================================
-- CARVIS SECURITY: SECURE ASSURANCE CLAIM APPROVAL RPC
-- DATE: 2026-07-19
-- =========================================================

CREATE OR REPLACE FUNCTION public.approve_assurance_claim(
    p_claim_id UUID,
    p_requested_payout NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_claim RECORD;
    v_order RECORD;
    v_max_payout NUMERIC;
BEGIN
    -- 1. Get the claim details
    SELECT * INTO v_claim
    FROM public.assurance_claims
    WHERE id = p_claim_id;

    IF v_claim IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Claim not found or you do not have permission.');
    END IF;

    -- 2. Fetch associated order to validate max payout amount
    SELECT total_amount INTO v_order
    FROM public.orders
    WHERE id = v_claim.order_id;

    IF v_order IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found for this claim.');
    END IF;

    -- Business logic: Payout cannot exceed order total
    v_max_payout := v_order.total_amount;

    IF p_requested_payout > v_max_payout THEN
        RETURN jsonb_build_object('success', false, 'error', 'Requested payout exceeds the maximum allowable amount (order total).');
    END IF;

    -- 3. Perform the secure update and return the full row
    UPDATE public.assurance_claims
    SET claim_status = 'recoursed_to_partner',
        payout_amount = p_requested_payout,
        recourse_amount = p_requested_payout,
        recourse_status = 'pending_collection',
        updated_at = NOW()
    WHERE id = p_claim_id
    RETURNING * INTO v_claim;

    -- 4. Return success and the full updated claim row
    RETURN jsonb_build_object(
        'success', true,
        'data', to_jsonb(v_claim)
    );
END;
$$;
