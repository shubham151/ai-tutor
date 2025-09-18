'use client'

import React from 'react'
import { Mail, ArrowRight } from 'lucide-react'
import { useLoginForm } from '@/hooks/auth-hooks'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import UIUtils from '@/lib/utils/AuthUtil'

export interface LoginFormProps {
  onSubmit: (email: string) => Promise<void>
  isLoading?: boolean
  error?: string
  success?: string
}

function LoginForm({ onSubmit, isLoading = false, error, success }: LoginFormProps) {
  const { email, errors, handleEmailChange, validateAndGetEmail } = useLoginForm()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { isValid, email: validatedEmail } = validateAndGetEmail()
    if (!isValid) return

    try {
      await onSubmit(validatedEmail)
    } catch {}
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && email && !isLoading) {
      handleSubmit(e as any)
    }
  }

  const isSubmitDisabled = UIUtils.isSubmitDisabled(email, !!errors.email, isLoading)

  return (
    <div className="space-y-6">
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onKeyDown={handleKeyPress}
          leftIcon={<Mail className="w-5 h-5" />}
          error={errors.email}
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
          disabled={isSubmitDisabled}
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
