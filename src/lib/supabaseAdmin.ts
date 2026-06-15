import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Builds a stub Supabase client that always returns error responses.
 * Used when environment variables are missing so that the app still builds
 * and routes can return meaningful errors at runtime instead of crashing
 * at module-load time.
 */
function buildMissingEnvAdminClient(): SupabaseClient {
  const error = { message: "Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." };

  // Minimal stub that satisfies the SupabaseClient shape used by route handlers.
  // All queries will return { data: null, error }.
  const stubFrom = () => ({
    select: () => ({
      eq: () => ({
        eq: async () => ({ data: null, error }),
        single: async () => ({ data: null, error }),
        limit: async () => ({ data: null, error }),
        order: () => ({
          limit: async () => ({ data: null, error }),
        }),
      }),
      ilike: async () => ({ data: null, error }),
      limit: async () => ({ data: null, error }),
      order: () => ({
        limit: async () => ({ data: null, error }),
      }),
      single: async () => ({ data: null, error }),
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error }),
      }),
    }),
    update: () => ({
      eq: () => ({
        eq: async () => ({ data: null, error }),
        select: async () => ({ data: null, error }),
      }),
      select: async () => ({ data: null, error }),
    }),
    delete: () => ({
      eq: async () => ({ data: null, error }),
    }),
    upsert: () => ({
      select: () => ({
        single: async () => ({ data: null, error }),
      }),
    }),
  });

  return {
    from: stubFrom,
    auth: {
      getUser: async () => ({ data: { user: null }, error }),
    },
    rpc: async () => ({ data: null, error }),
  } as unknown as SupabaseClient;
}

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    "[supabaseAdmin] WARNING: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY " +
    "are not set. The Supabase admin client will be non-functional. " +
    "Set these environment variables to enable database operations."
  );
}

export const supabaseAdmin: SupabaseClient =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : buildMissingEnvAdminClient();
