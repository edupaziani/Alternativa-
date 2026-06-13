import { createClient } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getAuthHeader(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {}
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const authHeader = await getAuthHeader()

  const url = new URL(`${API_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
    body: body ? JSON.stringify(body) : undefined,
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

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) =>
    request<T>('GET', path, undefined, params),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
