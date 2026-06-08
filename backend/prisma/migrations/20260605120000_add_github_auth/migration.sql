-- Add GitHub OAuth identity support on utilisateur accounts.
ALTER TABLE "utilisateurs" ADD COLUMN "github_id" TEXT;

CREATE UNIQUE INDEX "utilisateurs_github_id_key" ON "utilisateurs"("github_id");
