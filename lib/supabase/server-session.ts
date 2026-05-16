import { createServerClient as createSSRClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'

async function makeClient(writable: boolean) {
  const cookieStore = await cookies()
  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: writable
          ? (list) =>
              list.forEach(({ name, value, options }) => {
                try {
                  cookieStore.set(name, value, options)
                } catch {
                  // ignore in Server Components
                }
              })
          : () => {},
      },
    },
  )
}

/** Server Components — cookies en lecture seule */
export async function getServerUser(): Promise<User | null> {
  const supabase = await makeClient(false)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** Server Actions — cookies accessibles en écriture (refresh token) */
export async function getServerUserForAction(): Promise<User | null> {
  const supabase = await makeClient(true)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
