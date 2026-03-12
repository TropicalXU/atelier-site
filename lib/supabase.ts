/* supabase.ts
 *
 * Creates and exports a single Supabase client instance.
 * Import `supabase` from this file anywhere you need database access:
 *
 *   import { supabase } from "@/lib/supabase";
 *
 * The two environment variables are read from .env.local (in development)
 * or from Vercel's Environment Variables panel (in production).
 *
 * The `!` at the end of each process.env line tells TypeScript:
 * "I know this value exists — don't warn me that it might be undefined."
 * If the variable is missing, you'll get a runtime error which makes
 * it obvious something is wrong rather than failing silently.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// `createClient` returns an object with methods for querying your database.
// We create it once here and export it so every component uses the same instance.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
