-- ==========================================
-- CARVIS - ADMIN SECURITY SUITE
-- Admin rolü için süper yetkiler
-- ==========================================

-- 1. Helper Function: Is Admin?
-- Performans için ve cleaner code için
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. PROFILES POLICIES (Admin Full Access)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- 3. WALLETS POLICIES (Admin View)
DROP POLICY IF EXISTS "Admins can view all wallets" ON public.wallets;
CREATE POLICY "Admins can view all wallets" ON public.wallets
  FOR SELECT USING (public.is_admin());

-- 4. TRANSACTIONS POLICIES (Admin View)
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.wallet_transactions;
CREATE POLICY "Admins can view all transactions" ON public.wallet_transactions
  FOR SELECT USING (public.is_admin());

-- 5. ORDERS POLICIES (Admin View)
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin());

-- 6. OTOPARK/VALE POLICIES (Admin View)
-- Admin tüm işletmeleri görebilmeli
CREATE POLICY "Admins can view all parking lots" ON public.parking_lots
  FOR SELECT USING (public.is_admin());

-- TAMAMLANDI
