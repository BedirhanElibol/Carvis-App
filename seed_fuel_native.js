const supabaseUrl = 'https://gieclpczrozblvauxjhf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZWNscGN6cm96Ymx2YXV4amhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDM2NTYsImV4cCI6MjA4MTQ3OTY1Nn0.Cnag3S4Jj6VF8JU4aEYSLUZlVZhjtLZRrKb-BMHWyRA';

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
