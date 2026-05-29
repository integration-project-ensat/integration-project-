-- CreateEnum
CREATE TYPE "TypeConnexionLog" AS ENUM ('LOGIN_REUSSI', 'LOGIN_ECHOUE', 'LOGOUT');

-- CreateEnum
CREATE TYPE "TypeActionHistorique" AS ENUM ('VALIDATION_PROJET', 'REFUS_PROJET', 'MODIFICATION_PORTFOLIO', 'SUPPRESSION_COMMENTAIRE', 'VALIDATION_RECOMMANDATION', 'REFUS_RECOMMANDATION', 'EXPORT_PORTFOLIO', 'ACTIVATION_COMPTE', 'DESACTIVATION_COMPTE', 'ATTRIBUTION_BADGE');

-- CreateTable
CREATE TABLE "journal_connexions" (
    "id_log" BIGSERIAL NOT NULL,
    "utilisateur_id" BIGINT,
    "email_tente" TEXT,
    "role" "RoleUtilisateur",
    "type" "TypeConnexionLog" NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "succes" BOOLEAN NOT NULL DEFAULT false,
    "raison_echec" TEXT,
    "date_action" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_connexions_pkey" PRIMARY KEY ("id_log")
);

-- CreateTable
CREATE TABLE "historique_actions" (
    "id_historique" BIGSERIAL NOT NULL,
    "acteur_id" BIGINT,
    "role_acteur" "RoleUtilisateur",
    "action" "TypeActionHistorique" NOT NULL,
    "cible_type" TEXT,
    "cible_id" BIGINT,
    "description" TEXT,
    "ancienne_valeur" JSONB,
    "nouvelle_valeur" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "date_action" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historique_actions_pkey" PRIMARY KEY ("id_historique")
);

-- AddForeignKey
ALTER TABLE "journal_connexions" ADD CONSTRAINT "journal_connexions_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_actions" ADD CONSTRAINT "historique_actions_acteur_id_fkey" FOREIGN KEY ("acteur_id") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;
