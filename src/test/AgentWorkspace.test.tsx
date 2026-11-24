import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import AgentWorkspace from '../pages/AgentWorkspace'

test('suggested prompts populate the natural-language composer', () => {
  render(
    <MemoryRouter>
      <AgentWorkspace />
    </MemoryRouter>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Find the latest .NET developer jobs posted today' }))

  expect(screen.getByRole('textbox', { name: 'Tell JobPilot what you want to do' })).toHaveValue(
    'Find the latest .NET developer jobs posted today',
  )
})

test('reports the missing agent backend instead of pretending to run a task', () => {
  render(
    <MemoryRouter>
      <AgentWorkspace />
    </MemoryRouter>,
  )

  fireEvent.change(screen.getByLabelText('Tell JobPilot what you want to do'), {
    target: { value: 'Find remote backend jobs' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Run task' }))

  expect(screen.getByRole('alert')).toHaveTextContent('Task not sent')
  expect(screen.getByRole('alert')).toHaveTextContent('no search or application action was performed')
})
