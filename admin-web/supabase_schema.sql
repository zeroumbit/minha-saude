-- =====================================================
-- 1. EXTENSÕES & ENUMS
-- =====================================================
create extension if not exists "pgcrypto";

create type empresa_status as enum ('ACTIVE', 'SUSPENDED', 'BLOCKED_ADMIN', 'CANCELLED');
create type empresa_origin as enum ('SELF_SIGNUP', 'ADMIN_CREATED');
create type empresa_user_role as enum ('OWNER', 'ADMIN', 'EDITOR');
create type unidade_status as enum ('ACTIVE', 'INACTIVE', 'BLOCKED_ADMIN');
create type assinatura_status as enum ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED');
create type billing_cycle as enum ('MONTHLY', 'YEARLY');
create type fatura_status as enum ('OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE');
create type pagamento_status as enum ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- =====================================================
-- 2. CONFIGURAÇÕES & PLANOS
-- =====================================================
create table config_global (
  id int primary key default 1,
  modo_operacao_pago boolean default false,
  dias_trial_padrao int default 7,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into config_global (id) values (1) on conflict (id) do nothing;

create table planos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  valor_mensal numeric(10,2),
  valor_anual numeric(10,2),
  limite_unidades int,
  destaque_permitido boolean default false,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- =====================================================
-- 3. EMPRESAS & USUÁRIOS
-- =====================================================
create table empresas (
  id uuid primary key default gen_random_uuid(),
  nome_fantasia text not null,
  razao_social text,
  cnpj text,
  email_financeiro text,
  telefone text,
  logo_url text,
  descricao text,
  site text,
  status empresa_status default 'ACTIVE',
  origin empresa_origin default 'SELF_SIGNUP',
  is_public_partner boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

create table empresa_usuarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role empresa_user_role default 'EDITOR',
  created_at timestamptz default now(),
  unique (empresa_id, user_id)
);

-- =====================================================
-- 4. FINANCEIRO
-- =====================================================
create table assinaturas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id),
  plano_id uuid not null references planos(id),
  status assinatura_status not null,
  billing_cycle billing_cycle not null,
  valor numeric(10,2) not null,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table faturas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id),
  assinatura_id uuid not null references assinaturas(id),
  valor numeric(10,2) not null,
  status fatura_status default 'OPEN',
  vencimento timestamptz not null,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table pagamentos (
  id uuid primary key default gen_random_uuid(),
  fatura_id uuid not null references faturas(id),
  valor numeric(10,2) not null,
  status pagamento_status default 'PENDING',
  gateway text,
  external_id text,
  pago_em timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- 5. UNIDADES & GEOLOCALIZAÇÃO
-- =====================================================
create table unidades (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) on delete cascade,
  nome text not null,
  categoria text, 
  whatsapp text,
  telefone text,
  cep text,
  logradouro text,
  numero text,
  bairro text,
  estado char(2),
  cidade_ibge_id varchar(7) not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  maps_url text,
  logo_url text,
  prioridade int default 0,
  is_publico boolean default false,
  status unidade_status default 'ACTIVE',
  created_at timestamptz default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

create table unidade_horarios (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid references unidades(id) on delete cascade,
  dia_semana int not null check (dia_semana between 0 and 6),
  abertura time,
  fechamento time,
  fechado boolean default false,
  unique(unidade_id, dia_semana)
);

create table unidade_imagens (
  id uuid primary key default gen_random_uuid(),
  unidade_id uuid references unidades(id) on delete cascade,
  url text not null,
  ordem int default 0,
  created_at timestamptz default now()
);

-- =====================================================
-- 6. ESPECIALIDADES & CONVÊNIOS
-- =====================================================
create table especialidades (
  id uuid primary key default gen_random_uuid(),
  nome text unique not null,
  is_system boolean default true
);

create table unidade_especialidades (
  unidade_id uuid references unidades(id) on delete cascade,
  especialidade_id uuid references especialidades(id) on delete cascade,
  primary key (unidade_id, especialidade_id)
);

create table convenios (
  id uuid primary key default gen_random_uuid(),
  nome text unique not null
);

create table unidade_convenios (
  unidade_id uuid references unidades(id) on delete cascade,
  convenio_id uuid references convenios(id) on delete cascade,
  primary key (unidade_id, convenio_id)
);

-- =====================================================
-- 7. AUDITORIA
-- =====================================================
create table audit_logs (
  id bigserial primary key,
  actor_user_id uuid,
  empresa_id uuid,
  acao text,
  entidade text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- =====================================================
-- 8. TRIGGERS
-- =====================================================
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

create trigger trg_empresas_updated before update on empresas for each row execute procedure set_updated_at();
create trigger trg_unidades_updated before update on unidades for each row execute procedure set_updated_at();
create trigger trg_assinaturas_updated before update on assinaturas for each row execute procedure set_updated_at();
create trigger trg_faturas_updated before update on faturas for each row execute procedure set_updated_at();
create trigger trg_pagamentos_updated before update on pagamentos for each row execute procedure set_updated_at();
create trigger trg_config_updated before update on config_global for each row execute procedure set_updated_at();

-- =====================================================
-- 9. SECURITY (RLS) - ESSENCIAL PARA O APP FUNCIONAR
-- =====================================================
alter table empresas enable row level security;
alter table empresa_usuarios enable row level security;
alter table unidades enable row level security;
alter table assinaturas enable row level security;

-- Policy: Usuários podem ver empresas onde são membros
create policy "Usuarios veem suas empresas" on empresas
  for select using (
    exists (
      select 1 from empresa_usuarios
      where empresa_usuarios.empresa_id = empresas.id
      and empresa_usuarios.user_id = auth.uid()
    )
  );

-- Policy: Usuários podem criar empresas (via cadastro)
create policy "Usuarios autenticados criam empresas" on empresas
  for insert with check (auth.role() = 'authenticated');

-- Policy: Membros veem outros membros
create policy "Membros veem outros membros" on empresa_usuarios
  for select using (
    exists (
      select 1 from empresa_usuarios eu
      where eu.empresa_id = empresa_usuarios.empresa_id
      and eu.user_id = auth.uid()
    )
  );

-- Policy: Usuário vê sua própria ligação
create policy "Usuario ve seu proprio vinculo" on empresa_usuarios
  for select using (user_id = auth.uid());

-- Policy: Criar vinculo (apenas no cadastro/convite - simplificado por enquanto)
create policy "Usuarios criam vinculo inicial" on empresa_usuarios
  for insert with check (user_id = auth.uid());

-- Policy: Unidades
create policy "Membros veem unidades da empresa" on unidades
  for select using (
    exists (
      select 1 from empresa_usuarios
      where empresa_usuarios.empresa_id = unidades.empresa_id
      and empresa_usuarios.user_id = auth.uid()
    )
  );

create policy "Membros gerenciam unidades" on unidades
  for all using (
    exists (
      select 1 from empresa_usuarios
      where empresa_usuarios.empresa_id = unidades.empresa_id
      and empresa_usuarios.user_id = auth.uid()
    )
  );
