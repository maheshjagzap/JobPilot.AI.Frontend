import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Profile from '../pages/Profile'

test('allows multiple experience entries to be added and removed', () => {
  render(<Profile />)
  fireEvent.click(screen.getByRole('tab', { name: 'Experience' }))

  fireEvent.change(screen.getByLabelText('Job title *'), { target: { value: 'Backend Engineer' } })
  fireEvent.change(screen.getByLabelText('Employer *'), { target: { value: 'Northwind' } })
  fireEvent.change(screen.getByLabelText('Start date *'), { target: { value: '2022-01-01' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add experience' }))

  fireEvent.change(screen.getByLabelText('Job title *'), { target: { value: 'Senior Engineer' } })
  fireEvent.change(screen.getByLabelText('Employer *'), { target: { value: 'Contoso' } })
  fireEvent.change(screen.getByLabelText('Start date *'), { target: { value: '2024-01-01' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add experience' }))

  expect(screen.getByText('Backend Engineer')).toBeInTheDocument()
  expect(screen.getByText('Senior Engineer')).toBeInTheDocument()
  expect(screen.getAllByRole('article')).toHaveLength(2)

  fireEvent.click(screen.getByRole('button', { name: 'Remove Backend Engineer' }))
  expect(screen.queryByText('Backend Engineer')).not.toBeInTheDocument()
  expect(screen.getAllByRole('article')).toHaveLength(1)
})

test('supports multiple education and certification entries', () => {
  render(<Profile />)
  fireEvent.click(screen.getByRole('tab', { name: 'Education' }))

  fireEvent.change(screen.getByLabelText('Institution *'), { target: { value: 'State University' } })
  fireEvent.change(screen.getByLabelText('Degree *'), { target: { value: 'Bachelor of Science' } })
  fireEvent.change(screen.getByLabelText('Field of study *'), { target: { value: 'Computer Science' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add education' }))

  fireEvent.change(screen.getByLabelText('Institution *'), { target: { value: 'Technical Institute' } })
  fireEvent.change(screen.getByLabelText('Degree *'), { target: { value: 'Diploma' } })
  fireEvent.change(screen.getByLabelText('Field of study *'), { target: { value: 'Software' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add education' }))
  expect(screen.getByText('Bachelor of Science · Computer Science')).toBeInTheDocument()
  expect(screen.getByText('Diploma · Software')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Certifications' }))
  fireEvent.change(screen.getByLabelText('Certification name *'), { target: { value: 'Cloud Fundamentals' } })
  fireEvent.change(screen.getByLabelText('Issuing organization *'), { target: { value: 'Example Academy' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add certification' }))

  fireEvent.change(screen.getByLabelText('Certification name *'), { target: { value: 'Secure Cloud Associate' } })
  fireEvent.change(screen.getByLabelText('Issuing organization *'), { target: { value: 'Example Academy' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add certification' }))
  expect(screen.getByText('Cloud Fundamentals')).toBeInTheDocument()
  expect(screen.getByText('Secure Cloud Associate')).toBeInTheDocument()
})

test('clears the skill form after each added skill and saves the skill list separately', () => {
  render(<Profile />)
  fireEvent.click(screen.getByRole('tab', { name: 'Skills' }))

  const skillName = screen.getByLabelText('Skill name *')
  fireEvent.change(skillName, { target: { value: 'C#' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add skill' }))
  expect(screen.getByText('C#')).toBeInTheDocument()
  expect(skillName).toHaveValue('')

  fireEvent.change(skillName, { target: { value: 'SQL Server' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add skill' }))
  expect(screen.getByText('SQL Server')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Save section' }))
  expect(JSON.parse(localStorage.getItem('jobpilot-profile-skills') ?? 'null')).toHaveLength(2)
})
