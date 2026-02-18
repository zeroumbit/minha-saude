'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, CheckCircle2, Clock, DollarSign, Loader2, User, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Especialidade } from '@/lib/types/database'

const DIAS_SEMANA = [
  { id: 1, nome: 'Segunda-feira' },
  { id: 2, nome: 'Terça-feira' },
  { id: 3, nome: 'Quarta-feira' },
  { id: 4, nome: 'Quinta-feira' },
  { id: 5, nome: 'Sexta-feira' },
  { id: 6, nome: 'Sábado' },
  { id: 0, nome: 'Domingo' },
]

export default function NovoProfissionalPage() {
  const router = useRouter()
  const { empresa } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
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
    1: { ativo: true, inicio: '08:00', fim: '18:00' },
    2: { ativo: true, inicio: '08:00', fim: '18:00' },
    3: { ativo: true, inicio: '08:00', fim: '18:00' },
    4: { ativo: true, inicio: '08:00', fim: '18:00' },
    5: { ativo: true, inicio: '08:00', fim: '18:00' },
    6: { ativo: false, inicio: '08:00', fim: '12:00' },
    0: { ativo: false, inicio: '08:00', fim: '12:00' },
  })

  useEffect(() => {
    loadEspecialidades()
  }, [])

  const loadEspecialidades = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('especialidades')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true })

      if (error) throw error
      setEspecialidades(data || [])
    } catch (err) {
      console.error('Erro ao carregar especialidades:', err)
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
    if (selectedEspecialidades.length === 0) {
      setError('Selecione pelo menos uma especialidade')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // 1. Inserir Profissional
      const { data: prof, error: profError } = await supabase
        .from('profissionais')
        .insert({
          empresa_id: empresa.id,
          nome: formData.nome,
          sobrenome: formData.sobrenome || null,
          registro_profissional: formData.registro_profissional || null,
          tempo_atendimento_minutos: formData.tempo_atendimento_minutos,
          valor_normal: formData.valor_normal ? parseFloat(formData.valor_normal) : null,
          valor_pix: formData.valor_pix ? parseFloat(formData.valor_pix) : null,
          valor_cartao: formData.valor_cartao ? parseFloat(formData.valor_cartao) : null,
          ativo: formData.ativo,
        })
        .select()
        .single()

      if (profError) throw profError

      // 2. Inserir Especialidades
      const especData = selectedEspecialidades.map(eid => ({
        profissional_id: prof.id,
        especialidade_id: eid
      }))
      const { error: especError } = await supabase.from('profissional_especialidades').insert(especData)
      if (especError) throw especError

      // 3. Inserir Disponibilidade
      const dispData = Object.entries(disponibilidade)
        .filter(([_, v]) => v.ativo)
        .map(([dia, v]) => ({
          profissional_id: prof.id,
          dia_semana: parseInt(dia),
          hora_inicio: v.inicio,
          hora_fim: v.fim
        }))
      
      if (dispData.length > 0) {
        const { error: dispError } = await supabase.from('profissional_disponibilidade').insert(dispData)
        if (dispError) throw dispError
      }

      router.push('/dashboard/profissionais')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao criar profissional')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl pb-20">
        <Link href="/dashboard/profissionais">
          <Button variant="ghost" className="mb-4" icon={<ArrowLeft className="w-4 h-4" />}>
            Voltar
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Novo Profissional</h1>
        <p className="text-slate-600 mb-8">Cadastre um novo profissional no seu corpo clínico e defina seus horários.</p>

        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl animate-fade-in shadow-sm">
            <p className="text-sm text-danger-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados Principais */}
          <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                  <User className="w-4 h-4" />
                </div>
                <CardTitle className="text-xl">Dados de Identificação</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome *"
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  required
                />
                <Input
                  label="Sobrenome"
                  value={formData.sobrenome}
                  onChange={e => setFormData({...formData, sobrenome: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Registro Profissional (Ex: CRM-SP 12345)"
                  value={formData.registro_profissional}
                  onChange={e => setFormData({...formData, registro_profissional: e.target.value})}
                />
                <Input
                  label="Tempo Médio de Atendimento (minutos)"
                  type="number"
                  value={formData.tempo_atendimento_minutos}
                  onChange={e => setFormData({...formData, tempo_atendimento_minutos: parseInt(e.target.value)})}
                />
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

          {/* Precificação */}
          <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center text-success-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <CardTitle className="text-xl">Valores de Atendimento</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Valor Normal (R$)"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor_normal}
                  onChange={e => setFormData({...formData, valor_normal: e.target.value})}
                />
                <Input
                  label="Valor no PIX (R$)"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor_pix}
                  onChange={e => setFormData({...formData, valor_pix: e.target.value})}
                />
                <Input
                  label="Valor no Cartão (R$)"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor_cartao}
                  onChange={e => setFormData({...formData, valor_cartao: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Disponibilidade */}
          <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center text-warning-600">
                  <Clock className="w-4 h-4" />
                </div>
                <CardTitle className="text-xl">Horários de Atendimento</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-3 text-xs font-bold text-slate-400 uppercase">Dia da Semana</th>
                    <th className="py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                    <th className="py-3 text-xs font-bold text-slate-400 uppercase">Início</th>
                    <th className="py-3 text-xs font-bold text-slate-400 uppercase">Fim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {DIAS_SEMANA.map(dia => (
                    <tr key={dia.id}>
                      <td className="py-4 font-medium text-slate-700">{dia.nome}</td>
                      <td className="py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={disponibilidade[dia.id].ativo}
                            onChange={e => setDisponibilidade({...disponibilidade, [dia.id]: { ...disponibilidade[dia.id], ativo: e.target.checked }})}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          <span className="ml-3 text-xs font-medium text-slate-700">
                            {disponibilidade[dia.id].ativo ? 'Atende' : 'Não atende'}
                          </span>
                        </label>
                      </td>
                      <td className="py-4">
                        <input
                          type="time"
                          disabled={!disponibilidade[dia.id].ativo}
                          value={disponibilidade[dia.id].inicio}
                          onChange={e => setDisponibilidade({...disponibilidade, [dia.id]: { ...disponibilidade[dia.id], inicio: e.target.value }})}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </td>
                      <td className="py-4">
                        <input
                          type="time"
                          disabled={!disponibilidade[dia.id].ativo}
                          value={disponibilidade[dia.id].fim}
                          onChange={e => setDisponibilidade({...disponibilidade, [dia.id]: { ...disponibilidade[dia.id], fim: e.target.value }})}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex gap-4">
            <Link href="/dashboard/profissionais" className="flex-1">
              <Button type="button" variant="ghost" className="w-full">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isLoading}
              icon={<CheckCircle2 className="w-5 h-5" />}
            >
              Cadastrar Profissional
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
