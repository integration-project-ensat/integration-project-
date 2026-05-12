/*
  Warnings:

  - You are about to drop the column `pays` on the `profils` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profils" 
RENAME COLUMN     "pays" TO "adresse";