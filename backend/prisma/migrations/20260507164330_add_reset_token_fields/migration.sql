-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "reset_token_expires_at" TIMESTAMP(3),
ADD COLUMN     "resettoken" VARCHAR(255);
