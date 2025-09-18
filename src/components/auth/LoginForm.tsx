// components/auth/LoginForm.tsx
'use client'

import React, { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'

export interface LoginFormProps {
  onSubmit: (email: string) => Promise<void>
  isLoading?: boolean
  error?: string
  success?: string
}

const LoginForm = ({ onSubmit, isLoading = false, error, success }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setEmailError('')

    // Validate email
    if (!email) {
      setEmailError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    try {
      await onSubmit(email)
    } catch {}
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    // Clear error when user starts typing
    if (emailError) {
      setEmailError('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && email && !isLoading) {
      handleSubmit(e as any)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Error Message */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
          onKeyDown={handleKeyPress}
          leftIcon={<Mail className="w-5 h-5" />}
          error={emailError}
          disabled={isLoading}
          autoComplete="email"
          autoFocus
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={!email || !!emailError}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full"
        >
          Continue
        </Button>
      </form>
    </div>
  )
}

export default LoginForm
