'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Building2 } from 'lucide-react'

export default function CadastroPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  
  const [formData, setFormData] = useState({
    // Step 1: Dados da Empresa
    nome_fantasia: '',
    razao_social: '',
    cnpj: '',
    email_financeiro: '',
    telefone: '',
    site: '',
    descricao: '',
    categorias: [] as string[],
    is_public_partner: false,

    // Step 2: Dados do Responsável
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // 1. Criar usuário
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      })

      if (signUpError) throw signUpError
      if (!authData.user) throw new Error('Erro ao criar usuário')

      // 2. Criar empresa
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .insert({
          nome_fantasia: formData.nome_fantasia,
          razao_social: formData.razao_social || null,
          cnpj: formData.cnpj || null,
          email_financeiro: formData.email_financeiro || null,
          telefone: formData.telefone || null,
          site: formData.site || null,
          descricao: formData.descricao || null,
          categorias: formData.categorias,
          is_public_partner: formData.is_public_partner,
          status: 'ACTIVE',
          origin: 'SELF_SIGNUP',
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

      // Sucesso! Redirecionar para onboarding ou dashboard
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
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-primary-100">Comece a anunciar sua empresa no app</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-slide-up">
          {/* Steps Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-slate-200'}`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                2
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleCadastro}>
            {/* Step 1: Dados da Empresa */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Dados da Empresa</h2>

                <Input
                  label="Nome Fantasia *"
                  placeholder="Clínica Exemplo"
                  value={formData.nome_fantasia}
                  onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                  required
                />

                <Input
                  label="Razão Social"
                  placeholder="Clínica Exemplo LTDA"
                  value={formData.razao_social}
                  onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="CNPJ"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  />

                  <Input
                    label="Telefone"
                    placeholder="(00) 0000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>

                <Input
                  label="E-mail Financeiro"
                  placeholder="financeiro@empresa.com"
                  type="email"
                  value={formData.email_financeiro}
                  onChange={(e) => setFormData({ ...formData, email_financeiro: e.target.value })}
                />

                <Input
                  label="Site"
                  placeholder="https://www.suaempresa.com.br"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
                  <textarea
                    className="input w-full"
                    rows={3}
                    placeholder="Breve descrição sobre sua empresa..."
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-sm font-bold text-slate-900">Categorias de Atuação *</label>
                  <div className="flex flex-wrap gap-3">
                    {['CONSULTAS', 'EXAMES', 'FARMÁCIA'].map((cat) => (
                      <label key={cat} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary-600 rounded"
                          checked={formData.categorias.includes(cat)}
                          onChange={(e) => {
                            const newCats = e.target.checked
                              ? [...formData.categorias, cat]
                              : formData.categorias.filter(c => c !== cat)
                            setFormData({ ...formData, categorias: newCats })
                          }}
                        />
                        <span className="text-sm font-medium text-slate-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Selecione pelo menos uma categoria onde sua empresa atua.</p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-100 rounded-xl">
                  <input
                    type="checkbox"
                    id="is_public_partner"
                    className="w-5 h-5 text-primary-600 rounded border-primary-300 focus:ring-primary-500"
                    checked={formData.is_public_partner}
                    onChange={(e) => setFormData({ ...formData, is_public_partner: e.target.checked })}
                  />
                  <div>
                    <label htmlFor="is_public_partner" className="text-sm font-bold text-primary-900 block">Empresa Pública / Parceira</label>
                    <p className="text-xs text-primary-700">Marque se sua empresa é uma unidade pública de saúde ou parceira governamental.</p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  className="w-full mt-6"
                  onClick={() => setStep(2)}
                  disabled={!formData.nome_fantasia}
                >
                  Próximo
                </Button>
              </div>
            )}

            {/* Step 2: Dados do Responsável */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Dados do Responsável</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nome *"
                    placeholder="Seu nome"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label="Sobrenome *"
                    placeholder="Seu sobrenome"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                <Input
                  type="email"
                  label="E-mail *"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoComplete="email"
                />

                <Input
                  type="password"
                  label="Senha *"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  helperText="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                />

                <Input
                  type="password"
                  label="Confirmar Senha *"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                />

                <div className="flex gap-4 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    Criar Conta
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Já tem uma conta?{' '}
              <a href="/login" className="text-primary-600 font-medium hover:text-primary-700">
                Faça login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
