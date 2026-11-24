import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Profile from '../pages/Profile'

test('saves personal details independently and enforces only marked required fields', () => {
  const view = render(<Profile />)
  expect(screen.getByLabelText('Full legal name *')).toBeRequired()
  expect(screen.getByLabelText('Preferred name')).not.toBeRequired()

  fireEvent.click(screen.getByRole('button', { name: 'Save section' }))
  expect(localStorage.getItem('jobpilot-profile-personal')).toBeNull()

  fireEvent.change(screen.getByLabelText('Full legal name *'), { target: { value: 'Avery Candidate' } })
  fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'avery@example.com' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save section' }))
  expect(JSON.parse(localStorage.getItem('jobpilot-profile-personal') ?? 'null')).toMatchObject({
    fullName: 'Avery Candidate',
    email: 'avery@example.com',
  })

  view.unmount()
  render(<Profile />)
  expect(screen.getByLabelText('Full legal name *')).toHaveValue('Avery Candidate')
})

test('saves the experience section separately from personal details', () => {
  render(<Profile />)
  fireEvent.click(screen.getByRole('tab', { name: 'Experience' }))
  fireEvent.change(screen.getByLabelText('Job title *'), { target: { value: 'Platform Engineer' } })
  fireEvent.change(screen.getByLabelText('Employer *'), { target: { value: 'Example Works' } })
  fireEvent.change(screen.getByLabelText('Start date *'), { target: { value: '2021-06-01' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add experience' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save section' }))

  expect(JSON.parse(localStorage.getItem('jobpilot-profile-experience') ?? 'null')).toHaveLength(1)
  expect(localStorage.getItem('jobpilot-profile-personal')).toBeNull()
  expect(screen.getByRole('status')).toHaveTextContent('Saved in this browser only')
})
