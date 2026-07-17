-- =========================================================
-- CARVIS SECURITY: ROW LEVEL SECURITY (RLS) POLICIES
-- DATE: 2026-07-17
-- =========================================================

-- 1. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);


-- 2. WALLETS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = id);


-- 3. WALLET TRANSACTIONS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet transactions" ON public.wallet_transactions
    FOR SELECT USING (auth.uid() = wallet_id);


-- 4. PRODUCTS (PARTS CATALOG)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Sellers can manage their own products" ON public.products
    FOR ALL USING (auth.uid() = seller_id);


-- 5. ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can manage their own orders" ON public.orders
    FOR ALL USING (auth.uid() = customer_id OR auth.uid() = seller_id);


-- 6. APPOINTMENTS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can manage their own appointments" ON public.appointments
    FOR ALL USING (auth.uid() = customer_id OR auth.uid() = seller_id);


-- 7. EMERGENCY REQUESTS (SOS)
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SOS requests are viewable by owner, assigned driver or search pool" ON public.emergency_requests
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        auth.uid() = assigned_provider_id OR 
        status = 'paid_searching'
    );

CREATE POLICY "SOS requests can be updated by customer or assigned driver" ON public.emergency_requests
    FOR UPDATE USING (
        auth.uid() = customer_id OR 
        auth.uid() = assigned_provider_id
    );

CREATE POLICY "SOS requests can be created by authenticated users" ON public.emergency_requests
    FOR INSERT WITH CHECK (auth.uid() = customer_id);


-- 8. CARWASH REQUESTS
ALTER TABLE public.carwash_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Carwash requests are viewable by owner, assigned provider or pool" ON public.carwash_requests
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        auth.uid() = provider_id OR 
        status = 'pending'
    );

CREATE POLICY "Carwash requests can be updated by customer or provider" ON public.carwash_requests
    FOR UPDATE USING (
        auth.uid() = customer_id OR 
        auth.uid() = provider_id
    );

CREATE POLICY "Carwash requests can be created by authenticated users" ON public.carwash_requests
    FOR INSERT WITH CHECK (auth.uid() = customer_id);


-- 9. INSURANCE QUOTES
ALTER TABLE public.insurance_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quotes are viewable by customer or company" ON public.insurance_quotes
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'partner'
        )
    );

CREATE POLICY "Quotes can be updated by customer or company" ON public.insurance_quotes
    FOR UPDATE USING (
        auth.uid() = customer_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'partner'
        )
    );


-- 10. INSURANCE CLAIMS
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Claims are viewable by customer or company" ON public.insurance_claims
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'partner'
        )
    );

CREATE POLICY "Claims can be updated by customer or company" ON public.insurance_claims
    FOR UPDATE USING (
        auth.uid() = customer_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'partner'
        )
    );
