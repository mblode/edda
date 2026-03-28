import { createClient } from "@supabase/supabase-js";

import { readTrimmedEnv } from "./env.js";

type SupabaseClient = ReturnType<typeof createClient>;

let supabaseClient: SupabaseClient | null | undefined;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClient !== undefined) {
    return supabaseClient;
  }

  const supabaseUrl = readTrimmedEnv("SUPABASE_URL");
  const supabaseServiceRoleKey = readTrimmedEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    supabaseClient = null;
    return supabaseClient;
  }

  supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseClient;
};
