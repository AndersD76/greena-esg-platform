-- Atualizar planos de assinatura para nova estrutura: Start, Grow, Impact
-- Remove planos antigos e insere novos

-- Deletar planos antigos (basic, professional, enterprise)
DELETE FROM subscription_plans WHERE code IN ('basic', 'professional', 'enterprise');

-- Atualizar plano free para Demo
UPDATE subscription_plans SET
  name = 'Teste Grátis - Demo',
  features = '{"max_users": 1, "dashboard": false, "basic_reports": false, "lead_capture": true}'
WHERE code = 'free';

-- Inserir novos planos
INSERT INTO subscription_plans (name, code, price, billing_cycle, max_diagnoses, consultation_hours, features) VALUES
('Start', 'start', 49.00, 'monthly', 1, 0, '{"max_users": 1, "dashboard": true, "diagnosis": true}'),
('Grow', 'grow', 99.00, 'monthly', 3, 2, '{"max_users": 3, "dashboard": true, "diagnosis": true, "certification": true, "consultation": true}'),
('Impact', 'impact', 159.00, 'monthly', 5, 4, '{"max_users": 5, "dashboard": true, "diagnosis": true, "certification": true, "consultation": true, "action_plans": true}');

-- Adicionar campos do Asaas (se não existirem)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'asaas_customer_id') THEN
    ALTER TABLE users ADD COLUMN asaas_customer_id TEXT UNIQUE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'asaas_subscription_id') THEN
    ALTER TABLE user_subscriptions ADD COLUMN asaas_subscription_id TEXT UNIQUE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'payment_method') THEN
    ALTER TABLE user_subscriptions ADD COLUMN payment_method TEXT;
  END IF;
END $$;
