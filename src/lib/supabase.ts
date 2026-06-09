import { createClient } from "@supabase/supabase-js";

// @ts-ignore
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
// @ts-ignore
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// @ts-ignore
export const supabase =
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : ({
        from: (table: string) => ({
          select: () => ({ error: null, data: [] }),
          insert: () => ({ error: null, data: [] }),
          update: () => ({ error: null, data: [] }),
          delete: () => ({ error: null, data: [] }),
        }),
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => {} } },
          }),
        },
      } as any);
