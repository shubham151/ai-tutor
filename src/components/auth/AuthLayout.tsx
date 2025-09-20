import React from 'react'
import { GraduationCap } from 'lucide-react'
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card'

export interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
  showFooter?: boolean
}

const AuthLayout = ({ children, title, description, showFooter = true }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute top-1/3 -left-10 w-32 h-32 bg-purple-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-1/3 w-24 h-24 bg-green-100 rounded-full opacity-20"></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        <Card variant="glass" padding="xl">
          {/* Header */}
          <CardHeader
            title={title}
            description={description}
            icon={<GraduationCap className="w-8 h-8 text-white font-bold" strokeWidth={2.5} />}
            className="mb-8"
          />

          {/* Content */}
          <CardContent>{children}</CardContent>

          {/* Footer */}
          {showFooter && (
            <CardFooter>
              <p className="text-xs text-gray-500 text-center">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                  Privacy Policy
                </a>
              </p>
            </CardFooter>
          )}
        </Card>

        {/* Glassmorphism Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl backdrop-blur-sm -z-10"></div>
      </div>
    </div>
  )
}

export default AuthLayout
