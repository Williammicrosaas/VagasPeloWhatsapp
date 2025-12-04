-- Criar tabelas para vagas e sistema de matching

-- Criar tabela de vagas
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_website TEXT,
  job_area TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  salary_currency TEXT DEFAULT 'BRL',
  employment_type TEXT DEFAULT 'Tempo Integral',
  remote BOOLEAN DEFAULT false,
  requirements TEXT,
  benefits TEXT,
  apply_url TEXT NOT NULL,
  source TEXT DEFAULT 'API',
  posted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de histórico de vagas enviadas aos usuários
CREATE TABLE IF NOT EXISTS sent_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sent_at TIMESTAMP DEFAULT NOW(),
  view_status TEXT DEFAULT 'pending', -- pending, viewed, applied, dismissed
  UNIQUE(user_id, job_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_jobs_area ON jobs(job_area);
CREATE INDEX IF NOT EXISTS idx_jobs_country ON jobs(country);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_sent_jobs_user_id ON sent_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_sent_jobs_job_id ON sent_jobs(job_id);

-- Ativar Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_jobs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para jobs (public read, admin only write)
CREATE POLICY "Anyone can view active jobs"
  ON jobs FOR SELECT
  USING (expires_at IS NULL OR expires_at > NOW());

-- Políticas de RLS para sent_jobs
CREATE POLICY "Users can view their own sent jobs"
  ON sent_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sent jobs status"
  ON sent_jobs FOR UPDATE
  USING (auth.uid() = user_id);
