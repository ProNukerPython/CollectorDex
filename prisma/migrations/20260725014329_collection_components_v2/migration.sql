-- CreateEnum
CREATE TYPE "ComponentPresence" AS ENUM ('PRESENT', 'ABSENT', 'UNKNOWN', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "CompletenessDescriptor" AS ENUM ('COMPLETE', 'ALMOST_COMPLETE', 'PARTIAL', 'GAME_ONLY', 'NO_CHECKLIST');

-- Rename authenticity enum values (PostgreSQL 10+)
ALTER TYPE "Authenticity" RENAME VALUE 'PROBABLY_ORIGINAL' TO 'PROBABLY_AUTHENTIC';
ALTER TYPE "Authenticity" RENAME VALUE 'VERIFIED_ORIGINAL' TO 'VERIFIED_AUTHENTIC';

-- AlterTable edition_components
ALTER TABLE "edition_components" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "edition_components" ADD COLUMN "description" TEXT;

-- AlterTable owned_copies
ALTER TABLE "owned_copies" ADD COLUMN "estimatedValueCents" INTEGER;
ALTER TABLE "owned_copies" ADD COLUMN "serialNumber" TEXT;
ALTER TABLE "owned_copies" ADD COLUMN "completenessDescriptor" "CompletenessDescriptor" NOT NULL DEFAULT 'NO_CHECKLIST';
ALTER TABLE "owned_copies" ALTER COLUMN "completenessPercent" DROP NOT NULL;
ALTER TABLE "owned_copies" ALTER COLUMN "completenessPercent" DROP DEFAULT;
ALTER TABLE "owned_copies" ALTER COLUMN "isPrimary" SET DEFAULT false;

-- Migrate owned_copy_components.isPresent → presence
ALTER TABLE "owned_copy_components" ADD COLUMN "presence" "ComponentPresence" NOT NULL DEFAULT 'UNKNOWN';

UPDATE "owned_copy_components"
SET "presence" = CASE
  WHEN "isPresent" = true THEN 'PRESENT'::"ComponentPresence"
  ELSE 'ABSENT'::"ComponentPresence"
END;

ALTER TABLE "owned_copy_components" DROP COLUMN "isPresent";

-- Indexes
CREATE INDEX "owned_copies_userId_isPrimary_idx" ON "owned_copies"("userId", "isPrimary");

-- Partial unique index: at most one primary copy per user + edition
-- Documented here because Prisma cannot express partial unique indexes in schema.prisma.
CREATE UNIQUE INDEX "owned_copies_one_primary_per_user_edition"
ON "owned_copies" ("userId", "gameEditionId")
WHERE "isPrimary" = true;
