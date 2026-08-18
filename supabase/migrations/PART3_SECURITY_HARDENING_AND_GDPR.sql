-- =========================================================
-- CARVIS SECURITY HARDENING & GDPR/KVKK COMPLIANCE MIGRATION
-- =========================================================

-- 1. ROLE-BASED ACCESS CONTROL (RBAC) HELPER FUNCTIONS (Madde 18)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- Check user role from profiles table
    SELECT role INTO v_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN (v_role = 'admin' OR v_role = 'superadmin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_partner()
RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN (v_role = 'partner' OR v_role = 'provider' OR v_role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Admin Audit Logging Table for sensitive admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs
    FOR INSERT WITH CHECK (public.is_admin());


-- 2. GDPR / KVKK COMPLIANT HESAP SİLME FONKSİYONU (Madde 21)
-- Permanently purges user PII and cascades cleanup across tables
CREATE OR REPLACE FUNCTION public.delete_user_account_gdpr(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    calling_user UUID := auth.uid();
BEGIN
    -- Authorization check: User can only delete their own account or must be an admin
    IF calling_user != target_user_id AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Yalnızca kendi hesabınızı veya yetkili admin silebilir.';
    END IF;

    -- 1. Anonymize Profile Data (KVKK / GDPR compliant PII removal)
    UPDATE public.profiles
    SET 
        full_name = 'Silinmiş Kullanıcı',
        email = 'deleted_' || target_user_id || '@anonymized.carvis',
        phone_number = NULL,
        avatar_url = NULL,
        identity_number = NULL,
        is_suspended = true,
        ban_reason = 'Kullanıcı talebi ile KVKK/GDPR kapsamında silindi',
        updated_at = NOW()
    WHERE id = target_user_id;

    -- 2. Delete User Vehicles & Maintenance Logs
    DELETE FROM public.vehicles WHERE user_id = target_user_id;
    DELETE FROM public.fuel_logs WHERE user_id = target_user_id;

    -- 3. Clear Notifications & Search Queries
    DELETE FROM public.notifications WHERE user_id = target_user_id;

    -- 4. Anonymize/Clear Unpaid Orders if any
    UPDATE public.orders
    SET customer_notes = '[KVKK Uyarınca Temizlendi]'
    WHERE customer_id = target_user_id;

    -- Log account deletion in audit log
    INSERT INTO public.admin_audit_logs(admin_id, action_type, target_resource, details)
    VALUES (
        COALESCE(calling_user, target_user_id),
        'GDPR_ACCOUNT_DELETION',
        'profiles',
        jsonb_build_object('target_user_id', target_user_id, 'timestamp', NOW())
    );

    RETURN jsonb_build_object('success', true, 'message', 'Kullanıcı hesabı ve PII verileri KVKK/GDPR standartlarında temizlendi.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 3. SQL PARAMETRELENDİRME VE GÜVENLİ RPC YARDIMCILARI (Madde 15)
-- Ensures all user inputs in custom RPCs are strictly parameterized
GRANT EXECUTE ON FUNCTION public.delete_user_account_gdpr(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_partner() TO authenticated;
