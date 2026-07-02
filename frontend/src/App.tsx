/*
 ****************************************************************************************************************************
 * Filename    : App
 * Description : Root application component — owns the top-level view state and passes navigation callbacks down
 *               so pages never know about each other directly.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { useState, useEffect, lazy, Suspense } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import { authService } from './services'
import type { AuthUser } from './types'

const Register = lazy(() => import('./pages/Register/Register'))

type View = 'login' | 'register' | 'dashboard'

export default function App() {
  const [view, setView] = useState<View>('login')
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    // On every page load (including browser refresh), verify the httpOnly cookie
    // is still valid go straight to dashboard; otherwise login.
    authService
      .curLoggedInUser()
      .then((user) => {
        setCurrentUser(user)
        setView('dashboard')
      })
      .catch(() => setView('login'))
      .finally(() => setIsAuthChecking(false))
  }, [])

  if (isAuthChecking) {
    return null
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {view === 'register' && (
        <Suspense fallback={null}>
          <Register
            onNavigateToLogin={() => setView('login')}
            onRegisterSuccess={() => setView('login')}
          />
        </Suspense>
      )}

      {view === 'dashboard' && (
        <Dashboard
          onLogout={() => {
            setCurrentUser(null)
            setView('login')
          }}
          initialUser={currentUser}
        />
      )}

      {view === 'login' && (
        <Login
          onNavigateToRegister={() => setView('register')}
          onLoginSuccess={() => {
            authService.curLoggedInUser().then((user) => {
              setCurrentUser(user)
              setView('dashboard')
            })
          }}
        />
      )}
    </>
  )
}
