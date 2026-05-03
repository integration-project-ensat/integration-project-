/*
  Warnings:

  - The primary key for the `github_integration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_portfolio` on the `github_integration` table. All the data in the column will be lost.
  - You are about to alter the column `github_username` on the `github_integration` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The primary key for the `projet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `appreciation_professeur` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `date_debut` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `date_fin` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `est_dans_portfolio` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `id_element` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `resultats` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `titre` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `url_github` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `url_youtube` on the `projet` table. All the data in the column will be lost.
  - You are about to drop the column `visible` on the `projet` table. All the data in the column will be lost.
  - The primary key for the `projet_technologie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `activite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `administrateur` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attestation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `commentaire` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `competence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `depot_github` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `diplome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `element_validable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `etudiant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lettre_recommandation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `portfolio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `poste` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `professeur` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `professionnel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profil` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projet_etudiant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recommandation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `regle_badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `score_credibilite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `technologie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `utilisateur` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id_etudiant]` on the table `github_integration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_etudiant` to the `github_integration` table without a default value. This is not possible if the table is not empty.
  - Made the column `github_username` on table `github_integration` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `nom` to the `projet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('SOUMISSION_PROJET', 'VALIDATION_PROJET', 'REFUS_PROJET', 'NOUVEAU_COMMENTAIRE', 'NOUVELLE_RECOMMANDATION', 'VALIDATION_ATTESTATION', 'BADGE_OBTENU');

-- CreateEnum
CREATE TYPE "Visibilite" AS ENUM ('PUBLIC', 'PRIVE', 'ENSEIGNANTS', 'LIEN_PARTAGE');

-- CreateEnum
CREATE TYPE "CategorieCompetence" AS ENUM ('TECHNIQUE', 'SOFT');

-- CreateEnum
CREATE TYPE "TypeProjet" AS ENUM ('MODULE', 'INTEGRATION', 'HACKATHON', 'PERSONNEL', 'STAGE');

-- CreateEnum
CREATE TYPE "CanalNotification" AS ENUM ('APPLICATION', 'EMAIL');

-- CreateEnum
CREATE TYPE "TypeActivite" AS ENUM ('CLUB', 'EVENEMENT', 'HACKATHON', 'COMPETITION', 'ASSOCIATION');

-- CreateEnum
CREATE TYPE "StatutActivite" AS ENUM ('DECLAREE', 'ATTESTEE_INSTITUTION');

-- CreateEnum
CREATE TYPE "MotifLettre" AS ENUM ('DOUBLE_DIPLOME', 'MASTER', 'EMPLOI', 'STAGE', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "StatutLettre" AS ENUM ('EN_ATTENTE', 'REDIGEE');

-- CreateEnum
CREATE TYPE "VisibiliteLettre" AS ENUM ('PUBLIC', 'PRIVE', 'TELECHARGEABLE');

-- CreateEnum
CREATE TYPE "TypeElementValidable" AS ENUM ('PROJET', 'STAGE', 'ACTIVITE', 'ATTESTATION');

-- CreateEnum
CREATE TYPE "ObjectifProfessionnel" AS ENUM ('DEV_WEB', 'DEVOPS', 'DATA_SCIENCE', 'CYBERSECURITE', 'AUTRE');

-- CreateEnum
CREATE TYPE "RoleAuteur" AS ENUM ('ETUDIANT', 'PROFESSEUR', 'PROFESSIONNEL');

-- CreateEnum
CREATE TYPE "FormatExport" AS ENUM ('PDF', 'WEB', 'LIEN_PUBLIC');

-- CreateEnum
CREATE TYPE "TypeContrat" AS ENUM ('CDI', 'CDD', 'STAGE', 'ALTERNANCE', 'FREELANCE', 'EMPLOI_ETUDIANT', 'BENEVOLAT');

-- CreateEnum
CREATE TYPE "CritereBadgeType" AS ENUM ('WEB_DEV', 'DEVOPS', 'DATA', 'SECURITE', 'HACKATHON', 'COLLAB');

-- CreateEnum
CREATE TYPE "CritereScore" AS ENUM ('PROJETS', 'GITHUB', 'STAGES', 'RECOMMANDATIONS', 'CERTIFICATIONS', 'COMPLETUDE');

-- CreateEnum
CREATE TYPE "TypeReaction" AS ENUM ('JAIME', 'BRAVO', 'LIKE');

-- AlterEnum
ALTER TYPE "StatutValidation" ADD VALUE 'CORRECTION_DEMANDEE';

-- DropForeignKey
ALTER TABLE "activite" DROP CONSTRAINT "activite_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "administrateur" DROP CONSTRAINT "administrateur_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "attestation" DROP CONSTRAINT "attestation_id_element_fkey";

-- DropForeignKey
ALTER TABLE "badge" DROP CONSTRAINT "badge_id_profil_fkey";

-- DropForeignKey
ALTER TABLE "badge" DROP CONSTRAINT "badge_id_regle_fkey";

-- DropForeignKey
ALTER TABLE "commentaire" DROP CONSTRAINT "commentaire_id_profil_fkey";

-- DropForeignKey
ALTER TABLE "competence" DROP CONSTRAINT "competence_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "depot_github" DROP CONSTRAINT "depot_github_id_integration_fkey";

-- DropForeignKey
ALTER TABLE "diplome" DROP CONSTRAINT "diplome_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "etudiant" DROP CONSTRAINT "etudiant_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "github_integration" DROP CONSTRAINT "github_integration_id_portfolio_fkey";

-- DropForeignKey
ALTER TABLE "lettre_recommandation" DROP CONSTRAINT "lettre_recommandation_id_element_fkey";

-- DropForeignKey
ALTER TABLE "lettre_recommandation" DROP CONSTRAINT "lettre_recommandation_id_recommandation_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "portfolio" DROP CONSTRAINT "portfolio_id_profil_fkey";

-- DropForeignKey
ALTER TABLE "poste" DROP CONSTRAINT "poste_id_depot_fkey";

-- DropForeignKey
ALTER TABLE "professeur" DROP CONSTRAINT "professeur_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "professionnel" DROP CONSTRAINT "professionnel_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "profil" DROP CONSTRAINT "profil_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "projet" DROP CONSTRAINT "projet_id_element_fkey";

-- DropForeignKey
ALTER TABLE "projet_etudiant" DROP CONSTRAINT "projet_etudiant_id_etudiant_fkey";

-- DropForeignKey
ALTER TABLE "projet_etudiant" DROP CONSTRAINT "projet_etudiant_id_projet_fkey";

-- DropForeignKey
ALTER TABLE "projet_technologie" DROP CONSTRAINT "projet_technologie_id_projet_fkey";

-- DropForeignKey
ALTER TABLE "projet_technologie" DROP CONSTRAINT "projet_technologie_id_technologie_fkey";

-- DropForeignKey
ALTER TABLE "recommandation" DROP CONSTRAINT "recommandation_id_professionnel_fkey";

-- DropForeignKey
ALTER TABLE "recommandation" DROP CONSTRAINT "recommandation_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "score_credibilite" DROP CONSTRAINT "score_credibilite_id_portfolio_fkey";

-- DropForeignKey
ALTER TABLE "stage" DROP CONSTRAINT "stage_id_element_fkey";

-- DropForeignKey
ALTER TABLE "stage" DROP CONSTRAINT "stage_id_etudiant_fkey";

-- DropIndex
DROP INDEX "github_integration_id_portfolio_key";

-- AlterTable
ALTER TABLE "github_integration" DROP CONSTRAINT "github_integration_pkey",
DROP COLUMN "id_portfolio",
ADD COLUMN     "est_actif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "id_etudiant" BIGINT NOT NULL,
ALTER COLUMN "id_integration" SET DATA TYPE BIGSERIAL,
ALTER COLUMN "github_username" SET NOT NULL,
ALTER COLUMN "github_username" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "github_integration_pkey" PRIMARY KEY ("id_integration");

-- AlterTable
ALTER TABLE "projet" DROP CONSTRAINT "projet_pkey",
DROP COLUMN "appreciation_professeur",
DROP COLUMN "date_debut",
DROP COLUMN "date_fin",
DROP COLUMN "description",
DROP COLUMN "est_dans_portfolio",
DROP COLUMN "id_element",
DROP COLUMN "resultats",
DROP COLUMN "role",
DROP COLUMN "statut",
DROP COLUMN "titre",
DROP COLUMN "type",
DROP COLUMN "url_github",
DROP COLUMN "url_youtube",
DROP COLUMN "visible",
ADD COLUMN     "categorie" "CategorieCompetence",
ADD COLUMN     "id_competence" BIGSERIAL NOT NULL,
ADD COLUMN     "niveau" "NiveauCompetence",
ADD COLUMN     "nom" VARCHAR(100) NOT NULL,
ADD CONSTRAINT "projet_pkey" PRIMARY KEY ("id_competence");

-- AlterTable
ALTER TABLE "projet_technologie" DROP CONSTRAINT "projet_technologie_pkey",
ALTER COLUMN "id_projet" SET DATA TYPE BIGINT,
ALTER COLUMN "id_technologie" SET DATA TYPE BIGINT,
ADD CONSTRAINT "projet_technologie_pkey" PRIMARY KEY ("id_projet", "id_technologie");

-- DropTable
DROP TABLE "activite";

-- DropTable
DROP TABLE "administrateur";

-- DropTable
DROP TABLE "attestation";

-- DropTable
DROP TABLE "badge";

-- DropTable
DROP TABLE "commentaire";

-- DropTable
DROP TABLE "competence";

-- DropTable
DROP TABLE "depot_github";

-- DropTable
DROP TABLE "diplome";

-- DropTable
DROP TABLE "element_validable";

-- DropTable
DROP TABLE "etudiant";

-- DropTable
DROP TABLE "lettre_recommandation";

-- DropTable
DROP TABLE "notification";

-- DropTable
DROP TABLE "portfolio";

-- DropTable
DROP TABLE "poste";

-- DropTable
DROP TABLE "professeur";

-- DropTable
DROP TABLE "professionnel";

-- DropTable
DROP TABLE "profil";

-- DropTable
DROP TABLE "projet_etudiant";

-- DropTable
DROP TABLE "recommandation";

-- DropTable
DROP TABLE "regle_badge";

-- DropTable
DROP TABLE "score_credibilite";

-- DropTable
DROP TABLE "stage";

-- DropTable
DROP TABLE "technologie";

-- DropTable
DROP TABLE "utilisateur";

-- DropEnum
DROP TYPE "TypeCompetence";

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id_utilisateur" BIGSERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mot_de_passe_hashe" TEXT NOT NULL,
    "role" "RoleUtilisateur" NOT NULL,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "est_valide" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "derniere_connexion" TIMESTAMP(3),
    "email_verifie" BOOLEAN NOT NULL DEFAULT false,
    "token_verification" VARCHAR(255),
    "token_expires_at" TIMESTAMP(3),

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "etudiants" (
    "id_utilisateur" BIGINT NOT NULL,
    "numero_etudiant" VARCHAR(20),
    "filiere" VARCHAR(100),
    "annee_universitaire" VARCHAR(9),

    CONSTRAINT "etudiants_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "professeurs" (
    "id_utilisateur" BIGINT NOT NULL,
    "departement" VARCHAR(100),
    "specialite" VARCHAR(100),
    "titre" VARCHAR(100),
    "email_professionnel" VARCHAR(255),
    "telephone" VARCHAR(20),

    CONSTRAINT "professeurs_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "administrateurs" (
    "id_utilisateur" BIGINT NOT NULL,
    "droits_admin" JSONB,
    "date_validation" TIMESTAMP(3),

    CONSTRAINT "administrateurs_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "professionnels" (
    "id_utilisateur" BIGINT NOT NULL,
    "entreprise" VARCHAR(150) NOT NULL,
    "poste" VARCHAR(150) NOT NULL,
    "est_valide_admin" BOOLEAN NOT NULL DEFAULT false,
    "justificatifs_url" TEXT,

    CONSTRAINT "professionnels_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id_notification" BIGSERIAL NOT NULL,
    "utilisateur_id" BIGINT NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "message" TEXT,
    "canal_envoi" "CanalNotification" NOT NULL DEFAULT 'APPLICATION',
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "date_reception" TIMESTAMP(3),
    "cible_id" BIGINT,
    "cible_type" VARCHAR(100),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "profils" (
    "id_profil" BIGSERIAL NOT NULL,
    "id_utilisateur" BIGINT NOT NULL,
    "photo_profil" VARCHAR(500),
    "telephone" VARCHAR(20),
    "date_naissance" DATE,
    "pays" VARCHAR(100),
    "objectif_professionnel" VARCHAR(100),
    "linkedin_url" TEXT,
    "bio" TEXT,
    "visibilite" "Visibilite" NOT NULL DEFAULT 'PUBLIC',

    CONSTRAINT "profils_pkey" PRIMARY KEY ("id_profil")
);

-- CreateTable
CREATE TABLE "profil_competence" (
    "id_profil" BIGINT NOT NULL,
    "id_competence" BIGINT NOT NULL,
    "niveau_maitrise" INTEGER,
    "date_ajout" DATE,

    CONSTRAINT "profil_competence_pkey" PRIMARY KEY ("id_profil","id_competence")
);

-- CreateTable
CREATE TABLE "diplomes" (
    "id_diplome" BIGSERIAL NOT NULL,
    "id_etudiant" BIGINT NOT NULL,
    "titre_diplome" VARCHAR(200) NOT NULL,
    "domaine" VARCHAR(200),
    "etablissement" VARCHAR(200),
    "annee_debut" INTEGER,
    "annee_fin" INTEGER,

    CONSTRAINT "diplomes_pkey" PRIMARY KEY ("id_diplome")
);

-- CreateTable
CREATE TABLE "projets" (
    "id_projet" BIGSERIAL NOT NULL,
    "id_etudiant" BIGINT NOT NULL,
    "id_professeur" BIGINT,
    "titre" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "type" "TypeProjet",
    "role" TEXT,
    "resultats" TEXT,
    "lien_github" VARCHAR(500),
    "captures" JSONB,
    "statut" "StatutValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "appreciation_professeur" TEXT,
    "est_dans_portfolio" BOOLEAN NOT NULL DEFAULT false,
    "visibilite" "Visibilite",

    CONSTRAINT "projets_pkey" PRIMARY KEY ("id_projet")
);

-- CreateTable
CREATE TABLE "technologies" (
    "id_technologie" BIGSERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "categorie" VARCHAR(50),
    "est_validee" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id_technologie")
);

-- CreateTable
CREATE TABLE "stages" (
    "id_stage" BIGSERIAL NOT NULL,
    "id_etudiant" BIGINT NOT NULL,
    "id_encadrant" BIGINT,
    "entreprise" VARCHAR(200) NOT NULL,
    "poste" VARCHAR(150),
    "duree_semaines" INTEGER,
    "missions" TEXT,
    "technologies" TEXT,
    "rapport_url" VARCHAR(500),
    "statut" "StatutValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_debut" DATE,
    "date_fin" DATE,
    "commentaire_prof" TEXT,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id_stage")
);

-- CreateTable
CREATE TABLE "activites_parascolaires" (
    "id_activite" BIGSERIAL NOT NULL,
    "id_etudiant" BIGINT NOT NULL,
    "id_validateur" BIGINT,
    "type" "TypeActivite",
    "nom" VARCHAR(200),
    "periode" VARCHAR(200),
    "description" TEXT,
    "justificatif_url" VARCHAR(500),
    "statut" "StatutActivite",

    CONSTRAINT "activites_parascolaires_pkey" PRIMARY KEY ("id_activite")
);

-- CreateTable
CREATE TABLE "lettres_recommandation" (
    "id_lettre" BIGSERIAL NOT NULL,
    "id_etudiant" BIGINT NOT NULL,
    "id_professeur" BIGINT NOT NULL,
    "motif" "MotifLettre",
    "date_souhaitee" DATE,
    "contenu" TEXT,
    "statut" "StatutLettre",
    "visibilite" "VisibiliteLettre",
    "url_fichier" VARCHAR(500),

    CONSTRAINT "lettres_recommandation_pkey" PRIMARY KEY ("id_lettre")
);

-- CreateTable
CREATE TABLE "elements_validables" (
    "id_element" BIGSERIAL NOT NULL,
    "type" "TypeElementValidable" NOT NULL,
    "reference_id" BIGINT NOT NULL,
    "statut" "StatutValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "validateur_id" BIGINT,
    "date_soumission" TIMESTAMP(3),
    "date_validation" TIMESTAMP(3),
    "motif_refus" TEXT,

    CONSTRAINT "elements_validables_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "attestations" (
    "id_attestation" BIGSERIAL NOT NULL,
    "id_element" BIGINT NOT NULL,
    "titre" VARCHAR(200),
    "type" VARCHAR(200),
    "date" DATE,
    "organisme" VARCHAR(200),
    "date_retention" DATE,
    "description" TEXT,

    CONSTRAINT "attestations_pkey" PRIMARY KEY ("id_attestation")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id_portfolio" BIGSERIAL NOT NULL,
    "id_etudiant" BIGINT NOT NULL,
    "id_modele" BIGINT,
    "titre" VARCHAR(200),
    "objectif_pro" "ObjectifProfessionnel",
    "theme" VARCHAR(50),
    "est_public" BOOLEAN NOT NULL DEFAULT false,
    "url_public" VARCHAR(500),
    "date_modification" TIMESTAMP(3),

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id_portfolio")
);

-- CreateTable
CREATE TABLE "modeles_portfolio" (
    "id_modele" BIGSERIAL NOT NULL,
    "cree_par_admin" BIGINT,
    "nom" VARCHAR(100) NOT NULL,
    "structure" JSONB,
    "theme" TEXT,
    "sections" TEXT,

    CONSTRAINT "modeles_portfolio_pkey" PRIMARY KEY ("id_modele")
);

-- CreateTable
CREATE TABLE "scores_credibilite" (
    "id_score" BIGSERIAL NOT NULL,
    "id_profil" BIGINT NOT NULL,
    "score_total" DECIMAL(5,2),
    "score_projets" DECIMAL(5,2),
    "score_github" DECIMAL(5,2),
    "score_stages" DECIMAL(5,2),
    "score_recommandations" DECIMAL(5,2),
    "score_certifications" DECIMAL(5,2),
    "score_completude" DECIMAL(5,2),
    "niveau" "NiveauCredibilite",

    CONSTRAINT "scores_credibilite_pkey" PRIMARY KEY ("id_score")
);

-- CreateTable
CREATE TABLE "commentaires" (
    "id_commentaire" BIGSERIAL NOT NULL,
    "id_auteur" BIGINT NOT NULL,
    "id_portfolio" BIGINT,
    "id_poste" BIGINT,
    "contenu" TEXT NOT NULL,
    "statut" "StatutValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "date" TIMESTAMP(3),

    CONSTRAINT "commentaires_pkey" PRIMARY KEY ("id_commentaire")
);

-- CreateTable
CREATE TABLE "recommandations" (
    "id_recommandation" BIGSERIAL NOT NULL,
    "id_auteur" BIGINT NOT NULL,
    "id_profil" BIGINT NOT NULL,
    "message" TEXT,
    "role_auteur" "RoleAuteur",
    "statut" "StatutValidation" NOT NULL DEFAULT 'EN_ATTENTE',

    CONSTRAINT "recommandations_pkey" PRIMARY KEY ("id_recommandation")
);

-- CreateTable
CREATE TABLE "portfolio_recommandation" (
    "id_portfolio" BIGINT NOT NULL,
    "id_recommandation" BIGINT NOT NULL,
    "position" INTEGER,
    "est_affichee" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "portfolio_recommandation_pkey" PRIMARY KEY ("id_portfolio","id_recommandation")
);

-- CreateTable
CREATE TABLE "badges" (
    "id_badge" BIGSERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icone_url" VARCHAR(500),
    "critere_type" "CritereBadgeType",
    "est_visible" BOOLEAN,
    "mis_en_avant" BOOLEAN,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id_badge")
);

-- CreateTable
CREATE TABLE "profil_badge" (
    "id_profil" BIGINT NOT NULL,
    "id_badge" BIGINT NOT NULL,
    "date_attribution" TIMESTAMP(3),
    "position" INTEGER,

    CONSTRAINT "profil_badge_pkey" PRIMARY KEY ("id_profil","id_badge")
);

-- CreateTable
CREATE TABLE "regles_badge" (
    "id_regle" BIGSERIAL NOT NULL,
    "id_badge" BIGINT NOT NULL,
    "criteres" JSONB NOT NULL,
    "seuils" JSONB,
    "est_valide" BOOLEAN,

    CONSTRAINT "regles_badge_pkey" PRIMARY KEY ("id_regle")
);

-- CreateTable
CREATE TABLE "regles_score_credibilite" (
    "id_regle_score" BIGSERIAL NOT NULL,
    "cree_par_admin" BIGINT,
    "critere" "CritereScore",
    "poids" DECIMAL(5,2),
    "seuil" JSONB,
    "est_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "regles_score_credibilite_pkey" PRIMARY KEY ("id_regle_score")
);

-- CreateTable
CREATE TABLE "depots_github" (
    "id_depot" BIGSERIAL NOT NULL,
    "id_integration" BIGINT NOT NULL,
    "nom_depot" VARCHAR(500) NOT NULL,
    "url_depot" VARCHAR(500) NOT NULL,
    "langages" JSONB,
    "nb_commits" INTEGER,
    "total_depots" INTEGER,
    "est_public" BOOLEAN,
    "date_creation" TIMESTAMP(3),
    "est_importe_portfolio" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "depots_github_pkey" PRIMARY KEY ("id_depot")
);

-- CreateTable
CREATE TABLE "postes" (
    "id_poste" BIGSERIAL NOT NULL,
    "id_etudiant" BIGINT NOT NULL,
    "contenu" TEXT NOT NULL,
    "visibilite" "Visibilite" NOT NULL DEFAULT 'PUBLIC',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postes_pkey" PRIMARY KEY ("id_poste")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id_reaction" BIGSERIAL NOT NULL,
    "id_auteur" BIGINT NOT NULL,
    "id_poste" BIGINT NOT NULL,
    "type" "TypeReaction" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id_reaction")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "etudiants_numero_etudiant_key" ON "etudiants"("numero_etudiant");

-- CreateIndex
CREATE UNIQUE INDEX "profils_id_utilisateur_key" ON "profils"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "technologies_nom_key" ON "technologies"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "attestations_id_element_key" ON "attestations"("id_element");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_id_etudiant_key" ON "portfolios"("id_etudiant");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_url_public_key" ON "portfolios"("url_public");

-- CreateIndex
CREATE UNIQUE INDEX "scores_credibilite_id_profil_key" ON "scores_credibilite"("id_profil");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_id_auteur_id_poste_key" ON "reactions"("id_auteur", "id_poste");

-- CreateIndex
CREATE UNIQUE INDEX "github_integration_id_etudiant_key" ON "github_integration"("id_etudiant");

-- AddForeignKey
ALTER TABLE "etudiants" ADD CONSTRAINT "etudiants_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professeurs" ADD CONSTRAINT "professeurs_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrateurs" ADD CONSTRAINT "administrateurs_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionnels" ADD CONSTRAINT "professionnels_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profils" ADD CONSTRAINT "profils_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_competence" ADD CONSTRAINT "profil_competence_id_profil_fkey" FOREIGN KEY ("id_profil") REFERENCES "profils"("id_profil") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_competence" ADD CONSTRAINT "profil_competence_id_competence_fkey" FOREIGN KEY ("id_competence") REFERENCES "projet"("id_competence") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diplomes" ADD CONSTRAINT "diplomes_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_id_professeur_fkey" FOREIGN KEY ("id_professeur") REFERENCES "professeurs"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projet_technologie" ADD CONSTRAINT "projet_technologie_id_projet_fkey" FOREIGN KEY ("id_projet") REFERENCES "projets"("id_projet") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projet_technologie" ADD CONSTRAINT "projet_technologie_id_technologie_fkey" FOREIGN KEY ("id_technologie") REFERENCES "technologies"("id_technologie") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_id_encadrant_fkey" FOREIGN KEY ("id_encadrant") REFERENCES "professeurs"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activites_parascolaires" ADD CONSTRAINT "activites_parascolaires_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activites_parascolaires" ADD CONSTRAINT "activites_parascolaires_id_validateur_fkey" FOREIGN KEY ("id_validateur") REFERENCES "professeurs"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_recommandation" ADD CONSTRAINT "lettres_recommandation_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_recommandation" ADD CONSTRAINT "lettres_recommandation_id_professeur_fkey" FOREIGN KEY ("id_professeur") REFERENCES "professeurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elements_validables" ADD CONSTRAINT "elements_validables_validateur_id_fkey" FOREIGN KEY ("validateur_id") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attestations" ADD CONSTRAINT "attestations_id_element_fkey" FOREIGN KEY ("id_element") REFERENCES "elements_validables"("id_element") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_id_modele_fkey" FOREIGN KEY ("id_modele") REFERENCES "modeles_portfolio"("id_modele") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modeles_portfolio" ADD CONSTRAINT "modeles_portfolio_cree_par_admin_fkey" FOREIGN KEY ("cree_par_admin") REFERENCES "administrateurs"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores_credibilite" ADD CONSTRAINT "scores_credibilite_id_profil_fkey" FOREIGN KEY ("id_profil") REFERENCES "profils"("id_profil") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_id_auteur_fkey" FOREIGN KEY ("id_auteur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_id_portfolio_fkey" FOREIGN KEY ("id_portfolio") REFERENCES "portfolios"("id_portfolio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_id_poste_fkey" FOREIGN KEY ("id_poste") REFERENCES "postes"("id_poste") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommandations" ADD CONSTRAINT "recommandations_id_auteur_fkey" FOREIGN KEY ("id_auteur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommandations" ADD CONSTRAINT "recommandations_id_profil_fkey" FOREIGN KEY ("id_profil") REFERENCES "profils"("id_profil") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_recommandation" ADD CONSTRAINT "portfolio_recommandation_id_portfolio_fkey" FOREIGN KEY ("id_portfolio") REFERENCES "portfolios"("id_portfolio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_recommandation" ADD CONSTRAINT "portfolio_recommandation_id_recommandation_fkey" FOREIGN KEY ("id_recommandation") REFERENCES "recommandations"("id_recommandation") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_badge" ADD CONSTRAINT "profil_badge_id_profil_fkey" FOREIGN KEY ("id_profil") REFERENCES "profils"("id_profil") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_badge" ADD CONSTRAINT "profil_badge_id_badge_fkey" FOREIGN KEY ("id_badge") REFERENCES "badges"("id_badge") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regles_badge" ADD CONSTRAINT "regles_badge_id_badge_fkey" FOREIGN KEY ("id_badge") REFERENCES "badges"("id_badge") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regles_score_credibilite" ADD CONSTRAINT "regles_score_credibilite_cree_par_admin_fkey" FOREIGN KEY ("cree_par_admin") REFERENCES "administrateurs"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_integration" ADD CONSTRAINT "github_integration_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depots_github" ADD CONSTRAINT "depots_github_id_integration_fkey" FOREIGN KEY ("id_integration") REFERENCES "github_integration"("id_integration") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postes" ADD CONSTRAINT "postes_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_id_auteur_fkey" FOREIGN KEY ("id_auteur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_id_poste_fkey" FOREIGN KEY ("id_poste") REFERENCES "postes"("id_poste") ON DELETE CASCADE ON UPDATE CASCADE;
