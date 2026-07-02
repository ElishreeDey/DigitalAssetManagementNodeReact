/*
 ****************************************************************************************************************************
 * Filename    : useLoginForm.test
 * Description : Unit tests for the useLoginForm hook — field updates, validation errors,
 *               successful login, server errors, and password visibility toggle.
 *               authService and react-toastify are mocked.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AUTH_ERRORS } from '../../constants'

// Mock the services barrel so the hook receives a controllable authService.
vi.mock('../../services', () => ({
  authService: {
    login: vi.fn(),
  },
}))

// Suppress toast side-effects; they have no bearing on hook state under test.
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { useLoginForm } from '../../hooks/useLoginForm'
import { authService } from '../../services'

const mockAuthService = vi.mocked(authService)

// Helper — fires a change event on a named input field.
function changeField(
  hook: ReturnType<typeof useLoginForm>,
  name: string,
  value: string
) {
  act(() => {
    hook.handleChange({
      target: { name, value, type: 'text', checked: false },
    } as React.ChangeEvent<HTMLInputElement>)
  })
}

// Minimal form submit event — preventDefault stops the real form submission.
const fakeSubmit = {
  preventDefault: vi.fn(),
} as unknown as React.SyntheticEvent<HTMLFormElement>

describe('useLoginForm', () => {
  const onSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initialises with empty fields and no errors', () => {
    const { result } = renderHook(() => useLoginForm(onSuccess))
    expect(result.current.fields.email).toBe('')
    expect(result.current.fields.password).toBe('')
    expect(result.current.errors).toEqual({})
    expect(result.current.isLoading).toBe(false)
    expect(result.current.serverError).toBe('')
  })

  it('updates field value on change', () => {
    const { result } = renderHook(() => useLoginForm(onSuccess))
    changeField(result.current, 'email', 'user@example.com')
    expect(result.current.fields.email).toBe('user@example.com')
  })

  it('clears a field error as soon as the user starts typing', () => {
    const { result } = renderHook(() => useLoginForm(onSuccess))

    // Trigger validation to set errors first.
    act(() => {
      void result.current.handleSubmit(fakeSubmit)
    })
    expect(result.current.errors.email).toBeTruthy()

    // Typing in the email field should clear only the email error.
    changeField(result.current, 'email', 'user@example.com')
    expect(result.current.errors.email).toBeUndefined()
  })

  it('toggles password visibility', () => {
    const { result } = renderHook(() => useLoginForm(onSuccess))
    expect(result.current.showPassword).toBe(false)
    act(() => {
      result.current.toggleShowPassword()
    })
    expect(result.current.showPassword).toBe(true)
    act(() => {
      result.current.toggleShowPassword()
    })
    expect(result.current.showPassword).toBe(false)
  })

  it('sets validation errors and does not call authService when fields are empty', async () => {
    const { result } = renderHook(() => useLoginForm(onSuccess))
    await act(async () => {
      await result.current.handleSubmit(fakeSubmit)
    })
    expect(result.current.errors.email).toBe(AUTH_ERRORS.EMAIL_REQUIRED)
    expect(result.current.errors.password).toBe(AUTH_ERRORS.PASSWORD_REQUIRED)
    expect(mockAuthService.login).not.toHaveBeenCalled()
  })

  it('calls authService.login and onSuccess on a valid submission', async () => {
    mockAuthService.login.mockResolvedValue(undefined)
    const { result } = renderHook(() => useLoginForm(onSuccess))

    changeField(result.current, 'email', 'user@example.com')
    changeField(result.current, 'password', 'pass123')

    await act(async () => {
      await result.current.handleSubmit(fakeSubmit)
    })

    expect(mockAuthService.login).toHaveBeenCalledWith(
      'user@example.com',
      'pass123'
    )
    expect(onSuccess).toHaveBeenCalledOnce()
    expect(result.current.isLoading).toBe(false)
  })

  it('sets serverError when authService.login rejects with an API message', async () => {
    const apiError = {
      response: { data: { message: 'Invalid email or password' } },
    }
    mockAuthService.login.mockRejectedValue(apiError)
    const { result } = renderHook(() => useLoginForm(onSuccess))

    changeField(result.current, 'email', 'user@example.com')
    changeField(result.current, 'password', 'wrongpass')

    await act(async () => {
      await result.current.handleSubmit(fakeSubmit)
    })

    expect(result.current.serverError).toBe('Invalid email or password')
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('sets fallback serverError when the rejection carries no API message', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useLoginForm(onSuccess))

    changeField(result.current, 'email', 'user@example.com')
    changeField(result.current, 'password', 'pass123')

    await act(async () => {
      await result.current.handleSubmit(fakeSubmit)
    })

    expect(result.current.serverError).toBe(AUTH_ERRORS.LOGIN_FAILED)
  })
})
