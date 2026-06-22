/*
 ****************************************************************************************************************************
 * Filename    : useLoginForm
 * Description : Login form state and submission hook.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { authService } from '../services'
import { validateLoginForm } from '../utils'
import { AUTH_ERRORS, AUTH_TOAST } from '../constants'
import type {
  LoginFormFields,
  LoginFormErrors,
  UseLoginFormReturn,
} from '../types'

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

    // Checkbox values come from `checked` instead of `value`.
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
      toast.success(AUTH_TOAST.LOGIN_SUCCESS)
      onSuccess?.()
    } catch (err) {
      // Prefer API error messages when available.
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
