'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardComponent from '@/components/dashboard/DashboardComponent'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardComponent />
    </ProtectedRoute>
  )
}
