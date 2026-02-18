'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Settings, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ConfigGlobal } from '@/lib/types/database'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function ConfiguracoesPage() {
  const { user } = useAuthStore()
  const [configGlobal, setConfigGlobal] = useState<ConfigGlobal | null>(null)

  useEffect(() => {
    loadConfigGlobal()
  }, [])

  const loadConfigGlobal = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('config_global')
        .select('*')
        .single()

      if (error) {
        console.error('Erro ao carregar config global:', error)
      } else {
        setConfigGlobal(data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-600 mt-1">
          Gerencie as configurações globais do sistema e sua conta
        </p>
      </div>

      <div className="space-y-6">
        {/* Tab: Sistema */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-600" />
              Configurações do Sistema
            </CardTitle>
            <CardDescription>
              Informações globais de operação (somente leitura para parceiros)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {configGlobal ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Modo Operação Pago</span>
                  <Badge variant={configGlobal.modo_operacao_pago ? 'success' : 'default'}>
                    {configGlobal.modo_operacao_pago ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-600 font-medium">Dias de Trial Padrão</span>
                  <span className="font-bold text-slate-900">{configGlobal.dias_trial_padrao} dias</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-slate-500 animate-pulse">Carregando configurações...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações de Acesso</CardTitle>
            <CardDescription>
              Dados técnicos da sua conta de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">E-mail Principal</span>
                <span className="font-medium text-slate-900">{user?.email || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">ID de Referência</span>
                <span className="font-mono text-sm text-slate-500">{user?.id || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-slate-600">Data de Registro</span>
                <span className="font-medium text-slate-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  }) : '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
            <CardDescription>
              Ações críticas e irreversíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">Encerrar Conta</p>
                <p className="text-sm text-slate-500">
                  Ao excluir sua conta, todos os dados da empresa e unidades serão permanentemente removidos.
                </p>
              </div>
              <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} disabled className="opacity-50">
                Solicitar Exclusão
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
