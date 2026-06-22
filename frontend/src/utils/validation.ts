/*
 ****************************************************************************************************************************
 * Filename    : validation
 * Description : Form validation utilities
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { EMAIL_REGEX, PASSWORD_MIN_LENGTH, AUTH_ERRORS } from '../constants'
import type {
  LoginFormFields,
  LoginFormErrors,
  RegisterFormFields,
  RegisterFormErrors,
} from '../types'

export function validateLoginForm(fields: LoginFormFields): LoginFormErrors {
  const errors: LoginFormErrors = {}

  if (!fields.email.trim()) {
    errors.email = AUTH_ERRORS.EMAIL_REQUIRED
  } else if (!EMAIL_REGEX.test(fields.email)) {
    errors.email = AUTH_ERRORS.EMAIL_INVALID
  }

  if (!fields.password) {
    errors.password = AUTH_ERRORS.PASSWORD_REQUIRED
  } else if (fields.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = AUTH_ERRORS.PASSWORD_MIN_LENGTH
  }

  return errors
}

export function validateRegisterForm(
  fields: RegisterFormFields
): RegisterFormErrors {
  const errors: RegisterFormErrors = {}

  if (!fields.email.trim()) {
    errors.email = AUTH_ERRORS.EMAIL_REQUIRED
  } else if (!EMAIL_REGEX.test(fields.email)) {
    errors.email = AUTH_ERRORS.EMAIL_INVALID
  }

  if (!fields.password) {
    errors.password = AUTH_ERRORS.PASSWORD_REQUIRED
  } else if (fields.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = AUTH_ERRORS.PASSWORD_MIN_LENGTH
  }

  if (!fields.confirmPassword) {
    errors.confirmPassword = AUTH_ERRORS.CONFIRM_PASSWORD_REQUIRED
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = AUTH_ERRORS.PASSWORDS_DO_NOT_MATCH
  }

  return errors
}
