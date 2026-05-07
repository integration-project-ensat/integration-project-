const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');
const { sendResetPasswordEmail } = require('../services/email.service');
const asyncHandler = require('../middlewares/asyncHandler');

const SALT_ROUNDS = 12;
const RESET_TOKEN_EXPIRY_HOURS = 1;

/**
 * Demande de réinitialisation de mot de passe
 * POST /api/auth/mot-de-passe-oublie
 */
const motDePasseOublie = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await prisma.utilisateur.findUnique({
        where: { email },
        select: {
            id_utilisateur: true,
            email: true,
            nom: true,
            prenom: true,
            est_actif: true,
            email_verifie: true
        }
    });

    // Réponse identique que l'utilisateur existe ou non (sécurité)
    // pour éviter l'énumération d'emails
    if (!user || !user.est_actif || !user.email_verifie) {
        return res.json({
            success: true,
            message: 'Si cet email existe et est vérifié, un lien de réinitialisation a été envoyé.'
        });
    }

    // Générer un token sécurisé (32 bytes = 64 chars hex)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Sauvegarder le hash du token (pas le token en clair)
    await prisma.utilisateur.update({
        where: { id_utilisateur: user.id_utilisateur },
        data: {
            reset_token_hash: resetTokenHash,
            reset_token_expires_at: expiresAt
        }
    });

    // Envoyer l'email avec le token en clair (dans le lien)
    await sendResetPasswordEmail(user.email, resetToken, `${user.prenom} ${user.nom}`);

    res.json({
        success: true,
        message: 'Si cet email existe et est vérifié, un lien de réinitialisation a été envoyé.'
    });
});

/**
 * Vérifier la validité du token de réinitialisation
 * GET /api/auth/verifier-token-reset?token=xxx
 */
const verifierTokenReset = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token || token.length !== 64) {
        return res.status(400).json({
            success: false,
            message: 'Token invalide'
        });
    }

    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await prisma.utilisateur.findFirst({
        where: {
            reset_token_hash: tokenHash,
            reset_token_expires_at: { gt: new Date() }
        },
        select: {
            id_utilisateur: true,
            email: true
        }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'Token invalide ou expiré'
        });
    }

    res.json({
        success: true,
        message: 'Token valide',
        data: { email: user.email }
    });
});

/**
 * Réinitialiser le mot de passe
 * POST /api/auth/reinitialiser-mot-de-passe
 */
const reinitialiserMotDePasse = asyncHandler(async (req, res) => {
    const { token, nouveau_mot_de_passe, confirmation_mot_de_passe } = req.body;

    // Validation basique
    if (nouveau_mot_de_passe !== confirmation_mot_de_passe) {
        return res.status(400).json({
            success: false,
            message: 'Les mots de passe ne correspondent pas'
        });
    }

    if (nouveau_mot_de_passe.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Le mot de passe doit contenir au moins 8 caractères'
        });
    }

    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await prisma.utilisateur.findFirst({
        where: {
            reset_token_hash: tokenHash,
            reset_token_expires_at: { gt: new Date() }
        }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'Token invalide ou expiré'
        });
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await bcrypt.compare(nouveau_mot_de_passe, user.mot_de_passe_hashe);
    if (isSamePassword) {
        return res.status(400).json({
            success: false,
            message: 'Le nouveau mot de passe doit être différent de l\'ancien'
        });
    }

    const hashedPassword = await bcrypt.hash(nouveau_mot_de_passe, SALT_ROUNDS);

    // Mettre à jour le mot de passe et invalider le token
    await prisma.utilisateur.update({
        where: { id_utilisateur: user.id_utilisateur },
        data: {
            mot_de_passe_hashe: hashedPassword,
            reset_token_hash: null,
            reset_token_expires_at: null
        }
    });

    res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
    });
});

module.exports = {
    motDePasseOublie,
    verifierTokenReset,
    reinitialiserMotDePasse
};