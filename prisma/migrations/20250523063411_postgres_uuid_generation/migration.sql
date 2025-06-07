/*
  Warnings:

  - The `prompt_id` column on the `analytics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `improvement_suggestions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `improvement_suggestions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `version_id` column on the `improvement_suggestions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `prompt_evaluations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `prompt_evaluations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `version_id` column on the `prompt_evaluations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `prompt_outputs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `prompt_outputs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `version_id` column on the `prompt_outputs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `prompt_versions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `prompt_versions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `prompts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `prompts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `prompt_id` on the `favorites` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `prompt_id` on the `improvement_suggestions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `prompt_id` on the `prompt_evaluations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `prompt_id` on the `prompt_outputs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `prompt_id` on the `prompt_versions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "analytics" DROP CONSTRAINT "analytics_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "improvement_suggestions" DROP CONSTRAINT "improvement_suggestions_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "improvement_suggestions" DROP CONSTRAINT "improvement_suggestions_version_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_evaluations" DROP CONSTRAINT "prompt_evaluations_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_evaluations" DROP CONSTRAINT "prompt_evaluations_version_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_outputs" DROP CONSTRAINT "prompt_outputs_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_outputs" DROP CONSTRAINT "prompt_outputs_version_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_versions" DROP CONSTRAINT "prompt_versions_prompt_id_fkey";

-- AlterTable
ALTER TABLE "analytics" DROP COLUMN "prompt_id",
ADD COLUMN     "prompt_id" UUID;

-- AlterTable
ALTER TABLE "favorites" DROP COLUMN "prompt_id",
ADD COLUMN     "prompt_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "improvement_suggestions" DROP CONSTRAINT "improvement_suggestions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "prompt_id",
ADD COLUMN     "prompt_id" UUID NOT NULL,
DROP COLUMN "version_id",
ADD COLUMN     "version_id" UUID,
ADD CONSTRAINT "improvement_suggestions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "prompt_evaluations" DROP CONSTRAINT "prompt_evaluations_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "prompt_id",
ADD COLUMN     "prompt_id" UUID NOT NULL,
DROP COLUMN "version_id",
ADD COLUMN     "version_id" UUID,
ADD CONSTRAINT "prompt_evaluations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "prompt_outputs" DROP CONSTRAINT "prompt_outputs_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "prompt_id",
ADD COLUMN     "prompt_id" UUID NOT NULL,
DROP COLUMN "version_id",
ADD COLUMN     "version_id" UUID,
ADD CONSTRAINT "prompt_outputs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "prompt_versions" DROP CONSTRAINT "prompt_versions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "prompt_id",
ADD COLUMN     "prompt_id" UUID NOT NULL,
ADD CONSTRAINT "prompt_versions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "prompts" DROP CONSTRAINT "prompts_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "prompts_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_prompt_id_key" ON "favorites"("user_id", "prompt_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_versions_prompt_id_version_number_key" ON "prompt_versions"("prompt_id", "version_number");

-- AddForeignKey
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_evaluations" ADD CONSTRAINT "prompt_evaluations_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_evaluations" ADD CONSTRAINT "prompt_evaluations_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "prompt_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_outputs" ADD CONSTRAINT "prompt_outputs_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_outputs" ADD CONSTRAINT "prompt_outputs_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "prompt_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_suggestions" ADD CONSTRAINT "improvement_suggestions_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_suggestions" ADD CONSTRAINT "improvement_suggestions_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "prompt_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
