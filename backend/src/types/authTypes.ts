/*
 ****************************************************************************************************************************
 * Filename    : authTypes
 * Description : TypeScript types for authentication — JWT payload and request bodies.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

export interface JwtPayload {
  userId: string
  email: string
}

export interface RegisterBody {
  email: string
  password: string
}

export interface LoginBody {
  email: string
  password: string
}
