/*
  Warnings:

  - Added the required column `id_etudiant` to the `attestations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attestations" ADD COLUMN "id_etudiant" bigint;
-- (pas de NOT NULL, pas de FOREIGN KEY encore)
