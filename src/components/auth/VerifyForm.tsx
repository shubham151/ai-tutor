'use client'

import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import OTPInput from '@/components/ui/OTPInput'
import Alert from '@/components/ui/Alert'

export interface VerifyFormProps {
  email: string
  onSubmit: (code: string) => Promise<void>
  onResend: () => Promise<void>
  onBack: () => void
  isLoading?: boolean
  error?: string
  success?: string
}

const VerifyForm = ({
  email,
  onSubmit,
  onResend,
  onBack,
  isLoading = false,
  error,
  success,
}: VerifyFormProps) => {
  const [code, setCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6 || isLoading) return
    try {
      await onSubmit(code)
    } catch {
      // Parent handles error
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return
    try {
      await onResend()
      setResendCooldown(60)
    } catch {
      // Parent handles error
    }
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    if (newCode.length === 6 && !isLoading) {
      onSubmit(newCode).catch(() => {})
    }
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@')
    if (local.length <= 2) return email
    return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`
  }

  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          We sent a 6-digit code to <span className="font-medium">{maskEmail(email)}</span>
        </p>
      </div>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <OTPInput
          value={code}
          onChange={handleCodeChange}
          error={error?.toLowerCase().includes('code') ? error : undefined}
          disabled={isLoading}
          autoFocus
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={code.length !== 6 || isLoading}
          className="w-full"
        >
          Verify & Sign In
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isLoading}>
          ← Back to email
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={isLoading || resendCooldown > 0}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </Button>
      </div>
    </div>
  )
}

export default VerifyForm
