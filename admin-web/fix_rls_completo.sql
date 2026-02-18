-- =====================================================
-- DIAGNÓSTICO E CORREÇÃO COMPLETA RLS
-- =====================================================

-- 1. Desativar RLS temporariamente para teste
ALTER TABLE empresa_usuarios DISABLE ROW LEVEL SECURITY;

-- 2. Listar todas as políticas existentes
-- Execute isso no SQL Editor para ver o que existe:
-- SELECT * FROM pg_policies WHERE tablename = 'empresa_usuarios';

-- 3. Dropar TODAS as políticas de empresa_usuarios (forçar)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'empresa_usuarios'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON empresa_usuarios', pol.policyname);
    END LOOP;
END $$;

-- 4. Reativar RLS
ALTER TABLE empresa_usuarios ENABLE ROW LEVEL SECURITY;

-- 5. Criar política SIMPLES e segura
CREATE POLICY "acesso_total_usuario" ON empresa_usuarios
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- Também corrigir empresas (pode ter recursão)
-- =====================================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'empresas'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON empresas', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "acesso_empresas" ON empresas
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM empresa_usuarios eu
      WHERE eu.empresa_id = empresas.id
      AND eu.user_id = auth.uid()
    )
  );

-- =====================================================
-- Verificar se há triggers problemáticos
-- =====================================================
-- Listar triggers na tabela empresa_usuarios:
-- SELECT * FROM pg_trigger WHERE tgrelid = 'empresa_usuarios'::regclass;
