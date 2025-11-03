-- Criar tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- 'free', 'basic', 'professional', 'enterprise'
  price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL, -- 'monthly', 'yearly'
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
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
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
  level TEXT NOT NULL, -- 'bronze', 'silver', 'gold'
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
  level TEXT NOT NULL, -- 'bronze', 'silver', 'gold'
  benefit_type TEXT NOT NULL, -- 'feature', 'discount', 'consultation', 'badge', 'network'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  value TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Inserir planos padrão
INSERT INTO subscription_plans (name, code, price, billing_cycle, max_diagnoses, consultation_hours, features) VALUES
('Teste Grátis', 'free', 0.00, 'monthly', 1, 0, '{"max_users": 1, "dashboard": true, "basic_reports": true, "email_support": true}'),
('Básico', 'basic', 99.90, 'monthly', 5, 2, '{"max_users": 3, "dashboard": true, "advanced_reports": true, "email_support": true, "certification": true}'),
('Profissional', 'professional', 299.90, 'monthly', 20, 8, '{"max_users": 10, "dashboard": true, "advanced_reports": true, "custom_reports": true, "priority_support": true, "certification": true, "api_access": true}'),
('Empresarial', 'enterprise', 999.90, 'monthly', -1, 24, '{"max_users": -1, "dashboard": true, "advanced_reports": true, "custom_reports": true, "dedicated_support": true, "certification": true, "api_access": true, "white_label": true}');

-- Inserir benefícios por nível de certificação
INSERT INTO certification_benefits (level, benefit_type, title, description, value, "order") VALUES
-- Bronze
('bronze', 'badge', 'Selo de Compromisso ESG', 'Selo digital para uso em site e materiais de comunicação', NULL, 1),
('bronze', 'consultation', '1 hora de consultoria gratuita', 'Sessão de orientação sobre próximos passos ESG', '1', 2),
('bronze', 'feature', 'Relatório básico de maturidade', 'Documento detalhando seu nível atual e recomendações', NULL, 3),
('bronze', 'network', 'Acesso à comunidade GREENA', 'Network com outras empresas em transformação ESG', NULL, 4),

-- Prata
('silver', 'badge', 'Selo de Integração ESG', 'Selo premium para comunicação institucional', NULL, 1),
('silver', 'consultation', '3 horas de consultoria gratuita', 'Acompanhamento trimestral de implementação', '3', 2),
('silver', 'feature', 'Relatório avançado + Plano de ação', 'Roadmap detalhado com metas e indicadores', NULL, 3),
('silver', 'discount', '20% de desconto em auditorias', 'Desconto em processos de verificação externa', '20', 4),
('silver', 'network', 'Eventos exclusivos GREENA', 'Participação em webinars e workshops', NULL, 5),
('silver', 'feature', 'Prioridade no suporte técnico', 'Atendimento prioritário e consultoria dedicada', NULL, 6),

-- Ouro
('gold', 'badge', 'Selo de Liderança ESG', 'Selo de excelência com reconhecimento de mercado', NULL, 1),
('gold', 'consultation', '6 horas de consultoria gratuita', 'Acompanhamento mensal por especialistas', '6', 2),
('gold', 'feature', 'Relatório executivo completo', 'Análise estratégica com benchmarking setorial', NULL, 3),
('gold', 'discount', '30% de desconto em auditorias', 'Desconto premium em certificações externas', '30', 4),
('gold', 'feature', 'Certificado físico emoldurado', 'Documento oficial para exposição institucional', NULL, 5),
('gold', 'network', 'Destaque em cases GREENA', 'Divulgação como empresa referência ESG', NULL, 6),
('gold', 'feature', 'Assessoria para relatórios GRI/SASB', 'Suporte na elaboração de relatórios internacionais', NULL, 7),
('gold', 'network', 'Convite para conselho consultivo', 'Participação em grupo seleto de líderes ESG', NULL, 8);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_level ON certificates(level);
CREATE INDEX IF NOT EXISTS idx_certificates_diagnosis_id ON certificates(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_certification_benefits_level ON certification_benefits(level);
