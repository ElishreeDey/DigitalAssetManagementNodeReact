/*
 ****************************************************************************************************************************
 * Filename    : Login
 * Description : Login page component for user authentication.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { useLoginForm } from '../../hooks/useLoginForm'
import { eyeIcon, eyeOffIcon, warningIcon } from '../../assets'
import './Login.css'

type LoginProps = {
  onNavigateToRegister: () => void
  onLoginSuccess: () => void
}

export default function Login({
  onNavigateToRegister,
  onLoginSuccess,
}: LoginProps) {
  const {
    fields,
    errors,
    showPassword,
    isLoading,
    serverError,
    handleChange,
    handleSubmit,
    toggleShowPassword,
  } = useLoginForm(onLoginSuccess)

  return (
    <div className="login-page">
      {/* Left branding panel */}
      <div className="login-brand">
        <h1 className="brand-headline">
          Your assets, <span>organized.</span>
        </h1>
        <p className="brand-subline">
          A single platform to store, search, and share all your digital assets
          — images, videos, documents, and more.
        </p>
      </div>

      {/* Right form panel */}
      <main className="login-form-panel">
        <div className="login-form-header">
          <h2>Welcome back</h2>
          <p>Sign in to your Digital Asset Management to continue.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className="login-global-error" role="alert">
              <img
                src={warningIcon}
                alt=""
                className="login-global-error-icon"
              />
              {serverError}
            </div>
          )}

          {/* Email */}
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={fields.email}
              onChange={handleChange}
              className={`form-input${errors.email ? ' input-error' : ''}`}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="field-error" role="alert">
                <img src={warningIcon} alt="" />
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={fields.password}
                onChange={handleChange}
                className={`form-input password-input${errors.password ? ' input-error' : ''}`}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleShowPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <img
                  src={showPassword ? eyeOffIcon : eyeIcon}
                  alt=""
                  width={18}
                  height={18}
                  className="eye-icon"
                />
              </button>
            </div>
            {errors.password && (
              <span id="password-error" className="field-error" role="alert">
                <img src={warningIcon} alt="" />
                {errors.password}
              </span>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="btn-spinner" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Navigate to Register */}
        <p className="auth-switch-text">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="auth-switch-link"
            onClick={onNavigateToRegister}
          >
            Create one
          </button>
        </p>
      </main>
    </div>
  )
}
