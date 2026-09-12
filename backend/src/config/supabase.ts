import { createClient } from '@supabase/supabase-js';
import { env } from './env.ts';

export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});