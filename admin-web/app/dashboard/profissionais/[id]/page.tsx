'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, CheckCircle2, Clock, DollarSign, Loader2, User, Save, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Especialidade, Profissional } from '@/lib/types/database'

const DIAS_SEMANA = [
  { id: 1, nome: 'Segunda-feira' },
  { id: 2, nome: 'Terça-feira' },
  { id: 3, nome: 'Quarta-feira' },
  { id: 4, nome: 'Quinta-feira' },
  { id: 5, nome: 'Sexta-feira' },
  { id: 6, nome: 'Sábado' },
  { id: 0, nome: 'Domingo' },
]

export default function EditarProfissionalPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { empresa } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<string[]>([])
  const [especialidadeSearch, setEspecialidadeSearch] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    registro_profissional: '',
    tempo_atendimento_minutos: 30,
    valor_normal: '',
    valor_pix: '',
    valor_cartao: '',
    ativo: true,
  })

  const [disponibilidade, setDisponibilidade] = useState<Record<number, { ativo: boolean; inicio: string; fim: string }>>({
    1: { ativo: false, inicio: '08:00', fim: '18:00' },
    2: { ativo: false, inicio: '08:00', fim: '18:00' },
    3: { ativo: false, inicio: '08:00', fim: '18:00' },
    4: { ativo: false, inicio: '08:00', fim: '18:00' },
    5: { ativo: false, inicio: '08:00', fim: '18:00' },
    6: { ativo: false, inicio: '08:00', fim: '12:00' },
    0: { ativo: false, inicio: '08:00', fim: '12:00' },
  })

  useEffect(() => {
    if (empresa && id) {
      loadAll()
    }
  }, [empresa, id])

  const loadAll = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      const { data: especs } = await supabase
        .from('especialidades')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true })
      setEspecialidades(especs || [])

      // 2. Profissional
      const { data: prof, error: profError } = await supabase
        .from('profissionais')
        .select(`
          *,
          especialidades:profissional_especialidades(especialidade_id),
          disponibilidade:profissional_disponibilidade(*)
        `)
        .eq('id', id)
        .single()

      if (profError) throw profError

      setFormData({
        nome: prof.nome,
        sobrenome: prof.sobrenome || '',
        registro_profissional: prof.registro_profissional || '',
        tempo_atendimento_minutos: prof.tempo_atendimento_minutos,
        valor_normal: prof.valor_normal?.toString() || '',
        valor_pix: prof.valor_pix?.toString() || '',
        valor_cartao: prof.valor_cartao?.toString() || '',
        ativo: prof.ativo,
      })

      setSelectedEspecialidades(prof.especialidades.map((e: any) => e.especialidade_id))

      const newDisp = { ...disponibilidade }
      prof.disponibilidade.forEach((d: any) => {
        newDisp[d.dia_semana] = { ativo: true, inicio: d.hora_inicio.slice(0, 5), fim: d.hora_fim.slice(0, 5) }
      })
      setDisponibilidade(newDisp)

    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados do profissional')
    } finally {
      setIsLoading(false)
    }
  }

  // Agrupar especialidades por categoria
  const groupedEspecialidades = especialidades
    .filter(esp => esp.nome.toLowerCase().includes(especialidadeSearch.toLowerCase()))
    .reduce((acc, esp) => {
      const cat = esp.categoria || 'OUTRAS'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(esp)
      return acc
    }, {} as Record<string, Especialidade[]>)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresa) return
    setIsSaving(true)
    setError('')

    try {
      const supabase = createClient()

      // 1. Atualizar Profissional
      const { error: profError } = await supabase
        .from('profissionais')
        .update({
          nome: formData.nome,
          sobrenome: formData.sobrenome || null,
          registro_profissional: formData.registro_profissional || null,
          tempo_atendimento_minutos: formData.tempo_atendimento_minutos,
          valor_normal: formData.valor_normal ? parseFloat(formData.valor_normal) : null,
          valor_pix: formData.valor_pix ? parseFloat(formData.valor_pix) : null,
          valor_cartao: formData.valor_cartao ? parseFloat(formData.valor_cartao) : null,
          ativo: formData.ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (profError) throw profError

      // 2. Sincronizar Especialidades
      await supabase.from('profissional_especialidades').delete().eq('profissional_id', id)
      if (selectedEspecialidades.length > 0) {
        const especData = selectedEspecialidades.map(eid => ({
          profissional_id: id,
          especialidade_id: eid
        }))
        await supabase.from('profissional_especialidades').insert(especData)
      }

      // 3. Sincronizar Disponibilidade
      await supabase.from('profissional_disponibilidade').delete().eq('profissional_id', id)
      const dispData = Object.entries(disponibilidade)
        .filter(([_, v]) => v.ativo)
        .map(([dia, v]) => ({
          profissional_id: id,
          dia_semana: parseInt(dia),
          hora_inicio: v.inicio,
          hora_fim: v.fim
        }))
      
      if (dispData.length > 0) {
        await supabase.from('profissional_disponibilidade').insert(dispData)
      }

      alert('Profissional atualizado com sucesso!')
      router.push('/dashboard/profissionais')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao atualizar profissional')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="max-w-4xl pb-20">
        <Link href="/dashboard/profissionais">
          <Button variant="ghost" className="mb-4" icon={<ArrowLeft className="w-4 h-4" />}>
            Voltar
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Editar Profissional</h1>
        <p className="text-slate-600 mb-8">Atualize as informações e horários de {formData.nome}.</p>

        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Reutilizando estrutura do NovoProfissional com lógica de Save */}
          <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
               <CardTitle className="text-xl">Dados de Identificação</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome *" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                <Input label="Sobrenome" value={formData.sobrenome} onChange={e => setFormData({...formData, sobrenome: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Registro Profissional" value={formData.registro_profissional} onChange={e => setFormData({...formData, registro_profissional: e.target.value})} />
                <Input label="Tempo Médio (min)" type="number" value={formData.tempo_atendimento_minutos} onChange={e => setFormData({...formData, tempo_atendimento_minutos: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <label className="block text-sm font-bold text-slate-900">Especialidades *</label>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrar especialidades..."
                      className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      value={especialidadeSearch}
                      onChange={e => setEspecialidadeSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(groupedEspecialidades).map(([categoria, items]) => (
                    <div key={categoria} className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-white/95 backdrop-blur-sm py-1 z-10">
                        {categoria}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map(esp => (
                          <label 
                            key={esp.id} 
                            className={`
                              flex items-center gap-2 p-2 rounded-xl cursor-pointer border transition-all
                              ${selectedEspecialidades.includes(esp.id)
                                ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-100'
                                : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                              checked={selectedEspecialidades.includes(esp.id)}
                              onChange={e => {
                                const newEspecs = e.target.checked
                                  ? [...selectedEspecialidades, esp.id]
                                  : selectedEspecialidades.filter(id => id !== esp.id)
                                setSelectedEspecialidades(newEspecs)
                              }}
                            />
                            <span className={`text-[11px] font-medium truncate ${selectedEspecialidades.includes(esp.id) ? 'text-primary-900' : 'text-slate-700'}`}>
                              {esp.nome}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {Object.keys(groupedEspecialidades).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">Nenhuma especialidade encontrada para "{especialidadeSearch}"</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
               <CardTitle className="text-xl text-success-700">Valores de Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Normal" type="number" step="0.01" value={formData.valor_normal} onChange={e => setFormData({...formData, valor_normal: e.target.value})} />
                <Input label="PIX" type="number" step="0.01" value={formData.valor_pix} onChange={e => setFormData({...formData, valor_pix: e.target.value})} />
                <Input label="Cartão" type="number" step="0.01" value={formData.valor_cartao} onChange={e => setFormData({...formData, valor_cartao: e.target.value})} />
              </div>
            </CardContent>
          </Card>

           {/* Disponibilidade */}
          <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
               <CardTitle className="text-xl">Horários de Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {DIAS_SEMANA.map(dia => (
                  <div key={dia.id} className="flex flex-col md:flex-row md:items-center justify-between py-2 border-b border-slate-50 last:border-0 gap-4">
                    <span className="font-medium text-slate-700 w-32">{dia.nome}</span>
                    <div className="flex items-center gap-4 flex-1">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={disponibilidade[dia.id]?.ativo}
                          onChange={e => setDisponibilidade({...disponibilidade, [dia.id]: { ...disponibilidade[dia.id], ativo: e.target.checked }})}
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          disabled={!disponibilidade[dia.id]?.ativo}
                          value={disponibilidade[dia.id]?.inicio || '08:00'}
                          onChange={e => setDisponibilidade({...disponibilidade, [dia.id]: { ...disponibilidade[dia.id], inicio: e.target.value }})}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm disabled:opacity-50"
                        />
                        <span className="text-slate-400">até</span>
                        <input
                          type="time"
                          disabled={!disponibilidade[dia.id]?.ativo}
                          value={disponibilidade[dia.id]?.fim || '18:00'}
                          onChange={e => setDisponibilidade({...disponibilidade, [dia.id]: { ...disponibilidade[dia.id], fim: e.target.value }})}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link href="/dashboard/profissionais" className="flex-1">
              <Button type="button" variant="ghost" className="w-full">Cancelar</Button>
            </Link>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isSaving} icon={<Save className="w-5 h-5" />}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
