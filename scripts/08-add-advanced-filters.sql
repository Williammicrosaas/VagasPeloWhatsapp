-- Adicionar campos de filtros avançados à tabela job_preferences

-- Adicionar colunas para filtros avançados
ALTER TABLE job_preferences 
ADD COLUMN IF NOT EXISTS min_salary DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS max_salary DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'BRL',
ADD COLUMN IF NOT EXISTS level TEXT, -- Júnior, Pleno, Sênior, Especialista
ADD COLUMN IF NOT EXISTS employment_type TEXT, -- CLT, PJ, Freelance, Estágio
ADD COLUMN IF NOT EXISTS remote BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS match_score_threshold INTEGER DEFAULT 60; -- Score mínimo para enviar (0-100)

-- Criar tabela para armazenar match scores de vagas
CREATE TABLE IF NOT EXISTS job_match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  score_breakdown JSONB, -- Detalhamento do score por critério
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Criar tabela para rastrear alertas prioritários
CREATE TABLE IF NOT EXISTS priority_job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sent_job_id UUID REFERENCES sent_jobs(id) ON DELETE SET NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 80),
  sent_via TEXT DEFAULT 'whatsapp', -- whatsapp, email, telegram
  sent_at TIMESTAMP DEFAULT NOW(),
  clicked_at TIMESTAMP,
  UNIQUE(user_id, job_id, sent_at)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_job_match_scores_user_id ON job_match_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_job_match_scores_job_id ON job_match_scores(job_id);
CREATE INDEX IF NOT EXISTS idx_job_match_scores_score ON job_match_scores(match_score);
CREATE INDEX IF NOT EXISTS idx_priority_job_alerts_user_id ON priority_job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_priority_job_alerts_score ON priority_job_alerts(match_score);

-- Ativar RLS
ALTER TABLE job_match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_job_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para job_match_scores
CREATE POLICY "Users can view their own match scores"
  ON job_match_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own match scores"
  ON job_match_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para priority_job_alerts
CREATE POLICY "Users can view their own priority alerts"
  ON priority_job_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own priority alerts"
  ON priority_job_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own priority alerts"
  ON priority_job_alerts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

