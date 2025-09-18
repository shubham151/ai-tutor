// components/auth/AuthContainer.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AuthLayout from './AuthLayout'
import LoginForm from './LoginForm'
import VerifyForm from './VerifyForm'

type AuthStep = 'login' | 'verify'

interface AuthState {
  step: AuthStep
  email: string
  isLoading: boolean
  error: string
  success: string
}

const AuthContainer = () => {
  const [state, setState] = useState<AuthState>({
    step: 'login',
    email: '',
    isLoading: false,
    error: '',
    success: '',
  })

  const { login, verify } = useAuth()
  const router = useRouter()

  const updateState = (updates: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const handleLogin = async (email: string) => {
    updateState({ isLoading: true, error: '', success: '' })

    const result = await login(email)

    if (result.success) {
      updateState({
        step: 'verify',
        email,
        success: 'Check your email for the verification code',
        isLoading: false,
      })
    } else {
      updateState({
        error: result.error || 'Login failed. Please try again.',
        isLoading: false,
      })
    }
  }

  const handleVerify = async (code: string) => {
    updateState({ isLoading: true, error: '', success: '' })

    const result = await verify(state.email, code)

    if (result.success) {
      updateState({
        success: 'Login successful! Redirecting...',
        isLoading: false,
      })

      // Small delay for better UX
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } else {
      updateState({
        error: result.error || 'Verification failed. Please try again.',
        isLoading: false,
      })
    }
  }

  const handleResend = async () => {
    updateState({ isLoading: true, error: '', success: '' })

    const result = await login(state.email)

    if (result.success) {
      updateState({
        success: 'New verification code sent to your email',
        isLoading: false,
      })
    } else {
      updateState({
        error: result.error || 'Failed to resend code. Please try again.',
        isLoading: false,
      })
    }
  }

  const handleBack = () => {
    updateState({
      step: 'login',
      error: '',
      success: '',
    })
  }

  const getLayoutProps = () => {
    if (state.step === 'login') {
      return {
        title: 'Welcome to AI Tutor',
        description: 'Enter your email to get started with AI-powered document tutoring',
      }
    } else {
      return {
        title: 'Verify Your Email',
        description: 'We sent a verification code to your email address',
      }
    }
  }

  return (
    <AuthLayout {...getLayoutProps()}>
      {state.step === 'login' ? (
        <LoginForm
          onSubmit={handleLogin}
          isLoading={state.isLoading}
          error={state.error}
          success={state.success}
        />
      ) : (
        <VerifyForm
          email={state.email}
          onSubmit={handleVerify}
          onResend={handleResend}
          onBack={handleBack}
          isLoading={state.isLoading}
          error={state.error}
          success={state.success}
        />
      )}
    </AuthLayout>
  )
}

export default AuthContainer
