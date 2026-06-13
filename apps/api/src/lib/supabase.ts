import { createClient } from '@supabase/supabase-js'
import type { Database } from '@alternativa/types'

const url = process.env.SUPABASE_URL
const anonKey = process.env.SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !anonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables')
}

/** Anon client — used only to create per-request user-scoped clients. */
export const supabaseAnon = createClient<Database>(url, anonKey)

/** Service-role admin client — never use inside route handlers. */
export const supabaseAdmin = serviceRoleKey
  ? createClient<Database>(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null

/** Creates a user-scoped client that passes the JWT so RLS is applied. */
export function createUserClient(accessToken: string) {
  return createClient<Database>(url!, anonKey!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
