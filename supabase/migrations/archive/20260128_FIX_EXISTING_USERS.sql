-- ==========================================
-- CARVIS - FIX: EXISTING PROFILES
-- "Profil bulunamadı" sorununu çözer.
-- auth.users tablosundaki mevcut kullanıcıları public.profiles'a kopyalar.
-- ==========================================

INSERT INTO public.profiles (id, full_name, role, created_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    COALESCE(raw_user_meta_data->>'role', 'customer') as role,
    created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;

-- Ayrıca Cüzdanları da oluştur (Eksikse)
INSERT INTO public.wallets (user_id, balance)
SELECT id, 0 
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- Admin Yetkisini Tekrar Garantiye Al (E-postanızı buraya yazın veya çalıştırdıktan sonra önceki kodu tekrar çalıştırın)
-- UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'bedirelibol7@gmail.com');
