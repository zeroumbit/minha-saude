'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditarUnidadePage() {
  const router = useRouter()
  const params = useParams()
  const { empresa } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    estado: '',
    cidade_ibge_id: '',
    latitude: '',
    longitude: '',
    maps_url: '',
    is_publico: true,
    is_public_partner: false,
    categorias: [] as string[],
  })

  useEffect(() => {
    loadUnidade()
  }, [params.id])

  const loadUnidade = async () => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Unidade não encontrada')

      setFormData({
        nome: data.nome,
        whatsapp: data.whatsapp || '',
        telefone: data.telefone || '',
        cep: data.cep || '',
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        bairro: data.bairro || '',
        estado: data.estado || '',
        cidade_ibge_id: data.cidade_ibge_id || '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        maps_url: data.maps_url || '',
        is_publico: data.is_publico,
        is_public_partner: data.is_public_partner || false,
        categorias: data.categorias || [],
      })
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao carregar unidade')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!empresa) {
      setError('Empresa não identificada')
      return
    }

    if (formData.categorias.length === 0) {
      setError('Selecione pelo menos uma categoria')
      return
    }

    setError('')
    setIsSaving(true)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('unidades')
        .update({
          nome: formData.nome,
          whatsapp: formData.whatsapp || null,
          telefone: formData.telefone || null,
          cep: formData.cep || null,
          logradouro: formData.logradouro || null,
          numero: formData.numero || null,
          bairro: formData.bairro || null,
          estado: formData.estado || null,
          cidade_ibge_id: formData.cidade_ibge_id,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          maps_url: formData.maps_url || null,
          is_publico: formData.is_publico,
          is_public_partner: formData.is_public_partner,
          categorias: formData.categorias,
        })
        .eq('id', params.id)
        .eq('empresa_id', empresa.id)

      if (updateError) throw updateError

      router.push('/dashboard/unidades')
      router.refresh()
    } catch (err: any) {
      console.error('Erro ao atualizar unidade:', err)
      setError(err.message || 'Erro ao atualizar unidade')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard/unidades">
            <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Voltar
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Editar Unidade</h1>
        <p className="text-slate-600 mb-8">Atualize os dados da sua unidade</p>

        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais da unidade e categorias de atuação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Input
                  label="Nome da Unidade *"
                  placeholder="Ex: Clínica Centro"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Categorias da Unidade *</label>
                  <div className="flex flex-wrap gap-2">
                    {['CONSULTAS', 'EXAMES', 'FARMÁCIA'].map((cat) => (
                      <label key={cat} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary-600 rounded"
                          checked={formData.categorias.includes(cat)}
                          onChange={(e) => {
                            const newCats = e.target.checked
                              ? [...formData.categorias, cat]
                              : formData.categorias.filter(c => c !== cat)
                            setFormData({ ...formData, categorias: newCats })
                          }}
                        />
                        <span className="text-sm font-medium text-slate-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <input
                      type="checkbox"
                      id="is_publico"
                      checked={formData.is_publico}
                      onChange={(e) => setFormData({ ...formData, is_publico: e.target.checked })}
                      className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-2 focus:ring-primary-500"
                    />
                    <label htmlFor="is_publico" className="text-sm font-medium text-slate-900 cursor-pointer">
                      Tornar pública no aplicativo (visível para usuários)
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
                    <input
                      type="checkbox"
                      id="is_public_partner"
                      checked={formData.is_public_partner}
                      onChange={(e) => setFormData({ ...formData, is_public_partner: e.target.checked })}
                      className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-2 focus:ring-primary-500"
                    />
                    <label htmlFor="is_public_partner" className="text-sm font-bold text-primary-900 cursor-pointer">
                      Unidade Pública / Parceira Governamental
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
              <CardDescription>Formas de contato da unidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="WhatsApp"
                  placeholder="(00) 00000-0000"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />

                <Input
                  label="Telefone"
                  placeholder="(00) 0000-0000"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>Localização da unidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="CEP"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  />

                  <Input
                    label="Estado"
                    placeholder="SP"
                    maxLength={2}
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                  />

                  <Input
                    label="Código IBGE da Cidade *"
                    placeholder="3550308"
                    value={formData.cidade_ibge_id}
                    onChange={(e) => setFormData({ ...formData, cidade_ibge_id: e.target.value })}
                    required
                    helperText="7 dígitos"
                  />
                </div>

                <Input
                  label="Logradouro"
                  placeholder="Rua Exemplo"
                  value={formData.logradouro}
                  onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Número"
                    placeholder="123"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  />

                  <Input
                    label="Bairro"
                    placeholder="Centro"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Geolocalização */}
          <Card>
            <CardHeader>
              <CardTitle>Geolocalização</CardTitle>
              <CardDescription>Coordenadas para exibição no mapa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Latitude"
                    type="number"
                    step="any"
                    placeholder="-23.5505"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />

                  <Input
                    label="Longitude"
                    type="number"
                    step="any"
                    placeholder="-46.6333"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>

                <Input
                  label="Link Google Maps"
                  placeholder="https://maps.google.com/..."
                  value={formData.maps_url}
                  onChange={(e) => setFormData({ ...formData, maps_url: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Link href="/dashboard/unidades" className="flex-1">
              <Button type="button" variant="secondary" className="w-full">
                Cancelar
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              className="flex-1"
              icon={<Save className="w-4 h-4" />}
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
