import { AuthFormErrors } from '@/types/auth'

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidOtpCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) {
    return 'Email is required'
  }

  if (!isValidEmail(email)) {
    return 'Please enter a valid email address'
  }

  return undefined
}

function validateOtpCode(code: string): string | undefined {
  if (!code.trim()) {
    return 'Verification code is required'
  }

  if (!isValidOtpCode(code)) {
    return 'Code must be 6 digits'
  }

  return undefined
}

function validateLoginForm(email: string): AuthFormErrors {
  const errors: AuthFormErrors = {}

  const emailError = validateEmail(email)
  if (emailError) {
    errors.email = emailError
  }

  return errors
}

function validateVerifyForm(code: string): AuthFormErrors {
  const errors: AuthFormErrors = {}

  const codeError = validateOtpCode(code)
  if (codeError) {
    errors.code = codeError
  }

  return errors
}

function hasValidationErrors(errors: AuthFormErrors): boolean {
  return Object.keys(errors).length > 0
}

const ValidationUtils = {
  email: validateEmail,
  otpCode: validateOtpCode,
  loginForm: validateLoginForm,
  verifyForm: validateVerifyForm,
  hasErrors: hasValidationErrors,
}

export default ValidationUtils
