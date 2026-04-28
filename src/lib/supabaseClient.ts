import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const missingEnvMessage =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";

function buildMissingEnvClient() {
  const error = { message: missingEnvMessage };

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error }),
      resetPasswordForEmail: async () => ({ data: null, error }),
      signOut: async () => ({ error }),
    },
    from: () => ({
      delete: () => ({
        eq: async () => ({ data: null, error }),
      }),
      insert: async () => ({ data: null, error }),
      upsert: async () => ({ data: null, error }),
    }),
  };
}

export const createSupabaseBrowserClient = (): any => {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== "undefined") {
      console.error(missingEnvMessage);
    }
    return buildMissingEnvClient();
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
