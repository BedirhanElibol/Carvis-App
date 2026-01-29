-- ==========================================
-- CHAT VE BİLDİRİM REALTIME AKTİVASYONU
-- ==========================================

-- 1. Realtime Yayınını (Publication) Kontrol Et ve Ekle
-- Supabase otomatik olarak 'supabase_realtime' adında bir yayın oluşturur.
-- Eğer yoksa oluşturalım:
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- 2. Tabloları Realtime Yayınlarına Ekle
-- Bu komutlar tabloların anlık değişikliğini istemcilere (frontend) haber verir.

-- Mesajlar için
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Bildirimler için
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Teklifler için (Durum değişikliği anlık görünsün)
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;

-- Randevular için
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- ==========================================
-- TAMAMLANDI!
-- ==========================================
