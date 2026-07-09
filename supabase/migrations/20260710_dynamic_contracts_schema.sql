-- 20260710_dynamic_contracts_schema.sql
-- Dynamic Legal Contracts for Checkout Liability Protection

-- 1. Create table for Legal Templates
CREATE TABLE IF NOT EXISTS public.legal_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- 'mss' (Mesafeli Satis), 'obf' (On Bilgilendirme), 'kvkk'
    service_category TEXT NOT NULL, -- 'mechanic', 'parts', 'carwash', 'valet', 'parking'
    version TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for legal_templates
ALTER TABLE public.legal_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can read active templates
CREATE POLICY "Anyone can view active templates" 
ON public.legal_templates FOR SELECT 
USING (is_active = true);

-- 2. Create table for Order Legal Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS public.order_legal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID NOT NULL REFERENCES public.sellers(id),
    mss_version TEXT,
    obf_version TEXT,
    kvkk_version TEXT,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- RLS for order_legal_logs
ALTER TABLE public.order_legal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own order logs" 
ON public.order_legal_logs FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Sellers can view logs for their orders" 
ON public.order_legal_logs FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Customers can insert logs for their orders" 
ON public.order_legal_logs FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- 3. Insert Initial Templates (Mock Data)
INSERT INTO public.legal_templates (type, service_category, version, content) VALUES
('kvkk', 'carwash', '1.0.0', '<strong>KVKK Aydınlatma Metni:</strong> Anlık konum veriniz hizmetin ifası için işlenmektedir.'),
('mss', 'carwash', '1.0.0', '<strong>MESAFELİ SATIŞ SÖZLEŞMESİ</strong><br/><br/><strong>DİKKAT: Rapidsy yalnızca aracı platformdur. Tüm hukuki sorumluluk hizmet verene aittir.</strong><br/><br/>Hizmeti Veren: {{SELLER_COMPANY}}<br/>Müşteri: {{CUSTOMER_NAME}}<br/>Hizmet Bedeli: {{TOTAL_PRICE}} TL'),
('obf', 'carwash', '1.0.0', '<strong>ÖN BİLGİLENDİRME FORMU</strong><br/><br/>Hizmetin temel nitelikleri, süresi ve ek bedeller burada belirtilir.');
