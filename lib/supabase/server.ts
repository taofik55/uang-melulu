import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

type CookieStore = Awaited<ReturnType<typeof cookies>>
type CookieSetOptions = Parameters<CookieStore["set"]>[2]
type CookiesToSet = Array<{ name: string; value: string; options?: CookieSetOptions }>

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    }
  )
}

