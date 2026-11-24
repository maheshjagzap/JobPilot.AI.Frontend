import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import AIApply from '../pages/AIApply'

test('submission stays disabled until explicit review approval', () => {
  render(
    <MemoryRouter>
      <AIApply review />
    </MemoryRouter>,
  )

  const submit = screen.getByRole('button', { name: 'Submit application' })
  expect(submit).toBeDisabled()

  fireEvent.click(screen.getByRole('checkbox'))
  expect(submit).toBeEnabled()
})
