-- 20260713_add_product_compatibility.sql
-- Add compatibility JSONB column to products table and seed data

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS compatibility JSONB DEFAULT '[]'::jsonb;

-- Update existing seeded products with mock compatibility data for better demonstration
UPDATE public.products
SET compatibility = '[{"brand": "Fiat", "model": "Egea"}, {"brand": "Renault", "model": "Clio"}]'::jsonb
WHERE category = 'Fren Sistemi' OR name ILIKE '%balata%';

UPDATE public.products
SET compatibility = '[{"brand": "Volkswagen", "model": "Golf"}, {"brand": "Ford", "model": "Focus"}]'::jsonb
WHERE category = 'Filtreler' OR name ILIKE '%filtre%';

UPDATE public.products
SET compatibility = '[{"brand": "Toyota", "model": "Corolla"}, {"brand": "Honda", "model": "Civic"}]'::jsonb
WHERE category = 'Motor Parçaları' OR name ILIKE '%buji%' OR name ILIKE '%kayış%';

UPDATE public.products
SET compatibility = '[]'::jsonb
WHERE compatibility IS NULL;
