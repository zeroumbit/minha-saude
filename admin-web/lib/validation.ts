/**
 * Utilitários de Máscaras e Validações para Formulários
 */

// ==================== MÁSCARAS ====================

export const masks = {
  /**
   * Formata CPF: 000.000.000-00
   */
  cpf: (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  },

  /**
   * Formata CNPJ: 00.000.000/0000-00
   */
  cnpj: (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
  },

  /**
   * Formata CPF ou CNPJ automaticamente
   */
  cpfCnpj: (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 11) return masks.cpf(digits)
    return masks.cnpj(digits)
  },

  /**
   * Formata telefone fixo: (00) 0000-0000
   */
  telefone: (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    
    if (digits.length === 0) return ''
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  },

  /**
   * Formata celular/whatsapp: (00) 00000-0000
   */
  celular: (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    
    if (digits.length === 0) return ''
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  },

  /**
   * Formata telefone ou celular automaticamente
   */
  telefoneCelular: (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 10) return masks.telefone(digits)
    return masks.celular(digits)
  },

  /**
   * Formata CEP: 00000-000
   */
  cep: (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    
    if (digits.length <= 5) return digits
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
  },

  /**
   * Formata moeda brasileira (BRL): R$ 0,00
   */
  moeda: (value: string): string => {
    const digits = value.replace(/\D/g, '')
    const number = parseInt(digits, 10) / 100
    
    if (isNaN(number)) return ''
    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  },

  /**
   * Formata data: DD/MM/YYYY
   */
  data: (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    
    if (digits.length === 0) return ''
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
  },

  /**
   * Formata hora: HH:mm
   */
  hora: (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    
    if (digits.length === 0) return ''
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}:${digits.slice(2)}`
  },

  /**
   * Formata RG: 00.000.000-0 (SP) ou variações
   */
  rg: (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 12)
    
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
    if (digits.length <= 9) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`
  },

  /**
   * Formata PIS/PASEP: 000.00000.00-0
   */
  pis: (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    
    if (digits.length <= 3) return digits
    if (digits.length <= 8) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 10) return `${digits.slice(0, 3)}.${digits.slice(3, 8)}.${digits.slice(8)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 8)}.${digits.slice(8, 10)}-${digits.slice(10)}`
  },

  /**
   * Remove formatação de CPF/CNPJ para envio ao backend
   */
  unformatCpfCnpj: (value: string): string => {
    return value.replace(/\D/g, '')
  },

  /**
   * Remove formatação de telefone/celular para envio ao backend
   */
  unformatPhone: (value: string): string => {
    return value.replace(/\D/g, '')
  },

  /**
   * Remove formatação de CEP para envio ao backend
   */
  unformatCep: (value: string): string => {
    return value.replace(/\D/g, '')
  },
}

// ==================== VALIDAÇÕES ====================

export const validators = {
  /**
   * Valida email
   */
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  /**
   * Valida CPF usando algoritmo oficial
   */
  cpf: (value: string): boolean => {
    const cpf = value.replace(/\D/g, '')
    
    if (cpf.length !== 11) return false
    
    // Verifica CPFs inválidos conhecidos (todos dígitos iguais)
    if (/^(\d)\1+$/.test(cpf)) return false
    
    // Validação do primeiro dígito verificador
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = 11 - (sum % 11)
    if (remainder >= 10) remainder = 0
    if (remainder !== parseInt(cpf.charAt(9))) return false
    
    // Validação do segundo dígito verificador
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = 11 - (sum % 11)
    if (remainder >= 10) remainder = 0
    if (remainder !== parseInt(cpf.charAt(10))) return false
    
    return true
  },

  /**
   * Valida CNPJ usando algoritmo oficial
   */
  cnpj: (value: string): boolean => {
    const cnpj = value.replace(/\D/g, '')
    
    if (cnpj.length !== 14) return false
    
    // Verifica CNPJs inválidos conhecidos (todos dígitos iguais)
    if (/^(\d)\1+$/.test(cnpj)) return false
    
    // Validação do primeiro dígito verificador
    let sum = 0
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights1[i]
    }
    let remainder = sum % 11
    let digit1 = remainder < 2 ? 0 : 11 - remainder
    if (digit1 !== parseInt(cnpj.charAt(12))) return false
    
    // Validação do segundo dígito verificador
    sum = 0
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights2[i]
    }
    remainder = sum % 11
    const digit2 = remainder < 2 ? 0 : 11 - remainder
    if (digit2 !== parseInt(cnpj.charAt(13))) return false
    
    return true
  },

  /**
   * Valida CPF ou CNPJ
   */
  cpfCnpj: (value: string): boolean => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 11) return validators.cpf(value)
    if (digits.length === 14) return validators.cnpj(value)
    return false
  },

  /**
   * Valida CEP
   */
  cep: (value: string): boolean => {
    const cep = value.replace(/\D/g, '')
    return cep.length === 8
  },

  /**
   * Valida telefone fixo
   */
  telefone: (value: string): boolean => {
    const digits = value.replace(/\D/g, '')
    return digits.length === 10
  },

  /**
   * Valida celular/whatsapp
   */
  celular: (value: string): boolean => {
    const digits = value.replace(/\D/g, '')
    return digits.length === 11 && digits[2] === '9'
  },

  /**
   * Valida telefone ou celular
   */
  telefoneCelular: (value: string): boolean => {
    const digits = value.replace(/\D/g, '')
    return digits.length === 10 || digits.length === 11
  },

  /**
   * Valida data no formato DD/MM/YYYY
   */
  data: (value: string): boolean => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
    if (!dateRegex.test(value)) return false
    
    const [day, month, year] = value.split('/').map(Number)
    const date = new Date(year, month - 1, day)
    
    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day
  },

  /**
   * Valida hora no formato HH:mm
   */
  hora: (value: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(value)
  },

  /**
   * Valida senha (mínimo 6 caracteres, pelo menos 1 letra e 1 número)
   */
  senha: (value: string, minLength: number = 6): boolean => {
    if (value.length < minLength) return false
    return /[a-zA-Z]/.test(value) && /[0-9]/.test(value)
  },

  /**
   * Valida URL
   */
  url: (value: string): boolean => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  /**
   * Valida Instagram (@username ou URL)
   */
  instagram: (value: string): boolean => {
    if (!value) return true // Campo opcional
    const instagramRegex = /^(@[a-zA-Z0-9._]{1,30})|(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}\/?$/
    return instagramRegex.test(value)
  },

  /**
   * Valida campo obrigatório
   */
  required: (value: string): boolean => {
    return value.trim().length > 0
  },

  /**
   * Valida tamanho mínimo
   */
  minLength: (value: string, min: number): boolean => {
    return value.length >= min
  },

  /**
   * Valida tamanho máximo
   */
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max
  },
}

// ==================== HOOKS ====================

import { useState, ChangeEvent } from 'react'

/**
 * Hook para aplicar máscara em um input
 */
export function useMask(
  initialValue: string = '',
  maskFn: (value: string) => string
) {
  const [value, setValue] = useState(initialValue)

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const masked = maskFn(e.target.value)
    setValue(masked)
  }

  return { value, onChange, setValue }
}

/**
 * Hook para validação de formulário
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validators: Record<keyof T, (value: any, form: T) => boolean | string>,
  messages: Record<keyof T, string>
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})

  const validateField = (field: keyof T): boolean => {
    const validator = validators[field]
    const isValid = validator(values[field], values)
    
    if (isValid === false || typeof isValid === 'string') {
      setErrors(prev => ({ ...prev, [field]: messages[field] }))
      return false
    }
    
    setErrors(prev => ({ ...prev, [field]: undefined }))
    return true
  }

  const validateAll = (): boolean => {
    const fields = Object.keys(validators) as (keyof T)[]
    const results = fields.map(field => validateField(field))
    return results.every(result => result)
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
  }

  return {
    values,
    setValues,
    errors,
    validateField,
    validateAll,
    reset,
    hasErrors: Object.values(errors).some(e => e !== undefined),
  }
}
