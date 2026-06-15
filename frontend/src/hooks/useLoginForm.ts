/*
 ****************************************************************************************************************************
 * Filename    : useLoginForm
 * Description : Custom React hook that owns all login form state, field validation, and API submission.
 *               The page component stays a pure UI layer — it never imports authService directly.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { authService } from '../services/authService'
import { validateLoginForm } from '../utils/validation'
import { AUTH_ERRORS, AUTH_TOAST } from '../constants/auth'
import type {
  LoginFormFields,
  LoginFormErrors,
  UseLoginFormReturn,
} from '../types/auth'

// Reset shape used when the form mounts and after a successful submission.
const INITIAL_FIELDS: LoginFormFields = {
  email: '',
  password: '',
  rememberMe: false,
}

export function useLoginForm(onSuccess?: () => void): UseLoginFormReturn {
  const [fields, setFields] = useState<LoginFormFields>(INITIAL_FIELDS)
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target

    // Checkbox fields carry their value in `checked`, not `value`.
    setFields((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear the inline error for this field as soon as the user starts correcting it.
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError('')

    // Run client-side validation first so we avoid an unnecessary network round-trip.
    const validationErrors = validateLoginForm(fields)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    try {
      await authService.login(fields.email, fields.password)
      toast.success(AUTH_TOAST.LOGIN_SUCCESS)
      onSuccess?.()
    } catch (err) {
      // Prefer the backend's message (e.g. "Invalid email or password") over the generic fallback
      // so the user gets actionable feedback without us leaking internal details.
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? (err.response.data.message as string)
          : AUTH_ERRORS.LOGIN_FAILED
      setServerError(message)
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
