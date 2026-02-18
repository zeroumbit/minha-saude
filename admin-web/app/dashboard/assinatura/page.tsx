'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CreditCard, Check, AlertCircle, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Assinatura, Plano, Fatura } from '@/lib/types/database'
import { useAuthStore } from '@/lib/stores/auth-store'

interface AssinaturaComPlano extends Assinatura {
  planos: Plano | null
}

export default function AssinaturaPage() {
  const [assinatura, setAssinatura] = useState<AssinaturaComPlano | null>(null)
  const [faturas, setFaturas] = useState<Fatura[]>([])
  const [planos, setPlanos] = useState<Plano[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { empresa } = useAuthStore()

  useEffect(() => {
    loadAssinatura()
  }, [empresa])

  const loadAssinatura = async () => {
    if (!empresa) return

    try {
      const supabase = createClient()

      // Carregar assinatura atual
      const { data: assinaturaData, error: assinaturaError } = await supabase
        .from('assinaturas')
        .select(`
          *,
          plano:planos (
            *
          )
        `)
        .eq('empresa_id', empresa.id)
        .maybeSingle() // Usar maybeSingle para evitar erro 406 ou exceptions em filtros

      if (assinaturaError) {
        console.error('Erro ao carregar assinatura:', assinaturaError)
      } else if (assinaturaData) {
        setAssinatura({
          ...assinaturaData,
          planos: (assinaturaData as any).plano // Mapear o alias configurado no select
        })
      }

      // Carregar faturas
      const { data: faturasData, error: faturasError } = await supabase
        .from('faturas')
        .select('*')
        .eq('empresa_id', empresa.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (faturasError) {
        console.error('Erro ao carregar faturas:', faturasError)
      } else {
        setFaturas(faturasData || [])
      }

      // Carregar planos disponíveis
      const { data: planosData, error: planosError } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)

      if (planosError) {
        console.error('Erro ao carregar planos:', planosError)
      } else {
        setPlanos(planosData || [])
      }

    } catch (error) {
      console.error('Erro ao carregar dados da assinatura:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
      TRIAL: { label: 'Período de Teste', variant: 'success' },
      ACTIVE: { label: 'Ativa', variant: 'success' },
      PAST_DUE: { label: 'Vencida', variant: 'warning' },
      CANCELED: { label: 'Cancelada', variant: 'danger' },
      PAUSED: { label: 'Pausada', variant: 'default' }
    }

    const { label, variant } = config[status] || { label: status, variant: 'default' as const }
    return <Badge variant={variant}>{label}</Badge>
  }

  const getFaturaStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
      OPEN: { label: 'Aberta', variant: 'warning' },
      PAID: { label: 'Paga', variant: 'success' },
      VOID: { label: 'Cancelada', variant: 'default' },
      UNCOLLECTIBLE: { label: 'Incobrável', variant: 'danger' }
    }

    const { label, variant } = config[status] || { label: status, variant: 'default' as const }
    return <Badge variant={variant}>{label}</Badge>
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Assinatura</h1>
          <p className="text-slate-600 mt-1">
            Gerencie seu plano e faturas
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Card: Status da Assinatura */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Status</CardTitle>
            <CreditCard className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {assinatura ? (
              <div className="text-2xl font-bold">
                {getStatusBadge(assinatura.status)}
              </div>
            ) : (
              <p className="text-slate-500">Sem assinatura</p>
            )}
          </CardContent>
        </Card>

        {/* Card: Plano Atual */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Plano Atual</CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {assinatura?.planos ? (
              <>
                <div className="text-2xl font-bold">{assinatura.planos.nome}</div>
                <p className="text-sm text-slate-500 mt-1">
                  {formatCurrency(assinatura.valor)} / {assinatura.billing_cycle === 'MONTHLY' ? 'mês' : 'ano'}
                </p>
              </>
            ) : (
              <p className="text-slate-500">Nenhum plano ativo</p>
            )}
          </CardContent>
        </Card>

        {/* Card: Próximo Vencimento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Próximo Vencimento</CardTitle>
            <AlertCircle className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {assinatura?.current_period_end ? (
              <div className="text-2xl font-bold">
                {formatDate(assinatura.current_period_end)}
              </div>
            ) : (
              <p className="text-slate-500">-</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Planos Disponíveis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
          <CardDescription>
            Escolha o plano ideal para sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : planos.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhum plano disponível no momento.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {planos.map((plano) => (
                <div
                  key={plano.id}
                  className={`border rounded-lg p-6 ${
                    assinatura?.plano_id === plano.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{plano.nome}</h3>
                    {assinatura?.plano_id === plano.id && (
                      <Badge variant="success">Atual</Badge>
                    )}
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4">{plano.descricao}</p>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      {plano.valor_mensal ? formatCurrency(plano.valor_mensal) : 'Grátis'}
                    </span>
                    <span className="text-slate-500">/mês</span>
                  </div>

                  {plano.valor_anual && (
                    <p className="text-sm text-slate-500 mb-4">
                      ou {formatCurrency(plano.valor_anual)}/ano
                    </p>
                  )}

                  {plano.limite_unidades && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Até {plano.limite_unidades} unidades</span>
                    </div>
                  )}

                  {plano.destaque_permitido && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Unidades em destaque</span>
                    </div>
                  )}

                  <Button 
                    variant={assinatura?.plano_id === plano.id ? 'ghost' : 'secondary'} 
                    className="w-full mt-2"
                    disabled={assinatura?.plano_id === plano.id}
                  >
                    {assinatura?.plano_id === plano.id ? 'Plano Atual' : 'Assinar'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Faturas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Faturas Recentes</CardTitle>
          <CardDescription>
            Histórico das últimas faturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : faturas.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhuma fatura encontrada.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {faturas.map((fatura) => (
                <div key={fatura.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      {formatCurrency(fatura.valor)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Vencimento: {formatDate(fatura.vencimento)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getFaturaStatusBadge(fatura.status)}
                    {fatura.paid_at && (
                      <span className="text-xs text-slate-500">
                        Pago em {formatDate(fatura.paid_at)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-900">Precisa de ajuda?</h4>
          <p className="text-sm text-blue-700 mt-1">
            Em caso de dúvidas sobre sua assinatura ou faturas, entre em contato com nosso suporte.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
