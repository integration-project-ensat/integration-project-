// src/services/tokenBlacklist.service.js

const prisma = require('../../prisma/client');

// ── Révoquer un token au logout ──────────────────────────────
// jti      : identifiant unique du token (champ JWT)
// expiresAt: timestamp en secondes (champ exp du JWT)
// userId   : id de l'utilisateur (optionnel, pour audit)

async function révoquerToken(jti, expiresAt, userId = null) {
  try {
    await prisma.tokenRévoqué.create({
      data: {
        jti,
        expires_at: new Date(expiresAt * 1000),
        ...(userId !== null && { user_id: userId }),
      },
    });
  } catch (error) {
    console.error('[TokenBlacklist] Echec révocation token :', error.message);
  }
}

// ── Vérifier si un token est révoqué ────────────────────────

async function estRévoqué(jti) {
  try {
    const token = await prisma.tokenRévoqué.findUnique({ where: { jti } });
    return !!token;
  } catch (error) {
    console.error('[TokenBlacklist] Echec vérification token :', error.message);
    return false;
  }
}

// ── Nettoyage des tokens expirés (toutes les 24h via app.js) ─

async function nettoyerTokensExpirés() {
  try {
    const résultat = await prisma.tokenRévoqué.deleteMany({
      where: { expires_at: { lt: new Date() } },
    });
    console.log(`[Blacklist] ${résultat.count} token(s) expiré(s) supprimé(s)`);
  } catch (error) {
    console.error('[TokenBlacklist] Echec nettoyage tokens :', error.message);
  }
}

module.exports = { révoquerToken, estRévoqué, nettoyerTokensExpirés };
