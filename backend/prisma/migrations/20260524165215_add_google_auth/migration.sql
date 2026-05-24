/*
  Warnings:

  - You are about to drop the `historique_actions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `journal_connexions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[google_id]` on the table `utilisateurs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "historique_actions" DROP CONSTRAINT "historique_actions_acteur_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_connexions" DROP CONSTRAINT "journal_connexions_utilisateur_id_fkey";

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "auth_provider" TEXT NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "google_id" TEXT,
ALTER COLUMN "mot_de_passe_hashe" DROP NOT NULL;

-- DropTable
DROP TABLE "historique_actions";

-- DropTable
DROP TABLE "journal_connexions";

-- DropEnum
DROP TYPE "TypeActionHistorique";

-- DropEnum
DROP TYPE "TypeConnexionLog";

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_google_id_key" ON "utilisateurs"("google_id");
