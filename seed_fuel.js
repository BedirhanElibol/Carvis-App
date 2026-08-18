
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const data = [
    { province_code: '34', benzin: '43.77', motorin: '41.35', lpg: '22.80' },
    { province_code: '06', benzin: '44.52', motorin: '42.15', lpg: '22.85' },
    { province_code: '35', benzin: '44.75', motorin: '42.30', lpg: '22.60' }
  ];
  
  const { data: res, error } = await supabase.from('live_fuel_prices').upsert(data, { onConflict: 'province_code' });
  if (error) console.error('Error:', error);
  else console.log('Successfully seeded live_fuel_prices');
}
seed();
