// Centralized API client. All requests go through here.
// Never store tokens — they live in httpOnly cookies.

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  })

  if (res.status === 204) return undefined as T

  const data = (await res.json()) as T | { error: { code: string; message: string; details?: unknown } }

  if (!res.ok) {
    const err = data as { error: { code: string; message: string; details?: unknown } }
    throw new ApiError(err.error?.message ?? 'Something went wrong', err.error?.code ?? 'UNKNOWN', res.status, err.error?.details)
  }

  return data as T
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('image', file)
    const res = await fetch(`${BASE}/products/upload`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    })
    if (!res.ok) throw new ApiError('Upload failed', 'UPLOAD_FAILED', res.status)
    return res.json() as Promise<{ url: string }>
  },
}
