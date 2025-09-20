import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AuthService from '@/core/AuthService'
import { AuthState, AuthResponse } from '@/types/auth'

function createInitialAuthState(): AuthState {
  return {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  }
}

function createAuthResponse(success: boolean, error?: string): AuthResponse {
  return { success, error }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(createInitialAuthState())
  const router = useRouter()

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const { isAuthenticated, user } = await AuthService.checkAuth()

      updateState({
        user: user || null,
        isAuthenticated,
        isLoading: false,
      })
    } catch {
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }, [updateState])

  const login = useCallback(async (email: string): Promise<AuthResponse> => {
    try {
      return await AuthService.login(email)
    } catch (error) {
      return createAuthResponse(false, error instanceof Error ? error.message : 'Login failed')
    }
  }, [])

  const verify = useCallback(
    async (email: string, code: string): Promise<AuthResponse> => {
      try {
        const result = await AuthService.verify(email, code)

        if (result.success && result.user) {
          updateState({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
          })
        }

        return result
      } catch (error) {
        return createAuthResponse(
          false,
          error instanceof Error ? error.message : 'Verification failed'
        )
      }
    },
    [updateState]
  )

  const logout = useCallback(async () => {
    try {
      await AuthService.logout()
    } catch {
      // Ignore logout errors
    }

    updateState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })

    router.push('/')
  }, [updateState, router])

  const requireAuth = useCallback(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push('/')
    }
  }, [state.isLoading, state.isAuthenticated, router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    ...state,
    login,
    verify,
    logout,
    requireAuth,
    checkAuth,
  }
}
