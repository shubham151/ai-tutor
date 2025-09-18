// hooks/useAuth.ts
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/* ---------- Types ---------- */
interface User {
  id: string
  email: string
  emailConfirmed: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface LoginResponse {
  success: boolean
  error?: string
}

interface VerifyResponse {
  success: boolean
  error?: string
}

/* ---------- Token Manager ---------- */
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

/* ---------- API Client ---------- */
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
        window.location.href = '/auth'
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
        const data = (await response.json()) as { accessToken: string }
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

/* ---------- Main Hook ---------- */
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

  const login = useCallback(async (email: string): Promise<LoginResponse> => {
    try {
      await apiClient.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }, [])

  const verify = useCallback(
    async (email: string, code: string): Promise<VerifyResponse> => {
      try {
        const data = await apiClient.request<{ accessToken: string }>('/api/auth/verify', {
          method: 'POST',
          body: JSON.stringify({ email, code }),
        })

        if (data.accessToken) {
          TokenManager.set(data.accessToken)
          await checkAuth()
          return { success: true }
        }

        return { success: false, error: 'Invalid response' }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    },
    [checkAuth]
  )

  const logout = useCallback(async () => {
    try {
      await apiClient.logout()
    } catch {
      // ignore
    }

    updateState({ user: null, isAuthenticated: false })
    router.push('/auth')
  }, [updateState, router])

  const requireAuth = useCallback(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push('/auth')
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
