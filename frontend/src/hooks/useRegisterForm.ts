/*
 ****************************************************************************************************************************
 * Filename    : useRegisterForm
 * Description : Custom React hook that owns all register form state, confirm-password validation, and API submission.
 *               Calls onSuccess() after a successful registration so the caller can switch to the Login view.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { authService } from '../services/authService'
import { validateRegisterForm } from '../utils/validation'
import { AUTH_ERRORS, AUTH_TOAST } from '../constants/auth'
import type {
  RegisterFormFields,
  RegisterFormErrors,
  UseRegisterFormReturn,
} from '../types/auth'

// Stable empty state — used on mount and to reset after success if needed.
const INITIAL_FIELDS: RegisterFormFields = {
  email: '',
  password: '',
  confirmPassword: '',
}

export function useRegisterForm(onSuccess: () => void): UseRegisterFormReturn {
  const [fields, setFields] = useState<RegisterFormFields>(INITIAL_FIELDS)
  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))

    // Clear the inline error for this field the moment the user starts correcting it
    // so the red border disappears without waiting for a full re-validation.
    if (errors[name as keyof RegisterFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError('')

    // Client-side validation catches empty/mismatched passwords before hitting the network.
    const validationErrors = validateRegisterForm(fields)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    try {
      await authService.register(fields.email, fields.password)
      toast.success(AUTH_TOAST.REGISTER_SUCCESS)
      onSuccess()
    } catch (err) {
      // Surface the backend message when available (e.g. "Email already exists").
      // Fall back to the generic constant so no bare strings exist in this file.
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? (err.response.data.message as string)
          : AUTH_ERRORS.REGISTER_FAILED
      setServerError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    fields,
    errors,
    showPassword,
    showConfirmPassword,
    isLoading,
    serverError,
    handleChange,
    handleSubmit,
    toggleShowPassword: () => setShowPassword((v) => !v),
    toggleShowConfirmPassword: () => setShowConfirmPassword((v) => !v),
  }
}
