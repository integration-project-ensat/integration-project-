-- Nettoyer les anciennes tables si elles existent
DROP TABLE IF EXISTS "historique_actions";
DROP TABLE IF EXISTS "journal_connexions";

-- Nettoyer les anciens types si ils existent
DROP TYPE IF EXISTS "TypeActionHistorique";
DROP TYPE IF EXISTS "TypeConnexionLog";
DROP TYPE IF EXISTS "ActionConnexion";
DROP TYPE IF EXISTS "RaisonEchec";

-- CreateEnum
CREATE TYPE "ActionConnexion" AS ENUM ('LOGIN_REUSSI', 'LOGIN_ECHOUE', 'DECONNEXION');
CREATE TYPE "RaisonEchec" AS ENUM ('MOT_DE_PASSE_INCORRECT', 'EMAIL_INEXISTANT', 'EMAIL_NON_VERIFIE', 'COMPTE_INACTIF');

-- Recréer journal_connexions avec la nouvelle structure
CREATE TABLE "journal_connexions" (
    "id" BIGSERIAL NOT NULL,
    "utilisateur_id" BIGINT,
    "email" VARCHAR(255),
    "nom_complet" VARCHAR(200),
    "role" "RoleUtilisateur",
    "action" "ActionConnexion" NOT NULL,
    "raison" "RaisonEchec",
    "adresse_ip" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "journal_connexions_pkey" PRIMARY KEY ("id")
);

-- CreateTable tokens_revoques
CREATE TABLE "tokens_revoques" (
    "id" BIGSERIAL NOT NULL,
    "jti" VARCHAR(100) NOT NULL,
    "user_id" BIGINT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tokens_revoques_pkey" PRIMARY KEY ("id")
);

-- Foreign Key
ALTER TABLE "journal_connexions"
ADD CONSTRAINT "journal_connexions_utilisateur_id_fkey"
FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes
CREATE UNIQUE INDEX "tokens_revoques_jti_key" ON "tokens_revoques"("jti");
CREATE INDEX "tokens_revoques_expires_at_idx" ON "tokens_revoques"("expires_at");
CREATE INDEX "journal_connexions_action_idx" ON "journal_connexions"("action");
CREATE INDEX "journal_connexions_adresse_ip_idx" ON "journal_connexions"("adresse_ip");
CREATE INDEX "journal_connexions_date_idx" ON "journal_connexions"("date");