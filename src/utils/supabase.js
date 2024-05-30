import { createClient } from "@supabase/supabase-js";

// Get Supabase configuration from environment variables
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create authenticated Supabase client with Clerk JWT token
const supabaseClient = async (supabaseAccessToken) => {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${supabaseAccessToken}` } },
  });
  return supabase;
};

export default supabaseClient;
// milestone: Prepared the project foundation and local environment setup

// milestone 12: Tightened validation checks for job creation and edits
