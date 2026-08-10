CREATE TABLE "ai_analyses" (
    "id" SERIAL NOT NULL,
    "diagnosis_id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
    "tokens_used" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "diagnoses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
