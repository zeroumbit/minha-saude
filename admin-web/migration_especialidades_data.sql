-- =====================================================
-- MIGRATION: Cadastro Massivo de Especialidades
-- =====================================================

-- 1. Garantir que a tabela existe e tem o campo categoria
CREATE TABLE IF NOT EXISTS public.especialidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    categoria TEXT,
    is_system BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar coluna categoria se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pf_column_exists('public', 'especialidades', 'categoria')) THEN
        ALTER TABLE public.especialidades ADD COLUMN categoria TEXT;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Fallback simples se a função de checagem não existir
    BEGIN
        ALTER TABLE public.especialidades ADD COLUMN categoria TEXT;
    EXCEPTION WHEN duplicate_column THEN
    END;
END $$;

-- 2. Inserção dos Dados
INSERT INTO public.especialidades (nome, categoria) VALUES
-- MÉDICOS (ESPECIALIDADES CLÍNICAS)
('Alergistas / Imunologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Alergistas Pediátricos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Anestesiologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Angiologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cardiologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cardiologistas Pediátricos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cirurgiões Bariátricos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cirurgiões Cardiovasculares', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cirurgiões da Mão', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cirurgiões de Cabeça e Pescoço', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cirurgiões do Aparelho Digestivo', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cirurgiões Gerais', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cirurgiões Oncológicos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cirurgiões Pediátricos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cirurgiões Plásticos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cirurgiões Torácicos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Cirurgiões Vasculares', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Clínico Geral / Generalistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Coloproctologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Dermatologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Endocrinologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Endocrinologistas Pediátricos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Especialistas em Clínica Médica', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Especialistas em Dor', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Especialistas em Medicina do Adolescente', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Especialistas em Medicina Estética', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Especialistas em Medicina Física e Reabilitação', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Especialistas em Medicina Preventiva', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Especialistas em Neonatologia', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Especialistas em Reprodução Humana', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Gastroenterologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Gastroenterologistas Pediátricos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Geneticistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Geriatras', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Ginecologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Hematologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Hematologistas Pediátricos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Hepatologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Homeopatas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Infectologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Mastologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Nefrologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Neurocirurgiões', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Neurologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Neurologistas Pediátricos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Nutrólogos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Oftalmologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Oncologistas Clínicos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Ortopedistas / Traumatologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Otorrinolaringologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Pediatras', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Pneumologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Pneumologistas Pediátricos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Proctologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Psiquiatras', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Psiquiatras da Infância e Adolescência', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Reumatologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Reumatologistas Pediátricos', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),
('Urologistas', 'MÉDICOS (ESPECIALIDADES CLÍNICAS)'),

-- ODONTOLOGIA
('Dentistas Clínico Geral', 'ODONTOLOGIA'),
('Ortodontistas', 'ODONTOLOGIA'),
('Odontopediatras', 'ODONTOLOGIA'),
('Implantodontistas', 'ODONTOLOGIA'),
('Periodontistas', 'ODONTOLOGIA'),
('Endodontistas', 'ODONTOLOGIA'),
('Estomatologistas', 'ODONTOLOGIA'),
('Dentística (Restaurações)', 'ODONTOLOGIA'),
('Especialistas em Harmonização Orofacial', 'ODONTOLOGIA'),
('Proteticistas', 'ODONTOLOGIA'),
('Odontogeriatras', 'ODONTOLOGIA'),
('Odontologia do Esporte', 'ODONTOLOGIA'),
('Odontologia Hospitalar', 'ODONTOLOGIA'),
('Cirurgiões Buco-Maxilo-Faciais', 'ODONTOLOGIA'),
('Odontologistas Legais', 'ODONTOLOGIA'),

-- SAÚDE MENTAL
('Psicólogos (várias abordagens)', 'SAÚDE MENTAL'),
('Psicopedagogos', 'SAÚDE MENTAL'),
('Neuropsicólogos', 'SAÚDE MENTAL'),
('Terapeutas Ocupacionais', 'SAÚDE MENTAL'),
('Psicanalistas', 'SAÚDE MENTAL'),

-- FISIOTERAPIA E REABILITAÇÃO
('Fisioterapeutas Gerais', 'FISIOTERAPIA E REABILITAÇÃO'),
('Fisioterapeutas Ortopédicos', 'FISIOTERAPIA E REABILITAÇÃO'),
('Fisioterapeutas Esportivos', 'FISIOTERAPIA E REABILITAÇÃO'),
('Fisioterapeutas Respiratórios', 'FISIOTERAPIA E REABILITAÇÃO'),
('Fisioterapeutas Neurológicos', 'FISIOTERAPIA E REABILITAÇÃO'),
('Fisioterapeutas Dermato-funcionais', 'FISIOTERAPIA E REABILITAÇÃO'),
('Fisioterapeutas Pélvicos', 'FISIOTERAPIA E REABILITAÇÃO'),
('Quiropraxistas', 'FISIOTERAPIA E REABILITAÇÃO'),
('Osteopatas', 'FISIOTERAPIA E REABILITAÇÃO'),
('Pilates Clínico', 'FISIOTERAPIA E REABILITAÇÃO'),
('RPGistas', 'FISIOTERAPIA E REABILITAÇÃO'),

-- NUTRIÇÃO
('Nutricionistas Clínicos', 'NUTRIÇÃO'),
('Nutricionistas Esportivos', 'NUTRIÇÃO'),
('Nutricionistas Funcionais', 'NUTRIÇÃO'),
('Nutricionistas Materno-Infantis', 'NUTRIÇÃO'),
('Nutricionistas Comportamentais', 'NUTRIÇÃO'),
('Nutricionistas Oncológicos', 'NUTRIÇÃO'),

-- FONOAUDIOLOGIA
('Fonoaudiólogos Gerais', 'FONOAUDIOLOGIA'),
('Fonoaudiologia Infantil', 'FONOAUDIOLOGIA'),
('Motricidade Orofacial', 'FONOAUDIOLOGIA'),
('Audiologia', 'FONOAUDIOLOGIA'),
('Voz', 'FONOAUDIOLOGIA'),
('Disfagia', 'FONOAUDIOLOGIA'),
('Linguagem', 'FONOAUDIOLOGIA'),

-- ESTÉTICA E BEM-ESTAR
('Biomédicos Estetas', 'ESTÉTICA E BEM-ESTAR'),
('Esteticistas Clínicos', 'ESTÉTICA E BEM-ESTAR'),
('Cosmetólogos', 'ESTÉTICA E BEM-ESTAR'),
('Tricologistas', 'ESTÉTICA E BEM-ESTAR'),
('Podólogos', 'ESTÉTICA E BEM-ESTAR'),
('Massoterapeutas', 'ESTÉTICA E BEM-ESTAR'),

-- TERAPIAS INTEGRATIVAS
('Acupunturistas', 'TERAPIAS INTEGRATIVAS'),
('Fitoterapeutas', 'TERAPIAS INTEGRATIVAS'),
('Naturopatas', 'TERAPIAS INTEGRATIVAS'),
('Aromaterapeutas', 'TERAPIAS INTEGRATIVAS'),
('Florais de Bach', 'TERAPIAS INTEGRATIVAS'),
('Reflexólogos', 'TERAPIAS INTEGRATIVAS'),
('Ayurveda', 'TERAPIAS INTEGRATIVAS'),
('Terapeutas Holísticos', 'TERAPIAS INTEGRATIVAS'),

-- APOIO TERAPÊUTICO
('Educadores Físicos', 'APOIO TERAPÊUTICO'),
('Coach de Saúde', 'APOIO TERAPÊUTICO'),
('Personal Trainers', 'APOIO TERAPÊUTICO'),
('Acompanhantes Terapêuticos', 'APOIO TERAPÊUTICO'),
('Doulas', 'APOIO TERAPÊUTICO'),
('Doulas Pós-parto', 'APOIO TERAPÊUTICO'),

-- ENFERMAGEM EM CONSULTAS
('Enfermeiros Gerais', 'ENFERMAGEM EM CONSULTAS'),
('Enfermeiros Estetas', 'ENFERMAGEM EM CONSULTAS'),
('Enfermeiros para curativos', 'ENFERMAGEM EM CONSULTAS'),
('Enfermeiros para aplicação de injetáveis', 'ENFERMAGEM EM CONSULTAS'),
('Enfermeiros Obstetras', 'ENFERMAGEM EM CONSULTAS'),
('Técnicos de Enfermagem', 'ENFERMAGEM EM CONSULTAS'),

-- GESTÃO E ADMINISTRAÇÃO
('Especialistas em Administração em Saúde', 'GESTÃO E ADMINISTRAÇÃO'),
('Gestores Hospitalares', 'GESTÃO E ADMINISTRAÇÃO'),
('Auditores em Saúde', 'GESTÃO E ADMINISTRAÇÃO'),

-- DIAGNÓSTICO POR IMAGEM
('Especialistas em Diagnóstico por Imagem', 'DIAGNÓSTICO POR IMAGEM'),
('Especialistas em Ultrassonografia', 'DIAGNÓSTICO POR IMAGEM'),
('Especialistas em Medicina Nuclear', 'DIAGNÓSTICO POR IMAGEM'),
('Radiologistas', 'DIAGNÓSTICO POR IMAGEM'),
('Ultrassonografistas', 'DIAGNÓSTICO POR IMAGEM'),
('Mamografistas', 'DIAGNÓSTICO POR IMAGEM'),
('Densitometristas', 'DIAGNÓSTICO POR IMAGEM'),
('Tomografistas', 'DIAGNÓSTICO POR IMAGEM'),
('Ecografistas', 'DIAGNÓSTICO POR IMAGEM'),
('Técnicos em Radiologia', 'DIAGNÓSTICO POR IMAGEM'),
('Técnicos em Mamografia', 'DIAGNÓSTICO POR IMAGEM'),
('Técnicos em Ressonância', 'DIAGNÓSTICO POR IMAGEM'),

-- ANÁLISES CLÍNICAS E LABORATORIAIS
('Especialistas em Biomedicina', 'ANÁLISES CLÍNICAS E LABORATORIAIS'),
('Anátomopatologistas', 'ANÁLISES CLÍNICAS E LABORATORIAIS'),
('Farmacêuticos Bioquímicos', 'ANÁLISES CLÍNICAS E LABORATORIAIS'),
('Biomédicos', 'ANÁLISES CLÍNICAS E LABORATORIAIS'),
('Patologistas Clínicos', 'ANÁLISES CLÍNICAS E LABORATORIAIS'),
('Microbiologistas', 'ANÁLISES CLÍNICAS E LABORATORIAIS'),
('Citologistas', 'ANÁLISES CLÍNICAS E LABORATORIAIS'),
('Toxicologistas', 'ANÁLISES CLÍNICAS E LABORATORIAIS'),
('Técnicos em Análises Clínicas', 'ANÁLISES CLÍNICAS E LABORATORIAIS'),
('Técnicos em Patologia', 'ANÁLISES CLÍNICAS E LABORATORIAIS'),

-- EXAMES CARDIOVASCULARES
('Ecocardiografistas', 'EXAMES CARDIOVASCULARES'),
('Eletrocardiografistas', 'EXAMES CARDIOVASCULARES'),
('Ergonomistas', 'EXAMES CARDIOVASCULARES'),

-- EXAMES ENDOSCÓPICOS
('Endoscopistas', 'EXAMES ENDOSCÓPICOS'),
('Colonoscopistas', 'EXAMES ENDOSCÓPICOS'),
('Broncoscopistas', 'EXAMES ENDOSCÓPICOS'),
('Técnicos em Endoscopia', 'EXAMES ENDOSCÓPICOS'),

-- EXAMES OFTALMOLÓGICOS
('Refratometristas', 'EXAMES OFTALMOLÓGICOS'),
('Campimetristas', 'EXAMES OFTALMOLÓGICOS'),
('Retinógrafos', 'EXAMES OFTALMOLÓGICOS'),
('Tonometristas', 'EXAMES OFTALMOLÓGICOS'),
('Técnicos em Oftalmologia', 'EXAMES OFTALMOLÓGICOS'),

-- EXAMES OTORRINOLARINGOLÓGICOS
('Audiometristas', 'EXAMES OTORRINOLARINGOLÓGICOS'),
('Impedanciometristas', 'EXAMES OTORRINOLARINGOLÓGICOS'),
('Vectoeletronistagmógrafos', 'EXAMES OTORRINOLARINGOLÓGICOS'),
('Nasofibroscopistas', 'EXAMES OTORRINOLARINGOLÓGICOS'),

-- EXAMES NEUROLÓGICOS
('Eletroencefalografistas', 'EXAMES NEUROLÓGICOS'),
('Eletroneuromiografistas', 'EXAMES NEUROLÓGICOS'),
('Técnicos em EEG', 'EXAMES NEUROLÓGICOS'),

-- EXAMES GINECOLÓGICOS E OBSTÉTRICOS
('Colpocitologistas', 'EXAMES GINECOLÓGICOS E OBSTÉTRICOS'),
('Colposcopistas', 'EXAMES GINECOLÓGICOS E OBSTÉTRICOS'),

-- EXAMES ORTOPÉDICOS
('Densitometristas Ósseos', 'EXAMES ORTOPÉDICOS'),

-- EXAMES UROLÓGICOS
('Ultrassonografistas Urológicos', 'EXAMES UROLÓGICOS'),
('Urodinamicistas', 'EXAMES UROLÓGICOS'),

-- EXAMES GENÉTICOS
('Técnicos em Biologia Molecular', 'EXAMES GENÉTICOS'),

-- EXAMES OCUPACIONAIS
('Médicos do Trabalho', 'EXAMES OCUPACIONAIS'),
('Enfermeiros do Trabalho', 'EXAMES OCUPACIONAIS'),
('Técnicos em Segurança do Trabalho', 'EXAMES OCUPACIONAIS'),
('Audiometristas Ocupacionais', 'EXAMES OCUPACIONAIS'),
('Espirometristas', 'EXAMES OCUPACIONAIS'),

-- EXAMES DE IMUNIZAÇÃO
('Enfermeiros de Vacinação', 'EXAMES DE IMUNIZAÇÃO'),
('Técnicos em Enfermagem (salas de vacina)', 'EXAMES DE IMUNIZAÇÃO'),
('Farmacêuticos (imunizantes)', 'EXAMES DE IMUNIZAÇÃO')

ON CONFLICT (nome) DO UPDATE SET categoria = EXCLUDED.categoria;
