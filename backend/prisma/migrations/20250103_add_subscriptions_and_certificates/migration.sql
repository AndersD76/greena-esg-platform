-- Criar tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL,
  max_diagnoses INTEGER,
  consultation_hours INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de assinaturas dos usuários
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  trial_ends_at TIMESTAMP,
  consultation_hours_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de certificados emitidos
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  diagnosis_id TEXT NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  certificate_url TEXT,
  pdf_path TEXT,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de benefícios por nível
CREATE TABLE IF NOT EXISTS certification_benefits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL,
  benefit_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  value TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Inserir planos padrão
INSERT INTO subscription_plans (id, name, code, price, billing_cycle, max_diagnoses, consultation_hours, features) VALUES
(gen_random_uuid(), 'Teste Grátis', 'free', 0.00, 'monthly', 1, 0, '{"max_users": 1, "dashboard": true, "basic_reports": true, "email_support": true}')
ON CONFLICT (code) DO NOTHING;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_level ON certificates(level);
CREATE INDEX IF NOT EXISTS idx_certificates_diagnosis_id ON certificates(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_certification_benefits_level ON certification_benefits(level);
