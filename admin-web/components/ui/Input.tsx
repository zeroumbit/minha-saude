import { InputHTMLAttributes, forwardRef, useState, ChangeEvent } from 'react'
import { masks } from '@/lib/validation'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  mask?: 'cpf' | 'cnpj' | 'cpfCnpj' | 'telefone' | 'celular' | 'telefoneCelular' | 'cep' | 'moeda' | 'data' | 'hora' | 'rg' | 'pis'
  unformatOnValue?: boolean // Se true, retorna o valor sem formatação no onChange
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', mask, unformatOnValue, onChange, value, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState<string>(value?.toString() || '')

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value

      // Aplica máscara se especificada
      if (mask) {
        const maskFn = masks[mask]
        if (maskFn) {
          newValue = maskFn(newValue)
          setInternalValue(newValue)
        }
      }

      // Se unformatOnValue estiver ativo, passa o valor sem formatação para o onChange
      if (unformatOnValue && mask) {
        const unformatFn = mask === 'cep' ? masks.unformatCep : 
                          mask === 'cpf' || mask === 'cnpj' || mask === 'cpfCnpj' ? masks.unformatCpfCnpj :
                          mask === 'telefone' || mask === 'celular' || mask === 'telefoneCelular' ? masks.unformatPhone :
                          undefined
        if (unformatFn) {
          const unformattedValue = unformatFn(newValue)
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: unformattedValue
            }
          }
          onChange?.(syntheticEvent)
          return
        }
      }

      onChange?.(e)
    }

    // Usa o valor interno se houver máscara, senão usa o value prop
    const inputValue = mask ? internalValue : (value?.toString() || '')

    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}

        <input
          ref={ref}
          className={`input ${error ? 'input-error' : ''} ${className}`}
          value={inputValue}
          onChange={handleChange}
          {...props}
        />

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

Input.displayName = 'Input'
