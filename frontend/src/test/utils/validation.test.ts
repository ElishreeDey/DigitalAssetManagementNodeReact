/*
 ****************************************************************************************************************************
 * Filename    : validation.test
 * Description : Unit tests for form validation utilities — validateLoginForm and validateRegisterForm.
 *               These are pure functions with no external dependencies, so no mocking is needed.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect } from 'vitest'
import { validateLoginForm, validateRegisterForm } from '../../utils/validation'
import { AUTH_ERRORS } from '../../constants'

// validateLoginForm
describe('validateLoginForm', () => {
  it('returns an empty object when both fields are valid', () => {
    const errors = validateLoginForm({
      email: 'user@example.com',
      password: 'pass123',
      rememberMe: false,
    })
    expect(errors).toEqual({})
  })

  it('returns EMAIL_REQUIRED when email is empty', () => {
    const errors = validateLoginForm({
      email: '',
      password: 'pass123',
      rememberMe: false,
    })
    expect(errors.email).toBe(AUTH_ERRORS.EMAIL_REQUIRED)
  })

  it('returns EMAIL_REQUIRED when email is only whitespace', () => {
    const errors = validateLoginForm({
      email: '   ',
      password: 'pass123',
      rememberMe: false,
    })
    expect(errors.email).toBe(AUTH_ERRORS.EMAIL_REQUIRED)
  })

  it('returns EMAIL_INVALID when email format is wrong', () => {
    const errors = validateLoginForm({
      email: 'not-an-email',
      password: 'pass123',
      rememberMe: false,
    })
    expect(errors.email).toBe(AUTH_ERRORS.EMAIL_INVALID)
  })

  it('returns PASSWORD_REQUIRED when password is empty', () => {
    const errors = validateLoginForm({
      email: 'user@example.com',
      password: '',
      rememberMe: false,
    })
    expect(errors.password).toBe(AUTH_ERRORS.PASSWORD_REQUIRED)
  })

  it('returns PASSWORD_MIN_LENGTH when password is fewer than 6 characters', () => {
    const errors = validateLoginForm({
      email: 'user@example.com',
      password: 'abc',
      rememberMe: false,
    })
    expect(errors.password).toBe(AUTH_ERRORS.PASSWORD_MIN_LENGTH)
  })

  it('returns both field errors when both fields are invalid', () => {
    const errors = validateLoginForm({
      email: '',
      password: '',
      rememberMe: false,
    })
    expect(errors.email).toBe(AUTH_ERRORS.EMAIL_REQUIRED)
    expect(errors.password).toBe(AUTH_ERRORS.PASSWORD_REQUIRED)
  })
})

// validateRegisterForm
describe('validateRegisterForm', () => {
  it('returns an empty object when all fields are valid', () => {
    const errors = validateRegisterForm({
      email: 'user@example.com',
      password: 'pass123',
      confirmPassword: 'pass123',
    })
    expect(errors).toEqual({})
  })

  it('returns EMAIL_REQUIRED when email is empty', () => {
    const errors = validateRegisterForm({
      email: '',
      password: 'pass123',
      confirmPassword: 'pass123',
    })
    expect(errors.email).toBe(AUTH_ERRORS.EMAIL_REQUIRED)
  })

  it('returns EMAIL_INVALID for a malformed email', () => {
    const errors = validateRegisterForm({
      email: 'bad@@email',
      password: 'pass123',
      confirmPassword: 'pass123',
    })
    expect(errors.email).toBe(AUTH_ERRORS.EMAIL_INVALID)
  })

  it('returns PASSWORD_REQUIRED when password is empty', () => {
    const errors = validateRegisterForm({
      email: 'user@example.com',
      password: '',
      confirmPassword: '',
    })
    expect(errors.password).toBe(AUTH_ERRORS.PASSWORD_REQUIRED)
  })

  it('returns PASSWORD_MIN_LENGTH when password is shorter than 6 characters', () => {
    const errors = validateRegisterForm({
      email: 'user@example.com',
      password: 'abc',
      confirmPassword: 'abc',
    })
    expect(errors.password).toBe(AUTH_ERRORS.PASSWORD_MIN_LENGTH)
  })

  it('returns CONFIRM_PASSWORD_REQUIRED when confirmPassword is empty', () => {
    const errors = validateRegisterForm({
      email: 'user@example.com',
      password: 'pass123',
      confirmPassword: '',
    })
    expect(errors.confirmPassword).toBe(AUTH_ERRORS.CONFIRM_PASSWORD_REQUIRED)
  })

  it('returns PASSWORDS_DO_NOT_MATCH when passwords differ', () => {
    const errors = validateRegisterForm({
      email: 'user@example.com',
      password: 'pass123',
      confirmPassword: 'different',
    })
    expect(errors.confirmPassword).toBe(AUTH_ERRORS.PASSWORDS_DO_NOT_MATCH)
  })

  it('returns all three errors when all fields are empty', () => {
    const errors = validateRegisterForm({
      email: '',
      password: '',
      confirmPassword: '',
    })
    expect(errors.email).toBe(AUTH_ERRORS.EMAIL_REQUIRED)
    expect(errors.password).toBe(AUTH_ERRORS.PASSWORD_REQUIRED)
    // confirmPassword is empty, which triggers CONFIRM_PASSWORD_REQUIRED first.
    expect(errors.confirmPassword).toBe(AUTH_ERRORS.CONFIRM_PASSWORD_REQUIRED)
  })
})
