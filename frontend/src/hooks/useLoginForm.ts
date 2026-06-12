/*
 ****************************************************************************************************************************
 * Filename    : useLoginForm
 * Description : Custom React hook that encapsulates login form state, field validation, and submission logic
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { authService } from '../services/authService'
import { validateLoginForm } from '../utils/validation'
import { AUTH_ERRORS } from '../constants/auth'
import type { LoginFormFields, LoginFormErrors, UseLoginFormReturn } from '../types/auth'

const INITIAL_FIELDS: LoginFormFields = {
  email: '',
  password: '',
  rememberMe: false,
}

export function useLoginForm(): UseLoginFormReturn {
  const [fields, setFields] = useState<LoginFormFields>(INITIAL_FIELDS)
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setFields((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError('')

    const validationErrors = validateLoginForm(fields)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    try {
      await authService.login(fields.email, fields.password)
    } catch {
      setServerError(AUTH_ERRORS.LOGIN_FAILED)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    fields,
    errors,
    showPassword,
    isLoading,
    serverError,
    handleChange,
    handleSubmit,
    toggleShowPassword: () => setShowPassword((v) => !v),
  }
}
