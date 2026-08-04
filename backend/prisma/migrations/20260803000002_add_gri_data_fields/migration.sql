-- Add data_fields to assessment_items (GRI field definitions per disclosure)
ALTER TABLE "assessment_items" ADD COLUMN "data_fields" JSONB;

-- Add data to responses (actual GRI data entered by users)
ALTER TABLE "responses" ADD COLUMN "data" JSONB;
