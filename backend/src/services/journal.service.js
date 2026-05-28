// src/services/journal.service.js

const prisma = require('../../prisma/client');

// ── Constantes ───────────────────────────────────────────────

const TypeEvenement = Object.freeze({
  LOGIN_REUSSI: 'LOGIN_REUSSI',
  LOGIN_ECHOUE: 'LOGIN_ECHOUE',
  DECONNEXION:  'DECONNEXION',
});

const RaisonEchec = Object.freeze({
  MOT_DE_PASSE_INCORRECT: 'MOT_DE_PASSE_INCORRECT',
  EMAIL_INEXISTANT:       'EMAIL_INEXISTANT',
  EMAIL_NON_VERIFIE:      'EMAIL_NON_VERIFIE',
  COMPTE_INACTIF:         'COMPTE_INACTIF',
});

// ── Parsing User-Agent ───────────────────────────────────────
// Transforme le raw user-agent → "Chrome · Windows 11"

function parseUserAgent(rawUA) {
  if (!rawUA) return null;

  let navigateur = 'Inconnu';
  let systeme    = 'Inconnu';

  // Navigateur (ordre important : Edge avant Chrome)
  if      (rawUA.includes('Edg/'))     navigateur = 'Edge';
  else if (rawUA.includes('OPR/'))     navigateur = 'Opera';
  else if (rawUA.includes('Chrome/'))  navigateur = 'Chrome';
  else if (rawUA.includes('Firefox/')) navigateur = 'Firefox';
  else if (rawUA.includes('Safari/'))  navigateur = 'Safari';

  // Système d'exploitation
  if      (rawUA.includes('iPhone'))     systeme = 'iPhone';
  else if (rawUA.includes('iPad'))       systeme = 'iPad';
  else if (rawUA.includes('Android'))    systeme = 'Android';
  else if (rawUA.includes('Windows NT')) systeme = 'Windows';
  else if (rawUA.includes('Mac OS X'))   systeme = 'macOS';
  else if (rawUA.includes('Linux'))      systeme = 'Linux';

  return `${navigateur} · ${systeme}`;
}

// ── Fonction principale ──────────────────────────────────────

async function logConnexion({
  type,
  req,
  utilisateur = null,
  emailTente  = null,
  raison      = null,
}) {
  try {
    const ip = req.ip
      || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || null;

    const userAgent = parseUserAgent(req.headers['user-agent'] || null);

    const nom_complet = utilisateur
      ? `${utilisateur.prenom} ${utilisateur.nom}`.trim()
      : null;
    
      const email = emailTente ?? utilisateur?.email ?? null;

    await prisma.journalConnexion.create({
      data: {
        action: type,
        utilisateur_id: utilisateur?.id_utilisateur ?? null,
        email,
        nom_complet,
        role: utilisateur?.role ?? null,
        raison,
        adresse_ip: ip,
        user_agent: userAgent,
      },
    });
  } catch (err) {
    // Ne jamais bloquer la réponse si le log échoue
    console.error('[JournalService] Échec enregistrement :', err.message);
  }
}

module.exports = { logConnexion, TypeEvenement, RaisonEchec };

