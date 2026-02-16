-- Tabela de Medicamentos
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  time TIME NOT NULL,
  instructions TEXT,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'asNeeded')),
  is_taken BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Consultas (Appointments)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Perfis de Usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  photo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ativar RLS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Limpar políticas existentes para evitar erro de duplicação
DO $$ 
BEGIN
    -- Medicamentos
    DROP POLICY IF EXISTS "Usuários podem ver seus próprios medicamentos" ON medications;
    DROP POLICY IF EXISTS "Usuários podem inserir seus próprios medicamentos" ON medications;
    DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios medicamentos" ON medications;
    DROP POLICY IF EXISTS "Usuários podem deletar seus próprios medicamentos" ON medications;
    
    -- Consultas
    DROP POLICY IF EXISTS "Usuários podem ver suas próprias consultas" ON appointments;
    DROP POLICY IF EXISTS "Usuários podem inserir suas próprias consultas" ON appointments;
    DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias consultas" ON appointments;
    DROP POLICY IF EXISTS "Usuários podem deletar suas próprias consultas" ON appointments;
    
    -- Perfis
    DROP POLICY IF EXISTS "Perfis são visíveis apenas pelos próprios donos" ON profiles;
    DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON profiles;
END $$;

-- Recriar Políticas: Medicamentos
CREATE POLICY "Usuários podem ver seus próprios medicamentos" ON medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seus próprios medicamentos" ON medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios medicamentos" ON medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios medicamentos" ON medications FOR DELETE USING (auth.uid() = user_id);

-- Recriar Políticas: Consultas
CREATE POLICY "Usuários podem ver suas próprias consultas" ON appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias consultas" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias consultas" ON appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar suas próprias consultas" ON appointments FOR DELETE USING (auth.uid() = user_id);

-- Recriar Políticas: Perfis
CREATE POLICY "Perfis são visíveis apenas pelos próprios donos" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Tabela de Receitas (Prescriptions)
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  doctor_name TEXT,
  issue_date DATE,
  image_url TEXT, -- Para salvar o link do arquivo no Supabase Storage
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Círculo de Cuidado (Care Circle)
CREATE TABLE IF NOT EXISTS care_circle (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_email TEXT NOT NULL,
  member_name TEXT NOT NULL,
  relationship TEXT, -- Ex: "Filho", "Cuidador"
  access_level TEXT DEFAULT 'view_only' CHECK (access_level IN ('view_only', 'edit')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ativar RLS
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_circle ENABLE ROW LEVEL SECURITY;

-- Limpar e Recriar Políticas: Receitas
DO $$ BEGIN
    DROP POLICY IF EXISTS "Usuários podem ver suas próprias receitas" ON prescriptions;
    DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias receitas" ON prescriptions;
END $$;

CREATE POLICY "Usuários podem ver suas próprias receitas" ON prescriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem gerenciar suas próprias receitas" ON prescriptions FOR ALL USING (auth.uid() = user_id);

-- Limpar e Recriar Políticas: Círculo de Cuidado
DO $$ BEGIN
    DROP POLICY IF EXISTS "Donos podem ver seu círculo" ON care_circle;
    DROP POLICY IF EXISTS "Donos podem gerenciar seu círculo" ON care_circle;
END $$;

CREATE POLICY "Donos podem ver seu círculo" ON care_circle FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Donos podem gerenciar seu círculo" ON care_circle FOR ALL USING (auth.uid() = owner_id);

-- (Mantendo o resto das triggers e funções de perfil abaixo)
