-- Distingue diagnóstico completo (planos pagos) de demo (plano gratuito, 6 perguntas)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnoses' AND column_name = 'type') THEN
    ALTER TABLE diagnoses ADD COLUMN type TEXT NOT NULL DEFAULT 'full';
  END IF;
END $$;

-- Diagnósticos EM ANDAMENTO de usuários sem assinatura paga ativa viram demo:
-- sem isso, quem entrou no questionário completo durante a falha de bloqueio
-- continuaria respondendo de graça.
--
-- Diagnósticos já concluídos não são tocados. O `type` registra por qual fluxo
-- o diagnóstico foi feito, e reescrever isso apagaria o histórico de quem pagou
-- na época e depois deixou a assinatura vencer. O acesso ao resultado desses
-- diagnósticos continua controlado pelo plano atual, via requirePaidPlan.
UPDATE diagnoses d SET type = 'demo'
WHERE d.status = 'in_progress'
AND EXISTS (
  SELECT 1 FROM users u
  WHERE u.id = d.user_id AND u.role NOT IN ('admin', 'superadmin')
)
AND NOT EXISTS (
  SELECT 1 FROM user_subscriptions s
  JOIN subscription_plans p ON p.id = s.plan_id
  WHERE s.user_id = d.user_id
    AND s.status = 'active'
    AND p.code <> 'free'
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
);
