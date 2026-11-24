import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Profile from '../pages/Profile'

test('allows multiple projects, clears the form, and saves projects independently', () => {
  render(<Profile />)
  fireEvent.click(screen.getByRole('tab', { name: 'Projects' }))

  const projectName = screen.getByLabelText('Project name *')
  fireEvent.change(projectName, { target: { value: 'Job Search Tracker' } })
  fireEvent.change(screen.getByLabelText('Technologies used'), { target: { value: 'React, TypeScript, SQL Server' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add project' }))

  expect(screen.getByText('Job Search Tracker')).toBeInTheDocument()
  expect(screen.getByText('Technologies: React, TypeScript, SQL Server')).toBeInTheDocument()
  expect(projectName).toHaveValue('')

  fireEvent.change(projectName, { target: { value: 'Portfolio Website' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add project' }))
  expect(screen.getByText('Portfolio Website')).toBeInTheDocument()
  expect(screen.getAllByRole('article')).toHaveLength(2)

  fireEvent.click(screen.getByRole('button', { name: 'Save section' }))
  expect(JSON.parse(localStorage.getItem('jobpilot-profile-projects') ?? 'null')).toHaveLength(2)
  expect(localStorage.getItem('jobpilot-profile-experience')).toBeNull()
})
