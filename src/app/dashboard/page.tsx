'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardContainer from '@/components/dashboard/DashboardContainer'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContainer />
    </ProtectedRoute>
  )
}
