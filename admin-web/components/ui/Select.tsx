import { SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options?: { value: string | number; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options = [], className = '', children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}
        
        <div className="relative">
          <select
            ref={ref}
            className={`w-full px-4 py-2.5 pr-10 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 cursor-pointer appearance-none ${
              error ? 'border-danger-500 focus:ring-danger-500' : ''
            } ${className}`}
            {...props}
          >
            {children || options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          
          {/* Ícone de seta customizado */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-danger-600 animate-fade-in">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
