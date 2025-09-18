// components/ui/OTPInput.tsx
import React, { useState, useEffect, useRef } from 'react'

export interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  (
    {
      length = 6,
      value = '',
      onChange,
      error,
      label = 'Verification Code',
      disabled = false,
      autoFocus = false,
      className = '',
    },
    ref
  ) => {
    const [digits, setDigits] = useState<string[]>(Array(length).fill(''))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Initialize refs array
    useEffect(() => {
      inputRefs.current = inputRefs.current.slice(0, length)
    }, [length])

    // Update digits when value changes
    useEffect(() => {
      const newDigits = value.split('').concat(Array(length).fill('')).slice(0, length)
      setDigits(newDigits)
    }, [value, length])

    // Auto focus first input
    useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    }, [autoFocus])

    const handleChange = (index: number, digit: string) => {
      // Only allow single digits
      if (!/^\d?$/.test(digit)) return

      const newDigits = [...digits]
      newDigits[index] = digit
      setDigits(newDigits)

      const newValue = newDigits.join('')
      onChange(newValue)

      // Auto-focus next input if digit was entered
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle backspace navigation
      if (e.key === 'Backspace') {
        if (!digits[index] && index > 0) {
          // If current is empty, go to previous
          inputRefs.current[index - 1]?.focus()
        } else {
          // Clear current digit
          const newDigits = [...digits]
          newDigits[index] = ''
          setDigits(newDigits)
          onChange(newDigits.join(''))
        }
      }

      // Handle arrow key navigation
      if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }

      if (e.key === 'ArrowRight' && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }

      // Handle paste
      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        navigator.clipboard.readText().then((text) => {
          const pastedDigits = text.replace(/\D/g, '').slice(0, length)
          if (pastedDigits) {
            const newDigits = pastedDigits.split('').concat(Array(length).fill('')).slice(0, length)
            setDigits(newDigits)
            onChange(pastedDigits)

            // Focus the next empty input or last input
            const nextIndex = Math.min(pastedDigits.length, length - 1)
            inputRefs.current[nextIndex]?.focus()
          }
        })
      }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select()
    }

    return (
      <div ref={ref} className={`space-y-2 ${className}`}>
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

        <div className="flex gap-3 justify-center">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={handleFocus}
              disabled={disabled}
              className={`
                w-12 h-12 text-center text-lg font-semibold
                bg-white border-2 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200
                disabled:bg-gray-50 disabled:cursor-not-allowed
                ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'}
              `}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center flex items-center justify-center gap-1">
            <span className="w-1 h-1 bg-red-600 rounded-full flex-shrink-0"></span>
            {error}
          </p>
        )}
      </div>
    )
  }
)

OTPInput.displayName = 'OTPInput'

export default OTPInput
