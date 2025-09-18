import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  emailConfirmed: boolean
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

const TokenManager = {
  get(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  },

  set(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('accessToken', token)
  },

  remove(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('accessToken')
  },

  isValid(token: string | null): boolean {
    if (!token) return false

    try {
      const parts = token.split('.')
      if (parts.length < 2) return false

      const payloadJson = atob(parts[1])
      const payload: { exp?: number } = JSON.parse(payloadJson)

      if (typeof payload.exp !== 'number') return false

      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp > currentTime
    } catch {
      return false
    }
  },
}

const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = TokenManager.get()

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    const response = await fetch(endpoint, config)

    if (response.status === 401) {
      const refreshed = await this.refreshToken()
      if (refreshed) {
        const newToken = TokenManager.get()
        return this.request<T>(endpoint, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken ?? ''}`,
          },
        })
      } else {
        TokenManager.remove()
        throw new Error('Authentication required')
      }
    }

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { error?: string } | null
      throw new Error(error?.error || 'Request failed')
    }

    return (await response.json()) as T
  },

  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        const data = (await response.json()) as { accessToken?: string; refreshToken?: string }
        if (data.accessToken) {
          TokenManager.set(data.accessToken)
          return true
        }
      }
      return false
    } catch {
      return false
    }
  },

  async getCurrentUser(): Promise<User> {
    const data = await this.request<{ user: User }>('/api/auth/me')
    return data.user
  },

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' })
    } finally {
      TokenManager.remove()
    }
  },
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const checkAuth = useCallback(async () => {
    const token = TokenManager.get()

    if (!token || !TokenManager.isValid(token)) {
      updateState({ user: null, isLoading: false, isAuthenticated: false })
      return
    }

    try {
      const user = await apiClient.getCurrentUser()
      updateState({ user, isLoading: false, isAuthenticated: true })
    } catch {
      TokenManager.remove()
      updateState({ user: null, isLoading: false, isAuthenticated: false })
    }
  }, [updateState])

  const login = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      try {
        await apiClient.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email }),
        })
        return { success: true }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    },
    []
  )

  const verify = useCallback(
    async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code }),
        })

        const data = await response.json()

        if (response.ok && data.accessToken) {
          TokenManager.set(data.accessToken)

          // Set refresh token in cookie for future use
          if (data.refreshToken) {
            document.cookie = `refresh-token=${data.refreshToken}; path=/; max-age=${
              7 * 24 * 60 * 60
            }; samesite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}`
          }

          // Update state immediately with user data if available
          if (data.user) {
            updateState({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // Otherwise re-check auth to get user data
            await checkAuth()
          }

          return { success: true }
        }

        return { success: false, error: data.error || 'Verification failed' }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    },
    [checkAuth, updateState]
  )

  const logout = useCallback(async () => {
    try {
      await apiClient.logout()
    } catch {
      // ignore errors during logout
    }

    updateState({ user: null, isAuthenticated: false, isLoading: false })
    router.push('/auth')
  }, [updateState, router])

  const requireAuth = useCallback(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push('/auth')
    }
  }, [state.isLoading, state.isAuthenticated, router])

  // Initialize auth check
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
