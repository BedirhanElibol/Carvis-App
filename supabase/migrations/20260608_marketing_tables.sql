-- Create whatsapp_leads table
CREATE TABLE IF NOT EXISTS public.whatsapp_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'replied', 'failed')),
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create whatsapp_campaigns table
CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    daily_limit INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.whatsapp_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;

-- Allow access for authenticated users
CREATE POLICY "Allow full access for authenticated users on whatsapp_leads" ON public.whatsapp_leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access for authenticated users on whatsapp_campaigns" ON public.whatsapp_campaigns FOR ALL USING (auth.role() = 'authenticated');

-- Setup realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_campaigns;
