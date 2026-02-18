'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Building2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react'
import { masks, validators } from '@/lib/validation'

export default function CadastroPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    // Step 1: Dados de Acesso
    email: '',
    password: '',
    confirmPassword: '',

    // Step 2: Dados da Empresa
    nome_fantasia: '',
    cnpj: '',
    descricao: '',

    // Step 3: Categorias e Outros
    categorias: [] as string[],
    is_public_partner: false,
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleNext = () => {
    setError('')
    setFieldErrors({})
    
    if (step === 1) {
      let hasError = false
      
      if (!formData.email) {
        setFieldErrors(prev => ({ ...prev, email: 'E-mail é obrigatório' }))
        hasError = true
      } else if (!validators.email(formData.email)) {
        setFieldErrors(prev => ({ ...prev, email: 'E-mail inválido' }))
        hasError = true
      }
      
      if (!formData.password) {
        setFieldErrors(prev => ({ ...prev, password: 'Senha é obrigatória' }))
        hasError = true
      } else if (formData.password.length < 6) {
        setFieldErrors(prev => ({ ...prev, password: 'Mínimo de 6 caracteres' }))
        hasError = true
      }
      
      if (!formData.confirmPassword) {
        setFieldErrors(prev => ({ ...prev, confirmPassword: 'Confirme a senha' }))
        hasError = true
      } else if (formData.password !== formData.confirmPassword) {
        setFieldErrors(prev => ({ ...prev, confirmPassword: 'As senhas não coincidem' }))
        hasError = true
      }
      
      if (hasError) return
    }
    
    if (step === 2) {
      let hasError = false
      
      if (!formData.nome_fantasia) {
        setFieldErrors(prev => ({ ...prev, nome_fantasia: 'Nome fantasia é obrigatório' }))
        hasError = true
      }
      
      if (formData.cnpj && !validators.cnpj(formData.cnpj)) {
        setFieldErrors(prev => ({ ...prev, cnpj: 'CNPJ inválido' }))
        hasError = true
      }
      
      if (hasError) return
    }
    setStep(step + 1)
  }

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.categorias.length === 0) {
      setError('Selecione pelo menos uma categoria de atuação')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // 1. Criar usuário (DADOS DE ACESSO)
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) throw signUpError
      if (!authData.user) throw new Error('Erro ao criar usuário')

      // 2. Criar empresa (DADOS DA EMPRESA + CATEGORIAS)
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .insert({
          nome_fantasia: formData.nome_fantasia,
          cnpj: formData.cnpj || null,
          descricao: formData.descricao || null,
          categorias: formData.categorias,
          is_public_partner: formData.is_public_partner,
          status: 'ACTIVE',
          origin: 'SELF_SIGNUP',
          onboarding_completed: false, // Forçará o modal pós-login
        })
        .select()
        .single()

      if (empresaError) throw empresaError

      // 3. Vincular usuário à empresa como OWNER
      const { error: vinculoError } = await supabase
        .from('empresa_usuarios')
        .insert({
          empresa_id: empresa.id,
          user_id: authData.user.id,
          role: 'OWNER',
        })

      if (vinculoError) throw vinculoError

      // Sucesso!
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('Erro no cadastro:', err)
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-xl shadow-primary-200 mb-4 text-white transform hover:rotate-6 transition-transform">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Seja Bem-vindo!</h1>
          <p className="text-slate-500">Crie sua conta administrativa em poucos passos</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-slate-100">
          {/* Steps Indicator */}
          <div className="flex items-center justify-between mb-10 px-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                  step === s ? 'bg-primary-600 text-white scale-110 shadow-lg shadow-primary-200' : 
                  step > s ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && (
                  <div className={`h-1 flex-1 mx-4 rounded-full transition-all ${
                    step > s ? 'bg-primary-600' : 'bg-slate-100'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl animate-shake">
              <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleCadastro}>
            {/* Step 1: Dados de Acesso */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="pb-4">
                  <h2 className="text-xl font-bold text-slate-900">Configurar Acesso</h2>
                  <p className="text-sm text-slate-500">Credenciais para login no painel</p>
                </div>

                <Input
                  label="E-mail Administrativo *"
                  placeholder="exemplo@gmail.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (fieldErrors.email && validators.email(e.target.value)) {
                      setFieldErrors(prev => ({ ...prev, email: '' }))
                    }
                  }}
                  error={fieldErrors.email}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Senha *"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value })
                      if (fieldErrors.password && e.target.value.length >= 6) {
                        setFieldErrors(prev => ({ ...prev, password: '' }))
                      }
                    }}
                    error={fieldErrors.password}
                    required
                  />
                  <Input
                    label="Confirmar Senha *"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value })
                      if (fieldErrors.confirmPassword && e.target.value === formData.password) {
                        setFieldErrors(prev => ({ ...prev, confirmPassword: '' }))
                      }
                    }}
                    error={fieldErrors.confirmPassword}
                    required
                  />
                </div>
                
                <p className="text-xs text-slate-400 pt-2">A senha deve conter pelo menos 6 caracteres.</p>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full mt-6 h-12"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Continuar
                </Button>
              </div>
            )}

            {/* Step 2: Dados da Empresa */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="pb-4">
                  <h2 className="text-xl font-bold text-slate-900">Sobre sua Empresa</h2>
                  <p className="text-sm text-slate-500">Dados cadastrais básicos</p>
                </div>

                <Input
                  label="Nome Fantasia *"
                  placeholder="Clínica Minha Saúde"
                  value={formData.nome_fantasia}
                  onChange={(e) => {
                    setFormData({ ...formData, nome_fantasia: e.target.value })
                    if (fieldErrors.nome_fantasia && e.target.value.trim()) {
                      setFieldErrors(prev => ({ ...prev, nome_fantasia: '' }))
                    }
                  }}
                  error={fieldErrors.nome_fantasia}
                  required
                />

                <Input
                  label="CNPJ"
                  placeholder="00.000.000/0000-00"
                  mask="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => {
                    setFormData({ ...formData, cnpj: e.target.value })
                    if (fieldErrors.cnpj && validators.cnpj(e.target.value)) {
                      setFieldErrors(prev => ({ ...prev, cnpj: '' }))
                    }
                  }}
                  error={fieldErrors.cnpj}
                  helperText="Deixe em branco se não possuir CNPJ"
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Pequena descrição</label>
                  <textarea
                    className="input w-full min-h-[100px]"
                    placeholder="Conte um pouco sobre o que sua empresa faz..."
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1" icon={<ArrowLeft className="w-5 h-5" />}>
                    Voltar
                  </Button>
                  <Button type="button" onClick={handleNext} className="flex-1" icon={<ArrowRight className="w-5 h-5" />}>
                    Próximo
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Categorias */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="pb-2">
                  <h2 className="text-xl font-bold text-slate-900">Categorias de Atuação</h2>
                  <p className="text-sm text-slate-500">Selecione onde sua empresa se encaixa</p>
                </div>

                <div className="grid gap-3">
                  {['CONSULTAS', 'EXAMES', 'FARMÁCIA'].map((cat) => (
                    <label key={cat} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      formData.categorias.includes(cat) 
                        ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-50' 
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                    }`}>
                      <span className="font-bold text-slate-700">{cat}</span>
                      <input
                        type="checkbox"
                        className="w-6 h-6 text-primary-600 rounded-lg border-slate-300 focus:ring-primary-500"
                        checked={formData.categorias.includes(cat)}
                        onChange={(e) => {
                          const newCats = e.target.checked
                            ? [...formData.categorias, cat]
                            : formData.categorias.filter(c => c !== cat)
                          setFormData({ ...formData, categorias: newCats })
                        }}
                      />
                    </label>
                  ))}
                </div>

                <div className="flex items-center gap-4 p-4 bg-primary-100/50 border border-primary-100 rounded-2xl">
                  <input
                    type="checkbox"
                    id="is_public_partner"
                    className="w-5 h-5 text-primary-600 rounded border-primary-300 focus:ring-primary-500"
                    checked={formData.is_public_partner}
                    onChange={(e) => setFormData({ ...formData, is_public_partner: e.target.checked })}
                  />
                  <div>
                    <label htmlFor="is_public_partner" className="text-sm font-bold text-primary-900">Unidade Pública / Parceira</label>
                    <p className="text-xs text-primary-700">Minha empresa é uma unidade do governo ou parceira.</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setStep(2)} className="flex-1">
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    Concluir Cadastro
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500">
              Já possui uma conta?{' '}
              <a href="/login" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
                Faça login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
