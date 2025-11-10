-- AlterTable
ALTER TABLE "users" DROP COLUMN IF EXISTS "employees";

-- AlterTable
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "city" TEXT,
ADD COLUMN IF NOT EXISTS "founding_year" INTEGER,
ADD COLUMN IF NOT EXISTS "responsible_person" TEXT,
ADD COLUMN IF NOT EXISTS "responsible_contact" TEXT,
ADD COLUMN IF NOT EXISTS "company_size" TEXT,
ADD COLUMN IF NOT EXISTS "employees_range" TEXT;
