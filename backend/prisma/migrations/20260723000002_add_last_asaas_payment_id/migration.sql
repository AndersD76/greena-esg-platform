-- Guarda o último pagamento Asaas processado por assinatura.
-- O Asaas dispara PAYMENT_CONFIRMED e PAYMENT_RECEIVED para o mesmo pagamento
-- (além de reenviar webhooks), e sem isso cada pagamento estenderia a validade
-- mais de uma vez.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_subscriptions' AND column_name = 'last_asaas_payment_id') THEN
    ALTER TABLE user_subscriptions ADD COLUMN last_asaas_payment_id TEXT;
  END IF;
END $$;
