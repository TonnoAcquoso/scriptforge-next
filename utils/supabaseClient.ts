// lib/supabaseClient.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Istanza base
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Re-export della funzione, con alias opzionale per chiarezza
export { createSupabaseClient as createClient };