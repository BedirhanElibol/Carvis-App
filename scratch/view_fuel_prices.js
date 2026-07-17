import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Read .env file to get credentials
const envContent = fs.readFileSync(".env", "utf8");
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from("live_fuel_prices")
    .select("*");
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("DB Fuel Prices:", data);
  }
}
run();
