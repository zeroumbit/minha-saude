-- =====================================================
-- MIGRATION: Serviços e Profissionais
-- =====================================================

-- 1. Tabela de Profissionais
CREATE TABLE IF NOT EXISTS public.profissionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    sobrenome TEXT,
    registro_profissional TEXT, -- CRM, CRP, etc.
    tempo_atendimento_minutos INTEGER DEFAULT 30,
    valor_normal DECIMAL(10,2),
    valor_pix DECIMAL(10,2),
    valor_cartao DECIMAL(10,2),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Especialidades dos Profissionais (Relacionamento M:N)
CREATE TABLE IF NOT EXISTS public.profissional_especialidades (
    profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE,
    especialidade_id UUID REFERENCES public.especialidades(id) ON DELETE CASCADE,
    PRIMARY KEY (profissional_id, especialidade_id)
);

-- 3. Tabela de Disponibilidade dos Profissionais (Horários por dia)
CREATE TABLE IF NOT EXISTS public.profissional_disponibilidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL, -- 0-6 (Domingo a Sábado)
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    UNIQUE (profissional_id, dia_semana, hora_inicio)
);

-- 4. Tabela de Serviços
CREATE TABLE IF NOT EXISTS public.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Relacionamento M:N entre Serviços e Unidades
CREATE TABLE IF NOT EXISTS public.servico_unidades (
    servico_id UUID REFERENCES public.servicos(id) ON DELETE CASCADE,
    unidade_id UUID REFERENCES public.unidades(id) ON DELETE CASCADE,
    PRIMARY KEY (servico_id, unidade_id)
);

-- 6. Relacionamento M:N entre Serviços e Profissionais
CREATE TABLE IF NOT EXISTS public.servico_profissionais (
    servico_id UUID REFERENCES public.servicos(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES public.profissionais(id) ON DELETE CASCADE,
    PRIMARY KEY (servico_id, profissional_id)
);

-- 7. Tabela de Disponibilidade/Horários do Serviço (Se for específico do serviço e não apenas do profissional)
CREATE TABLE IF NOT EXISTS public.servico_disponibilidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servico_id UUID REFERENCES public.servicos(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL
);

-- Habilitar RLS (Segurança básica por empresa_id)
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- Políticas simplificadas (ajustar conforme necessidade do projeto)
CREATE POLICY "Empresas podem ver seus profissionais" ON public.profissionais
    FOR ALL USING (empresa_id IN (SELECT empresa_id FROM empresa_usuarios WHERE user_id = auth.uid()));

CREATE POLICY "Empresas podem ver seus serviços" ON public.servicos
    FOR ALL USING (empresa_id IN (SELECT empresa_id FROM empresa_usuarios WHERE user_id = auth.uid()));
