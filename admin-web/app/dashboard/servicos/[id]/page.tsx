'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Info, Loader2, Stethoscope, MapPin, Users, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Profissional, Unidade } from '@/lib/types/database'

export default function EditarServicoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { empresa } = useAuthStore()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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
    if (empresa && id) {
      loadAll()
    }
  }, [empresa, id])

  const loadAll = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // 1. Dados para os selects
      const { data: profs } = await supabase.from('profissionais').select('*').eq('empresa_id', empresa?.id)
      const { data: unis } = await supabase.from('unidades').select('*').eq('empresa_id', empresa?.id)
      setProfissionais(profs || [])
      setUnidades(unis || [])

      // 2. Dados do Serviço
      const { data: serv, error: servError } = await supabase
        .from('servicos')
        .select(`
          *,
          unidades:servico_unidades(unidade_id),
          profissionais:servico_profissionais(profissional_id)
        `)
        .eq('id', id)
        .single()

      if (servError) throw servError

      setFormData({
        nome: serv.nome,
        ativo: serv.ativo
      })

      setSelectedUnidades(serv.unidades.map((u: any) => u.unidade_id))
      setSelectedProfissionais(serv.profissionais.map((p: any) => p.profissional_id))

    } catch (err) {
      console.error(err)
      setError('Erro ao carregar serviço')
    } finally {
      setIsLoading(false)
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

    setIsSaving(true)
    setError('')

    try {
      const supabase = createClient()

      // 1. Atualizar Serviço
      await supabase
        .from('servicos')
        .update({
          nome: formData.nome,
          ativo: formData.ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      // 2. Sincronizar Profissionais
      await supabase.from('servico_profissionais').delete().eq('servico_id', id)
      if (selectedProfissionais.length > 0) {
        const profData = selectedProfissionais.map(pid => ({ servico_id: id, profissional_id: pid }))
        await supabase.from('servico_profissionais').insert(profData)
      }

      // 3. Sincronizar Unidades
      await supabase.from('servico_unidades').delete().eq('servico_id', id)
      const uniData = selectedUnidades.map(uid => ({ servico_id: id, unidade_id: uid }))
      await supabase.from('servico_unidades').insert(uniData)

      alert('Serviço atualizado com sucesso!')
      router.push('/dashboard/servicos')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao atualizar serviço')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="max-w-4xl pb-20">
        <Link href="/dashboard/servicos">
          <Button variant="ghost" className="mb-4" icon={<ArrowLeft className="w-4 h-4" />}>
            Voltar
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Editar Serviço</h1>
        <p className="text-slate-600 mb-8">Gerencie as configurações de {formData.nome}.</p>

        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
               <CardTitle className="text-xl">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Input
                label="Nome do Serviço *"
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
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-slate-900 cursor-pointer">
                  Serviço disponível para agendamento no App
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-3xl border-slate-200/60 shadow-sm">
              <CardHeader><CardTitle className="text-lg">Unidades Vinculadas</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-2 max-h-[250px] overflow-y-auto">
                {unidades.map(uni => (
                  <label key={uni.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" checked={selectedUnidades.includes(uni.id)} onChange={e => {
                      const newUnis = e.target.checked ? [...selectedUnidades, uni.id] : selectedUnidades.filter(uid => uid !== uni.id)
                      setSelectedUnidades(newUnis)
                    }} />
                    <span className="text-sm text-slate-700">{uni.nome}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/60 shadow-sm">
              <CardHeader><CardTitle className="text-lg">Profissionais que Prestam</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-2 max-h-[250px] overflow-y-auto">
                {profissionais.map(prof => (
                  <label key={prof.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" checked={selectedProfissionais.includes(prof.id)} onChange={e => {
                      const newProfs = e.target.checked ? [...selectedProfissionais, prof.id] : selectedProfissionais.filter(pid => pid !== prof.id)
                      setSelectedProfissionais(newProfs)
                    }} />
                    <span className="text-sm text-slate-700">{prof.nome} {prof.sobrenome}</span>
                  </label>
                ))}
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

          <div className="flex gap-4">
            <Link href="/dashboard/servicos" className="flex-1">
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
