// components/auth/ProtectedRoute.tsx
'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingScreen } from '@/components/ui/LoadingSpinner'

export interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

const ProtectedRoute = ({ children, redirectTo = '/login', fallback }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, router, redirectTo])

  // Show loading state
  if (isLoading) {
    return fallback || <LoadingScreen message="Loading..." />
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null
  }

  // Show protected content
  return <>{children}</>
}

export default ProtectedRoute
