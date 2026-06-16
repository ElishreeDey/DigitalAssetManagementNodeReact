/*
 ****************************************************************************************************************************
 * Filename    : authService
 * Description : Authentication API service — calls the backend login and register endpoints.
 *               The JWT is handled entirely by the browser via httpOnly cookie; this layer never touches the token.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import api from './api'
import { AUTH_ENDPOINTS } from '../constants'
import type { AuthUser } from '../types'

export const authService = {
  async login(email: string, password: string): Promise<void> {
    // POST body carries credentials; on success the backend sets an httpOnly cookie.
    await api.post(AUTH_ENDPOINTS.LOGIN, { email, password })
  },

  async register(email: string, password: string): Promise<void> {
    // confirmPassword is validated client-side only; the backend only needs email + password.
    await api.post(AUTH_ENDPOINTS.REGISTER, { email, password })
  },

  async logout(): Promise<void> {
    // Tells the backend to clear the httpOnly cookie — client-side JS cannot clear it directly.
    await api.post(AUTH_ENDPOINTS.LOGOUT)
  },

  async curLoggedInUser(): Promise<AuthUser> {
    // Reads user identity from the httpOnly cookie — no token handling needed in JS.
    const res = await api.get<AuthUser>(AUTH_ENDPOINTS.ME)
    return res.data
  },
}
