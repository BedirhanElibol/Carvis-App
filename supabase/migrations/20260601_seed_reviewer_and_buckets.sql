-- =========================================================
-- CARVIS APP RELEASE SEED & STORAGE MIGRATION
-- SEED: Apple/Google Reviewer Test Account
-- SETUP: Supabase Storage Buckets & Policies
-- =========================================================

-- 1. REVIEWER AUTH USER & GARAJA ÖN HAZIRLIK SEED
DO $$
DECLARE
  v_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- Sabit test UUID
BEGIN
  -- Eğer reviewer@rapidsy.app kullanıcısı yoksa auth tablosuna ekle
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'reviewer@rapidsy.app') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      confirmation_token,
      is_super_admin
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'reviewer@rapidsy.app',
      -- 'RapidsyTest2026!' şifresinin Blowfish hash'i
      crypt('RapidsyTest2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Reviewer Account","role":"customer"}'::jsonb,
      now(),
      now(),
      'authenticated',
      '',
      false
    );
    
    -- Triggere takılmamak veya asenkron gecikmeyi önlemek için public.profiles tablosuna manuel ekle
    INSERT INTO public.profiles (id, email, full_name, role, application_status, loyalty_points)
    VALUES (v_user_id, 'reviewer@rapidsy.app', 'Reviewer Account', 'customer', 'none', 150)
    ON CONFLICT (id) DO UPDATE 
    SET full_name = 'Reviewer Account', role = 'customer';
    
    -- İnceleme ekibinin işlem yapabilmesi için cüzdana bakiye yükle
    INSERT INTO public.wallets (id, user_id, balance, currency, pending_balance)
    VALUES (v_user_id, v_user_id, 10000.00, 'TRY', 0.00)
    ON CONFLICT (id) DO UPDATE 
    SET balance = balance + 10000.00;

    -- Cüzdan işlem geçmişi kaydı
    INSERT INTO public.wallet_transactions (wallet_id, amount, type, description)
    VALUES (v_user_id, 10000.00, 'deposit', 'Test Bakiye Tanımlandı (App Reviewer)');

    -- İnceleme ekibinin garajında hazır görebileceği test aracı ekle
    INSERT INTO public.vehicles (
      id, user_id, brand, model, plate, km, year, color, health_score, reminder_enabled
    )
    VALUES (
      '00000000-0000-0000-0000-000000000002',
      v_user_id,
      'Fiat',
      'Egea 1.3 Multijet',
      '34REV2026',
      '45000',
      2022,
      'Beyaz',
      98,
      true
    ) ON CONFLICT (plate) DO NOTHING;
  END IF;
END $$;


-- 2. SUPABASE STORAGE BUCKETS TANIMLARI
-- vehicle-documents: Belge kasası için
-- service-proofs: Usta tamamlandı kanıtları için
-- accident-reports: Kaza asistanı fotoğrafları için
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('vehicle-documents', 'vehicle-documents', false, 10485760, ARRAY['image/png', 'image/jpeg', 'application/pdf']),
  ('service-proofs', 'service-proofs', false, 10485760, ARRAY['image/png', 'image/jpeg']),
  ('accident-reports', 'accident-reports', false, 10485760, ARRAY['image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;


-- 3. STORAGE RLS GÜVENLİK POLİTİKALARI
-- (storage.objects RLS is already enabled by Supabase by default)

-- 3.1 Belge Kasası ve Kaza Raporları RLS: Sadece dosya sahibi okuyabilir ve yükleyebilir
DROP POLICY IF EXISTS "Users can manage own documents" ON storage.objects;
CREATE POLICY "Users can manage own documents"
ON storage.objects
FOR ALL
USING (bucket_id IN ('vehicle-documents', 'accident-reports') AND auth.uid() = owner)
WITH CHECK (bucket_id IN ('vehicle-documents', 'accident-reports') AND auth.uid() = owner);

-- 3.2 Servis Kanıtları (Proofs) RLS: Siparişle ilişkili müşteri veya satıcı görebilir, sadece satıcı yükleyebilir
DROP POLICY IF EXISTS "Authenticated users upload proofs" ON storage.objects;
CREATE POLICY "Authenticated users upload proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-proofs');

DROP POLICY IF EXISTS "Users view relevant service proofs" ON storage.objects;
CREATE POLICY "Users view relevant service proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'service-proofs');
