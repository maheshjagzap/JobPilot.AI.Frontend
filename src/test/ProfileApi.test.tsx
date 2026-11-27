import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { clearStoredAuth, storeAuth } from '../api/auth'
import Profile from '../pages/Profile'

const profile = {
  profileId: 'profile-1',
  eTag: '"profile-version-1"',
  personal: {
    preferredName: null,
    firstName: 'Avery',
    lastName: 'Candidate',
    email: 'avery@example.com',
    phoneNumber: null,
    professionalTitle: null,
    careerSummary: 'API-backed summary',
    currentLocation: 'Toronto',
    currentCountryCode: 'CA',
    linkedInUrl: null,
    gitHubUrl: null,
    portfolioUrl: null,
    isOpenToWork: true,
    noticePeriodDays: null,
    willingToRelocate: null,
    workAuthorization: null,
  },
  experience: [],
  education: [],
  certifications: [],
  skills: [],
  projects: [{
    projectId: 'project-1',
    projectName: 'API project',
    role: 'Developer',
    description: 'Loaded from the profile API.',
    projectUrl: null,
    repositoryUrl: null,
    startDate: null,
    endDate: null,
    isFeatured: false,
    displayOrder: 0,
    technologies: ['C#'],
  }],
  updatedAt: '2026-11-27T07:04:20Z',
}

beforeEach(() => {
  clearStoredAuth()
  storeAuth({
    accessToken: 'test-token',
    tokenType: 'Bearer',
    expiresAt: '2026-11-27T08:30:00Z',
    owner: { userId: 'user-1', email: 'avery@example.com', firstName: 'Avery', lastName: 'Candidate' },
  })
})

afterEach(() => {
  clearStoredAuth()
  vi.unstubAllGlobals()
})

test('maps the live profile DTO and saves with its ETag and update schema', async () => {
  let getCount = 0
  let putRequest: RequestInit | undefined
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === 'PUT') {
      putRequest = init
      return new Response(null, { status: 200 })
    }

    getCount += 1
    const body = getCount === 1 ? profile : { ...profile, eTag: '"profile-version-2"' }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)

  render(<Profile />)

  await waitFor(() => expect(screen.getByLabelText('Full legal name *')).toHaveValue('Avery Candidate'))
  expect(screen.getByLabelText('Email *')).toHaveValue('avery@example.com')
  expect(screen.getByLabelText('Full legal name *')).toHaveProperty('readOnly', true)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Projects' }))
  expect(screen.getByText('API project')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Save section' }))

  await waitFor(() => expect(putRequest).toBeDefined())
  const headers = new Headers(putRequest?.headers)
  expect(headers.get('If-Match')).toBe('"profile-version-1"')
  expect(headers.get('Authorization')).toBe('Bearer test-token')

  const body = JSON.parse(String(putRequest?.body))
  expect(body).toMatchObject({
    personal: { careerSummary: 'API-backed summary', currentCountryCode: 'CA' },
    projects: [{ projectId: 'project-1', projectName: 'API project', technologies: ['C#'] }],
  })
  expect(body).not.toHaveProperty('preferences')
  expect(body).not.toHaveProperty('relocation')
  await waitFor(() => expect(screen.getByText('Saved to your account.')).toBeInTheDocument())
})

test('creates a missing profile without If-Match and accepts the lowercase etag response field', async () => {
  let getCount = 0
  let putRequest: RequestInit | undefined
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === 'PUT') {
      putRequest = init
      return new Response(JSON.stringify({ profileId: 'profile-1' }), { status: 200 })
    }

    getCount += 1
    if (getCount === 1) return new Response(null, { status: 404 })
    const body = { ...profile, eTag: undefined, etag: '"profile-version-1"' }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)

  render(<Profile />)

  await waitFor(() => expect(screen.getByLabelText('Full legal name *')).toHaveValue('Avery Candidate'))
  fireEvent.click(screen.getByRole('button', { name: 'Save section' }))

  await waitFor(() => expect(putRequest).toBeDefined())
  expect(new Headers(putRequest?.headers).has('If-Match')).toBe(false)
  expect(JSON.parse(String(putRequest?.body))).toMatchObject({
    personal: { preferredName: null, isOpenToWork: true },
    experience: [],
    education: [],
    certifications: [],
    skills: [],
    projects: [],
  })
  await waitFor(() => expect(screen.getByText('Saved to your account.')).toBeInTheDocument())
})
