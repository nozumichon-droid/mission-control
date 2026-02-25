import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabase = Boolean(url && anonKey);

export const supabase = hasSupabase
  ? createClient(url!, anonKey!, { auth: { persistSession: false } })
  : null;

export const supabaseAdmin = Boolean(url && serviceRoleKey)
  ? createClient(url!, serviceRoleKey!, { auth: { persistSession: false } })
  : null;
