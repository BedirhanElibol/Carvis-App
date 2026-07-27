import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://gieclpczrozblvauxjhf.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZWNscGN6cm96Ymx2YXV4amhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDM2NTYsImV4cCI6MjA4MTQ3OTY1Nn0.Cnag3S4Jj6VF8JU4aEYSLUZlVZhjtLZRrKb-BMHWyRA";

const validateEnv = (val, defaultValue) => {
  return val && val !== 'undefined' && val !== 'null' && val.trim() !== '' ? val : defaultValue;
};

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = validateEnv(rawSupabaseUrl, DEFAULT_SUPABASE_URL);
const supabaseAnonKey = validateEnv(rawSupabaseAnonKey, DEFAULT_SUPABASE_ANON_KEY);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

