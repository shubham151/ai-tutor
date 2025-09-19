import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AuthService from '@/core/AuthService'
import ValidationUtils from '@/utils/Validation'
import { AuthFormErrors } from '@/types/auth'

interface UseAuthFormState {
  isLoading: boolean
  error: string
  success: string
}

function createInitialFormState(): UseAuthFormState {
  return {
    isLoading: false,
    error: '',
    success: '',
  }
}

function createAuthResponse(success: boolean, error?: string) {
  return { success, error }
}

export function useAuthForm() {
  const [state, setState] = useState(createInitialFormState())

  const updateState = useCallback((updates: Partial<UseAuthFormState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const resetMessages = useCallback(() => {
    updateState({ error: '', success: '' })
  }, [updateState])

  const setLoading = useCallback(
    (isLoading: boolean) => {
      updateState({ isLoading })
    },
    [updateState]
  )

  const setSuccess = useCallback(
    (success: string) => {
      updateState({ success, error: '' })
    },
    [updateState]
  )

  const setError = useCallback(
    (error: string) => {
      updateState({ error, success: '' })
    },
    [updateState]
  )

  return {
    ...state,
    updateState,
    resetMessages,
    setLoading,
    setSuccess,
    setError,
  }
}

export function useAuthStep() {
  const [currentStep, setCurrentStep] = useState<'login' | 'verify'>('login')
  const [email, setEmail] = useState('')

  const goToVerify = useCallback((userEmail: string) => {
    setEmail(userEmail)
    setCurrentStep('verify')
  }, [])

  const goToLogin = useCallback(() => {
    setCurrentStep('login')
    setEmail('')
  }, [])

  return {
    currentStep,
    email,
    goToVerify,
    goToLogin,
  }
}

export function useLoginForm() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<AuthFormErrors>({})

  const validateAndGetEmail = useCallback((): { isValid: boolean; email: string } => {
    const validationErrors = ValidationUtils.loginForm(email)
    setErrors(validationErrors)

    return {
      isValid: !ValidationUtils.hasErrors(validationErrors),
      email,
    }
  }, [email])

  const clearFieldError = useCallback((field: keyof AuthFormErrors) => {
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev
      return rest
    })
  }, [])

  const handleEmailChange = useCallback(
    (newEmail: string) => {
      setEmail(newEmail)
      if (errors.email) {
        clearFieldError('email')
      }
    },
    [errors.email, clearFieldError]
  )

  return {
    email,
    errors,
    handleEmailChange,
    validateAndGetEmail,
  }
}

export function useVerifyForm() {
  const [code, setCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const validateCode = useCallback((): boolean => {
    return ValidationUtils.otpCode(code) === undefined
  }, [code])

  const startResendCooldown = useCallback(() => {
    setResendCooldown(60)
  }, [])

  const decrementCooldown = useCallback(() => {
    setResendCooldown((prev) => Math.max(0, prev - 1))
  }, [])

  return {
    code,
    resendCooldown,
    setCode,
    validateCode,
    startResendCooldown,
    decrementCooldown,
  }
}

export function useAuthFlow() {
  const router = useRouter()

  const handleLoginSuccess = useCallback((email: string, onSuccess: (email: string) => void) => {
    onSuccess(email)
  }, [])

  const handleVerifySuccess = useCallback(() => {
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  }, [router])

  const executeLogin = useCallback(async (email: string) => {
    return await AuthService.login(email)
  }, [])

  const executeVerify = useCallback(async (email: string, code: string) => {
    return await AuthService.verify(email, code)
  }, [])

  return {
    handleLoginSuccess,
    handleVerifySuccess,
    executeLogin,
    executeVerify,
  }
}
