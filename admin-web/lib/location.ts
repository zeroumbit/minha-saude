export interface State {
  id: number
  sigla: string
  nome: string
}

export interface City {
  id: number
  nome: string
}

export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export async function fetchStates(): Promise<State[]> {
  const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
  if (!response.ok) throw new Error('Erro ao buscar estados')
  return response.json()
}

export async function fetchCitiesByState(uf: string): Promise<City[]> {
  const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
  if (!response.ok) throw new Error('Erro ao buscar cidades')
  return response.json()
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  const cleanCep = cep.replace(/\D/g, '')
  if (cleanCep.length !== 8) return null

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
  if (!response.ok) throw new Error('Erro ao buscar CEP')
  
  const data = await response.json()
  if (data.erro) return null
  
  return data
}
