/*
  Warnings:

  - You are about to drop the column `est_valide_admin` on the `professionnels` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[admin_action_token]` on the table `utilisateurs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "professionnels" DROP COLUMN "est_valide_admin",
ADD COLUMN     "date_validation" TIMESTAMP(3),
ADD COLUMN     "est_valide" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "statut_validation" "StatutValidation" NOT NULL DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "utilisateurs" ALTER COLUMN "admin_action_token" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_admin_action_token_key" ON "utilisateurs"("admin_action_token");
