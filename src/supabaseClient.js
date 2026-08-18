import { createClient } from "@supabase/supabase-js";

const getEnvVar = (key, defaultValue) => {
  const viteEnv = import.meta.env || {};
  const processEnv = typeof process !== "undefined" ? process.env : {};
  const val = viteEnv[key] || processEnv?.[key];
  return val && val !== 'undefined' && val !== 'null' && val.trim() !== '' ? val : defaultValue;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', '');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing from environment variables (.env).');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
