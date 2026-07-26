-- ============================================================================
-- MIGRATION: 20260502_REALISTIC_RESERVATIONS_AND_ORDERS_SEED.sql
-- DESCRIPTION: Ensures live status columns and inserts realistic sample seed data 
--              for appointments (Service, Wash, Valet, Towing) and store orders.
-- ============================================================================

-- 1. Ensure appointments RLS and policies
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
CREATE POLICY "Users can view their own appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can insert their own appointments" ON public.appointments;
CREATE POLICY "Users can insert their own appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
CREATE POLICY "Users can update their own appointments" ON public.appointments
    FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = seller_id);

-- 2. Ensure orders RLS and policies
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = seller_id);

-- 3. Add helper columns to orders if not existing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
        ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'carrier_name') THEN
        ALTER TABLE public.orders ADD COLUMN carrier_name TEXT DEFAULT 'Yurtiçi Kargo';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_address TEXT;
    END IF;
END $$;

-- 4. Helper function to seed realistic user appointments and orders automatically for existing vehicles & profiles
DO $$
DECLARE
    v_user_id UUID;
    v_vehicle_id UUID;
    v_appoint_id UUID;
    v_order_id UUID;
BEGIN
    -- Get first profile ID if available
    SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    -- Get first vehicle ID if available
    SELECT id INTO v_vehicle_id FROM public.vehicles LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        -- Seed Appointment 1: Completed Periodic Maintenance
        INSERT INTO public.appointments (
            customer_id, vehicle_id, service_type, appointment_date, status, completed_at, created_at
        ) VALUES (
            v_user_id, v_vehicle_id, 'Oto Servis & Periyodik Bakım', NOW() - INTERVAL '15 days', 'completed', NOW() - INTERVAL '15 days', NOW() - INTERVAL '18 days'
        ) ON CONFLICT DO NOTHING;

        -- Seed Appointment 2: Approved Upcoming Carwash
        INSERT INTO public.appointments (
            customer_id, vehicle_id, service_type, appointment_date, status, created_at
        ) VALUES (
            v_user_id, v_vehicle_id, 'Detaylı Oto Yıkama & Cilalama', NOW() + INTERVAL '2 days', 'approved', NOW() - INTERVAL '1 day'
        ) ON CONFLICT DO NOTHING;

        -- Seed Appointment 3: Pending Valet Reservation
        INSERT INTO public.appointments (
            customer_id, vehicle_id, service_type, appointment_date, status, created_at
        ) VALUES (
            v_user_id, v_vehicle_id, 'Vale İle Servis Transfer Hizmeti', NOW() + INTERVAL '5 days', 'pending', NOW() - INTERVAL '3 hours'
        ) ON CONFLICT DO NOTHING;

        -- Seed Order 1: Shipped Brembo Brake Discs Order
        INSERT INTO public.orders (
            customer_id, total_amount, payment_method, status, tracking_number, carrier_name, shipping_address, paid_at, created_at
        ) VALUES (
            v_user_id, 3450.00, 'Kredi Kartı', 'shipped', 'YK-849204192', 'Yurtiçi Kargo', 'Atatürk Mah. Karanfil Sok. No:14 Kadıköy / İstanbul', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
        ) ON CONFLICT DO NOTHING;

        -- Seed Order 2: Delivered Bosch Wiper Set
        INSERT INTO public.orders (
            customer_id, total_amount, payment_method, status, tracking_number, carrier_name, shipping_address, paid_at, completed_at, created_at
        ) VALUES (
            v_user_id, 650.00, 'Cüzdan', 'delivered', 'MNG-93019284', 'MNG Kargo', 'Barbaros Bulvarı No:88 Beşiktaş / İstanbul', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '10 days'
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;
