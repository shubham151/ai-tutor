// components/ui/Card.tsx
import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-xl border transition-all duration-200'

    const variants = {
      default: 'bg-white border-gray-200 shadow-sm hover:shadow-md',
      glass: 'bg-white/80 backdrop-blur-xl border-white/20 shadow-xl',
      elevated: 'bg-white border-gray-200 shadow-lg hover:shadow-xl',
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, description, icon, className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`text-center ${className}`} {...props}>
        {icon && (
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            {icon}
          </div>
        )}

        {title && <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>}

        {description && <p className="text-gray-600">{description}</p>}

        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

// Card Content Component
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => {
    return <div ref={ref} className={`space-y-6 ${className}`} {...props} />
  }
)

CardContent.displayName = 'CardContent'

// Card Footer Component
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => {
    return <div ref={ref} className={`pt-6 border-t border-gray-100 ${className}`} {...props} />
  }
)

CardFooter.displayName = 'CardFooter'

export default Card
