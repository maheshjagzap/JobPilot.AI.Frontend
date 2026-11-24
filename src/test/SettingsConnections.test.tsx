import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Settings from '../pages/Settings'

test('asks which accounts the user wants to link without pretending to connect them', () => {
  render(<Settings />)

  fireEvent.click(screen.getByRole('checkbox', { name: /Gmail/ }))
  fireEvent.click(screen.getByRole('checkbox', { name: /Naukri/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Save connection request' }))

  expect(screen.getByRole('status')).toHaveTextContent('No accounts were connected')
  expect(JSON.parse(localStorage.getItem('jobpilot-connection-request') ?? 'null')).toMatchObject({
    providers: ['Gmail', 'Naukri'],
    otherProvider: '',
  })
})
