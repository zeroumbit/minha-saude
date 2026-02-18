-- =====================================================
-- CORREÇÃO: Relacionamento de Equipe e Perfil
-- =====================================================

-- 1. Adicionar coluna de e-mail na tabela de perfis (para facilitar a listagem de equipe)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Atualizar a função handle_new_user para sincronizar o e-mail do Auth para o Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Sincronizar e-mails de usuários já existentes
UPDATE public.profiles p 
SET email = u.email 
FROM auth.users u 
WHERE p.id = u.id AND p.email IS NULL;

-- 4. Criar Chave Estrangeira explícita entre empresa_usuarios e profiles
-- Isso permite que o Supabase/PostgREST entenda o relacionamento para fazer Joins
ALTER TABLE public.empresa_usuarios
DROP CONSTRAINT IF EXISTS empresa_usuarios_user_id_fkey;

ALTER TABLE public.empresa_usuarios
ADD CONSTRAINT empresa_usuarios_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
