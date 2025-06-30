import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://denojnsdwhtlilmgmyeq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbm9qbnNkd2h0bGlsbWdteWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODMzOTUsImV4cCI6MjA2Njg1OTM5NX0.8aYOITIX8yOsDku27HnUB3Nda1ARL6t1sR0mPp-MeRs';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);