/*
 ****************************************************************************************************************************
 * Filename    : useRegisterForm
 * Description : Registration form state and submission hook.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { authService } from '../services'
import { validateRegisterForm } from '../utils'
import { AUTH_ERRORS, AUTH_TOAST } from '../constants'
import type {
  RegisterFormFields,
  RegisterFormErrors,
  UseRegisterFormReturn,
} from '../types'

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

    if (errors[name as keyof RegisterFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError('')

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
      // Prefer API error messages when available.
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
