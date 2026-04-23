-- CreateTable
CREATE TABLE "utilisateurs" (
    "id_utilisateur" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "est_valide" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "derniere_connexion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "profils" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profils_pkey" PRIMARY KEY ("id_profil")
);

-- CreateTable
CREATE TABLE "etudiants" (
    "id_element" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "numero_etudiant" TEXT,
    "filiere" TEXT,
    "annee_universitaire" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etudiants_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "professeurs" (
    "id_element" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "entreprise" TEXT,
    "poste" TEXT,
    "email_professionnel" TEXT,
    "facteur" TEXT,
    "date_validation" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professeurs_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "preferences" (
    "id" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "departement" TEXT,
    "specialite" TEXT,
    "telephone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regle_badge" (
    "id_nom" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "est_valide" BOOLEAN NOT NULL DEFAULT true,
    "categorie" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regle_badge_pkey" PRIMARY KEY ("id_nom")
);

-- CreateTable
CREATE TABLE "badges" (
    "id_badge" SERIAL NOT NULL,
    "id_regle" INTEGER,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "categorie" TEXT,
    "date_attribution" TIMESTAMP(3),
    "icon_url" TEXT,
    "critere_type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id_badge")
);

-- CreateTable
CREATE TABLE "utilisateur_badge" (
    "id_utilisateur" INTEGER NOT NULL,
    "id_badge" INTEGER NOT NULL,
    "date_attribution" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateur_badge_pkey" PRIMARY KEY ("id_utilisateur","id_badge")
);

-- CreateTable
CREATE TABLE "competences_techniques" (
    "id_element" SERIAL NOT NULL,
    "categorie" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competences_techniques_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "competences_comportementales" (
    "id_element" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competences_comportementales_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "competences" (
    "id_competence" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "niveau" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competences_pkey" PRIMARY KEY ("id_competence")
);

-- CreateTable
CREATE TABLE "utilisateur_competence" (
    "id_utilisateur" INTEGER NOT NULL,
    "id_competence" INTEGER NOT NULL,
    "niveau" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateur_competence_pkey" PRIMARY KEY ("id_utilisateur","id_competence")
);

-- CreateTable
CREATE TABLE "activites" (
    "id_element" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "url_affectation" TEXT,
    "date_validation" TIMESTAMP(3),
    "est_visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activites_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id_notification" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "canal_envoi" BOOLEAN NOT NULL DEFAULT false,
    "date_reception" TIMESTAMP(3),
    "cible_id" INTEGER,
    "cible_type" TEXT,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "diplomes" (
    "id_diplome" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "titre_diplome" TEXT NOT NULL,
    "domaine" TEXT,
    "annee_debut" INTEGER,
    "annee_fin" INTEGER,
    "etablissement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diplomes_pkey" PRIMARY KEY ("id_diplome")
);

-- CreateTable
CREATE TABLE "technologies" (
    "id_technologie" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "est_valide" BOOLEAN NOT NULL DEFAULT true,
    "categorie" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id_technologie")
);

-- CreateTable
CREATE TABLE "projets" (
    "id_element" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "role" TEXT,
    "url_github" TEXT,
    "filiere" TEXT,
    "resultats" TEXT,
    "statut" TEXT,
    "visibilite" BOOLEAN NOT NULL DEFAULT true,
    "appreciation_professeur" TEXT,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "est_dans_portfolio" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projets_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "projet_technologie" (
    "id_projet" INTEGER NOT NULL,
    "id_technologie" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projet_technologie_pkey" PRIMARY KEY ("id_projet","id_technologie")
);

-- CreateTable
CREATE TABLE "stages" (
    "id_element" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "entreprise" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "duree_semaines" TEXT,
    "missions" TEXT,
    "statut" TEXT,
    "url_rapport" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id_portfolio" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "objectif" BOOLEAN NOT NULL DEFAULT false,
    "theme" TEXT,
    "url_youtube" TEXT,
    "est_public" BOOLEAN NOT NULL DEFAULT false,
    "lien_public" BOOLEAN NOT NULL DEFAULT false,
    "nombre_vues" INTEGER NOT NULL DEFAULT 0,
    "date_modification" TIMESTAMP(3),
    "date_export" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id_portfolio")
);

-- CreateTable
CREATE TABLE "attestations" (
    "id_element" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "date_obtention" TIMESTAMP(3),
    "organisme" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attestations_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "lettres_recommandation" (
    "id_element" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "type" TEXT,
    "contenu" TEXT,
    "url_fichier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lettres_recommandation_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id_recommendation" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "type" TEXT,
    "contenu" TEXT,
    "url_fichier" TEXT,
    "statut" TEXT,
    "visibilite" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id_recommendation")
);

-- CreateTable
CREATE TABLE "commentaires" (
    "id_commentaire" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "id_projet" INTEGER,
    "contenu" TEXT NOT NULL,
    "statut" TEXT,
    "date" TIMESTAMP(3),
    "cible_id" INTEGER,
    "cible_type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commentaires_pkey" PRIMARY KEY ("id_commentaire")
);

-- CreateTable
CREATE TABLE "notes" (
    "id_note" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "id_projet" INTEGER,
    "date_publication" TIMESTAMP(3),
    "visibilite" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "cible_id" INTEGER,
    "cible_type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id_note")
);

-- CreateTable
CREATE TABLE "depot_github" (
    "id_depot" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "nom_depot" TEXT NOT NULL,
    "description" TEXT,
    "url_depot" TEXT,
    "nbr_commits" INTEGER NOT NULL DEFAULT 0,
    "date_creation" TIMESTAMP(3),
    "est_public" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "depot_github_pkey" PRIMARY KEY ("id_depot")
);

-- CreateTable
CREATE TABLE "github_integrations" (
    "id_integration" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "github_username" TEXT,
    "access_token" TEXT,
    "date_synchronisation" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_integrations_pkey" PRIMARY KEY ("id_integration")
);

-- CreateTable
CREATE TABLE "scores_credibilite" (
    "scoreID" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "score_totale" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score_projet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score_github" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score_recommendation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score_certification" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "score_stage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "niveau" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scores_credibilite_pkey" PRIMARY KEY ("scoreID")
);

-- CreateTable
CREATE TABLE "elements_valides" (
    "id_element" SERIAL NOT NULL,
    "statut" TEXT,
    "date_soumission" TIMESTAMP(3),
    "date_validation" TIMESTAMP(3),
    "validateur_id" INTEGER,
    "element_ref_id" INTEGER,
    "element_ref_type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elements_valides_pkey" PRIMARY KEY ("id_element")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profils_id_utilisateur_key" ON "profils"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "etudiants_id_utilisateur_key" ON "etudiants"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "professeurs_id_utilisateur_key" ON "professeurs"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "preferences_id_utilisateur_key" ON "preferences"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "github_integrations_id_utilisateur_key" ON "github_integrations"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "scores_credibilite_id_utilisateur_key" ON "scores_credibilite"("id_utilisateur");

-- AddForeignKey
ALTER TABLE "profils" ADD CONSTRAINT "profils_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiants" ADD CONSTRAINT "etudiants_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professeurs" ADD CONSTRAINT "professeurs_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_id_regle_fkey" FOREIGN KEY ("id_regle") REFERENCES "regle_badge"("id_nom") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur_badge" ADD CONSTRAINT "utilisateur_badge_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur_badge" ADD CONSTRAINT "utilisateur_badge_id_badge_fkey" FOREIGN KEY ("id_badge") REFERENCES "badges"("id_badge") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur_competence" ADD CONSTRAINT "utilisateur_competence_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur_competence" ADD CONSTRAINT "utilisateur_competence_id_competence_fkey" FOREIGN KEY ("id_competence") REFERENCES "competences"("id_competence") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diplomes" ADD CONSTRAINT "diplomes_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projet_technologie" ADD CONSTRAINT "projet_technologie_id_projet_fkey" FOREIGN KEY ("id_projet") REFERENCES "projets"("id_element") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projet_technologie" ADD CONSTRAINT "projet_technologie_id_technologie_fkey" FOREIGN KEY ("id_technologie") REFERENCES "technologies"("id_technologie") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attestations" ADD CONSTRAINT "attestations_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_recommandation" ADD CONSTRAINT "lettres_recommandation_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_id_projet_fkey" FOREIGN KEY ("id_projet") REFERENCES "projets"("id_element") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_id_projet_fkey" FOREIGN KEY ("id_projet") REFERENCES "projets"("id_element") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depot_github" ADD CONSTRAINT "depot_github_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_integrations" ADD CONSTRAINT "github_integrations_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores_credibilite" ADD CONSTRAINT "scores_credibilite_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;
