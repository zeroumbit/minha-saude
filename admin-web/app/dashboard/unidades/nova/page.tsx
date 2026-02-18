'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { fetchStates, fetchCitiesByState, fetchAddressByCep, State, City } from '@/lib/location'
import { masks, validators } from '@/lib/validation'

export default function NovaUnidadePage() {
  const router = useRouter()
  const { empresa } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

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
    instagram: '',
  })

  // Carregar estados ao montar
  useEffect(() => {
    loadStates()
  }, [])

  // Carregar cidades quando o estado muda
  useEffect(() => {
    if (formData.estado) {
      loadCities(formData.estado)
    } else {
      setCities([])
    }
  }, [formData.estado])

  // Busca automática por CEP
  useEffect(() => {
    const cleanCep = formData.cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      handleCepSearch(cleanCep)
    }
  }, [formData.cep])

  const loadStates = async () => {
    try {
      const data = await fetchStates()
      setStates(data)
    } catch (err) {
      console.error('Erro ao carregar estados:', err)
    }
  }

  const loadCities = async (uf: string) => {
    try {
      const data = await fetchCitiesByState(uf)
      setCities(data)
    } catch (err) {
      console.error('Erro ao carregar cidades:', err)
    }
  }

  const handleCepSearch = async (cep: string) => {
    setIsLoadingLocation(true)
    try {
      const address = await fetchAddressByCep(cep)
      if (address) {
        setFormData(prev => ({
          ...prev,
          logradouro: address.logradouro,
          bairro: address.bairro,
          estado: address.uf,
          cidade_ibge_id: address.ibge
        }))
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err)
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!empresa) {
      setError('Empresa não identificada')
      return
    }

    // Validar campos
    setFieldErrors({})
    let hasError = false

    if (!formData.nome.trim()) {
      setFieldErrors(prev => ({ ...prev, nome: 'Nome é obrigatório' }))
      hasError = true
    }

    if (formData.categorias.length === 0) {
      setError('Selecione pelo menos uma categoria')
      return
    }

    if (formData.whatsapp && !validators.celular(formData.whatsapp)) {
      setFieldErrors(prev => ({ ...prev, whatsapp: 'WhatsApp inválido' }))
      hasError = true
    }

    if (formData.telefone && !validators.telefoneCelular(formData.telefone)) {
      setFieldErrors(prev => ({ ...prev, telefone: 'Telefone inválido' }))
      hasError = true
    }

    if (formData.cep && !validators.cep(formData.cep)) {
      setFieldErrors(prev => ({ ...prev, cep: 'CEP inválido' }))
      hasError = true
    }

    if (!formData.cidade_ibge_id) {
      setFieldErrors(prev => ({ ...prev, cidade_ibge_id: 'Cidade é obrigatória' }))
      hasError = true
    }

    if (formData.instagram && !validators.instagram(formData.instagram)) {
      setFieldErrors(prev => ({ ...prev, instagram: 'Instagram inválido' }))
      hasError = true
    }

    if (hasError) return

    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('unidades')
        .insert({
          empresa_id: empresa.id,
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
          instagram: formData.instagram || null,
          status: 'ACTIVE',
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push('/dashboard/unidades')
      router.refresh()
    } catch (err: any) {
      console.error('Erro ao criar unidade:', err)
      setError(err.message || 'Erro ao criar unidade')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <Link href="/dashboard/unidades">
          <Button variant="ghost" className="mb-4" icon={<ArrowLeft className="w-4 h-4" />}>
            Voltar
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Nova Unidade</h1>
        <p className="text-slate-600 mb-8">Preencha os dados da nova unidade</p>

        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg animate-fade-in">
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
                  mask="celular"
                  value={formData.whatsapp}
                  onChange={(e) => {
                    setFormData({ ...formData, whatsapp: e.target.value })
                    if (fieldErrors.whatsapp && validators.celular(e.target.value)) {
                      setFieldErrors(prev => ({ ...prev, whatsapp: '' }))
                    }
                  }}
                  error={fieldErrors.whatsapp}
                />

                <Input
                  label="Telefone"
                  placeholder="(00) 0000-0000"
                  mask="telefone"
                  value={formData.telefone}
                  onChange={(e) => {
                    setFormData({ ...formData, telefone: e.target.value })
                    if (fieldErrors.telefone && validators.telefoneCelular(e.target.value)) {
                      setFieldErrors(prev => ({ ...prev, telefone: '' }))
                    }
                  }}
                  error={fieldErrors.telefone}
                />

                <Input
                  label="Instagram"
                  placeholder="@clinicaexemplo"
                  value={formData.instagram}
                  onChange={(e) => {
                    setFormData({ ...formData, instagram: e.target.value })
                    if (fieldErrors.instagram && validators.instagram(e.target.value)) {
                      setFieldErrors(prev => ({ ...prev, instagram: '' }))
                    }
                  }}
                  error={fieldErrors.instagram}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label="CEP"
                      mask="cep"
                      value={formData.cep}
                      onChange={e => {
                        setFormData({...formData, cep: e.target.value})
                        if (fieldErrors.cep && validators.cep(e.target.value)) {
                          setFieldErrors(prev => ({ ...prev, cep: '' }))
                        }
                      }}
                      placeholder="00000-000"
                      error={fieldErrors.cep}
                    />
                    {isLoadingLocation && (
                      <div className="absolute right-3 bottom-3">
                        <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                      </div>
                    )}
                  </div>

                  <Select
                    label="Estado"
                    value={formData.estado}
                    onChange={e => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {states.map(s => (
                      <option key={s.sigla} value={s.sigla}>{s.nome}</option>
                    ))}
                  </Select>
                </div>

                <Select
                  label="Cidade *"
                  value={formData.cidade_ibge_id}
                  onChange={e => setFormData({...formData, cidade_ibge_id: e.target.value})}
                  disabled={!formData.estado || cities.length === 0}
                  required
                  error={fieldErrors.cidade_ibge_id}
                >
                  <option value="">{formData.estado ? 'Selecione a cidade...' : 'Selecione um estado primeiro'}</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </Select>

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
              isLoading={isLoading}
              className="flex-1"
            >
              Criar Unidade
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
