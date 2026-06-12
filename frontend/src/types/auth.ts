/*
 ****************************************************************************************************************************
 * Filename    : auth
 * Description : This file holds all entry variable type
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

export type LoginFormFields = {
  email: string
  password: string
  rememberMe: boolean
}

export type LoginFormErrors = {
  email?: string
  password?: string
}

import type { ChangeEvent, SyntheticEvent } from 'react'

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
