import { supabaseServiceRoleKey, supabaseAdmin } from '../lib/supabase';

export async function generateRequestNumber(): Promise<string> {
  if (supabaseServiceRoleKey && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('generate_request_number');
    if (error || !data) {
      throw new Error(
        `Failed to generate request number: ${error?.message ?? 'unknown'}`
      );
    }
    return String(data);
  }

  // Fallback to in-app generation if service role isn't available.
  const randomSuffix = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `INV-${new Date().getFullYear()}-${randomSuffix}`;
}
