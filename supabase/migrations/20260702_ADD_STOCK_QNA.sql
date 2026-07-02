-- Migration: Add Q&A features
-- Description: Creates product_qna table

-- 2. Create product_qna table
CREATE TABLE IF NOT EXISTS public.product_qna (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id INTEGER REFERENCES public.oem_parts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE
);

-- 3. RLS for product_qna
ALTER TABLE public.product_qna ENABLE ROW LEVEL SECURITY;

-- Anyone can read public Q&A
CREATE POLICY "Public Q&A are viewable by everyone" ON public.product_qna
    FOR SELECT USING (is_public = true);

-- Users can read their own private Q&A
CREATE POLICY "Users can view own private Q&A" ON public.product_qna
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = seller_id);

-- Authenticated users can insert questions
CREATE POLICY "Authenticated users can insert questions" ON public.product_qna
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sellers can update (answer) questions directed to them
CREATE POLICY "Sellers can update questions" ON public.product_qna
    FOR UPDATE USING (auth.uid() = seller_id);
