-- Criar tabelas para sistema de planos e faturamento

-- Criar tabela de planos
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_period TEXT DEFAULT 'monthly', -- monthly, yearly
  features JSONB,
  max_daily_jobs INTEGER,
  priority BOOLEAN DEFAULT false,
  analytics BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de subscrições de usuários
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de transações de pagamento
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method TEXT, -- credit_card, pix, boleto
  external_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- Ativar RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Inserir planos padrão
INSERT INTO subscription_plans (name, description, price, billing_period, features, max_daily_jobs, priority, analytics)
VALUES
  (
    'Gratuito',
    'Perfeito para começar',
    0,
    'monthly',
    '["Vagas básicas", "Até 5 recomendações por dia", "Suporte por email"]'::jsonb,
    5,
    false,
    false
  ),
  (
    'Professional',
    'Para profissionais sérios',
    29.90,
    'monthly',
    '["Vagas ilimitadas", "Recomendações prioritárias", "Análise de mercado", "Suporte prioritário", "Sem anúncios"]'::jsonb,
    999,
    true,
    true
  ),
  (
    'Enterprise',
    'Para equipes',
    99.90,
    'monthly',
    '["Vagas ilimitadas", "Recomendações customizadas", "Analytics avançada", "Suporte 24/7", "API access", "Gestão de equipe"]'::jsonb,
    9999,
    true,
    true
  )
ON CONFLICT DO NOTHING;
