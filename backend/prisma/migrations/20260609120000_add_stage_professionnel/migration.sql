ALTER TABLE "stages" ADD COLUMN "id_professionnel" BIGINT;

ALTER TABLE "stages"
ADD CONSTRAINT "stages_id_professionnel_fkey"
FOREIGN KEY ("id_professionnel")
REFERENCES "professionnels"("id_utilisateur")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE INDEX "stages_id_professionnel_idx" ON "stages"("id_professionnel");
