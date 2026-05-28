-- CreateTable
CREATE TABLE "profils_sauvegardes" (
    "id" BIGSERIAL NOT NULL,
    "id_sauvegardeur" BIGINT NOT NULL,
    "id_etudiant" BIGINT NOT NULL,
    "date_sauvegarde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profils_sauvegardes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profils_sauvegardes_id_sauvegardeur_id_etudiant_key" ON "profils_sauvegardes"("id_sauvegardeur", "id_etudiant");

-- AddForeignKey
ALTER TABLE "profils_sauvegardes" ADD CONSTRAINT "profils_sauvegardes_id_sauvegardeur_fkey" FOREIGN KEY ("id_sauvegardeur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profils_sauvegardes" ADD CONSTRAINT "profils_sauvegardes_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;
