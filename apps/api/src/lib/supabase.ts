import { createClient } from "@supabase/supabase-js";

import { readTrimmedEnv } from "./env.js";

const supabaseUrl = readTrimmedEnv("SUPABASE_URL");
const supabaseServiceRoleKey = readTrimmedEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
