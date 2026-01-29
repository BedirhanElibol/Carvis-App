-- ==========================================
-- CARVIS - KESİN ÇÖZÜM: ÖDEME ŞEMASI SIFIRLAMA
-- Önceki hatalı tabloları siler ve doğru şemayı kurar
-- ==========================================

-- 1. BAĞIMLILIKLARI TEMİZLE (Sıralama Önemli)
DROP TRIGGER IF EXISTS trigger_create_commission ON public.orders;
DROP FUNCTION IF EXISTS create_commission_on_order();
DROP TABLE IF EXISTS public.withdrawal_requests CASCADE;
DROP TABLE IF EXISTS public.seller_balances CASCADE;
DROP TABLE IF EXISTS public.commissions CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- 2. ORDERS TABLOSU (Sıfırdan Doğru Şema)
CREATE TABLE public.orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quote_id bigint REFERENCES public.quotes(id) ON DELETE SET NULL,
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  commission_rate numeric DEFAULT 0.05 CHECK (commission_rate >= 0 AND commission_rate <= 1),
  commission_amount numeric GENERATED ALWAYS AS (total_amount * commission_rate) STORED,
  seller_amount numeric GENERATED ALWAYS AS (total_amount * (1 - commission_rate)) STORED,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled', 'refunded')),
  payment_method text DEFAULT 'paytr',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  paid_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- 3. TRANSACTIONS TABLOSU
CREATE TABLE public.transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id bigint REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  paytr_token text UNIQUE,
  merchant_oid text UNIQUE NOT NULL,
  payment_amount numeric NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'cancelled')),
  paytr_response jsonb,
  error_message text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. COMMISSIONS TABLOSU
CREATE TABLE public.commissions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id bigint REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. SELLER_BALANCES TABLOSU
CREATE TABLE public.seller_balances (
  seller_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  available_balance numeric DEFAULT 0 CHECK (available_balance >= 0),
  pending_balance numeric DEFAULT 0 CHECK (pending_balance >= 0),
  total_earned numeric DEFAULT 0 CHECK (total_earned >= 0),
  total_withdrawn numeric DEFAULT 0 CHECK (total_withdrawn >= 0),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. WITHDRAWAL_REQUESTS TABLOSU
CREATE TABLE public.withdrawal_requests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  bank_account text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  processed_at timestamp with time zone
);

-- 7. GÜVENLİK (RLS) AKTİFLEŞTİR
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- 8. POLİTİKALAR

-- Orders Politikaları
CREATE POLICY "Users can view their orders" ON public.orders 
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = seller_id);

CREATE POLICY "Customers can create orders" ON public.orders 
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update orders" ON public.orders 
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = seller_id);

-- Transactions Politikaları
CREATE POLICY "Users can view transactions" ON public.transactions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = transactions.order_id 
      AND (orders.customer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "Allow system actions on transactions" ON public.transactions 
  FOR ALL USING (true);

-- Balance Politikaları
CREATE POLICY "Sellers can view balance" ON public.seller_balances 
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Allow system actions on balances" ON public.seller_balances 
  FOR ALL USING (true);

-- Withdrawal Politikaları
CREATE POLICY "Sellers manage withdrawals" ON public.withdrawal_requests 
  FOR ALL USING (auth.uid() = seller_id);

-- 9. İNDEKSLER
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);
CREATE INDEX idx_transactions_oid ON public.transactions(merchant_oid);

-- 10. KOMİSYON VE BAKİYE OTOMASYONU (Trigger)
CREATE OR REPLACE FUNCTION handle_payment_success()
RETURNS TRIGGER AS $$
BEGIN
  -- Sipariş "paid" (ödendi) durumuna geçtiğinde
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    -- Komisyon Kaydı
    INSERT INTO public.commissions (seller_id, order_id, amount, status)
    VALUES (NEW.seller_id, NEW.id, NEW.commission_amount, 'pending');
    
    -- Satıcı Bakiyesi Güncelle
    INSERT INTO public.seller_balances (seller_id, pending_balance, total_earned)
    VALUES (NEW.seller_id, NEW.seller_amount, NEW.total_amount)
    ON CONFLICT (seller_id) DO UPDATE
    SET 
      pending_balance = seller_balances.pending_balance + NEW.seller_amount,
      total_earned = seller_balances.total_earned + NEW.total_amount,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_success
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION handle_payment_success();

-- TAMAMLANDI!
-- Add role column to profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'customer';
        ALTER TABLE public.profiles ADD CONSTRAINT check_roles CHECK (role IN ('customer', 'parking', 'valet', 'mechanic', 'admin'));
    END IF;
END $$;

-- Create parking_lots table
CREATE TABLE IF NOT EXISTS public.parking_lots (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id uuid REFERENCES public.profiles(id) NOT NULL,
    name text NOT NULL,
    capacity integer DEFAULT 100,
    current_occupancy integer DEFAULT 0,
    price_hourly decimal(10,2) DEFAULT 0,
    location_lat float,
    location_lng float,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parking_lots ENABLE ROW LEVEL SECURITY;

-- Policies (Drop first to avoid conflicts if rerunning)
DROP POLICY IF EXISTS "Public read access" ON public.parking_lots;
DROP POLICY IF EXISTS "Owner update access" ON public.parking_lots;
DROP POLICY IF EXISTS "Owner insert access" ON public.parking_lots;

CREATE POLICY "Public read access" ON public.parking_lots FOR SELECT USING (true);
CREATE POLICY "Owner update access" ON public.parking_lots FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owner insert access" ON public.parking_lots FOR INSERT WITH CHECK (auth.uid() = owner_id);
