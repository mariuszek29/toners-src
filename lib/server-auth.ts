import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

export async function requireRouteUser() {
  const supabase = createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  assertAdminEmail(user.email)
  return user
}

export async function getBearerUser(req: NextRequest) {
  const header = req.headers.get('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token) {
    throw new Error('Unauthorized')
  }

  const supabase = createSupabaseAdminClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return user
}

export function assertAdminEmail(email?: string | null) {
  const configured = process.env.ADMIN_EMAILS
  if (!configured) return

  const allowed = configured
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean)

  if (allowed.length > 0 && (!email || !allowed.includes(email.toLowerCase()))) {
    throw new Error('Forbidden')
  }
}
