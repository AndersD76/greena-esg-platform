-- AlterTable
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "esg_pain_point" TEXT,
ADD COLUMN IF NOT EXISTS "asaas_customer_id" TEXT;

-- CreateIndex (only if column was added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'users_asaas_customer_id_key'
  ) THEN
    CREATE UNIQUE INDEX "users_asaas_customer_id_key" ON "users"("asaas_customer_id");
  END IF;
END $$;
