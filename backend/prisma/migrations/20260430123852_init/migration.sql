/*
  Warnings:

  - You are about to drop the column `createdAt` on the `depot_github` table. All the data in the column will be lost.
  - You are about to drop the column `id_utilisateur` on the `depot_github` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `depot_github` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `projet_technologie` table. All the data in the column will be lost.
  - The primary key for the `regle_badge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `regle_badge` table. All the data in the column will be lost.
  - You are about to drop the column `id_nom` on the `regle_badge` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `regle_badge` table. All the data in the column will be lost.
  - You are about to drop the `activites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attestations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `badges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `commentaires` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `competences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `competences_comportementales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `competences_techniques` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `diplomes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `elements_valides` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `etudiants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `github_integrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lettres_recommandation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `portfolios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `preferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `professeurs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profils` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recommendations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scores_credibilite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `technologies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `utilisateur_badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `utilisateur_competence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `utilisateurs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('ETUDIANT', 'PROFESSEUR', 'PROFESSIONNEL', 'ADMINISTRATEUR');

-- CreateEnum
CREATE TYPE "StatutValidation" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REFUSE');

-- CreateEnum
CREATE TYPE "NiveauCompetence" AS ENUM ('DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT');

-- CreateEnum
CREATE TYPE "TypeCompetence" AS ENUM ('TECHNIQUE', 'COMPORTEMENTALE');

-- CreateEnum
CREATE TYPE "NiveauCredibilite" AS ENUM ('DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT');

-- DropForeignKey
ALTER TABLE "attestations" DROP CONSTRAINT "attestations_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "badges" DROP CONSTRAINT "badges_id_regle_fkey";

-- DropForeignKey
ALTER TABLE "commentaires" DROP CONSTRAINT "commentaires_id_projet_fkey";

-- DropForeignKey
ALTER TABLE "commentaires" DROP CONSTRAINT "commentaires_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "depot_github" DROP CONSTRAINT "depot_github_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "diplomes" DROP CONSTRAINT "diplomes_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "etudiants" DROP CONSTRAINT "etudiants_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "github_integrations" DROP CONSTRAINT "github_integrations_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "lettres_recommandation" DROP CONSTRAINT "lettres_recommandation_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_id_projet_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "portfolios" DROP CONSTRAINT "portfolios_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "preferences" DROP CONSTRAINT "preferences_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "professeurs" DROP CONSTRAINT "professeurs_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "profils" DROP CONSTRAINT "profils_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "projet_technologie" DROP CONSTRAINT "projet_technologie_id_projet_fkey";

-- DropForeignKey
ALTER TABLE "projet_technologie" DROP CONSTRAINT "projet_technologie_id_technologie_fkey";

-- DropForeignKey
ALTER TABLE "projets" DROP CONSTRAINT "projets_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "scores_credibilite" DROP CONSTRAINT "scores_credibilite_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "stages" DROP CONSTRAINT "stages_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "utilisateur_badge" DROP CONSTRAINT "utilisateur_badge_id_badge_fkey";

-- DropForeignKey
ALTER TABLE "utilisateur_badge" DROP CONSTRAINT "utilisateur_badge_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "utilisateur_competence" DROP CONSTRAINT "utilisateur_competence_id_competence_fkey";

-- DropForeignKey
ALTER TABLE "utilisateur_competence" DROP CONSTRAINT "utilisateur_competence_id_utilisateur_fkey";

-- AlterTable
ALTER TABLE "depot_github" DROP COLUMN "createdAt",
DROP COLUMN "id_utilisateur",
DROP COLUMN "updatedAt",
ADD COLUMN     "id_integration" INTEGER,
ALTER COLUMN "nom_depot" DROP NOT NULL;

-- AlterTable
ALTER TABLE "projet_technologie" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "regle_badge" DROP CONSTRAINT "regle_badge_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id_nom",
DROP COLUMN "updatedAt",
ADD COLUMN     "id_regle" SERIAL NOT NULL,
ALTER COLUMN "nom" DROP NOT NULL,
ADD CONSTRAINT "regle_badge_pkey" PRIMARY KEY ("id_regle");

-- DropTable
DROP TABLE "activites";

-- DropTable
DROP TABLE "attestations";

-- DropTable
DROP TABLE "badges";

-- DropTable
DROP TABLE "commentaires";

-- DropTable
DROP TABLE "competences";

-- DropTable
DROP TABLE "competences_comportementales";

-- DropTable
DROP TABLE "competences_techniques";

-- DropTable
DROP TABLE "diplomes";

-- DropTable
DROP TABLE "elements_valides";

-- DropTable
DROP TABLE "etudiants";

-- DropTable
DROP TABLE "github_integrations";

-- DropTable
DROP TABLE "lettres_recommandation";

-- DropTable
DROP TABLE "notes";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "portfolios";

-- DropTable
DROP TABLE "preferences";

-- DropTable
DROP TABLE "professeurs";

-- DropTable
DROP TABLE "profils";

-- DropTable
DROP TABLE "projets";

-- DropTable
DROP TABLE "recommendations";

-- DropTable
DROP TABLE "scores_credibilite";

-- DropTable
DROP TABLE "stages";

-- DropTable
DROP TABLE "technologies";

-- DropTable
DROP TABLE "utilisateur_badge";

-- DropTable
DROP TABLE "utilisateur_competence";

-- DropTable
DROP TABLE "utilisateurs";

-- CreateTable
CREATE TABLE "utilisateur" (
    "id_utilisateur" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe_hashe" TEXT NOT NULL,
    "role" "RoleUtilisateur" NOT NULL,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "est_valide" BOOLEAN NOT NULL DEFAULT false,
    "email_verifie" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "derniere_connexion" TIMESTAMP(3),

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "administrateur" (
    "id_utilisateur" INTEGER NOT NULL,

    CONSTRAINT "administrateur_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "professionnel" (
    "id_utilisateur" INTEGER NOT NULL,
    "entreprise" TEXT,
    "poste" TEXT,
    "email_professionnel" TEXT,
    "secteur" TEXT,
    "date_validation" TIMESTAMP(3),

    CONSTRAINT "professionnel_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "professeur" (
    "id_utilisateur" INTEGER NOT NULL,
    "code_administratif" TEXT,
    "departement" TEXT,
    "specialite" TEXT,
    "telephone" TEXT,

    CONSTRAINT "professeur_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "etudiant" (
    "id_utilisateur" INTEGER NOT NULL,
    "numero_etudiant" TEXT,
    "annee_universitaire" TEXT,
    "filiere" TEXT,

    CONSTRAINT "etudiant_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "profil" (
    "id_profil" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "photo_profil" TEXT,
    "telephone" TEXT,
    "ville" TEXT,
    "date_naissance" TIMESTAMP(3),
    "pays" TEXT,
    "bio" TEXT,
    "objectif_professionnel" TEXT,
    "linkedin_url" TEXT,

    CONSTRAINT "profil_pkey" PRIMARY KEY ("id_profil")
);

-- CreateTable
CREATE TABLE "portfolio" (
    "id_portfolio" SERIAL NOT NULL,
    "id_profil" INTEGER NOT NULL,
    "titre" TEXT,
    "objectif" TEXT,
    "theme" TEXT,
    "est_public" BOOLEAN NOT NULL DEFAULT false,
    "nombre_vues" INTEGER NOT NULL DEFAULT 0,
    "dates_modification" TIMESTAMP(3),
    "date_export" TIMESTAMP(3),

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id_portfolio")
);

-- CreateTable
CREATE TABLE "score_credibilite" (
    "scoreID" SERIAL NOT NULL,
    "id_portfolio" INTEGER NOT NULL,
    "score_totale" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score_projet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score_attestat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score_recommandation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score_certification" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score_stage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "niveau" "NiveauCredibilite",

    CONSTRAINT "score_credibilite_pkey" PRIMARY KEY ("scoreID")
);

-- CreateTable
CREATE TABLE "element_validable" (
    "id_element" SERIAL NOT NULL,
    "statut" "StatutValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_soumission" TIMESTAMP(3),
    "date_validation" TIMESTAMP(3),

    CONSTRAINT "element_validable_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "projet" (
    "id_element" INTEGER NOT NULL,
    "titre" TEXT,
    "description" TEXT,
    "type" TEXT,
    "role" TEXT,
    "url_github" TEXT,
    "url_youtube" TEXT,
    "resultats" TEXT,
    "statut" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "appreciation_professeur" TEXT,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "est_dans_portfolio" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "projet_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "projet_etudiant" (
    "id_projet" INTEGER NOT NULL,
    "id_etudiant" INTEGER NOT NULL,

    CONSTRAINT "projet_etudiant_pkey" PRIMARY KEY ("id_projet","id_etudiant")
);

-- CreateTable
CREATE TABLE "stage" (
    "id_element" INTEGER NOT NULL,
    "entreprise" TEXT,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "duree_semaines" INTEGER,
    "missions" TEXT,
    "statut" TEXT,
    "url_rapport" TEXT,
    "id_etudiant" INTEGER,

    CONSTRAINT "stage_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "attestation" (
    "id_element" INTEGER NOT NULL,
    "titre" TEXT,
    "type" TEXT,
    "date_obtention" TIMESTAMP(3),
    "organisme" TEXT,
    "description" TEXT,

    CONSTRAINT "attestation_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "lettre_recommandation" (
    "id_element" INTEGER NOT NULL,
    "type" TEXT,
    "contenu" TEXT,
    "url_fichier" TEXT,
    "id_recommandation" INTEGER,

    CONSTRAINT "lettre_recommandation_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "notification" (
    "id_notification" SERIAL NOT NULL,
    "type" TEXT,
    "message" TEXT,
    "est_lu" BOOLEAN NOT NULL DEFAULT false,
    "canal_envoi" TEXT,
    "date_reception" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cible_id" INTEGER,
    "cible_type" TEXT,
    "id_utilisateur" INTEGER NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "diplome" (
    "id_diplome" SERIAL NOT NULL,
    "titre_diplome" TEXT,
    "domaine" TEXT,
    "annee_debut" INTEGER,
    "annee_fin" INTEGER,
    "description" TEXT,
    "etablissement" TEXT,
    "id_utilisateur" INTEGER NOT NULL,

    CONSTRAINT "diplome_pkey" PRIMARY KEY ("id_diplome")
);

-- CreateTable
CREATE TABLE "competence" (
    "id_competence" SERIAL NOT NULL,
    "nom" TEXT,
    "description" TEXT,
    "niveau" "NiveauCompetence",
    "type" "TypeCompetence",
    "categorie" TEXT,
    "id_utilisateur" INTEGER NOT NULL,

    CONSTRAINT "competence_pkey" PRIMARY KEY ("id_competence")
);

-- CreateTable
CREATE TABLE "activite" (
    "id_element" SERIAL NOT NULL,
    "titre" TEXT,
    "type" TEXT,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "url_attestation" TEXT,
    "date_validation" TIMESTAMP(3),
    "est_visible" BOOLEAN NOT NULL DEFAULT true,
    "id_utilisateur" INTEGER NOT NULL,

    CONSTRAINT "activite_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "badge" (
    "id_badge" SERIAL NOT NULL,
    "nom" TEXT,
    "description" TEXT,
    "categorie" TEXT,
    "date_attribution" TIMESTAMP(3),
    "icon_url" TEXT,
    "critere_type" TEXT,
    "id_profil" INTEGER,
    "id_regle" INTEGER,

    CONSTRAINT "badge_pkey" PRIMARY KEY ("id_badge")
);

-- CreateTable
CREATE TABLE "recommandation" (
    "id_recommandation" SERIAL NOT NULL,
    "type" TEXT,
    "contenu" TEXT,
    "url_fichier" TEXT,
    "statut" TEXT,
    "visibilite" TEXT,
    "id_utilisateur" INTEGER,
    "id_professionnel" INTEGER,

    CONSTRAINT "recommandation_pkey" PRIMARY KEY ("id_recommandation")
);

-- CreateTable
CREATE TABLE "technologie" (
    "id_technologie" SERIAL NOT NULL,
    "nom" TEXT,
    "description" TEXT,
    "est_valide" BOOLEAN NOT NULL DEFAULT true,
    "categorie" TEXT,

    CONSTRAINT "technologie_pkey" PRIMARY KEY ("id_technologie")
);

-- CreateTable
CREATE TABLE "commentaire" (
    "id_commentaire" SERIAL NOT NULL,
    "contenu" TEXT,
    "statut" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_profil" INTEGER,

    CONSTRAINT "commentaire_pkey" PRIMARY KEY ("id_commentaire")
);

-- CreateTable
CREATE TABLE "github_integration" (
    "id_integration" SERIAL NOT NULL,
    "id_portfolio" INTEGER NOT NULL,
    "github_username" TEXT,
    "access_token" TEXT,
    "total_depot" INTEGER NOT NULL DEFAULT 0,
    "date_synchronisation" TIMESTAMP(3),

    CONSTRAINT "github_integration_pkey" PRIMARY KEY ("id_integration")
);

-- CreateTable
CREATE TABLE "poste" (
    "id_poste" SERIAL NOT NULL,
    "date_publication" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visibilite" TEXT,
    "description" TEXT,
    "id_depot" INTEGER,

    CONSTRAINT "poste_pkey" PRIMARY KEY ("id_poste")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professeur_code_administratif_key" ON "professeur"("code_administratif");

-- CreateIndex
CREATE UNIQUE INDEX "etudiant_numero_etudiant_key" ON "etudiant"("numero_etudiant");

-- CreateIndex
CREATE UNIQUE INDEX "profil_id_utilisateur_key" ON "profil"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_id_profil_key" ON "portfolio"("id_profil");

-- CreateIndex
CREATE UNIQUE INDEX "score_credibilite_id_portfolio_key" ON "score_credibilite"("id_portfolio");

-- CreateIndex
CREATE UNIQUE INDEX "github_integration_id_portfolio_key" ON "github_integration"("id_portfolio");

-- AddForeignKey
ALTER TABLE "administrateur" ADD CONSTRAINT "administrateur_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionnel" ADD CONSTRAINT "professionnel_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professeur" ADD CONSTRAINT "professeur_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiant" ADD CONSTRAINT "etudiant_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil" ADD CONSTRAINT "profil_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "etudiant"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_id_profil_fkey" FOREIGN KEY ("id_profil") REFERENCES "profil"("id_profil") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_credibilite" ADD CONSTRAINT "score_credibilite_id_portfolio_fkey" FOREIGN KEY ("id_portfolio") REFERENCES "portfolio"("id_portfolio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projet" ADD CONSTRAINT "projet_id_element_fkey" FOREIGN KEY ("id_element") REFERENCES "element_validable"("id_element") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projet_etudiant" ADD CONSTRAINT "projet_etudiant_id_projet_fkey" FOREIGN KEY ("id_projet") REFERENCES "projet"("id_element") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projet_etudiant" ADD CONSTRAINT "projet_etudiant_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiant"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage" ADD CONSTRAINT "stage_id_element_fkey" FOREIGN KEY ("id_element") REFERENCES "element_validable"("id_element") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage" ADD CONSTRAINT "stage_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiant"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attestation" ADD CONSTRAINT "attestation_id_element_fkey" FOREIGN KEY ("id_element") REFERENCES "element_validable"("id_element") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettre_recommandation" ADD CONSTRAINT "lettre_recommandation_id_element_fkey" FOREIGN KEY ("id_element") REFERENCES "element_validable"("id_element") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettre_recommandation" ADD CONSTRAINT "lettre_recommandation_id_recommandation_fkey" FOREIGN KEY ("id_recommandation") REFERENCES "recommandation"("id_recommandation") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diplome" ADD CONSTRAINT "diplome_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence" ADD CONSTRAINT "competence_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activite" ADD CONSTRAINT "activite_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge" ADD CONSTRAINT "badge_id_profil_fkey" FOREIGN KEY ("id_profil") REFERENCES "profil"("id_profil") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge" ADD CONSTRAINT "badge_id_regle_fkey" FOREIGN KEY ("id_regle") REFERENCES "regle_badge"("id_regle") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommandation" ADD CONSTRAINT "recommandation_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommandation" ADD CONSTRAINT "recommandation_id_professionnel_fkey" FOREIGN KEY ("id_professionnel") REFERENCES "professionnel"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projet_technologie" ADD CONSTRAINT "projet_technologie_id_projet_fkey" FOREIGN KEY ("id_projet") REFERENCES "projet"("id_element") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projet_technologie" ADD CONSTRAINT "projet_technologie_id_technologie_fkey" FOREIGN KEY ("id_technologie") REFERENCES "technologie"("id_technologie") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaire" ADD CONSTRAINT "commentaire_id_profil_fkey" FOREIGN KEY ("id_profil") REFERENCES "profil"("id_profil") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_integration" ADD CONSTRAINT "github_integration_id_portfolio_fkey" FOREIGN KEY ("id_portfolio") REFERENCES "portfolio"("id_portfolio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depot_github" ADD CONSTRAINT "depot_github_id_integration_fkey" FOREIGN KEY ("id_integration") REFERENCES "github_integration"("id_integration") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poste" ADD CONSTRAINT "poste_id_depot_fkey" FOREIGN KEY ("id_depot") REFERENCES "depot_github"("id_depot") ON DELETE SET NULL ON UPDATE CASCADE;
