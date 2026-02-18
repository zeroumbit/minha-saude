'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { setEmpresa, setEmpresaUsuario, setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const loadEmpresa = async (userId: string) => {
    try {
      const supabase = createClient()
      
      // Carregar vínculo do usuário com a empresa
      const { data: empresaUsuario, error: euError } = await supabase
        .from('empresa_usuarios')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (euError) {
        console.error('Erro ao carregar empresa_usuario:', euError)
        return
      }

      if (empresaUsuario) {
        setEmpresaUsuario(empresaUsuario)
        
        // Carregar dados da empresa
        const { data: empresa, error: empresaError } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', empresaUsuario.empresa_id)
          .single()

        if (empresaError) {
          console.error('Erro ao carregar empresa:', empresaError)
        } else if (empresa) {
          setEmpresa(empresa)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) throw signInError

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        setUser({
          id: data.user.id,
          email: data.user.email || '',
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          created_at: data.user.created_at || ''
        })

        // Carregar dados da empresa
        await loadEmpresa(data.user.id)
        
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Minha Saúde</h1>
          <p className="text-primary-100">Plataforma de Anunciantes</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Entrar</h2>

          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="E-mail"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />

            <Input
              type="password"
              label="Senha"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full mt-6"
            >
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Não tem uma conta?{' '}
              <a href="/cadastro" className="text-primary-600 font-medium hover:text-primary-700">
                Cadastre-se
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-primary-100 mt-8">
          © 2024 Minha Saúde. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
