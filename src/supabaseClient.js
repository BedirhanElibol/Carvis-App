import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://gieclpczrozblvauxjhf.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZWNscGN6cm96Ymx2YXV4amhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDM2NTYsImV4cCI6MjA4MTQ3OTY1Nn0.Cnag3S4Jj6VF8JU4aEYSLUZlVZhjtLZRrKb-BMHWyRA";

const getEnvVar = (key, defaultValue) => {
  const viteEnv = import.meta.env || {};
  const processEnv = typeof process !== "undefined" ? process.env : {};
  const val = viteEnv[key] || processEnv?.[key];
  return val && val !== 'undefined' && val !== 'null' && val.trim() !== '' ? val : defaultValue;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', DEFAULT_SUPABASE_URL);
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', DEFAULT_SUPABASE_ANON_KEY);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

