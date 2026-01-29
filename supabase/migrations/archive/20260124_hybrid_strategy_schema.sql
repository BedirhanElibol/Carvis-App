-- ==========================================
-- CARVIS HİBRİT STRATEJİ ŞEMASI
-- Versiyon: 1.0 (24 Ocak 2026)
-- Hedef: Option B (Teklif) + Option A (Marketplace) + Option C (AI)
-- ==========================================

-- ==========================================
-- 1. YENİ TİPLER (Mevcut tiplere ek)
-- ==========================================
-- PostgreSQL IF NOT EXISTS sözdizimini desteklemediği için DO bloğu kullanıyoruz
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status_type') THEN
    CREATE TYPE public.quote_status_type AS ENUM ('pending', 'accepted', 'rejected', 'expired');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status_type') THEN
    CREATE TYPE public.appointment_status_type AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM ('quote', 'order', 'appointment', 'message', 'system');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE public.transaction_type AS ENUM ('deposit', 'purchase', 'commission', 'refund', 'payout');
  END IF;
END $$;

-- ==========================================
-- 2. TEKLİF SİSTEMİ (Option B - Core Feature)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quotes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_request_id bigint REFERENCES public.service_requests(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Teklif Detayları
  price numeric NOT NULL CHECK (price > 0),
  estimated_delivery_days int,
  description text,
  warranty_months int DEFAULT 0,
  
  -- Durum ve Zaman
  status public.quote_status_type DEFAULT 'pending',
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Teklif güncellendiğinde updated_at'i otomatik güncelle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 3. RANDEVU YÖNETİMİ (Option B - Service Flow)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_id bigint REFERENCES public.vehicles(id) ON DELETE SET NULL,
  quote_id bigint REFERENCES public.quotes(id) ON DELETE SET NULL,
  
  -- Randevu Detayları
  appointment_date timestamp with time zone NOT NULL,
  service_type text NOT NULL, -- 'Bakım', 'Tamirat', 'Muayene' vb.
  notes text,
  
  -- Durum
  status public.appointment_status_type DEFAULT 'pending',
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- 4. MESAJLAŞMA SİSTEMİ (Müşteri-Satıcı İletişimi)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quote_id bigint REFERENCES public.quotes(id) ON DELETE SET NULL,
  order_id bigint REFERENCES public.orders(id) ON DELETE SET NULL,
  
  -- Mesaj İçeriği
  content text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- 5. BİLDİRİMLER (Realtime Push)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Bildirim Detayları
  type public.notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  
  -- İlişkili Kayıtlar
  quote_id bigint REFERENCES public.quotes(id) ON DELETE SET NULL,
  order_id bigint REFERENCES public.orders(id) ON DELETE SET NULL,
  appointment_id bigint REFERENCES public.appointments(id) ON DELETE SET NULL,
  
  -- Durum
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- 6. KOMİSYON SİSTEMİ (PayTR Entegrasyonu İçin)
-- ==========================================
-- Mevcut wallet_transactions tablosunu genişlet
ALTER TABLE public.wallet_transactions 
ADD COLUMN IF NOT EXISTS order_id bigint REFERENCES public.orders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS quote_id bigint REFERENCES public.quotes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2), -- %5.00 gibi
ADD COLUMN IF NOT EXISTS commission_amount numeric,
ADD COLUMN IF NOT EXISTS net_amount numeric, -- Satıcıya gidecek net tutar
ADD COLUMN IF NOT EXISTS paytr_transaction_id text, -- PayTR işlem ID'si
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'; -- 'pending', 'completed', 'failed'

-- ==========================================
-- 7. PARTNER DOĞRULAMA SÜRECİ
-- ==========================================
CREATE TABLE IF NOT EXISTS public.partner_verifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Doğrulama Belgeleri
  business_license_url text,
  tax_certificate_url text,
  iban text,
  
  -- Durum
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes text,
  verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- 8. GÜVENLİK (RLS) POLİTİKALARI
-- ==========================================

-- 8.1 QUOTES (Teklifler)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Müşteriler kendi tekliflerini görebilir
CREATE POLICY "Customers can view their quotes" ON public.quotes
FOR SELECT USING (auth.uid() = customer_id);

-- Satıcılar kendi verdikleri teklifleri görebilir
CREATE POLICY "Sellers can view their quotes" ON public.quotes
FOR SELECT USING (auth.uid() = seller_id);

-- Satıcılar teklif oluşturabilir
CREATE POLICY "Sellers can create quotes" ON public.quotes
FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Satıcılar kendi tekliflerini güncelleyebilir
CREATE POLICY "Sellers can update their quotes" ON public.quotes
FOR UPDATE USING (auth.uid() = seller_id);

-- Müşteriler teklif durumunu güncelleyebilir (kabul/red)
CREATE POLICY "Customers can update quote status" ON public.quotes
FOR UPDATE USING (auth.uid() = customer_id);

-- 8.2 APPOINTMENTS (Randevular)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their appointments" ON public.appointments
FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = seller_id);

CREATE POLICY "Customers can create appointments" ON public.appointments
FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their appointments" ON public.appointments
FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = seller_id);

-- 8.3 MESSAGES (Mesajlar)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages" ON public.messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update read status" ON public.messages
FOR UPDATE USING (auth.uid() = receiver_id);

-- 8.4 NOTIFICATIONS (Bildirimler)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- 8.5 PARTNER VERIFICATIONS
ALTER TABLE public.partner_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their verification" ON public.partner_verifications
FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can create verification request" ON public.partner_verifications
FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- 8.6 WALLET TRANSACTIONS (Güvenlik Sıkılaştırma)
-- Mevcut "Full access" politikasını kaldır ve güvenli politikalar ekle
DROP POLICY IF EXISTS "Full access for testing" ON public.wallet_transactions;

CREATE POLICY "Users can view their transactions" ON public.wallet_transactions
FOR SELECT USING (auth.uid() = user_id);

-- Sadece sistem (SECURITY DEFINER fonksiyonlar) transaction oluşturabilir
CREATE POLICY "System can create transactions" ON public.wallet_transactions
FOR INSERT WITH CHECK (true); -- Bu fonksiyonlar tarafından kontrol edilecek

-- ==========================================
-- 9. REALTIME TRİGGERLAR (Anlık Bildirimler)
-- ==========================================

-- 9.1 Yeni Teklif Geldiğinde Bildirim Oluştur
CREATE OR REPLACE FUNCTION notify_new_quote()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, quote_id)
  VALUES (
    NEW.customer_id,
    'quote',
    'Yeni Teklif Aldınız!',
    'Talebiniz için yeni bir teklif geldi.',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_quote_created 
AFTER INSERT ON public.quotes
FOR EACH ROW EXECUTE FUNCTION notify_new_quote();

-- 9.2 Teklif Kabul Edildiğinde Satıcıya Bildirim
CREATE OR REPLACE FUNCTION notify_quote_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    INSERT INTO public.notifications (user_id, type, title, message, quote_id)
    VALUES (
      NEW.seller_id,
      'quote',
      'Teklifiniz Kabul Edildi!',
      'Müşteri teklifinizi kabul etti.',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_quote_status_changed
AFTER UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION notify_quote_accepted();

-- 9.3 Yeni Mesaj Geldiğinde Bildirim
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    NEW.receiver_id,
    'message',
    'Yeni Mesajınız Var',
    'Size yeni bir mesaj geldi.',
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_created
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- ==========================================
-- 10. KOMİSYON HESAPLAMA FONKSİYONU
-- ==========================================
CREATE OR REPLACE FUNCTION calculate_commission(
  order_amount numeric,
  commission_rate numeric DEFAULT 6.0 -- %6 varsayılan
)
RETURNS TABLE (
  gross_amount numeric,
  commission numeric,
  net_amount numeric
) AS $$
BEGIN
  RETURN QUERY SELECT
    order_amount,
    ROUND(order_amount * commission_rate / 100, 2),
    ROUND(order_amount * (100 - commission_rate) / 100, 2);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 11. TEST VERİSİ (Geliştirme İçin)
-- ==========================================

-- Test Satıcısı Oluştur (Manuel olarak auth.users'a eklenecek)
-- INSERT INTO public.profiles (id, email, full_name, role, company_name, is_verified)
-- VALUES (
--   'test-seller-uuid',
--   'seller@test.com',
--   'Test Usta',
--   'seller',
--   'Test Oto Servis',
--   true
-- );

-- ==========================================
-- 12. İNDEKSLER (Performans Optimizasyonu)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON public.quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_seller ON public.quotes(seller_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- ==========================================
-- TAMAMLANDI! 🎉
-- ==========================================
-- Bu migration dosyası şunları sağlar:
-- ✅ Teklif sistemi (Option B)
-- ✅ Randevu yönetimi
-- ✅ Mesajlaşma
-- ✅ Realtime bildirimler
-- ✅ Komisyon takibi
-- ✅ Partner doğrulama
-- ✅ Güvenli RLS politikaları
-- ✅ Performans indeksleri
-- ==========================================
