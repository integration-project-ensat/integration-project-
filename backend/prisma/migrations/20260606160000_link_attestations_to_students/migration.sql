ALTER TABLE "attestations"
ADD COLUMN IF NOT EXISTS "id_etudiant" BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'attestations_id_etudiant_fkey'
  ) THEN
    ALTER TABLE "attestations"
    ADD CONSTRAINT "attestations_id_etudiant_fkey"
    FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "attestations_id_etudiant_idx" ON "attestations"("id_etudiant");
