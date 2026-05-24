-- CreateEnum
CREATE TYPE "StatutConnexion" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'BLOQUEE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TypeNotification" ADD VALUE 'SOUMISSION_STAGE';
ALTER TYPE "TypeNotification" ADD VALUE 'VALIDATION_STAGE';
ALTER TYPE "TypeNotification" ADD VALUE 'REFUS_STAGE';
ALTER TYPE "TypeNotification" ADD VALUE 'COMMENTAIRE_ACCEPTE';
ALTER TYPE "TypeNotification" ADD VALUE 'COMMENTAIRE_REFUSE';
ALTER TYPE "TypeNotification" ADD VALUE 'RECOMMANDATION_ACCEPTEE';
ALTER TYPE "TypeNotification" ADD VALUE 'RECOMMANDATION_REFUSEE';
ALTER TYPE "TypeNotification" ADD VALUE 'REFUS_ATTESTATION';
ALTER TYPE "TypeNotification" ADD VALUE 'DEMANDE_CONNEXION';
ALTER TYPE "TypeNotification" ADD VALUE 'CONNEXION_ACCEPTEE';
ALTER TYPE "TypeNotification" ADD VALUE 'CONNEXION_REFUSEE';

-- CreateTable
CREATE TABLE "connexions" (
    "id_connexion" BIGSERIAL NOT NULL,
    "demandeur_id" BIGINT NOT NULL,
    "destinataire_id" BIGINT NOT NULL,
    "statut" "StatutConnexion" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_demande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_reponse" TIMESTAMP(3),

    CONSTRAINT "connexions_pkey" PRIMARY KEY ("id_connexion")
);

-- CreateIndex
CREATE UNIQUE INDEX "connexions_demandeur_id_destinataire_id_key" ON "connexions"("demandeur_id", "destinataire_id");

-- AddForeignKey
ALTER TABLE "connexions" ADD CONSTRAINT "connexions_demandeur_id_fkey" FOREIGN KEY ("demandeur_id") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connexions" ADD CONSTRAINT "connexions_destinataire_id_fkey" FOREIGN KEY ("destinataire_id") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;
