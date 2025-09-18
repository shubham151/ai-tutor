// components/ui/Button.tsx
import React from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg focus:ring-blue-500 disabled:bg-gray-300 disabled:hover:bg-gray-300',
      secondary:
        'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400',
      ghost:
        'bg-transparent hover:bg-gray-100 text-gray-600 focus:ring-gray-500 disabled:text-gray-400 disabled:hover:bg-transparent',
      danger:
        'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg focus:ring-red-500 disabled:bg-gray-300 disabled:hover:bg-gray-300',
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
          isDisabled ? 'opacity-60' : ''
        } ${className}`}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon ? leftIcon : null}
        {children}
        {!isLoading && rightIcon && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
