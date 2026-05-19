/*
  Warnings:

  - You are about to drop the column `resettoken` on the `utilisateurs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "utilisateurs" DROP COLUMN "resettoken",
ADD COLUMN     "reset_token_hash" VARCHAR(255);
