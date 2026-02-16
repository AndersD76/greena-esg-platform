-- Migração: Atualizar escala de pontuação para maturidade ESG (0-5)
-- Nova escala:
--   0: Não se aplica (N/A)
--   1: Não iniciado (ELEMENTAR)
--   2: Planejado (NÃO INTEGRADO)
--   3: Em andamento (GERENCIAL)
--   4: Implementado parcialmente (ESTRATÉGICO)
--   5: Totalmente implementado (TRANSFORMADOR)

-- 1. Tornar colunas importance opcionais (depreciadas)
ALTER TABLE responses ALTER COLUMN importance DROP NOT NULL;
ALTER TABLE responses ALTER COLUMN importance_value DROP NOT NULL;

-- 2. Atualizar labels de evaluation nas respostas existentes
UPDATE responses SET evaluation = 'Não iniciado' WHERE evaluation = 'Não é feito';
UPDATE responses SET evaluation = 'Planejado' WHERE evaluation = 'É mal feito';
UPDATE responses SET evaluation = 'Em andamento' WHERE evaluation = 'É feito';
UPDATE responses SET evaluation = 'Implementado parcialmente' WHERE evaluation = 'É bem feito';
UPDATE responses SET evaluation = 'Totalmente implementado' WHERE evaluation = 'É muito bem feito';

-- 3. Limpar campos depreciados nas respostas existentes
UPDATE responses SET importance = NULL, importance_value = NULL;
