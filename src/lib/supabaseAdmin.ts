import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Builds a stub Supabase client that always returns error responses.
 * Uses a Proxy so any query chain (no matter how deep or which methods
 * are called — .eq(), .maybeSingle(), .select(), etc.) always resolves
 * to { data: null, error }.  This way we never need to enumerate every
 * Supabase method — the stub adapts automatically.
 */
function buildMissingEnvAdminClient(): SupabaseClient {
  const errorMsg =
    "Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.";

  // A thenable that resolves to { data: null, error } — this makes
  // `await stub.from("x").select().eq().maybeSingle()` work.
  const errorResult = { data: null, error: { message: errorMsg } };

  function createChain(): any {
    const handler: ProxyHandler<object> = {
      get(_target, prop, _receiver) {
        // Terminal async methods — return a Promise that resolves to the error result
        if (
          prop === "then" ||
          prop === "maybeSingle" ||
          prop === "single" ||
          prop === "limit" ||
          typeof prop === "string" &&
            ["eq", "neq", "gt", "gte", "lt", "lte", "ilike", "like", "in", "contains", "range"].includes(prop)
        ) {
          // For .then, we need to make the chain thenable so `await` works
          if (prop === "then") {
            return (resolve: any, reject: any) => resolve(errorResult);
          }
          // For filter/terminal methods, return a function that continues the chain
          return (..._args: unknown[]) => createChain();
        }
        // All other methods (select, insert, update, delete, upsert, order, etc.)
        // just continue the chain
        if (typeof prop === "string" && prop !== "toJSON" && prop !== Symbol.toPrimitive.toString()) {
          return (..._args: unknown[]) => createChain();
        }
        return undefined;
      },
    };
    return new Proxy({}, handler);
  }

  return {
    from: (_tableName: string) => createChain(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: { message: errorMsg } }),
    },
    rpc: async () => errorResult,
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
