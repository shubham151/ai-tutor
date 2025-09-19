function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (local.length <= 2) return email
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`
}

function formatResendText(cooldown: number): string {
  return cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'
}

function createLayoutProps(step: 'login' | 'verify') {
  if (step === 'login') {
    return {
      title: 'Welcome to AI Tutor',
      description: 'Enter your email to get started with AI-powered document tutoring',
    }
  }

  return {
    title: 'Verify Your Email',
    description: 'We sent a verification code to your email address',
  }
}

function createCookieValue(token: string): string {
  const maxAge = 7 * 24 * 60 * 60
  const isProduction = process.env.NODE_ENV === 'production'

  return [
    `refresh-token=${token}`,
    'path=/',
    `max-age=${maxAge}`,
    'samesite=lax',
    ...(isProduction ? ['secure'] : []),
  ].join('; ')
}

function generateInputId(): string {
  return `input-${Math.random().toString(36).substr(2, 9)}`
}

function isSubmitDisabled(email: string, hasError: boolean, isLoading: boolean): boolean {
  return !email || hasError || isLoading
}

function isCodeComplete(code: string): boolean {
  return code.length === 6
}

const AuthUtils = {
  maskEmail,
  formatResendText,
  createLayoutProps,
  createCookieValue,
  generateInputId,
  isSubmitDisabled,
  isCodeComplete,
}

export default AuthUtils
