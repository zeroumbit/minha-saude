'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { MapPin, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Unidade } from '@/lib/types/database'
import { useAuthStore } from '@/lib/stores/auth-store'
import Link from 'next/link'

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { empresa } = useAuthStore()

  useEffect(() => {
    loadUnidades()
  }, [empresa])

  const loadUnidades = async () => {
    if (!empresa) return

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .eq('empresa_id', empresa.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      setUnidades(data || [])
    } catch (error) {
      console.error('Erro ao carregar unidades:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUnidades = unidades.filter((unidade) =>
    unidade.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Unidades</h1>
          <p className="text-slate-600 mt-1">
            Gerencie os locais de atendimento da sua empresa
          </p>
        </div>

        <Link href="/dashboard/unidades/nova">
          <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
            Nova Unidade
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar unidades..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Unidades List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-600 mt-4">Carregando unidades...</p>
        </div>
      ) : filteredUnidades.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-lg font-medium text-slate-900">
                {searchTerm ? 'Nenhuma unidade encontrada' : 'Nenhuma unidade cadastrada'}
              </p>
              <p className="text-slate-600 mt-2">
                {searchTerm
                  ? 'Tente buscar com outros termos'
                  : 'Comece adicionando sua primeira unidade'}
              </p>
              {!searchTerm && (
                <Link href="/dashboard/unidades/nova">
                  <Button variant="primary" className="mt-6" icon={<Plus className="w-5 h-5" />}>
                    Adicionar Primeira Unidade
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredUnidades.map((unidade) => (
            <Card key={unidade.id} className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900">{unidade.nome}</h3>
                      <StatusBadge status={unidade.status} />
                      {unidade.is_publico && (
                        <span className="badge badge-primary">Público</span>
                      )}
                    </div>

                    {unidade.categoria && (
                      <p className="text-sm text-slate-600 mb-3">
                        📋 {unidade.categoria}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {unidade.cidade_ibge_id && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {unidade.logradouro && `${unidade.logradouro}, `}
                            {unidade.bairro && `${unidade.bairro} - `}
                            {unidade.estado}
                          </span>
                        </div>
                      )}

                      {unidade.whatsapp && (
                        <div className="text-slate-600">
                          📱 WhatsApp: {unidade.whatsapp}
                        </div>
                      )}

                      {unidade.telefone && (
                        <div className="text-slate-600">
                          ☎️ Telefone: {unidade.telefone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/dashboard/unidades/${unidade.id}`}>
                      <Button variant="secondary" icon={<Edit className="w-4 h-4" />}>
                        Editar
                      </Button>
                    </Link>
                    
                    <Button
                      variant="ghost"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => {
                        // TODO: Implementar soft delete
                        if (confirm('Deseja realmente excluir esta unidade?')) {
                          console.log('Excluir:', unidade.id)
                        }
                      }}
                      className="text-danger-600 hover:bg-danger-50"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
