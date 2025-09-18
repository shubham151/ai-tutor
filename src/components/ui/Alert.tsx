// components/ui/Alert.tsx
import React from 'react'
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { variant = 'info', title, dismissible = false, onDismiss, className = '', children, ...props },
    ref
  ) => {
    const baseStyles = 'p-4 rounded-lg border flex items-start gap-3 transition-all duration-200'

    const variants = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    }

    const icons = {
      success: <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />,
      error: <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />,
      warning: <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />,
      info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />,
    }

    return (
      <div ref={ref} className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {icons[variant]}

        <div className="flex-1 min-w-0">
          {title && <h4 className="font-medium mb-1">{title}</h4>}

          {children && <div className={title ? 'text-sm' : ''}>{children}</div>}
        </div>

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-md hover:bg-black/5 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }
)

Alert.displayName = 'Alert'

export default Alert
