-- =========================================================
-- CARVIS APP SECURITY PATCH
-- FIX: Remove INSERT policy from wallet_transactions
-- FIX: Add user_id to transactions for Wallet Top-ups
-- =========================================================

-- Müşterilerin/Kullanıcıların kendi işlemlerini "okuma" (SELECT) yetkisine dokunmuyoruz.
-- Ancak doğrudan "ekleme" (INSERT) yetkilerini siliyoruz.
-- wallet_transactions tablosuna artık sadece backend (service_role veya SECURITY DEFINER RPC'ler) kayıt atabilir.

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.wallet_transactions;

-- Cüzdan yükleme (Top-up) işlemleri için transactions tablosuna user_id sütunu eklenir.
-- Sipariş ödemesi olmayan (order_id IS NULL) işlemlerde bakiyenin kime yükleneceğini bilmek için bu şart.
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id);
