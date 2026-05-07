const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    },
    tls: { rejectUnauthorized: false }
});

/**
 * Échappe les caractères HTML dangereux
 */
const escapeHtml = (unsafe) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

/**
 * Génère un code de vérification à 6 chiffres
 */
const genererCode = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Template email de base
 */
const baseEmailTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f3f4f6;">
    <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr><td align="center" style="padding:40px 20px;">
            <table role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <tr><td style="background:#4F46E5;padding:24px 30px;border-radius:8px 8px 0 0;">
                    <h2 style="color:#fff;margin:0;font-size:20px;">Pheracore</h2>
                </td></tr>
                <tr><td style="padding:30px;">
                    ${content}
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px;">
                    <p style="color:#9CA3AF;font-size:12px;text-align:center;margin:0;">
                        Cet email a été envoyé automatiquement par Pheracore.<br>
                        Si vous n'êtes pas à l'origine de cette action, ignorez cet email.
                    </p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`;

/**
 * Envoie un email avec gestion d'erreur
 */
const sendEmail = async (options) => {
    try {
        await transporter.sendMail(options);
    } catch (error) {
        console.error('[EMAIL ERROR]', error.message);
        throw new Error(`Échec de l'envoi d'email : ${error.message}`);
    }
};

// ── Email vérification inscription ──────────────────────────────────────────
const sendVerificationCode = async (email, code, nom) => {
    const safeNom = escapeHtml(nom);
    const safeCode = escapeHtml(code);

    const content = `
        <h2 style="color:#4F46E5;margin:0 0 20px;">Bonjour ${safeNom},</h2>
        <p style="color:#374151;font-size:16px;line-height:1.5;margin:0 0 20px;">
            Merci de vous être inscrit sur notre plateforme. Pour finaliser votre inscription, utilisez le code ci-dessous :
        </p>
        <div style="padding:24px;background:#f3f4f6;text-align:center;border-radius:8px;margin:20px 0;">
            <span style="font-size:36px;letter-spacing:12px;font-weight:bold;color:#111827;font-family:monospace;">
                ${safeCode}
            </span>
        </div>
        <p style="color:#6B7280;font-size:14px;margin:20px 0 0;">
            ⏱️ Ce code expire dans <strong style="color:#374151;">24 heures</strong>.
        </p>
        <p style="color:#9CA3AF;font-size:13px;margin:20px 0 0;">
            Si vous n'avez pas créé ce compte, ignorez cet email.
        </p>`;

    await sendEmail({
        from: `"Pheracore" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Votre code de vérification',
        html: baseEmailTemplate('Code de vérification', content),
        text: `Bonjour ${nom},\n\nVotre code de vérification : ${code}\n\nCe code expire dans 24 heures.`
    });
};

// ── Email admin : demande de validation d'un professionnel ──────────────────
const sendAdminValidationRequest = async (professionnel, adminActionToken) => {
    // ✅ Vérification DES DONNÉES d'abord
    if (!professionnel?.id_utilisateur) {
        throw new Error('Données du professionnel invalides');
    }

    const required = ['BACKEND_URL', 'ADMIN_EMAIL', 'FRONTEND_URL'];
    for (const key of required) {
        if (!process.env[key]) throw new Error(`Variable d'environnement manquante : ${key}`);
    }

    // ✅ Construction des liens APRÈS vérification
    const baseUrl = process.env.BACKEND_URL.replace(/\/$/, '');
    const id = professionnel.id_utilisateur;

    const validationLink = `${baseUrl}/api/auth/admin/valider/${id}?token=${adminActionToken}`;
    const refusalLink = `${baseUrl}/api/auth/admin/refuser/${id}?token=${adminActionToken}`;
    const adminUrl = `${process.env.FRONTEND_URL}/admin/validation/${id}`;

    const nom = escapeHtml(`${professionnel.prenom} ${professionnel.nom}`);
    const email = escapeHtml(professionnel.email);
    const entreprise = escapeHtml(professionnel.professionnel?.entreprise || 'Non renseigné');
    const poste = escapeHtml(professionnel.professionnel?.poste || 'Non renseigné');
    const secteur = escapeHtml(professionnel.professionnel?.secteur || 'Non renseigné');

    const content = `
        <p style="color:#374151;margin:0 0 20px;">
            Un nouveau compte professionnel vient d'être créé et attend votre validation.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:14px;">
            <tr>
                <td style="padding:10px 12px;background:#f9fafb;font-weight:bold;width:38%;border:1px solid #e5e7eb;color:#374151;">Nom complet</td>
                <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#111827;">${nom}</td>
            </tr>
            <tr>
                <td style="padding:10px 12px;background:#f9fafb;font-weight:bold;border:1px solid #e5e7eb;color:#374151;">Email</td>
                <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#111827;">${email}</td>
            </tr>
            <tr>
                <td style="padding:10px 12px;background:#f9fafb;font-weight:bold;border:1px solid #e5e7eb;color:#374151;">Entreprise</td>
                <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#111827;">${entreprise}</td>
            </tr>
            <tr>
                <td style="padding:10px 12px;background:#f9fafb;font-weight:bold;border:1px solid #e5e7eb;color:#374151;">Poste</td>
                <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#111827;">${poste}</td>
            </tr>
            <tr>
                <td style="padding:10px 12px;background:#f9fafb;font-weight:bold;border:1px solid #e5e7eb;color:#374151;">Secteur</td>
                <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#111827;">${secteur}</td>
            </tr>
        </table>
        <div style="text-align:center;margin:0 0 24px;">
            <a href="${escapeHtml(validationLink)}"
               style="display:inline-block;padding:14px 28px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:bold;margin-right:12px;">
                ✅ Valider
            </a>
            <a href="${escapeHtml(refusalLink)}"
               style="display:inline-block;padding:14px 28px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:bold;">
                ❌ Refuser
            </a>
        </div>
        <p style="text-align:center;margin:0 0 20px;">
            <a href="${escapeHtml(adminUrl)}" style="color:#4F46E5;font-size:13px;">
                Voir le dossier complet dans le tableau de bord →
            </a>
        </p>`;

    await sendEmail({
        from: `"Pheracore" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `[Action requise] Nouveau professionnel à valider — ${nom}`,
        html: baseEmailTemplate('Nouveau professionnel à valider', content),
        text: `Nouveau professionnel à valider\n\nNom : ${nom}\nEmail : ${email}\nEntreprise : ${entreprise}\nPoste : ${poste}\n\nValider : ${validationLink}\nRefuser : ${refusalLink}\n\nDossier complet : ${adminUrl}`
    });
};

// ── Email professionnel : résultat de la validation ─────────────────────────
const sendValidationResultEmail = async (email, nom, estValide, motifRefus = null) => {
    const safeNom = escapeHtml(nom);
    const sujet = estValide
        ? '✅ Votre compte professionnel a été validé'
        : '❌ Votre compte professionnel a été refusé';

    const contenuHtml = estValide
        ? `<p style="color:#374151;font-size:16px;line-height:1.6;">
             Bonne nouvelle ! Votre compte professionnel sur <strong>Pheracore</strong> a été
             <strong style="color:#16a34a;">validé par notre équipe</strong>.
             Vous pouvez désormais vous connecter et accéder à toutes les fonctionnalités de la plateforme.
           </p>
           <div style="text-align:center;margin:28px 0;">
             <a href="${escapeHtml(process.env.FRONTEND_URL + '/seconnecter')}"
                style="display:inline-block;padding:14px 32px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;">
               Se connecter →
             </a>
           </div>`
        : `<p style="color:#374151;font-size:16px;line-height:1.6;">
             Nous avons examiné votre demande de création de compte professionnel sur <strong>Pheracore</strong>.
             Malheureusement, votre compte n'a pas pu être <strong style="color:#dc2626;">validé</strong>.
           </p>
           ${motifRefus ? `
           <div style="padding:16px;background:#fef2f2;border-left:4px solid #dc2626;border-radius:4px;margin:20px 0;">
             <p style="margin:0;color:#7f1d1d;font-size:14px;"><strong>Motif :</strong> ${escapeHtml(motifRefus)}</p>
           </div>` : ''}
           <p style="color:#6B7280;font-size:14px;">
             Pour toute question, contactez-nous à <a href="mailto:${escapeHtml(process.env.SMTP_USER)}" style="color:#4F46E5;">${escapeHtml(process.env.SMTP_USER)}</a>.
           </p>`;

    await sendEmail({
        from: `"Pheracore" <${process.env.SMTP_USER}>`,
        to: email,
        subject: sujet,
        html: baseEmailTemplate(sujet, `
            <h3 style="color:#374151;margin:0 0 16px;">Bonjour ${safeNom},</h3>
            ${contenuHtml}`),
        text: `${sujet}\n\nBonjour ${nom},\n\n${estValide
            ? 'Votre compte a été validé. Connectez-vous : ' + process.env.FRONTEND_URL + '/seconnecter'
            : 'Votre compte a été refusé.' + (motifRefus ? '\n\nMotif : ' + motifRefus : '')
        }`
    });
};

// ── Email réinitialisation mot de passe ─────────────────────────────────────
const sendResetPasswordEmail = async (email, token, nom) => {
    const resetLink = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe?token=${resetToken}`;
    const safeNom = escapeHtml(nom);

    const content = `
        <h2 style="color:#4F46E5;margin:0 0 20px;">Bonjour ${safeNom},</h2>
        <p style="color:#374151;font-size:16px;line-height:1.5;margin:0 0 20px;">
            Vous avez demandé la réinitialisation de votre mot de passe.
        </p>
        <div style="text-align:center;margin:20px 0;">
            <a href="${escapeHtml(resetLink)}"
               style="display:inline-block;padding:14px 32px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;">
                Réinitialiser mon mot de passe
            </a>
        </div>
        <p style="color:#6B7280;font-size:14px;margin:20px 0 0;">
            ⏱️ Ce lien expire dans <strong style="color:#374151;">24 heures</strong>.
        </p>
        <p style="color:#9CA3AF;font-size:13px;margin:20px 0 0;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        </p>`;

    await sendEmail({
        from: `"Pheracore" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: baseEmailTemplate('Réinitialisation mot de passe', content),
        text: `Bonjour ${nom},\n\nRéinitialisez votre mot de passe : ${resetLink}\n\nCe lien expire dans 24 heures.`
    });
};

module.exports = {
    genererCode,
    sendVerificationCode,
    sendAdminValidationRequest,
    sendValidationResultEmail,
    sendResetPasswordEmail
};