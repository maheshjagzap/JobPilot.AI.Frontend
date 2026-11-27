import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { clearStoredAuth, storeAuth } from '../api/auth'
import type { JobSearchPreference } from '../api/features'
import JobSearchPreferences from '../pages/JobSearchPreferences'

const auth = {
  accessToken: 'test-token',
  tokenType: 'Bearer',
  expiresAt: '2026-11-27T08:30:00Z',
  owner: { userId: 'user-1', email: 'test@example.com', firstName: 'Test', lastName: null },
}

beforeEach(() => {
  clearStoredAuth()
  storeAuth(auth)
})

afterEach(() => {
  clearStoredAuth()
  vi.unstubAllGlobals()
})

test('creates preferences with the API field names and refreshes the list', async () => {
  let created: JobSearchPreference | undefined
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === 'POST') {
      const body = JSON.parse(String(init.body))
      created = {
        ...body,
        preferenceId: 'preference-1',
        nextRunAt: null,
        updatedAt: '2026-11-27T08:00:00Z',
      }
      return new Response(JSON.stringify(created), { status: 201 })
    }
    return new Response(JSON.stringify({ items: created ? [created] : [] }), { status: 200 })
  })
  vi.stubGlobal('fetch', fetchMock)

  render(<JobSearchPreferences />)
  fireEvent.change(await screen.findByLabelText('Preference name *'), { target: { value: 'Backend roles' } })
  fireEvent.change(screen.getByLabelText('Job titles (comma-separated)'), { target: { value: 'Backend Engineer' } })
  fireEvent.change(screen.getByLabelText('Locations (comma-separated)'), { target: { value: 'Toronto, Remote' } })
  fireEvent.click(screen.getByRole('button', { name: 'Create preference' }))

  await waitFor(() => expect(screen.getByText('Preference created.')).toBeInTheDocument())
  const postCall = fetchMock.mock.calls.find((call) => call[1]?.method === 'POST')
  const request = postCall?.[1]
  expect(new Headers(request?.headers).get('Authorization')).toBe('Bearer test-token')
  expect(JSON.parse(String(request?.body))).toMatchObject({
    preferenceName: 'Backend roles',
    jobTitles: ['Backend Engineer'],
    locations: ['Toronto', 'Remote'],
    isEnabled: true,
    discoveryFrequency: 'Daily',
  })
  expect(await screen.findByText('Backend roles')).toBeInTheDocument()
})

test('explains that a profile must exist before preferences can be created', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })))

  render(<JobSearchPreferences />)

  expect(await screen.findByText('Save your candidate profile first to create job-search preferences.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'New preference' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Create preference' })).toBeDisabled()
})
