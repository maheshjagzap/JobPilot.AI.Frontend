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

let inMemoryAuth: AuthenticationResponse | null = null
let refreshPromise: Promise<AuthenticationResponse> | null = null
let restoreSessionPromise: Promise<AuthenticationResponse | null> | null = null
let setupStatusPromise: Promise<{ setupRequired: boolean }> | null = null
let logoutInProgress = false
const refreshExemptPaths = new Set([
  '/api/v1/auth/setup-status',
  '/api/v1/auth/setup',
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/logout',
])

async function readError(response: Response): Promise<string> {
  if (response.status === 502) {
    return 'Backend server is not connected. Please start the API server and try again.'
  }
  if (response.status === 503) {
    return 'Backend server is unavailable. Please try again shortly.'
  }
  if (response.status === 504) {
    return 'The backend server took too long to respond. Please try again.'
  }

  try {
    const body = await response.json() as { title?: string; detail?: string; message?: string }
    return body.detail || body.title || body.message || 'The request could not be completed.'
  } catch {
    return 'The request could not be completed. Please try again.'
  }
}

async function fetchWithAuth(path: string, options: RequestInit = {}, allowRefresh = true): Promise<Response> {
  const auth = readStoredAuth()
  const headers = new Headers(options.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (typeof options.body === 'string') headers.set('Content-Type', 'application/json')
  if (auth?.accessToken) headers.set('Authorization', `Bearer ${auth.accessToken}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })
  } catch {
    throw new Error('Backend server is not connected. Please start the API server and try again.')
  }

  if (response.status === 401 && allowRefresh && !logoutInProgress && !refreshExemptPaths.has(path)) {
    try {
      if (!refreshPromise) {
        refreshPromise = request<AuthenticationResponse>('/api/v1/auth/refresh', { method: 'POST' }, false)
          .then((auth) => {
            storeAuth(auth)
            return auth
          })
          .finally(() => { refreshPromise = null })
      }
      await refreshPromise
      return fetchWithAuth(path, options, false)
    } catch {
      clearStoredAuth()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
      throw new Error('Your session has expired. Please sign in again.')
    }
  }

  return response
}

async function request<T>(path: string, options: RequestInit = {}, allowRefresh = true): Promise<T> {
  const response = await fetchWithAuth(path, options, allowRefresh)
  if (!response.ok) throw new Error(await readError(response))
  if (response.status === 204) return undefined as T
  const body = await response.text()
  return body ? JSON.parse(body) as T : undefined as T
}

export function apiRequest<T>(path: string, options: RequestInit = {}) {
  return request<T>(path, options)
}

export async function apiRequestOrNull<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  const response = await fetchWithAuth(path, options)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(await readError(response))
  if (response.status === 204) return null
  const body = await response.text()
  return body ? JSON.parse(body) as T : null
}

export async function apiResponse(path: string, options: RequestInit = {}) {
  const response = await fetchWithAuth(path, options)
  if (!response.ok) throw new Error(await readError(response))
  return response
}

export async function apiBlob(path: string, options: RequestInit = {}) {
  return (await apiResponse(path, options)).blob()
}

export function readStoredAuth(): AuthenticationResponse | null {
  return inMemoryAuth
}

export function storeAuth(auth: AuthenticationResponse) {
  inMemoryAuth = auth
}

export function clearStoredAuth() {
  inMemoryAuth = null
}

export function getSetupStatus() {
  if (!setupStatusPromise) {
    setupStatusPromise = request<{ setupRequired: boolean }>('/api/v1/auth/setup-status')
      .finally(() => { setupStatusPromise = null })
  }
  return setupStatusPromise
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
  return request<AuthenticationResponse>('/api/v1/auth/refresh', { method: 'POST' }, false)
}

export function getCurrentOwner() {
  return request<OwnerProfile>('/api/v1/auth/me')
}

export async function logout() {
  logoutInProgress = true
  try {
    if (refreshPromise) await refreshPromise.catch(() => undefined)
    await request<void>('/api/v1/auth/logout', { method: 'POST' }, false)
  } finally {
    clearStoredAuth()
    logoutInProgress = false
  }
}

export function restoreSession(): Promise<AuthenticationResponse | null> {
  if (!restoreSessionPromise) {
    restoreSessionPromise = (async () => {
      try {
        const auth = await refreshAuth()
        storeAuth(auth)
        const owner = await getCurrentOwner()
        const restored = { ...auth, owner }
        storeAuth(restored)
        return restored
      } catch {
        clearStoredAuth()
        return null
      }
    })().finally(() => { restoreSessionPromise = null })
  }
  return restoreSessionPromise
}
