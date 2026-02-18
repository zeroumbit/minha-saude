import { LabelHTMLAttributes, forwardRef } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required, className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-slate-700 mb-1.5 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-danger-600 ml-1">*</span>}
      </label>
    )
  }
)

Label.displayName = 'Label'
