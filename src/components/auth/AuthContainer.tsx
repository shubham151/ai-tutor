'use client'

import React from 'react'
import { useAuthForm, useAuthStep, useAuthFlow } from '@/hooks/auth-hooks'
import AuthLayout from './AuthLayout'
import LoginForm from './LoginForm'
import VerifyForm from './VerifyForm'
import AuthUtils from '@/lib/utils/AuthUtil'

function AuthContainer() {
  const authForm = useAuthForm()
  const authStep = useAuthStep()
  const authFlow = useAuthFlow()

  const handleLoginSubmit = async (email: string) => {
    authForm.setLoading(true)
    authForm.resetMessages()

    const result = await authFlow.executeLogin(email)

    if (result.success) {
      authForm.setSuccess('Check your email for the verification code')
      authStep.goToVerify(email)
    } else {
      authForm.setError(result.error || 'Login failed. Please try again.')
    }

    authForm.setLoading(false)
  }

  const handleVerifySubmit = async (code: string) => {
    authForm.setLoading(true)
    authForm.resetMessages()

    const result = await authFlow.executeVerify(authStep.email, code)

    if (result.success) {
      authForm.setSuccess('Login successful! Redirecting...')
      authFlow.handleVerifySuccess()
    } else {
      authForm.setError(result.error || 'Verification failed. Please try again.')
    }

    authForm.setLoading(false)
  }

  const handleResend = async () => {
    authForm.setLoading(true)
    authForm.resetMessages()

    const result = await authFlow.executeLogin(authStep.email)

    if (result.success) {
      authForm.setSuccess('New verification code sent to your email')
    } else {
      authForm.setError(result.error || 'Failed to resend code. Please try again.')
    }

    authForm.setLoading(false)
  }

  const handleBack = () => {
    authStep.goToLogin()
    authForm.resetMessages()
  }

  const layoutProps = AuthUtils.createLayoutProps(authStep.currentStep)

  return (
    <AuthLayout {...layoutProps}>
      {authStep.currentStep === 'login' ? (
        <LoginForm
          onSubmit={handleLoginSubmit}
          isLoading={authForm.isLoading}
          error={authForm.error}
          success={authForm.success}
        />
      ) : (
        <VerifyForm
          email={authStep.email}
          onSubmit={handleVerifySubmit}
          onResend={handleResend}
          onBack={handleBack}
          isLoading={authForm.isLoading}
          error={authForm.error}
          success={authForm.success}
        />
      )}
    </AuthLayout>
  )
}

export default AuthContainer
