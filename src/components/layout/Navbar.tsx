'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User, LogOut, Settings, ChevronDown, GraduationCap } from 'lucide-react'

interface NavbarProps {
  className?: string
}

const Navbar = ({ className = '' }: NavbarProps) => {
  const { user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    await logout()
  }

  const getInitials = (email: string): string => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <nav
      className={`bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-macos-accent to-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white font-bold" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-semibold text-macos-text font-sf">AI Tutor</h1>
            </div>
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {getInitials(user.email)}
                </div>

                {/* User Info */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.emailConfirmed ? 'Verified' : 'Unverified'}
                  </p>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {/* User Info in Mobile */}
                  <div className="md:hidden px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      {user.emailConfirmed ? 'Verified Account' : 'Unverified Account'}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>

                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <hr className="my-1 border-gray-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
