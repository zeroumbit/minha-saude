-- =====================================================
-- MIGRATION: Categorias para Empresas e Unidades
-- =====================================================

-- 1. Adicionar coluna categorias à tabela empresas
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS categorias text[] DEFAULT '{}';

-- 2. Migrar a coluna categoria (singular) para categorias (array) na tabela unidades
DO $$ 
BEGIN 
    -- Verifica se a coluna antiga 'categoria' existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='unidades' AND column_name='categoria') THEN
        -- Adiciona a nova coluna 'categorias' se não existir
        ALTER TABLE public.unidades ADD COLUMN IF NOT EXISTS categorias text[] DEFAULT '{}';
        
        -- Converte o texto simples para um array de um elemento
        UPDATE public.unidades 
        SET categorias = ARRAY[categoria] 
        WHERE categoria IS NOT NULL AND (categorias IS NULL OR categorias = '{}');
        
        -- Remove a coluna antiga
        ALTER TABLE public.unidades DROP COLUMN categoria;
    ELSE
        -- Se a coluna antiga não existe, apenas garante que a nova existe
        ALTER TABLE public.unidades ADD COLUMN IF NOT EXISTS categorias text[] DEFAULT '{}';
    END IF;
END $$;

-- 3. Garantir que is_public_partner existe em empresas (já existe no schema original, mas por segurança)
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS is_public_partner boolean DEFAULT false;

-- 4. Adicionar is_public_partner em unidades para facilitar filtro direto (opcional, mas recomendado pelo prompt)
ALTER TABLE public.unidades ADD COLUMN IF NOT EXISTS is_public_partner boolean DEFAULT false;
