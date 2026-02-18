'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Stethoscope, Plus, Search, Trash2, Edit, MapPin, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Servico } from '@/lib/types/database'

export default function ServicosPage() {
  const { empresa } = useAuthStore()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (empresa) {
      loadServicos()
    }
  }, [empresa])

  const loadServicos = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('servicos')
        .select(`
          *,
          unidades:servico_unidades(
            unidade:unidades(nome)
          ),
          profissionais:servico_profissionais(
            profissional:profissionais(nome, sobrenome)
          )
        `)
        .eq('empresa_id', empresa?.id)
        .order('nome', { ascending: true })

      if (error) throw error
      setServicos(data || [])
    } catch (err) {
      console.error('Erro ao carregar serviços:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStatus = async (servico: Servico) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('servicos')
        .update({ ativo: !servico.ativo })
        .eq('id', servico.id)

      if (error) throw error
      setServicos(servicos.map(s => 
        s.id === servico.id ? { ...s, ativo: !s.ativo } : s
      ))
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    }
  }

  const deleteServico = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id)

      if (error) throw error
      setServicos(servicos.filter(s => s.id !== id))
    } catch (err) {
      console.error('Erro ao excluir serviço:', err)
    }
  }

  const filtered = servicos.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Serviços</h1>
          <p className="text-slate-600 mt-1">
            Gerencie os procedimentos e serviços oferecidos em suas clínicas
          </p>
        </div>

        <Link href="/dashboard/servicos/novo">
          <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
            Novo Serviço
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome do serviço..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhum serviço cadastrado</h3>
          <p className="text-slate-500 mb-6">Cadastre os serviços que sua clínica oferece para aparecer no app.</p>
          <Link href="/dashboard/servicos/novo">
            <Button variant="secondary">Adicionar Serviço</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((serv) => (
            <Card key={serv.id} className="overflow-hidden group hover:shadow-lg transition-shadow border-slate-200/60 shadow-sm flex flex-col">
              <CardContent className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/servicos/${serv.id}`}>
                      <Button variant="ghost" className="p-2 h-auto">
                        <Edit className="w-4 h-4 text-slate-600" />
                      </Button>
                    </Link>
                    <Button variant="ghost" className="p-2 h-auto" onClick={() => deleteServico(serv.id)}>
                      <Trash2 className="w-4 h-4 text-danger-600" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{serv.nome}</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {(serv as any).unidades?.map((u: any, i: number) => (
                        <Badge key={i} variant="default" className="text-[10px] bg-slate-100 text-slate-600 border-none">
                          {u.unidade.nome}
                        </Badge>
                      ))}
                      {(serv as any).unidades?.length === 0 && <span className="text-xs text-slate-400 italic">Nenhuma unidade</span>}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {(serv as any).profissionais?.map((p: any, i: number) => (
                        <Badge key={i} variant="default" className="text-[10px] bg-primary-50 text-primary-600 border-none">
                          {p.profissional.nome}
                        </Badge>
                      ))}
                      {(serv as any).profissionais?.length === 0 && <span className="text-xs text-slate-400 italic">Nenhum profissional</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Status no App</span>
                <button
                  onClick={() => toggleStatus(serv)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-bold transition-colors
                    ${serv.ativo 
                      ? 'bg-success-50 text-success-700 hover:bg-success-100' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }
                  `}
                >
                  {serv.ativo ? 'Disponível' : 'Indisponível'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
