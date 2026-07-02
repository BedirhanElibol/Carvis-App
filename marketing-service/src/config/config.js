import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Environment Variables Schema Definition (Validation at boundary)
const envSchema = z.object({
    SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
    SUPABASE_SERVICE_KEY: z.string().min(10, "SUPABASE_SERVICE_KEY is required"),
    CAMPAIGN_INTERVAL_MS: z.coerce.number().default(150000), // Default 2.5 minutes
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    process.exit(1);
}

export const config = parsedEnv.data;
