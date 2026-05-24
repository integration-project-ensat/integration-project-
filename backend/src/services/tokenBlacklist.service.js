// src/services/tokenBlacklist.service.js

const prisma = require('../../prisma/client');

// ── Révoquer un token au logout ──────────────────────────────
// jti      : identifiant unique du token (champ JWT)
// expiresAt: timestamp en secondes (champ exp du JWT)
// userId   : id de l'utilisateur (optionnel, pour audit)

async function révoquerToken(jti, expiresAt, userId = null) {
  await prisma.tokenRévoqué.create({
    data: {
      jti,
      expires_at: new Date(expiresAt * 1000),
      ...(userId !== null && { user_id: userId }),
    },
  });
}

// ── Vérifier si un token est révoqué ────────────────────────

async function estRévoqué(jti) {
  const token = await prisma.tokenRévoqué.findUnique({ where: { jti } });
  return !!token;
}

// ── Nettoyage des tokens expirés (toutes les 24h via app.js) ─

async function nettoyerTokensExpirés() {
  const résultat = await prisma.tokenRévoqué.deleteMany({
    where: { expires_at: { lt: new Date() } },
  });
  console.log(`[Blacklist] ${résultat.count} token(s) expiré(s) supprimé(s)`);
}

module.exports = { révoquerToken, estRévoqué, nettoyerTokensExpirés };