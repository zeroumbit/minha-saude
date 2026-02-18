-- =====================================================
-- MIGRATION: Correção de Disponibilidade de Serviços
-- =====================================================
-- PROBLEMA: Hoje temos disponibilidade tanto em profissional quanto em serviço,
-- o que causa conflito no agendamento.
--
-- SOLUÇÃO: A disponibilidade deve estar apenas no profissional.
-- O serviço apenas vincula profissionais e unidades.
-- =====================================================

-- 1. Drop na tabela servico_disponibilidade (não é mais necessária)
DROP TABLE IF EXISTS public.servico_disponibilidade CASCADE;

-- 2. Adicionar coluna para indicar se o profissional atende aquele serviço em todas as unidades ou apenas específicas
ALTER TABLE public.servico_profissionais 
ADD COLUMN IF NOT EXISTS aplica_todas_unidades BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS disponibilidade_propria BOOLEAN DEFAULT false;

-- Explicação das colunas:
-- aplica_todas_unidades: Se true, o profissional atende este serviço em TODAS as unidades onde a unidade tem o serviço
-- disponibilidade_propria: Se true, o profissional tem horários específicos para este serviço (usar profissional_disponibilidade)
--                          Se false, usa apenas a disponibilidade geral do profissional

-- 3. Criar view para facilitar consulta de disponibilidade combinada
CREATE OR REPLACE VIEW vw_servico_disponibilidade AS
SELECT 
    sp.servico_id,
    sp.profissional_id,
    su.unidade_id,
    pd.dia_semana,
    pd.hora_inicio,
    pd.hora_fim,
    p.tempo_atendimento_minutos
FROM servico_profissionais sp
JOIN servico_unidades su ON sp.servico_id = su.servico_id
JOIN profissionais p ON sp.profissional_id = p.id
JOIN profissional_disponibilidade pd ON pd.profissional_id = p.id
WHERE p.ativo = true;

-- 4. Adicionar comentário explicativo
COMMENT ON TABLE servico_profissionais IS 'Relacionamento entre serviços e profissionais. A disponibilidade é herdada da tabela profissional_disponibilidade.';
COMMENT ON COLUMN servico_profissionais.aplica_todas_unidades IS 'Se true, profissional atende em todas as unidades do serviço';
COMMENT ON COLUMN servico_profissionais.disponibilidade_propria IS 'Se true, usa disponibilidade específica do profissional para este serviço';

-- 5. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_servico_profissionais_unidades ON servico_profissionais(servico_id, profissional_id);
CREATE INDEX IF NOT EXISTS idx_profissional_disponibilidade_dia ON profissional_disponibilidade(dia_semana, hora_inicio, hora_fim);

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- Para agendar um serviço, consulte a view vw_servico_disponibilidade
-- ou faça o join manualmente:
--
-- SELECT 
--     s.nome as servico,
--     p.nome as profissional,
--     u.nome as unidade,
--     pd.dia_semana,
--     pd.hora_inicio,
--     pd.hora_fim
-- FROM servicos s
-- JOIN servico_unidades su ON s.id = su.servico_id
-- JOIN unidades u ON su.unidade_id = u.id
-- JOIN servico_profissionais sp ON s.id = sp.servico_id
-- JOIN profissionais p ON sp.profissional_id = p.id
-- JOIN profissional_disponibilidade pd ON p.id = pd.profissional_id
-- WHERE s.id = 'uuid-do-servico'
--   AND u.id = 'uuid-da-unidade'
--   AND pd.dia_semana = 1 -- Segunda-feira
-- ORDER BY pd.hora_inicio;
-- =====================================================
