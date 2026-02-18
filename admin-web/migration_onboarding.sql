-- =====================================================
-- MIGRATION: Novos Campos para Empresas e Unidades (Onboarding)
-- =====================================================

-- 1. Campos de Redes Sociais e SAC para Empresas
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS email_sac TEXT;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 2. Campos de Endereço Administrativo para Empresas
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS estado CHAR(2);
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS cidade_ibge_id VARCHAR(7);
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS logradouro TEXT;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS complemento TEXT;

-- 3. Campo Instagram para Unidades
ALTER TABLE public.unidades ADD COLUMN IF NOT EXISTS instagram TEXT;

-- 4. Campo Telefone de contato para Responsável (no Perfil)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefone_contato TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_contato TEXT;
