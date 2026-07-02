/*
 ****************************************************************************************************************************
 * Filename    : useRegisterForm.test
 * Description : Unit tests for the useRegisterForm hook — field updates, validation errors,
 *               successful registration, server errors, and both password visibility toggles.
 *               authService and react-toastify are mocked.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AUTH_ERRORS } from '../../constants'

vi.mock('../../services', () => ({
  authService: {
    register: vi.fn(),
  },
}))

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { useRegisterForm } from '../../hooks/useRegisterForm'
import { authService } from '../../services'

const mockAuthService = vi.mocked(authService)

// Helper — fires a change event on a named input field.
function changeField(
  hook: ReturnType<typeof useRegisterForm>,
  name: string,
  value: string
) {
  act(() => {
    hook.handleChange({
      target: { name, value, type: 'text', checked: false },
    } as React.ChangeEvent<HTMLInputElement>)
  })
}

const fakeSubmit = {
  preventDefault: vi.fn(),
} as unknown as React.SyntheticEvent<HTMLFormElement>

describe('useRegisterForm', () => {
  const onSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initialises with empty fields and no errors', () => {
    const { result } = renderHook(() => useRegisterForm(onSuccess))
    expect(result.current.fields.email).toBe('')
    expect(result.current.fields.password).toBe('')
    expect(result.current.fields.confirmPassword).toBe('')
    expect(result.current.errors).toEqual({})
    expect(result.current.isLoading).toBe(false)
    expect(result.current.serverError).toBe('')
  })

  it('updates field values on change', () => {
    const { result } = renderHook(() => useRegisterForm(onSuccess))
    changeField(result.current, 'email', 'new@example.com')
    changeField(result.current, 'password', 'newpass')
    changeField(result.current, 'confirmPassword', 'newpass')
    expect(result.current.fields.email).toBe('new@example.com')
    expect(result.current.fields.password).toBe('newpass')
    expect(result.current.fields.confirmPassword).toBe('newpass')
  })

  it('clears a field error as soon as the user starts typing', () => {
    const { result } = renderHook(() => useRegisterForm(onSuccess))
    act(() => {
      void result.current.handleSubmit(fakeSubmit)
    })
    expect(result.current.errors.email).toBeTruthy()

    changeField(result.current, 'email', 'new@example.com')
    expect(result.current.errors.email).toBeUndefined()
  })

  it('toggles password visibility', () => {
    const { result } = renderHook(() => useRegisterForm(onSuccess))
    expect(result.current.showPassword).toBe(false)
    act(() => {
      result.current.toggleShowPassword()
    })
    expect(result.current.showPassword).toBe(true)
  })

  it('toggles confirm-password visibility independently', () => {
    const { result } = renderHook(() => useRegisterForm(onSuccess))
    expect(result.current.showConfirmPassword).toBe(false)
    act(() => {
      result.current.toggleShowConfirmPassword()
    })
    expect(result.current.showConfirmPassword).toBe(true)
    // Toggling confirmPassword must not affect showPassword.
    expect(result.current.showPassword).toBe(false)
  })

  it('sets validation errors and does not call authService when fields are empty', async () => {
    const { result } = renderHook(() => useRegisterForm(onSuccess))
    await act(async () => {
      await result.current.handleSubmit(fakeSubmit)
    })
    expect(result.current.errors.email).toBe(AUTH_ERRORS.EMAIL_REQUIRED)
    expect(result.current.errors.password).toBe(AUTH_ERRORS.PASSWORD_REQUIRED)
    expect(mockAuthService.register).not.toHaveBeenCalled()
  })

  it('sets PASSWORDS_DO_NOT_MATCH error when passwords differ', async () => {
    const { result } = renderHook(() => useRegisterForm(onSuccess))
    changeField(result.current, 'email', 'new@example.com')
    changeField(result.current, 'password', 'pass123')
    changeField(result.current, 'confirmPassword', 'different')
    await act(async () => {
      await result.current.handleSubmit(fakeSubmit)
    })
    expect(result.current.errors.confirmPassword).toBe(
      AUTH_ERRORS.PASSWORDS_DO_NOT_MATCH
    )
    expect(mockAuthService.register).not.toHaveBeenCalled()
  })

  it('calls authService.register and onSuccess on a valid submission', async () => {
    mockAuthService.register.mockResolvedValue(undefined)
    const { result } = renderHook(() => useRegisterForm(onSuccess))

    changeField(result.current, 'email', 'new@example.com')
    changeField(result.current, 'password', 'pass123')
    changeField(result.current, 'confirmPassword', 'pass123')

    await act(async () => {
      await result.current.handleSubmit(fakeSubmit)
    })

    expect(mockAuthService.register).toHaveBeenCalledWith(
      'new@example.com',
      'pass123'
    )
    expect(onSuccess).toHaveBeenCalledOnce()
    expect(result.current.isLoading).toBe(false)
  })

  it('sets serverError when authService.register rejects with an API message', async () => {
    const apiError = { response: { data: { message: 'Email already taken' } } }
    mockAuthService.register.mockRejectedValue(apiError)
    const { result } = renderHook(() => useRegisterForm(onSuccess))

    changeField(result.current, 'email', 'dup@example.com')
    changeField(result.current, 'password', 'pass123')
    changeField(result.current, 'confirmPassword', 'pass123')

    await act(async () => {
      await result.current.handleSubmit(fakeSubmit)
    })

    expect(result.current.serverError).toBe('Email already taken')
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('sets fallback serverError when the rejection carries no API message', async () => {
    mockAuthService.register.mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useRegisterForm(onSuccess))

    changeField(result.current, 'email', 'new@example.com')
    changeField(result.current, 'password', 'pass123')
    changeField(result.current, 'confirmPassword', 'pass123')

    await act(async () => {
      await result.current.handleSubmit(fakeSubmit)
    })

    expect(result.current.serverError).toBe(AUTH_ERRORS.REGISTER_FAILED)
  })
})
