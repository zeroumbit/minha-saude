'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, CheckCircle2, Loader2, Stethoscope, MapPin, Users, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Profissional, Unidade } from '@/lib/types/database'

export default function NovoServicoPage() {
  const router = useRouter()
  const { empresa } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [selectedProfissionais, setSelectedProfissionais] = useState<string[]>([])

  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [selectedUnidades, setSelectedUnidades] = useState<string[]>([])

  const [formData, setFormData] = useState({
    nome: '',
    ativo: true,
  })

  useEffect(() => {
    if (empresa) {
      loadData()
    }
  }, [empresa])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      const { data: profs } = await supabase.from('profissionais').select('*').eq('empresa_id', empresa?.id).eq('ativo', true)
      const { data: unis } = await supabase.from('unidades').select('*').eq('empresa_id', empresa?.id).eq('status', 'ACTIVE')

      setProfissionais(profs || [])
      setUnidades(unis || [])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresa) return
    if (selectedUnidades.length === 0) {
      setError('Selecione pelo menos uma unidade')
      return
    }
    if (selectedProfissionais.length === 0) {
      setError('Selecione pelo menos um profissional')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // 1. Inserir Serviço
      const { data: serv, error: servError } = await supabase
        .from('servicos')
        .insert({
          empresa_id: empresa.id,
          nome: formData.nome,
          ativo: formData.ativo,
        })
        .select()
        .single()

      if (servError) throw servError

      // 2. Inserir Profissionais vinculados
      if (selectedProfissionais.length > 0) {
        const profData = selectedProfissionais.map(pid => ({
          servico_id: serv.id,
          profissional_id: pid
        }))
        const { error: pError } = await supabase.from('servico_profissionais').insert(profData)
        if (pError) throw pError
      }

      // 3. Inserir Unidades vinculadas
      const uniData = selectedUnidades.map(uid => ({
        servico_id: serv.id,
        unidade_id: uid
      }))
      const { error: uError } = await supabase.from('servico_unidades').insert(uniData)
      if (uError) throw uError

      router.push('/dashboard/servicos')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao criar serviço')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl pb-20">
        <Link href="/dashboard/servicos">
          <Button variant="ghost" className="mb-4" icon={<ArrowLeft className="w-4 h-4" />}>
            Voltar
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Novo Serviço</h1>
        <p className="text-slate-600 mb-8">Defina um novo serviço ou procedimento oferecido em suas unidades.</p>

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
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <CardTitle className="text-xl">Informações do Serviço</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Input
                label="Nome do Serviço *"
                placeholder="Ex: Consulta Cardiológica, Exame de Sangue..."
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                required
              />

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-2 focus:ring-primary-500"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-slate-900 cursor-pointer">
                  Serviço disponível para agendamento no App
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Unidades */}
            <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <CardTitle className="text-lg">Unidades Vinculadas *</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {unidades.map(uni => (
                    <label key={uni.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 rounded"
                        checked={selectedUnidades.includes(uni.id)}
                        onChange={e => {
                          const newUnis = e.target.checked
                            ? [...selectedUnidades, uni.id]
                            : selectedUnidades.filter(id => id !== uni.id)
                          setSelectedUnidades(newUnis)
                        }}
                      />
                      <span className="text-sm font-medium text-slate-700">{uni.nome}</span>
                    </label>
                  ))}
                  {unidades.length === 0 && <p className="text-sm text-slate-400 italic">Nenhuma unidade ativa encontrada.</p>}
                </div>
              </CardContent>
            </Card>

            {/* Profissionais */}
            <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" />
                  <CardTitle className="text-lg">Profissionais que Prestam</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {profissionais.map(prof => (
                    <label key={prof.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 rounded"
                        checked={selectedProfissionais.includes(prof.id)}
                        onChange={e => {
                          const newProfs = e.target.checked
                            ? [...selectedProfissionais, prof.id]
                            : selectedProfissionais.filter(id => id !== prof.id)
                          setSelectedProfissionais(newProfs)
                        }}
                      />
                      <span className="text-sm font-medium text-slate-700">{prof.nome} {prof.sobrenome}</span>
                    </label>
                  ))}
                  {profissionais.length === 0 && <p className="text-sm text-slate-400 italic">Nenhum profissional ativo encontrado.</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden bg-blue-50/50 border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm">Como funciona a disponibilidade?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    A disponibilidade de horários é definida no cadastro de cada <strong>profissional</strong>. 
                    Este serviço estará disponível para agendamento nos horários em que os profissionais 
                    vinculados estiverem disponíveis.
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    <strong>Exemplo:</strong> Se o Dr. João atende às Segundas das 08:00 às 18:00, 
                    este serviço estará disponível nesses horários através dele.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex gap-4">
            <Link href="/dashboard/servicos" className="flex-1">
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
              Confirmar Serviço
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
