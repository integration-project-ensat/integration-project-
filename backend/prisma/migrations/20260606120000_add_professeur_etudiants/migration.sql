CREATE TABLE "professeur_etudiants" (
    "id_professeur" BIGINT NOT NULL,
    "id_etudiant" BIGINT NOT NULL,
    "source" VARCHAR(20),
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professeur_etudiants_pkey" PRIMARY KEY ("id_professeur","id_etudiant"),
    CONSTRAINT "professeur_etudiants_id_professeur_fkey" FOREIGN KEY ("id_professeur") REFERENCES "professeurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "professeur_etudiants_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE
);
