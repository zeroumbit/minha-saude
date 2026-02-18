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
import { masks, validators } from '@/lib/validation'

export function OnboardingModal() {
  const { empresa, user, setEmpresa, setUser } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
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

    // Responsável (Agora salvos na tabela empresas para permitir independência por empresa)
    responsavel_nome: '',
    responsavel_email: '',
    responsavel_telefone: '',
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
        responsavel_nome: empresa.responsavel_nome || `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
        responsavel_email: empresa.responsavel_email || user?.email || '',
        responsavel_telefone: empresa.responsavel_telefone || '',
        whatsapp: empresa.whatsapp || '',
        telefone: empresa.telefone || '',
        site: empresa.site || '',
        instagram: empresa.instagram || '',
        email_sac: empresa.email_sac || '',
        cep: empresa.cep || '',
        estado: empresa.estado || '',
        cidade_ibge_id: empresa.cidade_ibge_id || '',
        logradouro: empresa.logradouro || '',
        numero: empresa.numero || '',
        bairro: empresa.bairro || '',
        complemento: empresa.complemento || '',
      })
    }
  }, [empresa])

  const handleSave = async () => {
    if (!empresa || !user) return
    setError('')
    setFieldErrors({})

    // Validar campos
    let hasError = false

    // Step 1: SAC
    if (formData.whatsapp && !validators.celular(formData.whatsapp)) {
      setFieldErrors(prev => ({ ...prev, whatsapp: 'WhatsApp inválido' }))
      hasError = true
    }
    if (formData.telefone && !validators.telefoneCelular(formData.telefone)) {
      setFieldErrors(prev => ({ ...prev, telefone: 'Telefone inválido' }))
      hasError = true
    }
    if (formData.email_sac && !validators.email(formData.email_sac)) {
      setFieldErrors(prev => ({ ...prev, email_sac: 'E-mail inválido' }))
      hasError = true
    }
    if (formData.site && !validators.url(formData.site)) {
      setFieldErrors(prev => ({ ...prev, site: 'URL inválida' }))
      hasError = true
    }

    // Step 2: Endereço
    if (formData.cep && !validators.cep(formData.cep)) {
      setFieldErrors(prev => ({ ...prev, cep: 'CEP inválido' }))
      hasError = true
    }
    if (!formData.cidade_ibge_id) {
      setFieldErrors(prev => ({ ...prev, cidade_ibge_id: 'Cidade é obrigatória' }))
      hasError = true
    }

    // Step 3: Responsável
    if (!formData.responsavel_nome?.trim()) {
      setFieldErrors(prev => ({ ...prev, responsavel_nome: 'Nome é obrigatório' }))
      hasError = true
    }
    if (!formData.responsavel_email?.trim()) {
      setFieldErrors(prev => ({ ...prev, responsavel_email: 'E-mail é obrigatório' }))
      hasError = true
    } else if (!validators.email(formData.responsavel_email)) {
      setFieldErrors(prev => ({ ...prev, responsavel_email: 'E-mail inválido' }))
      hasError = true
    }
    if (formData.responsavel_telefone && !validators.telefoneCelular(formData.responsavel_telefone)) {
      setFieldErrors(prev => ({ ...prev, responsavel_telefone: 'Telefone inválido' }))
      hasError = true
    }

    if (hasError) return

    setIsSaving(true)

    try {
      const supabase = createClient()

      // 1. Atualizar Empresa (Incluindo dados do responsável específicos desta empresa)
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
          responsavel_nome: formData.responsavel_nome,
          responsavel_email: formData.responsavel_email,
          responsavel_telefone: formData.responsavel_telefone,
          onboarding_completed: true
        })
        .eq('id', empresa.id)

      if (empresaError) throw empresaError

      // 2. Atualizar Perfil do Usuário se o nome ainda estiver vazio (opcional, para conveniência)
      if (!user.first_name) {
        const [firstName, ...rest] = formData.responsavel_nome.split(' ')
        await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: rest.join(' ')
          })
          .eq('id', user.id)
      }

      // 3. Atualizar Store Local
      const { data: updatedEmpresa } = await supabase.from('empresas').select('*').eq('id', empresa.id).single()
      if (updatedEmpresa) setEmpresa(updatedEmpresa)

      setIsOpen(false)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao salvar informações')
    } finally {
      setIsSaving(false)
    }
  }

  const handleNextStep = () => {
    setError('')
    setFieldErrors({})
    let hasError = false

    if (step === 1) {
      // Validar Step 1: SAC
      if (formData.whatsapp && !validators.celular(formData.whatsapp)) {
        setFieldErrors(prev => ({ ...prev, whatsapp: 'WhatsApp inválido' }))
        hasError = true
      }
      if (formData.telefone && !validators.telefoneCelular(formData.telefone)) {
        setFieldErrors(prev => ({ ...prev, telefone: 'Telefone inválido' }))
        hasError = true
      }
      if (formData.email_sac && !validators.email(formData.email_sac)) {
        setFieldErrors(prev => ({ ...prev, email_sac: 'E-mail inválido' }))
        hasError = true
      }
      if (formData.site && !validators.url(formData.site)) {
        setFieldErrors(prev => ({ ...prev, site: 'URL inválida' }))
        hasError = true
      }
    }

    if (step === 2) {
      // Validar Step 2: Endereço
      if (formData.cep && !validators.cep(formData.cep)) {
        setFieldErrors(prev => ({ ...prev, cep: 'CEP inválido' }))
        hasError = true
      }
      if (!formData.cidade_ibge_id) {
        setFieldErrors(prev => ({ ...prev, cidade_ibge_id: 'Cidade é obrigatória' }))
        hasError = true
      }
      if (!formData.numero?.trim()) {
        setFieldErrors(prev => ({ ...prev, numero: 'Número é obrigatório' }))
        hasError = true
      }
    }

    if (!hasError) {
      setStep(step + 1)
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
                  <Input
                    label="WhatsApp"
                    mask="celular"
                    value={formData.whatsapp}
                    onChange={(e) => {
                      setFormData({...formData, whatsapp: e.target.value})
                      if (fieldErrors.whatsapp && validators.celular(e.target.value)) {
                        setFieldErrors(prev => ({ ...prev, whatsapp: '' }))
                      }
                    }}
                    error={fieldErrors.whatsapp}
                    placeholder="(00) 00000-0000"
                  />
                  <Input
                    label="Telefone Fixo"
                    mask="telefone"
                    value={formData.telefone}
                    onChange={(e) => {
                      setFormData({...formData, telefone: e.target.value})
                      if (fieldErrors.telefone && validators.telefoneCelular(e.target.value)) {
                        setFieldErrors(prev => ({ ...prev, telefone: '' }))
                      }
                    }}
                    error={fieldErrors.telefone}
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <Input
                  label="E-mail de Atendimento"
                  type="email"
                  value={formData.email_sac}
                  onChange={(e) => {
                    setFormData({...formData, email_sac: e.target.value})
                    if (fieldErrors.email_sac && validators.email(e.target.value)) {
                      setFieldErrors(prev => ({ ...prev, email_sac: '' }))
                    }
                  }}
                  error={fieldErrors.email_sac}
                  placeholder="sac@suaempresa.com"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Site"
                    value={formData.site}
                    onChange={(e) => {
                      setFormData({...formData, site: e.target.value})
                      if (fieldErrors.site && validators.url(e.target.value)) {
                        setFieldErrors(prev => ({ ...prev, site: '' }))
                      }
                    }}
                    error={fieldErrors.site}
                    placeholder="www.suaempresa.com"
                  />
                  <Input
                    label="Instagram"
                    value={formData.instagram}
                    onChange={(e) => {
                      setFormData({...formData, instagram: e.target.value})
                      if (fieldErrors.instagram && validators.instagram(e.target.value)) {
                        setFieldErrors(prev => ({ ...prev, instagram: '' }))
                      }
                    }}
                    error={fieldErrors.instagram}
                    placeholder="@suaempresa"
                  />
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
                      mask="cep"
                      value={formData.cep}
                      onChange={(e) => {
                        setFormData({...formData, cep: e.target.value})
                        if (fieldErrors.cep && validators.cep(e.target.value)) {
                          setFieldErrors(prev => ({ ...prev, cep: '' }))
                        }
                      }}
                      error={fieldErrors.cep}
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
                  label="Cidade *"
                  value={formData.cidade_ibge_id}
                  onChange={e => setFormData({...formData, cidade_ibge_id: e.target.value})}
                  disabled={!formData.estado || cities.length === 0}
                  error={fieldErrors.cidade_ibge_id}
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
                  <Input label="Número *" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} error={fieldErrors.numero} />
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
                  Dados do Responsável pela Conta
                </div>
                <p className="text-xs text-slate-500 -mt-2">
                  Estes dados são específicos para esta empresa anunciante.
                </p>
                
                <Input
                  label="Nome Completo do Responsável *"
                  value={formData.responsavel_nome}
                  onChange={(e) => {
                    setFormData({...formData, responsavel_nome: e.target.value})
                    if (fieldErrors.responsavel_nome && e.target.value.trim()) {
                      setFieldErrors(prev => ({ ...prev, responsavel_nome: '' }))
                    }
                  }}
                  error={fieldErrors.responsavel_nome}
                  placeholder="Nome do responsável jurídico ou administrativo"
                />

                <Input
                  label="E-mail de Contato *"
                  type="email"
                  value={formData.responsavel_email}
                  onChange={(e) => {
                    setFormData({...formData, responsavel_email: e.target.value})
                    if (fieldErrors.responsavel_email && validators.email(e.target.value)) {
                      setFieldErrors(prev => ({ ...prev, responsavel_email: '' }))
                    }
                  }}
                  error={fieldErrors.responsavel_email}
                  placeholder="email@contato.com"
                />
                <Input
                  label="Telefone de Contato"
                  mask="telefoneCelular"
                  value={formData.responsavel_telefone}
                  onChange={(e) => {
                    setFormData({...formData, responsavel_telefone: e.target.value})
                    if (fieldErrors.responsavel_telefone && validators.telefoneCelular(e.target.value)) {
                      setFieldErrors(prev => ({ ...prev, responsavel_telefone: '' }))
                    }
                  }}
                  error={fieldErrors.responsavel_telefone}
                  placeholder="(00) 00000-0000"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between gap-4">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
            
            {step < 3 ? (
              <Button onClick={handleNextStep}>
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
