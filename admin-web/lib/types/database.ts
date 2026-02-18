export type EmpresaStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED_ADMIN' | 'CANCELLED'
export type EmpresaOrigin = 'SELF_SIGNUP' | 'ADMIN_CREATED'
export type EmpresaUserRole = 'OWNER' | 'ADMIN' | 'EDITOR'
export type UnidadeStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED_ADMIN'
export type AssinaturaStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'PAUSED'
export type BillingCycle = 'MONTHLY' | 'YEARLY'
export type FaturaStatus = 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE'
export type PagamentoStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'

export interface ConfigGlobal {
  id: number
  modo_operacao_pago: boolean
  dias_trial_padrao: number
  created_at: string
  updated_at: string
}

export interface Plano {
  id: string
  nome: string
  descricao: string | null
  valor_mensal: number | null
  valor_anual: number | null
  limite_unidades: number | null
  destaque_permitido: boolean
  ativo: boolean
  created_at: string
}

export interface Empresa {
  id: string
  nome_fantasia: string
  razao_social: string | null
  cnpj: string | null
  email_financeiro: string | null
  telefone: string | null
  logo_url: string | null
  descricao: string | null
  site: string | null
  status: EmpresaStatus
  origin: EmpresaOrigin
  is_public_partner: boolean
  categorias: string[]
  onboarding_completed: boolean
  instagram: string | null
  whatsapp: string | null
  email_sac: string | null
  cep: string | null
  estado: string | null
  cidade_ibge_id: string | null
  logradouro: string | null
  numero: string | null
  bairro: string | null
  complemento: string | null
  responsavel_nome: string | null
  responsavel_email: string | null
  responsavel_telefone: string | null
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

export interface EmpresaUsuario {
  id: string
  empresa_id: string
  user_id: string
  role: EmpresaUserRole
  created_at: string
}

export interface Assinatura {
  id: string
  empresa_id: string
  plano_id: string
  status: AssinaturaStatus
  billing_cycle: BillingCycle
  valor: number
  trial_ends_at: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface Fatura {
  id: string
  empresa_id: string
  assinatura_id: string
  valor: number
  status: FaturaStatus
  vencimento: string
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface Pagamento {
  id: string
  fatura_id: string
  valor: number
  status: PagamentoStatus
  gateway: string | null
  external_id: string | null
  pago_em: string | null
  created_at: string
  updated_at: string
}

export interface Unidade {
  id: string
  empresa_id: string
  nome: string
  categorias: string[]
  whatsapp: string | null
  telefone: string | null
  instagram: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  bairro: string | null
  estado: string | null
  cidade_ibge_id: string
  latitude: number | null
  longitude: number | null
  maps_url: string | null
  logo_url: string | null
  prioridade: number
  is_publico: boolean
  is_public_partner: boolean
  status: UnidadeStatus
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

export interface UnidadeHorario {
  id: string
  unidade_id: string
  dia_semana: number
  abertura: string | null
  fechamento: string | null
  fechado: boolean
}

export interface UnidadeImagem {
  id: string
  unidade_id: string
  url: string
  ordem: number
  created_at: string
}

export interface Especialidade {
  id: string
  nome: string
  categoria: string | null
  is_system: boolean
}

export interface Convenio {
  id: string
  nome: string
}

export interface AuditLog {
  id: number
  actor_user_id: string | null
  empresa_id: string | null
  acao: string | null
  entidade: string | null
  metadata: Record<string, any> | null
  created_at: string
}

export interface Profissional {
  id: string
  empresa_id: string
  nome: string
  sobrenome: string | null
  registro_profissional: string | null
  tempo_atendimento_minutos: number
  valor_normal: number | null
  valor_pix: number | null
  valor_cartao: number | null
  ativo: boolean
  created_at: string
  updated_at: string | null
}

export interface ProfissionalDisponibilidade {
  id: string
  profissional_id: string
  dia_semana: number
  hora_inicio: string
  hora_fim: string
}

export interface Servico {
  id: string
  empresa_id: string
  nome: string
  ativo: boolean
  created_at: string
  updated_at: string | null
}

export interface ServicoProfissional {
  servico_id: string
  profissional_id: string
}

export interface ServicoUnidade {
  servico_id: string
  unidade_id: string
}
