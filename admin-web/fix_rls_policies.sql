-- =====================================================
-- CORREÇÃO RLS - Policy de empresa_usuarios
-- =====================================================
-- O problema era a política "Membros veem outros membros" que causava
-- recursão infinita ao fazer subquery na própria tabela.
-- =====================================================

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Membros veem outros membros" ON empresa_usuarios;
DROP POLICY IF EXISTS "Usuario ve seu proprio vinculo" ON empresa_usuarios;
DROP POLICY IF EXISTS "Usuarios criam vinculo inicial" ON empresa_usuarios;

-- Recriar políticas de forma segura
-- Policy 1: Usuário pode ver seu próprio vínculo
CREATE POLICY "Usuario ve proprio vinculo" ON empresa_usuarios
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy 2: Usuário pode inserir seu próprio vínculo (cadastro)
CREATE POLICY "Usuario cria proprio vinculo" ON empresa_usuarios
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Admin/Owner pode ver todos os vínculos da empresa
-- (para quando precisar listar membros da equipe)
CREATE POLICY "Admin ve vinculos da empresa" ON empresa_usuarios
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM empresa_usuarios eu
      WHERE eu.user_id = auth.uid()
      AND eu.empresa_id = empresa_usuarios.empresa_id
      AND eu.role IN ('OWNER', 'ADMIN')
    )
  );

-- =====================================================
-- Ajustar políticas de empresas (se necessário)
-- =====================================================
DROP POLICY IF EXISTS "Usuarios veem suas empresas" ON empresas;

CREATE POLICY "Usuarios veem suas empresas" ON empresas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM empresa_usuarios
      WHERE empresa_usuarios.empresa_id = empresas.id
      AND empresa_usuarios.user_id = auth.uid()
    )
  );

-- =====================================================
-- Ajustar políticas de unidades
-- =====================================================
DROP POLICY IF EXISTS "Membros veem unidades da empresa" ON unidades;
DROP POLICY IF EXISTS "Membros gerenciam unidades" ON unidades;

CREATE POLICY "Membros veem unidades da empresa" ON unidades
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM empresa_usuarios
      WHERE empresa_usuarios.empresa_id = unidades.empresa_id
      AND empresa_usuarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Membros gerenciam unidades" ON unidades
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM empresa_usuarios
      WHERE empresa_usuarios.empresa_id = unidades.empresa_id
      AND empresa_usuarios.user_id = auth.uid()
    )
  );
