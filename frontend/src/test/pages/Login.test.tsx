/*
 ****************************************************************************************************************************
 * Filename    : Login.test
 * Description : Component tests for the Login page — rendering, server error banner, field
 *               validation errors, password visibility toggle, loading state, and navigation link.
 *               useLoginForm is mocked so no real API calls are made.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock SVG asset imports — jsdom cannot process SVG modules.
vi.mock('../../assets', () => ({
  eyeIcon: 'eye.svg',
  eyeOffIcon: 'eye-off.svg',
  warningIcon: 'warning.svg',
}))

vi.mock('../../hooks/useLoginForm', () => ({
  useLoginForm: vi.fn(),
}))

import Login from '../../pages/Login/Login'
import { useLoginForm } from '../../hooks/useLoginForm'

const mockUseLoginForm = vi.mocked(useLoginForm)

// Default hook return value — all fields empty, no errors, not loading.
function defaultHook(overrides: Partial<ReturnType<typeof useLoginForm>> = {}) {
  return {
    fields: { email: '', password: '', rememberMe: false },
    errors: {},
    showPassword: false,
    isLoading: false,
    serverError: '',
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
    toggleShowPassword: vi.fn(),
    ...overrides,
  }
}

describe('Login', () => {
  const onNavigateToRegister = vi.fn()
  const onLoginSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLoginForm.mockReturnValue(defaultHook())
  })

  it('renders the email input, password input, and submit button', () => {
    render(
      <Login
        onNavigateToRegister={onNavigateToRegister}
        onLoginSuccess={onLoginSuccess}
      />
    )
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows the server error banner when serverError is set', () => {
    mockUseLoginForm.mockReturnValue(
      defaultHook({ serverError: 'Invalid credentials' })
    )
    render(
      <Login
        onNavigateToRegister={onNavigateToRegister}
        onLoginSuccess={onLoginSuccess}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('does not render the server error banner when serverError is empty', () => {
    render(
      <Login
        onNavigateToRegister={onNavigateToRegister}
        onLoginSuccess={onLoginSuccess}
      />
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('renders the email field error when errors.email is set', () => {
    mockUseLoginForm.mockReturnValue(
      defaultHook({ errors: { email: 'Email is required' } })
    )
    render(
      <Login
        onNavigateToRegister={onNavigateToRegister}
        onLoginSuccess={onLoginSuccess}
      />
    )
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('disables the submit button and shows spinner text while loading', () => {
    mockUseLoginForm.mockReturnValue(defaultHook({ isLoading: true }))
    render(
      <Login
        onNavigateToRegister={onNavigateToRegister}
        onLoginSuccess={onLoginSuccess}
      />
    )
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('calls onNavigateToRegister when "Create one" link is clicked', () => {
    render(
      <Login
        onNavigateToRegister={onNavigateToRegister}
        onLoginSuccess={onLoginSuccess}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create one' }))
    expect(onNavigateToRegister).toHaveBeenCalledOnce()
  })

  it('calls toggleShowPassword when the eye icon button is clicked', () => {
    const toggleShowPassword = vi.fn()
    mockUseLoginForm.mockReturnValue(defaultHook({ toggleShowPassword }))
    render(
      <Login
        onNavigateToRegister={onNavigateToRegister}
        onLoginSuccess={onLoginSuccess}
      />
    )
    fireEvent.click(screen.getByLabelText('Show password'))
    expect(toggleShowPassword).toHaveBeenCalledOnce()
  })

  it('changes password input type to text when showPassword is true', () => {
    mockUseLoginForm.mockReturnValue(defaultHook({ showPassword: true }))
    render(
      <Login
        onNavigateToRegister={onNavigateToRegister}
        onLoginSuccess={onLoginSuccess}
      />
    )
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
  })
})
