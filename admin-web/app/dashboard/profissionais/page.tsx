'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Briefcase, Plus, Search, MoreHorizontal, User, UserPlus, Trash2, Edit } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Profissional } from '@/lib/types/database'

export default function ProfissionaisPage() {
  const { empresa } = useAuthStore()
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (empresa) {
      loadProfissionais()
    }
  }, [empresa])

  const loadProfissionais = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profissionais')
        .select(`
          *,
          especialidades:profissional_especialidades (
            especialidade:especialidades (nome)
          )
        `)
        .eq('empresa_id', empresa?.id)
        .order('nome', { ascending: true })

      if (error) throw error
      setProfissionais(data || [])
    } catch (err) {
      console.error('Erro ao carregar profissionais:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStatus = async (profissional: Profissional) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profissionais')
        .update({ ativo: !profissional.ativo })
        .eq('id', profissional.id)

      if (error) throw error
      setProfissionais(profissionais.map(p => 
        p.id === profissional.id ? { ...p, ativo: !p.ativo } : p
      ))
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    }
  }

  const deleteProfissional = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profissionais')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProfissionais(profissionais.filter(p => p.id !== id))
    } catch (err) {
      console.error('Erro ao excluir profissional:', err)
    }
  }

  const filtered = profissionais.filter(p => 
    `${p.nome} ${p.sobrenome}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.registro_profissional?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profissionais</h1>
          <p className="text-slate-600 mt-1">
            Gerencie o corpo clínico e profissionais da sua empresa
          </p>
        </div>

        <Link href="/dashboard/profissionais/novo">
          <Button variant="primary" icon={<UserPlus className="w-5 h-5" />}>
            Novo Profissional
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou registro..."
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
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhum profissional encontrado</h3>
          <p className="text-slate-500 mb-6">Comece adicionando o primeiro profissional ao seu corpo clínico.</p>
          <Link href="/dashboard/profissionais/novo">
            <Button variant="secondary">Adicionar Profissional</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prof) => (
            <Card key={prof.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/dashboard/profissionais/${prof.id}`}>
                      <Button variant="ghost" className="p-2 h-auto">
                        <Edit className="w-4 h-4 text-slate-600" />
                      </Button>
                    </Link>
                    <Button variant="ghost" className="p-2 h-auto" onClick={() => deleteProfissional(prof.id)}>
                      <Trash2 className="w-4 h-4 text-danger-600" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 truncate">
                    {prof.nome} {prof.sobrenome}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Badge variant="secondary" className="font-mono">{prof.registro_profissional || 'S/R'}</Badge>
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {(prof as any).especialidades?.map((e: any, i: number) => (
                    <Badge key={i} variant="default" className="text-[10px] bg-slate-100 text-slate-600 border-none">
                      {e.especialidade.nome}
                    </Badge>
                  ))}
                  {(prof as any).especialidades?.length === 0 && (
                    <span className="text-xs text-slate-400 italic">Nenhuma especialidade</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Atendimento</span>
                    <span className="text-sm font-medium text-slate-700">{prof.tempo_atendimento_minutos} min</span>
                  </div>
                  <button
                    onClick={() => toggleStatus(prof)}
                    className={`
                      px-3 py-1 rounded-full text-xs font-bold transition-colors
                      ${prof.ativo 
                        ? 'bg-success-50 text-success-700 hover:bg-success-100' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }
                    `}
                  >
                    {prof.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
