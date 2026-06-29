/*
 ****************************************************************************************************************************
 * Filename    : auth
 * Description : TypeScript types for all authentication forms and the hooks that drive them.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import type { ChangeEvent, SyntheticEvent } from 'react'

/* Authenticated user */
export type UserRole = 'admin' | 'editor' | 'viewer'

export type AuthUser = {
  userId: string
  email: string
  role: UserRole
}

/* Bare id and email from the registered account (e.g. to pick "add team member" while adding a team member) */
export type Account = {
  id: string
  email: string
}

/* Login */
export type LoginFormFields = {
  email: string
  password: string
  rememberMe: boolean
}

export type LoginFormErrors = {
  email?: string
  password?: string
}

export type UseLoginFormReturn = {
  fields: LoginFormFields
  errors: LoginFormErrors
  showPassword: boolean
  isLoading: boolean
  serverError: string
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: SyntheticEvent<HTMLFormElement>) => Promise<void>
  toggleShowPassword: () => void
}

/* Register */
export type RegisterFormFields = {
  email: string
  password: string
  confirmPassword: string
}

export type RegisterFormErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

export type UseRegisterFormReturn = {
  fields: RegisterFormFields
  errors: RegisterFormErrors
  showPassword: boolean
  showConfirmPassword: boolean
  isLoading: boolean
  serverError: string
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: SyntheticEvent<HTMLFormElement>) => Promise<void>
  toggleShowPassword: () => void
  toggleShowConfirmPassword: () => void
}
