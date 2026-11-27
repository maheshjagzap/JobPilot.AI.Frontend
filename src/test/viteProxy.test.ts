import { expect, test, vi } from 'vitest'
import { forwardApiCookieHeader } from '../../vite.config'

test('forwards the browser cookie header through the development API proxy', () => {
  const setHeader = vi.fn()

  forwardApiCookieHeader(
    { setHeader },
    { headers: { cookie: 'cookie-header' } },
  )

  expect(setHeader).toHaveBeenCalledExactlyOnceWith('Cookie', 'cookie-header')
})

test('does not add a Cookie header when the browser sent none', () => {
  const setHeader = vi.fn()

  forwardApiCookieHeader({ setHeader }, { headers: {} })

  expect(setHeader).not.toHaveBeenCalled()
})
