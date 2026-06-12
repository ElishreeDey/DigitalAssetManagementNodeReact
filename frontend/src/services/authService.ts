/*
 ****************************************************************************************************************************
 * Filename    : authService
 * Description : Authentication API service — handles login requests to the backend and manages auth tokens
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

// import api from './api'   ← wire up when backend /auth/login is ready

export const authService = {
  async login(email: string, password: string): Promise<void> {
    // TODO: swap with real call → api.post('/auth/login', { email, password })
    await new Promise((r) => setTimeout(r, 1200))
    console.log('Login submitted', { email, password })
  },
}
