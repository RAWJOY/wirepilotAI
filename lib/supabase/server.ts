import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// This function creates a connection to Supabase that runs on our
// server (used inside Server Components and API routes) so we can
// securely check "is this person actually logged in?"
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // This can be safely ignored when called from a Server Component,
            // since the middleware below handles refreshing sessions.
          }
        },
      },
    }
  );
}
