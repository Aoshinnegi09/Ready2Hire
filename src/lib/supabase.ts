import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here' &&
    supabaseUrl.startsWith('https://')
  );
};

if (!isSupabaseConfigured()) {
  console.warn(
    `[Ready2Hire Config Warning]: Supabase environment variables are missing or using placeholders.\n` +
    `Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n` +
    `Ready2Hire will run in interactive Demo Mode with realistic offline mock data until configured.`
  );
}

// Fallback dummy URL and Key to allow client instantiation in test/demo mode without crashing
const validUrl = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
const validKey = isSupabaseConfigured() ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase: SupabaseClient<Database> = createClient<Database>(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
