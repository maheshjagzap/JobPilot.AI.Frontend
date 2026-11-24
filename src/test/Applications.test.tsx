import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, test } from 'vitest'
import AgentWorkspace from '../pages/AgentWorkspace'
import Applications from '../pages/Applications'

test('campus drives can be requested from the agent without showing invented events', () => {
  render(
    <MemoryRouter initialEntries={['/applications']}>
      <Routes>
        <Route path="/applications" element={<Applications />} />
        <Route path="/agent" element={<AgentWorkspace />} />
      </Routes>
    </MemoryRouter>,
  )

  fireEvent.click(screen.getByRole('tab', { name: 'Upcoming campus drives' }))
  expect(screen.getByText('Campus drive listings are not connected')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Ask JobPilot' }))

  expect(screen.getByLabelText('Tell JobPilot what you want to do')).toHaveValue(
    'Find upcoming campus drives and show me the dates, eligibility, and official source links.',
  )
})
