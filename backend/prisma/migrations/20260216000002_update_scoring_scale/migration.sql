-- Atualizar escala de pontuação para maturidade ESG (0-5)

-- 1. Tornar colunas importance opcionais (depreciadas)
DO $$ BEGIN
  ALTER TABLE responses ALTER COLUMN importance DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE responses ALTER COLUMN importance_value DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- 2. Atualizar labels de evaluation nas respostas existentes
UPDATE responses SET evaluation = 'Não iniciado' WHERE evaluation = 'Não é feito';
UPDATE responses SET evaluation = 'Planejado' WHERE evaluation = 'É mal feito';
UPDATE responses SET evaluation = 'Em andamento' WHERE evaluation = 'É feito';
UPDATE responses SET evaluation = 'Implementado parcialmente' WHERE evaluation = 'É bem feito';
UPDATE responses SET evaluation = 'Totalmente implementado' WHERE evaluation = 'É muito bem feito';

-- 3. Limpar campos depreciados nas respostas existentes
UPDATE responses SET importance = NULL, importance_value = NULL WHERE importance IS NOT NULL;
