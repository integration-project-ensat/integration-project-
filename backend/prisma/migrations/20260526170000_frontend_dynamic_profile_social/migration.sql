CREATE TYPE "StatutConnexion" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE');

CREATE TABLE IF NOT EXISTS "reposts" (
  "id_repost" BIGSERIAL NOT NULL,
  "id_auteur" BIGINT NOT NULL,
  "id_poste" BIGINT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "reposts_pkey" PRIMARY KEY ("id_repost"),
  CONSTRAINT "reposts_id_auteur_fkey"
    FOREIGN KEY ("id_auteur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "reposts_id_poste_fkey"
    FOREIGN KEY ("id_poste") REFERENCES "postes"("id_poste") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "reposts_id_auteur_id_poste_key"
ON "reposts"("id_auteur", "id_poste");

CREATE TABLE IF NOT EXISTS "connexions" (
  "id_connexion" BIGSERIAL NOT NULL,
  "id_demandeur" BIGINT NOT NULL,
  "id_destinataire" BIGINT NOT NULL,
  "statut" "StatutConnexion" NOT NULL DEFAULT 'EN_ATTENTE',
  "message" TEXT,
  "date_demande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "date_reponse" TIMESTAMP(3),

  CONSTRAINT "connexions_pkey" PRIMARY KEY ("id_connexion"),
  CONSTRAINT "connexions_id_demandeur_fkey"
    FOREIGN KEY ("id_demandeur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "connexions_id_destinataire_fkey"
    FOREIGN KEY ("id_destinataire") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "connexions_id_demandeur_id_destinataire_key"
ON "connexions"("id_demandeur", "id_destinataire");
