import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Service client (use sparingly; bypasses RLS). Requires SUPABASE_SERVICE_ROLE_KEY
export const serviceClient: SupabaseClient | null =
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

// Build a user-scoped client from the request token to honor RLS
export function userClientFromToken(token?: string): SupabaseClient | null {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  });
  return client;
}


