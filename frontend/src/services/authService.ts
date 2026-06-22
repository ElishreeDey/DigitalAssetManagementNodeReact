/*
 ****************************************************************************************************************************
 * Filename    : authService
 * Description : Authentication API service — calls the backend login and register endpoints.
 *               The JWT is handled entirely by the browser via httpOnly cookie token.
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
    await api.post(AUTH_ENDPOINTS.REGISTER, { email, password })
  },

  async logout(): Promise<void> {
    await api.post(AUTH_ENDPOINTS.LOGOUT)
  },

  async curLoggedInUser(): Promise<AuthUser> {
    const res = await api.get<AuthUser>(AUTH_ENDPOINTS.ME)
    return res.data
  },
}
