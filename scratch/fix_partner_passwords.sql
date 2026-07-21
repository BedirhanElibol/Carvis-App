-- =========================================================
-- CARVIS PARTNER SIFRE GUNCELLEME
-- Bu SQL'i Supabase Dashboard > SQL Editor'da calistirin
-- =========================================================

-- Oncelikle mevcut partner kullanicilarin sifrelerini guncelleyelim
-- Sifre: carvis123

DO $$
DECLARE
    encrypted_pw TEXT;
BEGIN
    encrypted_pw := crypt('carvis123', gen_salt('bf', 10));

    -- Mechanic
    UPDATE auth.users SET 
        encrypted_password = encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE email = 'mechanic@carvis.com';

    -- Parts
    UPDATE auth.users SET 
        encrypted_password = encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE email = 'parts@carvis.com';

    -- Carwash
    UPDATE auth.users SET 
        encrypted_password = encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE email = 'carwash@carvis.com';

    -- Tow
    UPDATE auth.users SET 
        encrypted_password = encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE email = 'tow@carvis.com';

    -- Insurance
    UPDATE auth.users SET 
        encrypted_password = encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE email = 'insurance@carvis.com';

    RAISE NOTICE 'Tum partner sifreleri "carvis123" olarak guncellendi.';
END $$;

-- Dogrulama: Guncellenen kullanicilari listeleyelim
SELECT id, email, email_confirmed_at, updated_at 
FROM auth.users 
WHERE email IN (
    'mechanic@carvis.com',
    'parts@carvis.com', 
    'carwash@carvis.com',
    'tow@carvis.com',
    'insurance@carvis.com'
);
