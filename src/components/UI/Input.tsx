import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', style, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl
            focus:outline-none focus:ring-2 focus:border-transparent
            transition-all
            ${className}
          `}
          style={{
            backgroundColor: 'var(--color-surface)',
            border: `1px solid ${error ? '#ef4444' : 'var(--color-border)'}`,
            color: 'var(--color-text)',
            ['--tw-ring-color' as string]: error ? '#ef4444' : 'var(--color-primary)',
            ...style,
          }}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
