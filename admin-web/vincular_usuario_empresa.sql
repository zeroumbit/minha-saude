-- =====================================================
-- SCRIPT: Vincular usuário existente à empresa
-- =====================================================
-- Substitua os valores abaixo pelos dados reais
-- =====================================================

-- 1. Primeiro, descubra o email do usuário e o nome da empresa
-- Execute para ver os dados:
SELECT 
    u.id as user_id,
    u.email,
    e.id as empresa_id,
    e.nome_fantasia
FROM auth.users u
CROSS JOIN empresas e
WHERE u.email = 'commecedez@gmail.com';

-- 2. Se a empresa NÃO existe, crie uma:
-- INSERT INTO empresas (id, nome_fantasia, razao_social, status, origin)
-- VALUES (gen_random_uuid(), 'Nome da Empresa', 'Razão Social LTDA', 'ACTIVE', 'SELF_SIGNUP');

-- 3. Vincular usuário à empresa (substitua os IDs abaixo)
-- Você precisa pegar o user_id do passo 1 e o empresa_id também
INSERT INTO empresa_usuarios (empresa_id, user_id, role)
VALUES (
    'COLOQUE_O_ID_DA_EMPRESA_AQUI',  -- Substitua pelo ID da empresa
    '5cacd5c3-9fa8-46c4-b816-6e404475ac00',  -- ID do usuário
    'OWNER'  -- Role do usuário
)
ON CONFLICT (empresa_id, user_id) DO NOTHING;
