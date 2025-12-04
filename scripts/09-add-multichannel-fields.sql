-- Adicionar campos de multicanal à tabela users

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_channel TEXT DEFAULT 'whatsapp' CHECK (preferred_channel IN ('whatsapp', 'email', 'telegram')),
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Criar índice para busca por canal
CREATE INDEX IF NOT EXISTS idx_users_preferred_channel ON users(preferred_channel);

