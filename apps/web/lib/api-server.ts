import { createClient } from './supabase-server'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getServerHeaders(): Promise<Record<string, string>> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

async function serverRequest<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const headers = await getServerHeaders()
  const url = new URL(`${API_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }

  const res = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json', ...headers },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw Object.assign(new Error(payload?.error?.message ?? res.statusText), {
      statusCode: res.status,
      code: payload?.error?.code,
    })
  }

  return res.json() as Promise<T>
}

export const serverApi = {
  get: <T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ) => serverRequest<T>(path, params),
}
