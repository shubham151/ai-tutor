// components/layout/AppLayout.tsx
'use client'

import React from 'react'
import Navbar from './Navbar'

export interface AppLayoutProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  showNavbar?: boolean
}

const AppLayout = ({
  children,
  className = '',
  containerClassName = '',
  showNavbar = true,
}: AppLayoutProps) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Navigation */}
      {showNavbar && <Navbar />}

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${containerClassName}`}>
        {children}
      </main>
    </div>
  )
}

export default AppLayout
