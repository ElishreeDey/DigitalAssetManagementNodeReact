/*
 ****************************************************************************************************************************
 * Filename    : App
 * Description : Root application component — owns the top-level view state (register → login → app) and passes
 *               navigation callbacks down so pages never know about each other directly.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'

type View = 'login' | 'register'

export default function App() {
  const [view, setView] = useState<View>('login')

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {view === 'register' ? (
        <Register
          onNavigateToLogin={() => setView('login')}
          onRegisterSuccess={() => setView('login')}
        />
      ) : (
        <Login
          onNavigateToRegister={() => setView('register')}
          onLoginSuccess={() => {
            // TODO: navigate to the main DAM dashboard once built
            console.log('Login success — dashboard coming next')
          }}
        />
      )}
    </>
  )
}
