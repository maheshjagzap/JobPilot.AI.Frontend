import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Profile from '../pages/Profile'

test('supports multiple target roles, a salary range, and flexible work modes', () => {
  render(<Profile />)
  fireEvent.click(screen.getByRole('tab', { name: 'Preferences' }))

  fireEvent.change(screen.getByLabelText('Target role'), { target: { value: '.NET Developer' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add role' }))
  fireEvent.change(screen.getByLabelText('Target role'), { target: { value: 'Software Developer' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add role' }))

  expect(screen.getByText('.NET Developer')).toBeInTheDocument()
  expect(screen.getByText('Software Developer')).toBeInTheDocument()

  fireEvent.change(screen.getByLabelText('Minimum salary'), { target: { value: '100000' } })
  fireEvent.change(screen.getByLabelText('Maximum salary'), { target: { value: '50000' } })
  expect(screen.getByRole('alert')).toHaveTextContent('Minimum salary must not exceed maximum salary.')

  fireEvent.click(screen.getByRole('checkbox', { name: 'Flexible / Any' }))
  expect(screen.getByRole('checkbox', { name: 'Flexible / Any' })).toBeChecked()
  fireEvent.click(screen.getByRole('checkbox', { name: 'Remote' }))
  expect(screen.getByRole('checkbox', { name: 'Flexible / Any' })).not.toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'Remote' })).toBeChecked()
})

test('adds preferred countries with suggested and custom cities', () => {
  render(<Profile />)
  fireEvent.click(screen.getByRole('tab', { name: 'Relocation' }))

  fireEvent.change(screen.getByLabelText('Preferred country'), { target: { value: 'India' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add country' }))
  fireEvent.change(screen.getByLabelText('Suggested city in India'), { target: { value: 'Bengaluru' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add city' }))
  fireEvent.change(screen.getByLabelText('Custom city in India'), { target: { value: 'Mysuru' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add custom city' }))

  expect(screen.getByText('Bengaluru')).toBeInTheDocument()
  expect(screen.getByText('Mysuru')).toBeInTheDocument()

  fireEvent.change(screen.getByLabelText('Preferred country'), { target: { value: 'Canada' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add country' }))
  expect(screen.getByText('Canada')).toBeInTheDocument()
})
