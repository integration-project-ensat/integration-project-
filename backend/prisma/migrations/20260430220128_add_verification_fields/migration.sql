-- AlterTable
ALTER TABLE "utilisateur" ADD COLUMN     "email_verification" TEXT,
ADD COLUMN     "token_expires_at" TIMESTAMP(3);
