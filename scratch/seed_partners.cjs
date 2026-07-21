const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://gieclpczrozblvauxjhf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZWNscGN6cm96Ymx2YXV4amhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDM2NTYsImV4cCI6MjA4MTQ3OTY1Nn0.Cnag3S4Jj6VF8JU4aEYSLUZlVZhjtLZRrKb-BMHWyRA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PARTNERS = [
  {
    email: "mechanic@carvis.com",
    password: "carvis123",
    full_name: "Ozgur Oto Servis",
    phone: "+905550000006",
    subProfile: "mechanic",
  },
  {
    email: "parts@carvis.com",
    password: "carvis123",
    full_name: "Yedek Parca Deposu",
    phone: "+905550000003",
    subProfile: "parts",
  },
  {
    email: "carwash@carvis.com",
    password: "carvis123",
    full_name: "Mobil Oto Yikama",
    phone: "+905550000004",
    subProfile: "carwash",
  },
  {
    email: "tow@carvis.com",
    password: "carvis123",
    full_name: "Cekici Guven",
    phone: "+905550000005",
    subProfile: "tow_truck",
  },
  {
    email: "insurance@carvis.com",
    password: "carvis123",
    full_name: "Anadolu Kasko",
    phone: "+905550000007",
    subProfile: "insurance",
  },
];

async function seedPartner(partner) {
  console.log(`\n--- Seeding: ${partner.email} ---`);

  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: partner.email,
    password: partner.password,
    options: {
      data: { full_name: partner.full_name },
    },
  });

  if (authError) {
    // User might already exist - try sign in
    if (authError.message.includes("already registered") || authError.status === 422) {
      console.log(`  User already exists, signing in...`);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: partner.email,
        password: partner.password,
      });
      if (signInError) {
        console.error(`  Sign-in failed: ${signInError.message}`);
        return null;
      }
      console.log(`  Signed in as: ${signInData.user.id}`);
      return signInData.user;
    }
    console.error(`  Auth error: ${authError.message}`);
    return null;
  }

  if (!authData.user) {
    console.error(`  No user returned from signUp`);
    return null;
  }

  console.log(`  Created user: ${authData.user.id}`);
  return authData.user;
}

async function upsertProfile(userId, partner) {
  console.log(`  Upserting profile...`);
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: partner.email,
      full_name: partner.full_name,
      role: "partner",
      application_status: "approved",
      phone_number: partner.phone,
      is_approved_partner: true,
      is_active_provider: true,
    },
    { onConflict: "id" }
  );
  if (error) {
    console.error(`  Profile upsert error: ${error.message}`);
    return false;
  }
  console.log(`  Profile OK`);
  return true;
}

async function upsertWallet(userId) {
  console.log(`  Upserting wallet...`);
  const { error } = await supabase.from("wallets").upsert(
    {
      id: userId,
      user_id: userId,
      balance: 5000.0,
      currency: "TRY",
    },
    { onConflict: "id" }
  );
  if (error) {
    console.error(`  Wallet upsert error: ${error.message}`);
  } else {
    console.log(`  Wallet OK`);
  }
}

async function upsertSubProfile(userId, partner) {
  console.log(`  Upserting sub-profile: ${partner.subProfile}...`);
  let error;

  switch (partner.subProfile) {
    case "mechanic": {
      const { error: e } = await supabase.from("mechanic_shops").upsert(
        {
          seller_id: userId,
          shop_name: "Ozgur Oto Ozel Servis",
          brands: ["Fiat", "Renault", "Volkswagen", "Toyota", "Ford"],
          rating: 4.9,
          experience_years: 12,
          is_active: true,
        },
        { onConflict: "seller_id", ignoreDuplicates: true }
      );
      error = e;
      break;
    }
    case "parts": {
      const { error: e } = await supabase.from("parts_profiles").upsert(
        {
          id: userId,
          business_name: "Ostim Yedek Parca Toptancisi",
          delivery_radius_km: 150,
          store_type: "wholesale",
          tax_info: "9876543210",
          is_warehouse_direct: true,
          categories: ["Fren Sistemi", "Filtreler", "Motor Parcalari"],
        },
        { onConflict: "id" }
      );
      error = e;
      break;
    }
    case "carwash": {
      const { error: e } = await supabase.from("carwash_profiles").upsert(
        {
          id: userId,
          company_name: "Mobil Eco Oto Yikama",
          base_price: 250.0,
          service_radius_km: 20,
          has_own_water_tank: true,
          has_generator: true,
          is_eco_friendly: true,
          seller_id: userId,
          rating: 4.8,
        },
        { onConflict: "id" }
      );
      error = e;
      break;
    }
    case "tow_truck": {
      const { error: e } = await supabase.from("tow_truck_profiles").upsert(
        {
          id: userId,
          company_name: "Guven Yol Yardim ve Cekici",
          service_types: ["towing", "tire_change", "battery_boost"],
          truck_capacity_tons: 4.0,
          is_24_7: true,
          response_time_minutes: 20,
          coverage_provinces: ["Ankara", "Kirikkale"],
          has_flatbed: true,
          base_price: 600.0,
          price_per_km: 20.0,
          is_active_now: true,
          rating: 4.7,
        },
        { onConflict: "id" }
      );
      error = e;
      break;
    }
    case "insurance": {
      const { error: e } = await supabase
        .from("insurance_company_profiles")
        .upsert(
          {
            id: userId,
            company_name: "Anadolu Sigorta Carvis Grubu",
            license_number: "SIG-556677",
            company_type: ["kasko", "trafik"],
            policy_types: ["Kasko Full Guvence", "Zorunlu Trafik Sigortasi"],
            coverage_limit_max: 5000000.0,
            monthly_premium_min: 200.0,
            monthly_premium_max: 2500.0,
            is_digital_policy: true,
            partner_garage_network_count: 120,
            is_rapidsy_integrated: true,
            is_24_7_support: true,
            rating: 4.8,
          },
          { onConflict: "id" }
        );
      error = e;
      break;
    }
  }

  if (error) {
    console.error(`  Sub-profile error: ${error.message}`);
  } else {
    console.log(`  Sub-profile OK`);
  }
}

async function main() {
  console.log("========================================");
  console.log("  CARVIS PARTNER SEED SCRIPT");
  console.log("========================================");

  for (const partner of PARTNERS) {
    const user = await seedPartner(partner);
    if (!user) continue;

    await upsertProfile(user.id, partner);
    await upsertWallet(user.id);
    await upsertSubProfile(user.id, partner);

    // Sign out after each to avoid session conflicts
    await supabase.auth.signOut();
  }

  console.log("\n========================================");
  console.log("  SEED COMPLETE");
  console.log("========================================");
  console.log("\nPartner Login Credentials:");
  console.log("Password: carvis123 (all accounts)");
  PARTNERS.forEach((p) => {
    console.log(`  ${p.subProfile.padEnd(12)} -> ${p.email}`);
  });
}

main().catch(console.error);
