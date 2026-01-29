-- ==========================================
-- CARVIS - COMMISSION LOGIC UPDATE
-- Eski 'seller_balances' yerine 'wallets' tablosunu kullanır
-- ==========================================

-- 1. Trigger Fonksiyonunu Güncelle
CREATE OR REPLACE FUNCTION create_commission_on_order()
RETURNS TRIGGER AS $$
DECLARE
  v_commission_amount numeric;
  v_seller_amount numeric;
BEGIN
  -- Sadece 'paid' durumuna geçişte çalış
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    
    -- Komisyon Hesabı
    v_commission_amount := NEW.commission_amount;
    v_seller_amount := NEW.seller_amount;

    -- 1. Komisyon Tablosuna Kayıt
    INSERT INTO public.commissions (seller_id, order_id, amount, status)
    VALUES (NEW.seller_id, NEW.id, v_commission_amount, 'paid'); -- Status 'paid' çünkü para zaten alındı (Platform'da)
    
    -- 2. Satıcı Cüzdanını Güncelle (Bakiye Ekle)
    UPDATE public.wallets 
    SET 
        balance = balance + v_seller_amount, 
        updated_at = now()
    WHERE user_id = NEW.seller_id;

    -- 3. Cüzdan İşlem Geçmişine Ekle (Gelir)
    INSERT INTO public.wallet_transactions (wallet_id, amount, type, status, description, reference_id)
    VALUES (
        NEW.seller_id, 
        v_seller_amount, 
        'deposit', 
        'completed', 
        'Hizmet Geliri (Sipariş #' || NEW.id || ')', 
        NEW.id::text
    );

  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger zaten tanımlı olduğu için (create_commission_on_order), fonksiyonu güncellemek yeterli.
-- Ancak emin olmak için trigger'ı drop/create yapabiliriz.

DROP TRIGGER IF EXISTS trigger_create_commission ON public.orders;
CREATE TRIGGER trigger_create_commission
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION create_commission_on_order();

-- Eski tabloyu temizle (Opsiyonel, veri kaybı olmasın diye şimdilik kalsın)
-- DROP TABLE IF EXISTS public.seller_balances;

-- TAMAMLANDI
