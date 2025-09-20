'use client'

import React, { useEffect } from 'react'
import { useVerifyForm } from '@/hooks/auth-hooks'
import Button from '@/components/ui/Button'
import OTPInput from '@/components/ui/OTPInput'
import Alert from '@/components/ui/Alert'
import AuthUtils from '@/utils/AuthUtil'

export interface VerifyFormProps {
  email: string
  onSubmit: (code: string) => Promise<void>
  onResend: () => Promise<void>
  onBack: () => void
  isLoading?: boolean
  error?: string
  success?: string
}

function VerifyForm({
  email,
  onSubmit,
  onResend,
  onBack,
  isLoading = false,
  error,
  success,
}: VerifyFormProps) {
  const { code, resendCooldown, setCode, validateCode, startResendCooldown, decrementCooldown } =
    useVerifyForm()

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(decrementCooldown, 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown, decrementCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!AuthUtils.isCodeComplete(code) || isLoading) return

    try {
      await onSubmit(code)
    } catch {}
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return

    try {
      await onResend()
      startResendCooldown()
    } catch {}
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    if (AuthUtils.isCodeComplete(newCode) && !isLoading) {
      onSubmit(newCode).catch(() => {})
    }
  }

  const maskedEmail = AuthUtils.maskEmail(email)
  const resendText = AuthUtils.formatResendText(resendCooldown)
  const isCodeValid = AuthUtils.isCodeComplete(code)

  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          We sent a 6-digit code to <span className="font-medium">{maskedEmail}</span>
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
          disabled={!isCodeValid || isLoading}
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
          {resendText}
        </Button>
      </div>
    </div>
  )
}

export default VerifyForm
