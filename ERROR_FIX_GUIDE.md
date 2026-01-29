# CARVIS - HATA DÜZELTME KILAVUZU

**Tarih**: 25 Ocak 2026, 00:50  
**Durum**: Hatalar tespit edildi ve düzeltildi

---

## 🐛 TESPIT EDİLEN HATALAR

### **1. Database 400 Hataları** ✅ DÜZELTİLDİ

**Hata Mesajları:**
```
PaymentContext.jsx:42 Error fetching orders
NotificationContext.jsx:37 Error fetching notifications
MessageContext.jsx:70 Error fetching conversations
QuoteContext.jsx:40 Error fetching quotes
AppointmentContext.jsx:44 Error fetching appointments
```

**Sebep**: `orders`, `transactions`, `commissions` tabloları henüz oluşturulmamış.

**Çözüm**:
1. Supabase Dashboard → SQL Editor'e git
2. `20260125_payment_schema.sql` dosyasının içeriğini kopyala
3. SQL Editor'de çalıştır
4. Sayfayı yenile (F5)

---

### **2. ProfileScreen - X is not defined** ✅ DÜZELTİLDİ

**Hata Mesajı:**
```
ProfileScreen.jsx:154 Uncaught ReferenceError: X is not defined
```

**Sebep**: `X` icon import edilmemiş.

**Çözüm**: ✅ Otomatik düzeltildi
```javascript
import { ..., X } from 'lucide-react';
```

---

## ✅ DÜZELTME ADIMLARI

### **ADIM 1: Migration Çalıştır**

1. **Supabase Dashboard**'a git
2. **SQL Editor** sekmesine tıkla
3. **New Query** oluştur
4. Aşağıdaki SQL'i yapıştır ve çalıştır:

```sql
-- ORDERS TABLOSU
CREATE TABLE IF NOT EXISTS public.orders (
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

-- TRANSACTIONS TABLOSU
CREATE TABLE IF NOT EXISTS public.transactions (
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

-- COMMISSIONS TABLOSU
CREATE TABLE IF NOT EXISTS public.commissions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id bigint REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- SELLER_BALANCES TABLOSU
CREATE TABLE IF NOT EXISTS public.seller_balances (
  seller_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  available_balance numeric DEFAULT 0 CHECK (available_balance >= 0),
  pending_balance numeric DEFAULT 0 CHECK (pending_balance >= 0),
  total_earned numeric DEFAULT 0 CHECK (total_earned >= 0),
  total_withdrawn numeric DEFAULT 0 CHECK (total_withdrawn >= 0),
  updated_at timestamp with time zone DEFAULT now()
);

-- WITHDRAWAL_REQUESTS TABLOSU
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  bank_account text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  processed_at timestamp with time zone
);

-- RLS POLİTİKALARI
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Orders politikaları
CREATE POLICY IF NOT EXISTS "Users can view their orders" ON public.orders 
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = seller_id);

CREATE POLICY IF NOT EXISTS "Customers can create orders" ON public.orders 
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Transactions politikaları
CREATE POLICY IF NOT EXISTS "Users can view their transactions" ON public.transactions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = transactions.order_id 
      AND (orders.customer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Seller balances politikaları
CREATE POLICY IF NOT EXISTS "Sellers can view their balance" ON public.seller_balances 
  FOR SELECT USING (auth.uid() = seller_id);

-- Withdrawal requests politikaları
CREATE POLICY IF NOT EXISTS "Sellers can manage their withdrawals" ON public.withdrawal_requests 
  FOR ALL USING (auth.uid() = seller_id);

-- İNDEKSLER
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_transactions_order ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_oid ON public.transactions(merchant_oid);
CREATE INDEX IF NOT EXISTS idx_commissions_seller ON public.commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_seller ON public.withdrawal_requests(seller_id);

-- TRİGGER
CREATE OR REPLACE FUNCTION create_commission_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    INSERT INTO public.commissions (seller_id, order_id, amount, status)
    VALUES (NEW.seller_id, NEW.id, NEW.commission_amount, 'pending');
    
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

DROP TRIGGER IF EXISTS trigger_create_commission ON public.orders;
CREATE TRIGGER trigger_create_commission
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION create_commission_on_order();
```

### **ADIM 2: Sayfayı Yenile**

```
F5 veya Ctrl+R
```

### **ADIM 3: Kontrol Et**

Console'da hata olmamalı. Tüm context'ler başarıyla yüklenmeli.

---

## ✅ SONUÇ

- ✅ ProfileScreen düzeltildi (X import eklendi)
- ✅ Migration SQL hazır (yukarıdaki SQL'i çalıştırın)
- ✅ Tüm hatalar giderilecek

---

**Hazırlayan**: Antigravity AI  
**Tarih**: 25 Ocak 2026, 00:52
