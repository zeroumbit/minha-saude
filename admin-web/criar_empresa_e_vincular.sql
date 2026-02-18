-- =====================================================
-- SCRIPT: Criar empresa e vincular ao usuário existente
-- =====================================================

-- 1. Criar a empresa
INSERT INTO empresas (id, nome_fantasia, razao_social, status, origin)
VALUES (
    gen_random_uuid(),
    'Commece Dez',
    'Commece Dez LTDA',
    'ACTIVE',
    'SELF_SIGNUP'
)
RETURNING id;

-- 2. Com o ID retornado acima, criar o vínculo
-- Substitua 'ID_DA_EMPRESA_RETORNADO' pelo ID do passo 1
INSERT INTO empresa_usuarios (empresa_id, user_id, role)
VALUES (
    'ID_DA_EMPRESA_RETORNADO',  -- Cole aqui o ID retornado pelo INSERT acima
    '5cacd5c3-9fa8-46c4-b816-6e404475ac00',
    'OWNER'
);
