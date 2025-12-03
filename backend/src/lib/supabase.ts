import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log environment variable status (for debugging)
if (process.env.NODE_ENV !== 'test') {
  console.log('[Supabase] Environment check:', {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseAnonKey: !!supabaseAnonKey,
    hasSupabaseServiceRoleKey: !!supabaseServiceRoleKey,
    supabaseUrlLength: supabaseUrl?.length || 0,
    supabaseAnonKeyLength: supabaseAnonKey?.length || 0,
    supabaseServiceRoleKeyLength: supabaseServiceRoleKey?.length || 0,
  });
}

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('SUPABASE_ANON_KEY');
  
  const errorMessage = `Missing Supabase environment variables: ${missing.join(', ')} are required. Please set them in Netlify Dashboard or .env file.`;
  console.error('[Supabase] Configuration Error:', errorMessage);
  
  // In production (Netlify), we should fail fast to catch configuration issues early
  // But we'll create a placeholder client to prevent module load failures
  // The actual operations will fail with clear error messages
  throw new Error(errorMessage);
}

// Regular client with anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Backend doesn't need session persistence
  },
});

// Admin client with service role key (for admin operations)
// This is required for operations that bypass RLS (Row Level Security)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export function requireSupabaseAdmin() {
  if (!supabaseAdmin) {
    const errorMessage = 'Supabase service role key is required for this operation. Please set SUPABASE_SERVICE_ROLE_KEY in Netlify Dashboard.';
    console.error('[Supabase] Admin Client Error:', errorMessage);
    throw new Error(errorMessage);
  }
  return supabaseAdmin;
}

export { supabaseServiceRoleKey };
