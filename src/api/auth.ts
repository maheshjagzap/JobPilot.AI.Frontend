export type OwnerProfile = {
  userId: string
  email: string
  firstName: string
  lastName: string | null
}

export type AuthenticationResponse = {
  accessToken: string
  tokenType: string
  expiresAt: string
  owner: OwnerProfile
}

export type SetupOwnerRequest = {
  email: string
  password: string
  firstName: string
  lastName: string | null
}

const configuredBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const API_BASE_URL = import.meta.env.DEV ? '' : (configuredBaseUrl || 'https://localhost:7081')
const AUTH_STORAGE_KEY = 'jobpilot-auth'

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json() as { title?: string; detail?: string; message?: string }
    return body.detail || body.title || body.message || `Request failed (${response.status})`
  } catch {
    return `Request failed (${response.status})`
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = readStoredAuth()
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body) headers.set('Content-Type', 'application/json')
  if (auth?.accessToken) headers.set('Authorization', `Bearer ${auth.accessToken}`)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) throw new Error(await readError(response))
  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}

export function readStoredAuth(): AuthenticationResponse | null {
  try {
    const value = sessionStorage.getItem(AUTH_STORAGE_KEY)
    return value ? JSON.parse(value) as AuthenticationResponse : null
  } catch {
    return null
  }
}

export function storeAuth(auth: AuthenticationResponse) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearStoredAuth() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getSetupStatus() {
  return request<{ setupRequired: boolean }>('/api/v1/auth/setup-status')
}

export function setupOwner(body: SetupOwnerRequest) {
  return request<AuthenticationResponse>('/api/v1/auth/setup', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function login(email: string, password: string) {
  return request<AuthenticationResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function refreshAuth() {
  return request<AuthenticationResponse>('/api/v1/auth/refresh', { method: 'POST' })
}

export function getCurrentOwner() {
  return request<OwnerProfile>('/api/v1/auth/me')
}

export async function logout() {
  try {
    await request<void>('/api/v1/auth/logout', { method: 'POST' })
  } finally {
    clearStoredAuth()
  }
}
