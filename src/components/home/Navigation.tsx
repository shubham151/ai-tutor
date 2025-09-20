'use client'

import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import Button from '@/components/ui/Button'

interface NavigationProps {
  siteName?: string
  showAuth?: boolean
}

export function Navigation({ siteName = 'AI Tutor', showAuth = true }: NavigationProps) {
  return (
    <nav className="backdrop-blur-macos bg-white/80 border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-macos-accent to-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white font-bold" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-semibold text-macos-text font-sf">{siteName}</h1>
          </div>

          {showAuth && (
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" className="w-full h-full block">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full h-full block">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
