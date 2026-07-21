const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://gieclpczrozblvauxjhf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZWNscGN6cm96Ymx2YXV4amhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDM2NTYsImV4cCI6MjA4MTQ3OTY1Nn0.Cnag3S4Jj6VF8JU4aEYSLUZlVZhjtLZRrKb-BMHWyRA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EMAILS = [
  "mechanic@carvis.com",
  "parts@carvis.com",
  "carwash@carvis.com",
  "tow@carvis.com",
  "insurance@carvis.com",
];

// Try multiple common passwords
const PASSWORDS = ["b998877", "carvis123", "test123456", "password123"];

async function tryLogin(email) {
  for (const pw of PASSWORDS) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });
    if (!error && data.user) {
      console.log(`  [OK] ${email} -> password: ${pw} -> user_id: ${data.user.id}`);
      await supabase.auth.signOut();
      return { userId: data.user.id, password: pw };
    }
  }
  console.log(`  [FAIL] ${email} -> none of the passwords worked`);
  return null;
}

async function main() {
  console.log("Testing partner logins...\n");
  
  // Also test admin
  console.log("--- Admin ---");
  await tryLogin("bedirelibol7@gmail.com");
  
  console.log("\n--- Partners ---");
  for (const email of EMAILS) {
    await tryLogin(email);
  }
}

main().catch(console.error);
