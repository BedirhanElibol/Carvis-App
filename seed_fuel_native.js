const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;


async function seed() {
  const data = [
    { province_code: '34', benzin: 43.77, motorin: 41.35, lpg: 22.80 },
    { province_code: '06', benzin: 44.52, motorin: 42.15, lpg: 22.85 },
    { province_code: '35', benzin: 44.75, motorin: 42.30, lpg: 22.60 }
  ];
  
  const response = await fetch(`${supabaseUrl}/rest/v1/live_fuel_prices`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    console.error('Error:', await response.text());
  } else {
    console.log('Successfully seeded live_fuel_prices');
  }
}
seed();
