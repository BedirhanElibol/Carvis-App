-- ==========================================
-- CARVIS - ACİL DÜZELTME: EKSİK TABLOLAR
-- ERROR: relation "public.wallets" does not exist hatası için çözüm.
-- ==========================================

-- 1. EKSİKSE WALLETS TABLOSUNU OLUŞTUR
CREATE TABLE IF NOT EXISTS public.wallets (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  currency text DEFAULT 'TRY',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. EKSİKSE TRANSACTIONS TABLOSUNU OLUŞTUR
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wallet_id uuid REFERENCES public.wallets(user_id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL, 
  type text NOT NULL CHECK (type IN ('deposit', 'spending', 'refund', 'transfer', 'withdrawal')),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  description text,
  reference_id text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. RLS AKTİFLEŞTİR
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 4. HERKESİN KENDİ CÜZDANINI GÖRMESİ İÇİN POLICY
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
CREATE POLICY "Users can view their own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view their transactions" ON public.wallet_transactions FOR SELECT USING (wallet_id = auth.uid());

-- 5. ADMIN GÜVENLİK POLİTİKALARI (Hata aldığınız yer burasıydı)
-- Artık tablolar var olduğu için hata vermeyecek.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin View Policies
DROP POLICY IF EXISTS "Admins can view all wallets" ON public.wallets;
CREATE POLICY "Admins can view all wallets" ON public.wallets FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.wallet_transactions;
CREATE POLICY "Admins can view all transactions" ON public.wallet_transactions FOR SELECT USING (public.is_admin());

-- TAMAMLANDI
