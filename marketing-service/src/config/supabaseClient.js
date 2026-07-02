import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

// Singleton instance of Supabase Client
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
