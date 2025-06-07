-- AlterTable
ALTER TABLE "users" ADD COLUMN     "backup_codes" TEXT[],
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "two_factor_secret" TEXT;
