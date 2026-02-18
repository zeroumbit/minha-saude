'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Building2, User, Save, ShieldCheck } from 'lucide-react'
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
        logo_url: empresa.logo_url || '',
        responsavel_nome: empresa.responsavel_nome || '',
        responsavel_email: empresa.responsavel_email || '',
        responsavel_telefone: empresa.responsavel_telefone || '',
        instagram: empresa.instagram || '',
        whatsapp: empresa.whatsapp || '',
        email_sac: empresa.email_sac || ''
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
      setFieldErrors(prev => ({ ...prev, site: 'URL inválidade' }))
      hasError = true
    }

    // Responsável
    if (!empresaData.responsavel_nome?.trim()) {
      setFieldErrors(prev => ({ ...prev, responsavel_nome: 'Nome do responsável é obrigatório' }))
      hasError = true
    }
    if (empresaData.responsavel_email && !validators.email(empresaData.responsavel_email)) {
      setFieldErrors(prev => ({ ...prev, responsavel_email: 'E-mail do responsável inválido' }))
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
        <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-600 mt-1">
          Gerencie as informações da sua empresa e sua conta pessoal
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
          Meu Perfil de Acesso
        </button>
      </div>

      {/* Tab: Dados da Empresa */}
      {activeTab === 'empresa' && (
        <div className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Identificação da Empresa</CardTitle>
              <CardDescription>
                Informações cadastrais básicas da empresa anunciante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="nome_fantasia">Nome Fantasia *</Label>
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
                  />
                </div>
                <div>
                  <Label htmlFor="razao_social">Razão Social</Label>
                  <Input
                    id="razao_social"
                    value={empresaData.razao_social || ''}
                    onChange={(e) => setEmpresaData({ ...empresaData, razao_social: e.target.value })}
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
              </div>

              <div>
                <Label htmlFor="descricao">Descrição (Aparece no App)</Label>
                <Textarea
                  id="descricao"
                  value={empresaData.descricao || ''}
                  onChange={(e) => setEmpresaData({ ...empresaData, descricao: e.target.value })}
                  placeholder="Conte um pouco sobre os serviços oferecidos..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
              <div>
                <CardTitle>Responsável pela Conta</CardTitle>
                <CardDescription>
                  Pessoa responsável por esta empresa anunciante
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="responsavel_nome">Nome Completo *</Label>
                  <Input
                    id="responsavel_nome"
                    value={empresaData.responsavel_nome || ''}
                    onChange={(e) => {
                      setEmpresaData({ ...empresaData, responsavel_nome: e.target.value })
                      if (fieldErrors.responsavel_nome && e.target.value.trim()) {
                        setFieldErrors(prev => ({ ...prev, responsavel_nome: '' }))
                      }
                    }}
                    error={fieldErrors.responsavel_nome}
                  />
                </div>
                <div>
                  <Label htmlFor="responsavel_email">E-mail de Contato *</Label>
                  <Input
                    id="responsavel_email"
                    type="email"
                    value={empresaData.responsavel_email || ''}
                    onChange={(e) => {
                      setEmpresaData({ ...empresaData, responsavel_email: e.target.value })
                      if (fieldErrors.responsavel_email && validators.email(e.target.value)) {
                        setFieldErrors(prev => ({ ...prev, responsavel_email: '' }))
                      }
                    }}
                    error={fieldErrors.responsavel_email}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="responsavel_telefone">Telefone de Contato</Label>
                <Input
                  id="responsavel_telefone"
                  mask="telefoneCelular"
                  value={empresaData.responsavel_telefone || ''}
                  onChange={(e) => setEmpresaData({ ...empresaData, responsavel_telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financeiro e SAC</CardTitle>
              <CardDescription>
                Canais de comunicação para faturamento e atendimento ao cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email_financeiro">E-mail Financeiro</Label>
                  <Input
                    id="email_financeiro"
                    type="email"
                    value={empresaData.email_financeiro || ''}
                    onChange={(e) => setEmpresaData({ ...empresaData, email_financeiro: e.target.value })}
                    placeholder="financeiro@empresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone_geral">Telefone Geral</Label>
                  <Input
                    id="telefone_geral"
                    mask="telefoneCelular"
                    value={empresaData.telefone || ''}
                    onChange={(e) => setEmpresaData({ ...empresaData, telefone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp SAC</Label>
                  <Input
                    id="whatsapp"
                    mask="celular"
                    value={empresaData.whatsapp || ''}
                    onChange={(e) => setEmpresaData({ ...empresaData, whatsapp: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email_sac">E-mail SAC</Label>
                  <Input
                    id="email_sac"
                    type="email"
                    value={empresaData.email_sac || ''}
                    onChange={(e) => setEmpresaData({ ...empresaData, email_sac: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <Button onClick={handleSaveEmpresa} isLoading={isSaving} icon={<Save className="w-4 h-4" />}>
                Salvar Todas as Alterações
              </Button>
              {empresa && (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-slate-500">Status da Conta:</span>
                  {getStatusBadge(empresa.status)}
                </div>
              )}
            </div>
            {empresa?.is_public_partner && (
              <Badge variant="success" className="bg-primary-50 text-primary-700 hover:bg-primary-100 border-primary-200">
                Parceiro Público
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Tab: Perfil do Usuário */}
      {activeTab === 'usuario' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Meu Perfil de Acesso</CardTitle>
            <CardDescription>
              Seus dados pessoais no sistema (usados para todos os seus anunciantes)
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
              <Label htmlFor="email">E-mail de Login</Label>
              <Input
                id="email"
                type="email"
                value={perfilData.email}
                onChange={(e) => setPerfilData({ ...perfilData, email: e.target.value })}
                placeholder="seu@email.com"
              />
              <p className="text-xs text-slate-500 mt-2">
                Nota: O e-mail de login é único e serve para acessar todas as empresas vinculadas ao seu usuário.
              </p>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleSavePerfil} 
                isLoading={isSaving}
                icon={<Save className="w-4 h-4" />}
              >
                Atualizar Perfil Pessoal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}
