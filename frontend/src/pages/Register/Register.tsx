/*
 ****************************************************************************************************************************
 * Filename    : Register
 * Description : Register page — pure UI component that renders the sign-up form using the useRegisterForm hook.
 *               On success it calls onRegisterSuccess() so App.tsx can switch the view to Login.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { useRegisterForm } from '../../hooks'
import { EyeIcon, EyeOffIcon } from '../../components/icons'
import './Register.css'

type RegisterProps = {
  onNavigateToLogin: () => void
  onRegisterSuccess: () => void
}

export default function Register({
  onNavigateToLogin,
  onRegisterSuccess,
}: RegisterProps) {
  const {
    fields,
    errors,
    showPassword,
    showConfirmPassword,
    isLoading,
    serverError,
    handleChange,
    handleSubmit,
    toggleShowPassword,
    toggleShowConfirmPassword,
  } = useRegisterForm(onRegisterSuccess)

  return (
    <div className="login-page">
      {/* Left branding panel */}
      <div className="login-brand">
        <h1 className="brand-headline">
          Get started <span>today.</span>
        </h1>
        <p className="brand-subline">
          Create your account to start managing your digital assets — images,
          videos, documents, and more in one place.
        </p>
      </div>

      {/* Right form panel */}
      <main className="login-form-panel">
        <div className="login-form-header">
          <h2>Create account</h2>
          <p>Fill in the details below to register for AssetVault.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className="login-global-error" role="alert">
              <span className="login-global-error-icon">⚠️</span>
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
              aria-describedby={errors.email ? 'reg-email-error' : undefined}
            />
            {errors.email && (
              <span id="reg-email-error" className="field-error" role="alert">
                ⚠ {errors.email}
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
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                value={fields.password}
                onChange={handleChange}
                className={`form-input password-input${errors.password ? ' input-error' : ''}`}
                aria-describedby={
                  errors.password ? 'reg-password-error' : undefined
                }
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleShowPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <span
                id="reg-password-error"
                className="field-error"
                role="alert"
              >
                ⚠ {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={fields.confirmPassword}
                onChange={handleChange}
                className={`form-input password-input${errors.confirmPassword ? ' input-error' : ''}`}
                aria-describedby={
                  errors.confirmPassword ? 'reg-confirm-error' : undefined
                }
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleShowConfirmPassword}
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span id="reg-confirm-error" className="field-error" role="alert">
                ⚠ {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="btn-spinner" />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Navigate to Login */}
        <p className="auth-switch-text">
          Already have an account?{' '}
          <button
            type="button"
            className="auth-switch-link"
            onClick={onNavigateToLogin}
          >
            Sign in
          </button>
        </p>
      </main>
    </div>
  )
}
