/*
 ****************************************************************************************************************************
 * Filename    : Register.test
 * Description : Component tests for the Register page — rendering all three form fields, server error
 *               banner, password visibility toggles, loading state, and the "Sign in" navigation link.
 *               useRegisterForm is mocked so no real API calls are made.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('../../assets', () => ({
  eyeIcon: 'eye.svg',
  eyeOffIcon: 'eye-off.svg',
  warningIcon: 'warning.svg',
}))

// Register imports useRegisterForm from the hooks barrel.
vi.mock('../../hooks', () => ({
  useRegisterForm: vi.fn(),
}))

import Register from '../../pages/Register/Register'
import { useRegisterForm } from '../../hooks'

const mockUseRegisterForm = vi.mocked(useRegisterForm)

function defaultHook(
  overrides: Partial<ReturnType<typeof useRegisterForm>> = {}
) {
  return {
    fields: { email: '', password: '', confirmPassword: '' },
    errors: {},
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
    serverError: '',
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
    toggleShowPassword: vi.fn(),
    toggleShowConfirmPassword: vi.fn(),
    ...overrides,
  }
}

describe('Register', () => {
  const onNavigateToLogin = vi.fn()
  const onRegisterSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRegisterForm.mockReturnValue(defaultHook())
  })

  it('renders email, password, and confirm-password inputs plus the submit button', () => {
    render(
      <Register
        onNavigateToLogin={onNavigateToLogin}
        onRegisterSuccess={onRegisterSuccess}
      />
    )
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create account' })
    ).toBeInTheDocument()
  })

  it('shows the server error banner when serverError is set', () => {
    mockUseRegisterForm.mockReturnValue(
      defaultHook({ serverError: 'Email already taken' })
    )
    render(
      <Register
        onNavigateToLogin={onNavigateToLogin}
        onRegisterSuccess={onRegisterSuccess}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Email already taken')
  })

  it('does not render the server error banner when serverError is empty', () => {
    render(
      <Register
        onNavigateToLogin={onNavigateToLogin}
        onRegisterSuccess={onRegisterSuccess}
      />
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('disables the submit button and shows spinner text while loading', () => {
    mockUseRegisterForm.mockReturnValue(defaultHook({ isLoading: true }))
    render(
      <Register
        onNavigateToLogin={onNavigateToLogin}
        onRegisterSuccess={onRegisterSuccess}
      />
    )
    expect(
      screen.getByRole('button', { name: /creating account/i })
    ).toBeDisabled()
  })

  it('calls onNavigateToLogin when "Sign in" link is clicked', () => {
    render(
      <Register
        onNavigateToLogin={onNavigateToLogin}
        onRegisterSuccess={onRegisterSuccess}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(onNavigateToLogin).toHaveBeenCalledOnce()
  })

  it('calls toggleShowPassword when the password eye button is clicked', () => {
    const toggleShowPassword = vi.fn()
    mockUseRegisterForm.mockReturnValue(defaultHook({ toggleShowPassword }))
    render(
      <Register
        onNavigateToLogin={onNavigateToLogin}
        onRegisterSuccess={onRegisterSuccess}
      />
    )
    const eyeButtons = screen.getAllByLabelText('Show password')
    fireEvent.click(eyeButtons[0]) // First eye button is for the password field.
    expect(toggleShowPassword).toHaveBeenCalledOnce()
  })

  it('calls toggleShowConfirmPassword when the confirm-password eye button is clicked', () => {
    const toggleShowConfirmPassword = vi.fn()
    mockUseRegisterForm.mockReturnValue(
      defaultHook({ toggleShowConfirmPassword })
    )
    render(
      <Register
        onNavigateToLogin={onNavigateToLogin}
        onRegisterSuccess={onRegisterSuccess}
      />
    )
    const eyeButtons = screen.getAllByLabelText('Show password')
    fireEvent.click(eyeButtons[1]) // Second eye button is for confirm-password.
    expect(toggleShowConfirmPassword).toHaveBeenCalledOnce()
  })
})
