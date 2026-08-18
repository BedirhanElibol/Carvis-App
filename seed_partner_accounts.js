import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gieclpczrozblvauxjhf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZWNscGN6cm96Ymx2YXV4amhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDM2NTYsImV4cCI6MjA4MTQ3OTY1Nn0.Cnag3S4Jj6VF8JU4aEYSLUZlVZhjtLZRrKb-BMHWyRA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const partnerAccounts = [
  {
    role: 'mechanic',
    email: 'usta@carvis.com',
    password: 'Password123!',
    companyName: 'Garanti Oto Servis Ltd. Şti.',
    phone: '05321112233',
    city: 'istanbul'
  },
  {
    role: 'parts',
    email: 'parca@carvis.com',
    password: 'Password123!',
    companyName: 'Egem Otomotiv Parça A.Ş.',
    phone: '05322223344',
    city: 'istanbul'
  },
  {
    role: 'carwash',
    email: 'yikama@carvis.com',
    password: 'Password123!',
    companyName: 'Mobil Parlak Yıkama Hizmetleri',
    phone: '05323334455',
    city: 'istanbul'
  },
  {
    role: 'tow_truck',
    email: 'cekici@carvis.com',
    password: 'Password123!',
    companyName: '7/24 Hızlı Yol Yardım & Çekici',
    phone: '05324445566',
    city: 'istanbul'
  },
  {
    role: 'valet',
    email: 'vale@carvis.com',
    password: 'Password123!',
    companyName: 'VIP Lüks Vale Hizmetleri',
    phone: '05325556677',
    city: 'istanbul'
  },
  {
    role: 'parking',
    email: 'otopark@carvis.com',
    password: 'Password123!',
    companyName: 'Merkez Güvenli Otopark',
    phone: '05326667788',
    city: 'istanbul'
  },
  {
    role: 'insurance',
    email: 'sigorta@carvis.com',
    password: 'Password123!',
    companyName: 'Anadolu Sigorta A.Ş.',
    phone: '05327778899',
    city: 'istanbul'
  },
  {
    role: 'admin',
    email: 'admin@carvis.com',
    password: 'Password123!',
    companyName: 'Rapidsy Platform Yöneticisi',
    phone: '05320000000',
    city: 'istanbul'
  },
  {
    role: 'partner',
    email: 'partner@carvis.com',
    password: 'Password123!',
    companyName: 'Tek Ortak Partner Hesabı',
    phone: '05329999999',
    city: 'istanbul'
  }
];

async function seedPartners() {
  console.log('Seeding 7 Partner Accounts...');

  for (const account of partnerAccounts) {
    try {
      console.log(`Processing [${account.role}] - ${account.email}...`);

      let userId = null;

      // 1. Try Signing Up
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            full_name: account.companyName,
            role: account.role
          }
        }
      });

      if (signUpError) {
        if (signUpError.message?.includes('User already registered')) {
          console.log(`  User ${account.email} already exists. Logging in to get ID...`);
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: account.email,
            password: account.password
          });
          if (loginError) {
            console.error(`  Login failed for ${account.email}:`, loginError.message);
            continue;
          }
          userId = loginData.user.id;
        } else {
          console.error(`  SignUp failed for ${account.email}:`, signUpError.message);
          continue;
        }
      } else {
        userId = authData?.user?.id;
      }

      if (!userId) {
        console.error(`  No userId for ${account.email}`);
        continue;
      }

      // 2. Update Profile to Approved Partner
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: account.email,
        full_name: account.companyName,
        phone_number: account.phone,
        role: account.role,
        application_status: 'approved',
        is_approved_partner: true,
        is_active_provider: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (profileError) {
        console.error(`  Profile update error for ${account.email}:`, profileError.message);
      } else {
        console.log(`  ✓ Successfully updated profile for [${account.role}] (${account.email})`);
      }

      // 3. Upsert Partner Application
      const { error: appError } = await supabase.from('partner_applications').upsert({
        user_id: userId,
        company_name: account.companyName,
        business_type: account.role,
        phone: account.phone,
        city: account.city,
        status: 'approved'
      }, { onConflict: 'user_id' });

      if (appError) {
        console.warn(`  App upsert warning:`, appError.message);
      }

    } catch (err) {
      console.error(`Error seeding ${account.role}:`, err);
    }
  }

  console.log('Seeding Completed!');
}

seedPartners();
