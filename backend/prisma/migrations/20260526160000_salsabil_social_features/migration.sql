ALTER TYPE "TypeElementValidable" ADD VALUE IF NOT EXISTS 'COMMENTAIRE';
ALTER TYPE "TypeElementValidable" ADD VALUE IF NOT EXISTS 'RECOMMANDATION';

ALTER TABLE "postes"
ADD COLUMN IF NOT EXISTS "image_url" VARCHAR(500);

CREATE TABLE IF NOT EXISTS "poste_collaborateurs" (
  "id_poste" BIGINT NOT NULL,
  "id_utilisateur" BIGINT NOT NULL,
  "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "poste_collaborateurs_pkey" PRIMARY KEY ("id_poste", "id_utilisateur"),
  CONSTRAINT "poste_collaborateurs_id_poste_fkey"
    FOREIGN KEY ("id_poste") REFERENCES "postes"("id_poste") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "poste_collaborateurs_id_utilisateur_fkey"
    FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE
);
