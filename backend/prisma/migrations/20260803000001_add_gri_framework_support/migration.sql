-- Pillar: framework, sort_order, macro_category
ALTER TABLE "pillars" ADD COLUMN "framework" TEXT NOT NULL DEFAULT 'ESG';
ALTER TABLE "pillars" ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "pillars" ADD COLUMN "macro_category" TEXT;

-- Set sort_order for existing ESG pillars
UPDATE "pillars" SET "sort_order" = 1 WHERE "code" = 'E';
UPDATE "pillars" SET "sort_order" = 2 WHERE "code" = 'S';
UPDATE "pillars" SET "sort_order" = 3 WHERE "code" = 'G';

-- Diagnosis: framework
ALTER TABLE "diagnoses" ADD COLUMN "framework" TEXT NOT NULL DEFAULT 'ESG';

-- AssessmentItem: gri_code, framework_tag
ALTER TABLE "assessment_items" ADD COLUMN "gri_code" TEXT;
ALTER TABLE "assessment_items" ADD COLUMN "framework_tag" TEXT NOT NULL DEFAULT 'ESG';

-- Certificate: framework
ALTER TABLE "certificates" ADD COLUMN "framework" TEXT NOT NULL DEFAULT 'ESG';

-- DiagnosisScore pivot table
CREATE TABLE "diagnosis_scores" (
    "id" SERIAL NOT NULL,
    "diagnosis_id" TEXT NOT NULL,
    "pillar_id" INTEGER NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnosis_scores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "diagnosis_scores_diagnosis_id_pillar_id_key" ON "diagnosis_scores"("diagnosis_id", "pillar_id");

ALTER TABLE "diagnosis_scores" ADD CONSTRAINT "diagnosis_scores_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "diagnoses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "diagnosis_scores" ADD CONSTRAINT "diagnosis_scores_pillar_id_fkey" FOREIGN KEY ("pillar_id") REFERENCES "pillars"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- FrameworkMapping table
CREATE TABLE "framework_mappings" (
    "id" SERIAL NOT NULL,
    "esg_assessment_item_id" INTEGER NOT NULL,
    "gri_assessment_item_id" INTEGER NOT NULL,
    "compatibility_level" TEXT NOT NULL,

    CONSTRAINT "framework_mappings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "framework_mappings_esg_assessment_item_id_gri_assessment_item_id_key" ON "framework_mappings"("esg_assessment_item_id", "gri_assessment_item_id");

ALTER TABLE "framework_mappings" ADD CONSTRAINT "framework_mappings_esg_assessment_item_id_fkey" FOREIGN KEY ("esg_assessment_item_id") REFERENCES "assessment_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "framework_mappings" ADD CONSTRAINT "framework_mappings_gri_assessment_item_id_fkey" FOREIGN KEY ("gri_assessment_item_id") REFERENCES "assessment_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
