/*
  Warnings:

  - The primary key for the `journal_connexions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date_action` on the `journal_connexions` table. All the data in the column will be lost.
  - You are about to drop the column `email_tente` on the `journal_connexions` table. All the data in the column will be lost.
  - You are about to drop the column `id_log` on the `journal_connexions` table. All the data in the column will be lost.
  - You are about to drop the column `ip` on the `journal_connexions` table. All the data in the column will be lost.
  - You are about to drop the column `raison_echec` on the `journal_connexions` table. All the data in the column will be lost.
  - You are about to drop the column `succes` on the `journal_connexions` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `journal_connexions` table. All the data in the column will be lost.
  - You are about to alter the column `user_agent` on the `journal_connexions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to drop the `historique_actions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `action` to the `journal_connexions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActionConnexion" AS ENUM ('LOGIN_REUSSI', 'LOGIN_ECHOUE', 'DECONNEXION');

-- CreateEnum
CREATE TYPE "RaisonEchec" AS ENUM ('MOT_DE_PASSE_INCORRECT', 'EMAIL_INEXISTANT', 'EMAIL_NON_VERIFIE', 'COMPTE_INACTIF');

-- DropForeignKey
ALTER TABLE "historique_actions" DROP CONSTRAINT "historique_actions_acteur_id_fkey";

-- AlterTable
ALTER TABLE "journal_connexions" DROP CONSTRAINT "journal_connexions_pkey",
DROP COLUMN "date_action",
DROP COLUMN "email_tente",
DROP COLUMN "id_log",
DROP COLUMN "ip",
DROP COLUMN "raison_echec",
DROP COLUMN "succes",
DROP COLUMN "type",
ADD COLUMN     "action" "ActionConnexion" NOT NULL,
ADD COLUMN     "adresse_ip" VARCHAR(45),
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD COLUMN     "nom_complet" VARCHAR(200),
ADD COLUMN     "raison" "RaisonEchec",
ALTER COLUMN "user_agent" SET DATA TYPE VARCHAR(500),
ADD CONSTRAINT "journal_connexions_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "historique_actions";

-- DropEnum
DROP TYPE "TypeActionHistorique";

-- DropEnum
DROP TYPE "TypeConnexionLog";

-- CreateTable
CREATE TABLE "tokens_revoques" (
    "id" BIGSERIAL NOT NULL,
    "jti" VARCHAR(100) NOT NULL,
    "user_id" BIGINT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_revoques_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_revoques_jti_key" ON "tokens_revoques"("jti");

-- CreateIndex
CREATE INDEX "tokens_revoques_expires_at_idx" ON "tokens_revoques"("expires_at");

-- CreateIndex
CREATE INDEX "journal_connexions_action_idx" ON "journal_connexions"("action");

-- CreateIndex
CREATE INDEX "journal_connexions_adresse_ip_idx" ON "journal_connexions"("adresse_ip");

-- CreateIndex
CREATE INDEX "journal_connexions_date_idx" ON "journal_connexions"("date");
