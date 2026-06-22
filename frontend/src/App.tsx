/*
 ****************************************************************************************************************************
 * Filename    : App
 * Description : Root application component — owns the top-level view state and passes navigation callbacks down
 *               so pages never know about each other directly.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { useState, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import { authService } from './services'

type View = 'login' | 'register' | 'dashboard'

export default function App() {
  const [view, setView] = useState<View>('login')
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  useEffect(() => {
    // On every page load (including browser refresh), verify the httpOnly cookie
    // is still valid go straight to dashboard; otherwise login.
    authService
      .curLoggedInUser()
      .then(() => setView('dashboard'))
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
        <Register
          onNavigateToLogin={() => setView('login')}
          onRegisterSuccess={() => setView('login')}
        />
      )}

      {view === 'dashboard' && <Dashboard onLogout={() => setView('login')} />}

      {view === 'login' && (
        <Login
          onNavigateToRegister={() => setView('register')}
          onLoginSuccess={() => setView('dashboard')}
        />
      )}
    </>
  )
}
