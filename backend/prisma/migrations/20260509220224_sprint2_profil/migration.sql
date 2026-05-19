/*
  Warnings:

  - The values [SOFT] on the enum `CategorieCompetence` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `id_etudiant` on the `postes` table. All the data in the column will be lost.
  - You are about to drop the column `email_professionnel` on the `professeurs` table. All the data in the column will be lost.
  - You are about to drop the column `telephone` on the `professeurs` table. All the data in the column will be lost.
  - The primary key for the `profil_badge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_profil` on the `profil_badge` table. All the data in the column will be lost.
  - The primary key for the `profil_competence` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_profil` on the `profil_competence` table. All the data in the column will be lost.
  - You are about to drop the column `date_naissance` on the `profils` table. All the data in the column will be lost.
  - You are about to drop the column `objectif_professionnel` on the `profils` table. All the data in the column will be lost.
  - You are about to drop the column `id_profil` on the `recommandations` table. All the data in the column will be lost.
  - You are about to drop the column `id_profil` on the `scores_credibilite` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `utilisateurs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_etudiant]` on the table `scores_credibilite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_auteur` to the `postes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_etudiant` to the `profil_badge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_etudiant` to the `profil_competence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_etudiant_cible` to the `recommandations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_etudiant` to the `scores_credibilite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CategorieCompetence_new" AS ENUM ('TECHNIQUE', 'COMPORTEMENTALE');
ALTER TABLE "competences" ALTER COLUMN "categorie" TYPE "CategorieCompetence_new" USING ("categorie"::text::"CategorieCompetence_new");
ALTER TYPE "CategorieCompetence" RENAME TO "CategorieCompetence_old";
ALTER TYPE "CategorieCompetence_new" RENAME TO "CategorieCompetence";
DROP TYPE "public"."CategorieCompetence_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "lettres_recommandation" DROP CONSTRAINT "lettres_recommandation_id_professeur_fkey";

-- DropForeignKey
ALTER TABLE "postes" DROP CONSTRAINT "postes_id_etudiant_fkey";

-- DropForeignKey
ALTER TABLE "profil_badge" DROP CONSTRAINT "profil_badge_id_profil_fkey";

-- DropForeignKey
ALTER TABLE "profil_competence" DROP CONSTRAINT "profil_competence_id_profil_fkey";

-- DropForeignKey
ALTER TABLE "profils" DROP CONSTRAINT "profils_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "recommandations" DROP CONSTRAINT "recommandations_id_profil_fkey";

-- DropForeignKey
ALTER TABLE "scores_credibilite" DROP CONSTRAINT "scores_credibilite_id_profil_fkey";

-- DropIndex
DROP INDEX "scores_credibilite_id_profil_key";

-- AlterTable
ALTER TABLE "etudiants" ADD COLUMN     "date_naissance" DATE;

-- AlterTable
ALTER TABLE "lettres_recommandation" ALTER COLUMN "id_professeur" DROP NOT NULL;

-- AlterTable
ALTER TABLE "postes" DROP COLUMN "id_etudiant",
ADD COLUMN     "id_auteur" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "professeurs" DROP COLUMN "email_professionnel",
DROP COLUMN "telephone";

-- AlterTable
ALTER TABLE "profil_badge" DROP CONSTRAINT "profil_badge_pkey",
DROP COLUMN "id_profil",
ADD COLUMN     "id_etudiant" BIGINT NOT NULL,
ADD CONSTRAINT "profil_badge_pkey" PRIMARY KEY ("id_etudiant", "id_badge");

-- AlterTable
ALTER TABLE "profil_competence" DROP CONSTRAINT "profil_competence_pkey",
DROP COLUMN "id_profil",
ADD COLUMN     "id_etudiant" BIGINT NOT NULL,
ADD CONSTRAINT "profil_competence_pkey" PRIMARY KEY ("id_etudiant", "id_competence");

-- AlterTable
ALTER TABLE "profils" DROP COLUMN "date_naissance",
DROP COLUMN "objectif_professionnel",
ADD COLUMN     "email_professionnel" VARCHAR(255);

-- AlterTable
ALTER TABLE "recommandations" DROP COLUMN "id_profil",
ADD COLUMN     "id_etudiant_cible" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "scores_credibilite" DROP COLUMN "id_profil",
ADD COLUMN     "id_etudiant" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "utilisateurs" DROP COLUMN "bio";

-- CreateIndex
CREATE UNIQUE INDEX "scores_credibilite_id_etudiant_key" ON "scores_credibilite"("id_etudiant");

-- AddForeignKey
ALTER TABLE "profils" ADD CONSTRAINT "profils_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_competence" ADD CONSTRAINT "profil_competence_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_recommandation" ADD CONSTRAINT "lettres_recommandation_id_professeur_fkey" FOREIGN KEY ("id_professeur") REFERENCES "professeurs"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores_credibilite" ADD CONSTRAINT "scores_credibilite_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommandations" ADD CONSTRAINT "recommandations_id_etudiant_cible_fkey" FOREIGN KEY ("id_etudiant_cible") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_badge" ADD CONSTRAINT "profil_badge_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postes" ADD CONSTRAINT "postes_id_auteur_fkey" FOREIGN KEY ("id_auteur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TYPE "niveau_acces" RENAME TO "NiveauAcces";