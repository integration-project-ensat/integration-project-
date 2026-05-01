const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Génère un code à 6 chiffres
 */
const genererCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationCode = async (email, code, nom) => {
  await transporter.sendMail({
    from: '"Pheracore platforme" <noreply@portfolio.ma>',
    to: email,
    subject: 'Votre code de vérification',
    html: `
      <h2>Bonjour  ${nom},</h2>
      <p>Voici votre code de vérification :</p>
      <div style="padding:20px;background:#f3f4f6;text-align:center;font-size:32px;letter-spacing:8px;font-weight:bold;">
        ${code}
      </div>
      <p>Ce code expire dans 24 heures.</p>
      <p>Si vous n'avez pas cree ce compte, ignorez cet email.</p>
    `
  });
};

const sendAdminValidationRequest = async (professionnel) => {
  const adminUrl = `${process.env.FRONTEND_URL}/admin/validation/${professionnel.id}`;

  await transporter.sendMail({
    from: '"Pheracore" <noreply@portfolio.ma>',
    to: process.env.ADMIN_EMAIL,
    subject: 'Nouveau professionnel en attente de validation',
    html: `
      <h2>Nouveau professionnel a valider</h2>
      <p><strong>Nom :</strong> ${professionnel.nom} ${professionnel.prenom}</p>
      <p><strong>Email :</strong> ${professionnel.email}</p>
      <p><strong>Entreprise :</strong> ${professionnel.professionnel.entreprise}</p>
      <p><strong>Poste :</strong> ${professionnel.professionnel.poste}</p>
      <p><a href="${adminUrl}">Valider ce compte</a></p>
    `
  });
};

module.exports = {
  genererCode,
  sendVerificationCode,
  sendAdminValidationRequest
};