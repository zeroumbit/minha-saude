'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Building2, User, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Empresa } from '@/lib/types/database'
import { useAuthStore } from '@/lib/stores/auth-store'
import { masks, validators } from '@/lib/validation'

type Tab = 'empresa' | 'usuario'

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState<Tab>('empresa')
  const [isSaving, setIsSaving] = useState(false)
  const { empresa, user, setEmpresa, setUser } = useAuthStore()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  // Estado para dados da empresa
  const [empresaData, setEmpresaData] = useState<Partial<Empresa>>({})
  
  // Estado para perfil do usuário
  const [perfilData, setPerfilData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })

  useEffect(() => {
    if (empresa) {
      setEmpresaData({
        nome_fantasia: empresa.nome_fantasia || '',
        razao_social: empresa.razao_social || '',
        cnpj: empresa.cnpj || '',
        email_financeiro: empresa.email_financeiro || '',
        telefone: empresa.telefone || '',
        descricao: empresa.descricao || '',
        site: empresa.site || '',
        logo_url: empresa.logo_url || ''
      })
    }
  }, [empresa])

  useEffect(() => {
    if (user) {
      setPerfilData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || ''
      })
    }
  }, [user])

  const handleSaveEmpresa = async () => {
    if (!empresa) return

    // Validar campos
    setFieldErrors({})
    let hasError = false

    if (!empresaData.nome_fantasia?.trim()) {
      setFieldErrors(prev => ({ ...prev, nome_fantasia: 'Nome fantasia é obrigatório' }))
      hasError = true
    }

    if (empresaData.cnpj && !validators.cnpj(empresaData.cnpj)) {
      setFieldErrors(prev => ({ ...prev, cnpj: 'CNPJ inválido' }))
      hasError = true
    }

    if (empresaData.telefone && !validators.telefoneCelular(empresaData.telefone)) {
      setFieldErrors(prev => ({ ...prev, telefone: 'Telefone inválido' }))
      hasError = true
    }

    if (empresaData.email_financeiro && !validators.email(empresaData.email_financeiro)) {
      setFieldErrors(prev => ({ ...prev, email_financeiro: 'E-mail inválido' }))
      hasError = true
    }

    if (empresaData.site && !validators.url(empresaData.site)) {
      setFieldErrors(prev => ({ ...prev, site: 'URL inválida' }))
      hasError = true
    }

    if (hasError) return

    setIsSaving(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('empresas')
        .update({
          ...empresaData,
          updated_at: new Date().toISOString()
        })
        .eq('id', empresa.id)

      if (error) throw error

      // Atualizar o store com os novos dados
      const { data: updatedEmpresa } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresa.id)
        .single()

      if (updatedEmpresa) {
        setEmpresa(updatedEmpresa)
      }

      alert('Dados da empresa atualizados com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
      alert('Erro ao salvar dados da empresa')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePerfil = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      
      // Atualizar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: perfilData.firstName,
          last_name: perfilData.lastName
        })
        .eq('id', user?.id)

      if (profileError) throw profileError

      // Atualizar o store localmente
      if (user) {
        // Se o email mudou, atualizar no Auth do Supabase
        if (perfilData.email !== user.email) {
          const { error: emailError } = await supabase.auth.updateUser({
            email: perfilData.email
          })
          if (emailError) throw emailError
        }

        setUser({
          ...user,
          first_name: perfilData.firstName,
          last_name: perfilData.lastName,
          email: perfilData.email
        })
      }

      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      alert('Erro ao salvar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'success' | 'warning' | 'danger' }> = {
      ACTIVE: { variant: 'success' },
      SUSPENDED: { variant: 'warning' },
      BLOCKED_ADMIN: { variant: 'danger' },
      CANCELLED: { variant: 'danger' }
    }
    const { variant } = config[status] || { variant: 'default' as any }
    return <Badge variant={variant}>{status}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Meu Perfil</h1>
        <p className="text-slate-600 mt-1">
          Gerencie suas informações pessoais e da sua empresa
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('empresa')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'empresa'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Dados da Empresa
        </button>
        <button
          onClick={() => setActiveTab('usuario')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'usuario'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          Meu Perfil
        </button>
      </div>

      {/* Tab: Dados da Empresa */}
      {activeTab === 'empresa' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>
              Atualize os dados cadastrais da sua empresa que aparecem no app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input
                  id="nome_fantasia"
                  value={empresaData.nome_fantasia || ''}
                  onChange={(e) => {
                    setEmpresaData({ ...empresaData, nome_fantasia: e.target.value })
                    if (fieldErrors.nome_fantasia && e.target.value.trim()) {
                      setFieldErrors(prev => ({ ...prev, nome_fantasia: '' }))
                    }
                  }}
                  error={fieldErrors.nome_fantasia}
                  placeholder="Ex: Minha Saúde Clínica"
                />
              </div>
              <div>
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input
                  id="razao_social"
                  value={empresaData.razao_social || ''}
                  onChange={(e) => setEmpresaData({ ...empresaData, razao_social: e.target.value })}
                  placeholder="Ex: Minha Saúde LTDA"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  mask="cnpj"
                  value={empresaData.cnpj || ''}
                  onChange={(e) => {
                    setEmpresaData({ ...empresaData, cnpj: e.target.value })
                    if (fieldErrors.cnpj && validators.cnpj(e.target.value)) {
                      setFieldErrors(prev => ({ ...prev, cnpj: '' }))
                    }
                  }}
                  error={fieldErrors.cnpj}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  mask="telefoneCelular"
                  value={empresaData.telefone || ''}
                  onChange={(e) => {
                    setEmpresaData({ ...empresaData, telefone: e.target.value })
                    if (fieldErrors.telefone && validators.telefoneCelular(e.target.value)) {
                      setFieldErrors(prev => ({ ...prev, telefone: '' }))
                    }
                  }}
                  error={fieldErrors.telefone}
                  placeholder="(00) 0000-0000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email_financeiro">E-mail Financeiro</Label>
              <Input
                id="email_financeiro"
                type="email"
                value={empresaData.email_financeiro || ''}
                onChange={(e) => {
                  setEmpresaData({ ...empresaData, email_financeiro: e.target.value })
                  if (fieldErrors.email_financeiro && validators.email(e.target.value)) {
                    setFieldErrors(prev => ({ ...prev, email_financeiro: '' }))
                  }
                }}
                error={fieldErrors.email_financeiro}
                placeholder="financeiro@empresa.com"
              />
            </div>

            <div>
              <Label htmlFor="site">Site</Label>
              <Input
                id="site"
                value={empresaData.site || ''}
                onChange={(e) => {
                  setEmpresaData({ ...empresaData, site: e.target.value })
                  if (fieldErrors.site && validators.url(e.target.value)) {
                    setFieldErrors(prev => ({ ...prev, site: '' }))
                  }
                }}
                error={fieldErrors.site}
                placeholder="https://www.empresa.com.br"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={empresaData.descricao || ''}
                onChange={(e) => setEmpresaData({ ...empresaData, descricao: e.target.value })}
                placeholder="Breve descrição sobre sua empresa..."
                rows={4}
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button 
                onClick={handleSaveEmpresa} 
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar Empresa'}
              </Button>
              
              {empresa && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Status:</span>
                  {getStatusBadge(empresa.status)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Perfil do Usuário */}
      {activeTab === 'usuario' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>
              Seus dados de acesso e identificação pessoal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={perfilData.firstName}
                  onChange={(e) => setPerfilData({ ...perfilData, firstName: e.target.value })}
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={perfilData.lastName}
                  onChange={(e) => setPerfilData({ ...perfilData, lastName: e.target.value })}
                  placeholder="Seu sobrenome"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-mail de Acesso</Label>
              <Input
                id="email"
                type="email"
                value={perfilData.email}
                onChange={(e) => setPerfilData({ ...perfilData, email: e.target.value })}
                placeholder="seu@email.com"
              />
              <p className="text-xs text-slate-500 mt-1">
                Ao alterar o e-mail, você precisará verificá-lo no próximo acesso.
              </p>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleSavePerfil} 
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Atualizar Perfil'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}
