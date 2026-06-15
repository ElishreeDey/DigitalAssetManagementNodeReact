/*
 ****************************************************************************************************************************
 * Filename    : userTypes
 * Description : TypeScript types for the user CRUD resource.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

export interface UserCreateBody {
  name: string
  email: string
  phone: string
  gender?: 'Male' | 'Female' | 'Other' | null
}

export interface UserUpdateBody {
  name?: string
  email?: string
  phone?: string
  gender?: 'Male' | 'Female' | 'Other' | null
}
