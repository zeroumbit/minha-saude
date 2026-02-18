'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Building2, User, MapPin, Phone, Instagram, Globe, Mail, CheckCircle2, Loader2 } from 'lucide-react'
import { fetchStates, fetchCitiesByState, fetchAddressByCep, State, City } from '@/lib/location'

export function OnboardingModal() {
  const { empresa, user, setEmpresa, setUser } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  const [formData, setFormData] = useState({
    // SAC
    whatsapp: '',
    site: '',
    instagram: '',
    email_sac: '',
    telefone: '',

    // Endereço Administrativo
    cep: '',
    estado: '',
    cidade_ibge_id: '',
    logradouro: '',
    numero: '',
    bairro: '',
    complemento: '',

    // Responsável
    firstName: '',
    lastName: '',
    email_contato: '',
    telefone_contato: '',
  })

  // Carregar estados ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      loadStates()
    }
  }, [isOpen])

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
          cidade_ibge_id: address.ibge,
          complemento: address.complemento
        }))
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err)
    } finally {
      setIsLoadingLocation(false)
    }
  }

  useEffect(() => {
    if (empresa && !empresa.onboarding_completed) {
      setIsOpen(true)
      setFormData({
        ...formData,
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email_contato: user?.email || '',
        whatsapp: empresa.whatsapp || '',
        telefone: empresa.telefone || '',
        site: empresa.site || '',
      })
    }
  }, [empresa])

  const handleSave = async () => {
    if (!empresa || !user) return
    setIsSaving(true)
    setError('')

    try {
      const supabase = createClient()

      // 1. Atualizar Empresa
      const { error: empresaError } = await supabase
        .from('empresas')
        .update({
          whatsapp: formData.whatsapp,
          site: formData.site,
          instagram: formData.instagram,
          email_sac: formData.email_sac,
          telefone: formData.telefone,
          cep: formData.cep,
          estado: formData.estado,
          cidade_ibge_id: formData.cidade_ibge_id,
          logradouro: formData.logradouro,
          numero: formData.numero,
          bairro: formData.bairro,
          complemento: formData.complemento,
          onboarding_completed: true
        })
        .eq('id', empresa.id)

      if (empresaError) throw empresaError

      // 2. Atualizar Perfil do Responsável
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email_contato: formData.email_contato,
          telefone_contato: formData.telefone_contato
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // 3. Atualizar Store Local
      const { data: updatedEmpresa } = await supabase.from('empresas').select('*').eq('id', empresa.id).single()
      if (updatedEmpresa) setEmpresa(updatedEmpresa)
      
      setUser({
        ...user,
        first_name: formData.firstName,
        last_name: formData.lastName
      })

      setIsOpen(false)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao salvar informações')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex flex-col h-[85vh] md:h-auto max-h-[90vh]">
          {/* Header */}
          <div className="p-6 bg-primary-600 text-white relative">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6 text-primary-200" />
              <h2 className="text-2xl font-bold">Conclua seu Cadastro</h2>
            </div>
            <p className="text-primary-100 text-sm">
              Sua empresa só poderá aparecer para os usuários após preencher as informações a seguir.
            </p>
            
            {/* Progress dots */}
            <div className="flex gap-2 mt-4">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? 'bg-white' : 'bg-primary-400/50'}`} />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            {/* Step 1: SAC */}
            {step === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
                  <Phone className="w-5 h-5 text-primary-600" />
                  Informações de SAC (Público)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="WhatsApp" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="(00) 00000-0000" />
                  <Input label="Telefone Fixo" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} placeholder="(00) 0000-0000" />
                </div>
                <Input label="E-mail de Atendimento" value={formData.email_sac} onChange={e => setFormData({...formData, email_sac: e.target.value})} placeholder="sac@suaempresa.com" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Site" value={formData.site} onChange={e => setFormData({...formData, site: e.target.value})} placeholder="www.suaempresa.com" />
                  <Input label="Instagram" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="@suaempresa" />
                </div>
              </div>
            )}

            {/* Step 2: Endereço Administrativo */}
            {step === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  Endereço Administrativo (Interno)
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input 
                      label="CEP" 
                      value={formData.cep} 
                      onChange={e => setFormData({...formData, cep: e.target.value})} 
                      placeholder="00000-000"
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
                  label="Cidade" 
                  value={formData.cidade_ibge_id} 
                  onChange={e => setFormData({...formData, cidade_ibge_id: e.target.value})}
                  disabled={!formData.estado || cities.length === 0}
                >
                  <option value="">{formData.estado ? 'Selecione a cidade...' : 'Selecione um estado primeiro'}</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </Select>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Input label="Logradouro" value={formData.logradouro} onChange={e => setFormData({...formData, logradouro: e.target.value})} />
                  </div>
                  <Input label="Número" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Bairro" value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} />
                  <Input label="Complemento" value={formData.complemento} onChange={e => setFormData({...formData, complemento: e.target.value})} />
                </div>
              </div>
            )}

            {/* Step 3: Responsável */}
            {step === 3 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
                  <User className="w-5 h-5 text-primary-600" />
                  Dados do Responsável
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Nome" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  <Input label="Sobrenome" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <Input label="E-mail de Contato" value={formData.email_contato} onChange={e => setFormData({...formData, email_contato: e.target.value})} />
                <Input label="Telefone de Contato" value={formData.telefone_contato} onChange={e => setFormData({...formData, telefone_contato: e.target.value})} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between gap-4">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
            
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>
                Próximo Passo
              </Button>
            ) : (
              <Button onClick={handleSave} isLoading={isSaving} icon={<CheckCircle2 className="w-5 h-5" />}>
                Concluir e Acessar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
