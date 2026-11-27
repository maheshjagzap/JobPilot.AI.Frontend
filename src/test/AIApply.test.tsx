import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import AIApply from '../pages/AIApply'

test('does not expose application submission without an authenticated backend draft', () => {
  render(
    <MemoryRouter>
      <AIApply review />
    </MemoryRouter>,
  )

  expect(screen.getByRole('alert')).toHaveTextContent('Sign in to use application preparation')
  expect(screen.queryByRole('button', { name: /submit application/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
})
