-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "admin_action_expires_at" TIMESTAMP(3),
ADD COLUMN     "admin_action_token" VARCHAR(255);
