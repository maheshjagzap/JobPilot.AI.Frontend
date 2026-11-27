import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import {
  apiRequest,
  clearStoredAuth,
  getSetupStatus,
  login,
  logout,
  readStoredAuth,
  refreshAuth,
  restoreSession,
  setupOwner,
  storeAuth,
} from '../api/auth'
import { listResumes, uploadResume } from '../api/features'

const auth = {
  accessToken: 'test-token',
  tokenType: 'Bearer',
  expiresAt: '2026-11-24T08:30:00Z',
  owner: { userId: 'user_1', email: 'test@example.com', firstName: 'Test', lastName: null },
}

beforeEach(() => {
  clearStoredAuth()
})

afterEach(() => {
  clearStoredAuth()
  vi.unstubAllGlobals()
})

test('allows an empty 200 response from logout', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })))
  storeAuth(auth)

  await expect(logout()).resolves.toBeUndefined()
})

test('uses credentialed fetches for login, setup, and refresh', async () => {
  const fetchMock = vi.fn().mockImplementation(() =>
    Promise.resolve(new Response(JSON.stringify(auth), { status: 200 })),
  )
  vi.stubGlobal('fetch', fetchMock)

  await login(auth.owner.email, 'test-password')
  await setupOwner({ email: auth.owner.email, password: 'test-password', firstName: 'Test', lastName: null })
  await refreshAuth()

  expect(fetchMock).toHaveBeenCalledTimes(3)
  expect(fetchMock.mock.calls.map((call) => call[1]?.credentials)).toEqual(['include', 'include', 'include'])
})

test('shares setup-status requests during React StrictMode remounts', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ setupRequired: true }), { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)

  const [first, second] = await Promise.all([getSetupStatus(), getSetupStatus()])

  expect(first).toEqual({ setupRequired: true })
  expect(second).toEqual({ setupRequired: true })
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('does not attempt refresh after setup-status or logout returns 401', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
  vi.stubGlobal('fetch', fetchMock)
  storeAuth(auth)

  await expect(getSetupStatus()).rejects.toThrow()
  await expect(logout()).rejects.toThrow()

  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(readStoredAuth()).toBeNull()
})

test('restores a session with one refresh and owner lookup for concurrent callers', async () => {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const path = String(input)
    if (path.endsWith('/auth/refresh')) {
      return Promise.resolve(new Response(JSON.stringify(auth), { status: 200 }))
    }
    return Promise.resolve(new Response(JSON.stringify(auth.owner), { status: 200 }))
  })
  vi.stubGlobal('fetch', fetchMock)

  const first = restoreSession()
  const second = restoreSession()

  expect(first).toBe(second)
  await expect(first).resolves.toMatchObject({ owner: auth.owner })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

test('coalesces concurrent protected 401 responses into one refresh request', async () => {
  let refreshCalls = 0
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const path = String(input)
    if (path.endsWith('/auth/refresh')) {
      refreshCalls += 1
      return Promise.resolve(new Response(JSON.stringify(auth), { status: 200 }))
    }

    const authorization = new Headers(init?.headers).get('Authorization')
    if (authorization === 'Bearer expired-token') {
      return Promise.resolve(new Response(null, { status: 401 }))
    }
    return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))
  })
  vi.stubGlobal('fetch', fetchMock)
  storeAuth({ ...auth, accessToken: 'expired-token' })

  await Promise.all([apiRequest('/api/v1/profile'), apiRequest('/api/v1/settings')])

  expect(refreshCalls).toBe(1)
  expect(fetchMock.mock.calls.every((call) => call[1]?.credentials === 'include')).toBe(true)
})

test('waits for an in-flight refresh before sending logout', async () => {
  let releaseRefresh: ((response: Response) => void) | undefined
  let markRefreshStarted: () => void = () => {}
  const refreshStarted = new Promise<void>((resolve) => { markRefreshStarted = resolve })
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const path = String(input)
    if (path.endsWith('/auth/refresh')) {
      markRefreshStarted()
      return new Promise<Response>((resolve) => { releaseRefresh = resolve })
    }
    if (path.endsWith('/auth/logout')) {
      return Promise.resolve(new Response(null, { status: 204 }))
    }
    if (new Headers(init?.headers).get('Authorization') === 'Bearer expired-token') {
      return Promise.resolve(new Response(null, { status: 401 }))
    }
    return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))
  })
  vi.stubGlobal('fetch', fetchMock)
  storeAuth({ ...auth, accessToken: 'expired-token' })

  const protectedRequest = apiRequest('/api/v1/profile')
  await refreshStarted
  const logoutRequest = logout()

  expect(fetchMock.mock.calls.some((call) => String(call[0]).endsWith('/auth/logout'))).toBe(false)
  releaseRefresh?.(new Response(JSON.stringify(auth), { status: 200 }))
  await Promise.all([protectedRequest, logoutRequest])

  const paths = fetchMock.mock.calls.map((call) => String(call[0]))
  expect(paths.indexOf('/api/v1/auth/refresh')).toBeLessThan(paths.indexOf('/api/v1/auth/logout'))
  expect(readStoredAuth()).toBeNull()
})

test('uploads resumes with bearer auth without overriding the multipart boundary', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
    resumeId: 'resume_1',
    importJobId: 'import_1',
    originalFileName: 'resume.pdf',
    importStatus: 'queued',
  }), { status: 202, headers: { 'Content-Type': 'application/json' } }))
  vi.stubGlobal('fetch', fetchMock)
  storeAuth(auth)

  await uploadResume(new File(['resume'], 'resume.pdf', { type: 'application/pdf' }), {
    resumeName: 'Software Engineer',
    resumeKind: 'source',
    setAsDefault: true,
  })

  const request = fetchMock.mock.calls[0]?.[1] as RequestInit
  const headers = new Headers(request.headers)
  expect(headers.get('Authorization')).toBe('Bearer test-token')
  expect(headers.has('Content-Type')).toBe(false)
  expect(request.body).toBeInstanceOf(FormData)
  const formData = request.body as FormData
  expect(formData.get('file')).toBeInstanceOf(File)
  expect(formData.get('resumeName')).toBe('Software Engineer')
  expect(formData.get('resumeKind')).toBe('source')
  expect(formData.get('setAsDefault')).toBe('true')
})

test('uses page and pageSize for the paged resume list contract', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [] }), { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  storeAuth(auth)

  await listResumes(2, 10)

  expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/v1/resumes?page=2&pageSize=10')
})
