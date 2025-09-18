// components/ui/LoadingSpinner.tsx
import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'white' | 'gray' | 'green' | 'red'
  className?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', color = 'blue', className = '' }, ref) => {
    const sizes = {
      sm: 'w-4 h-4 border-2',
      md: 'w-6 h-6 border-2',
      lg: 'w-8 h-8 border-2',
      xl: 'w-12 h-12 border-4',
    }

    const colors = {
      blue: 'border-blue-500 border-t-transparent',
      white: 'border-white border-t-transparent',
      gray: 'border-gray-500 border-t-transparent',
      green: 'border-green-500 border-t-transparent',
      red: 'border-red-500 border-t-transparent',
    }

    return (
      <div
        ref={ref}
        className={`${sizes[size]} ${colors[color]} rounded-full animate-spin ${className}`}
        role="status"
        aria-label="Loading"
      />
    )
  }
)

LoadingSpinner.displayName = 'LoadingSpinner'

// Full screen loading component
export interface LoadingScreenProps {
  message?: string
  className?: string
}

export const LoadingScreen = ({ message = 'Loading...', className = '' }: LoadingScreenProps) => {
  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}
    >
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
