-- Execute este script no SQL Editor do Supabase para adicionar as colunas de configuração de notificação.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_lead_time_minutes INTEGER DEFAULT 30;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_interval_minutes INTEGER DEFAULT 5;

-- Opcional: Atualizar registros existentes para ter os valores padrão se estiverem nulos
UPDATE public.profiles 
SET notification_lead_time_minutes = 30 
WHERE notification_lead_time_minutes IS NULL;

UPDATE public.profiles 
SET notification_interval_minutes = 5 
WHERE notification_interval_minutes IS NULL;
