const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');//ajouté pour les tokens sécurisés
const prisma = require('../../prisma/client');
const{PUBLIC_ROLES, ROLES} = require('../config/roles');
const { genererCode, sendVerificationCode, sendAdminValidationRequest,sendValidationResultEmail } = require('../services/email.service');
const asyncHandler = require('../middlewares/asyncHandler');

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '24h';
const VERIFICATION_CODE_EXPIRY_HOURS = 24;
const ADMIN_LINK_EXPIRY_HOURS = 48;
// Fonction pour générer un token JWTavec les informations de l'utilisateur et une clé secrète, valable pendant 24 heures.
function generateToken(user) {
  return jwt.sign(
    { userId: user.id_utilisateur.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}
//pour ne pas exposer le mot de passe dans les reponses
function sanitizeUser(user) {
  const { mot_de_passe_hashe, ...safe } = user;
  return safe;
}
//vérifie que le rôle est bien un rôle public autorisé
function isValidPublicRole(role) {
  return Object.values(PUBLIC_ROLES).includes(role);
}
//Génère un token unique pour l'action admin (lien email)
function generateAdminActionToken() {
  return crypto.randomBytes(32).toString('hex');
}

//hash le token pour le stocker de manière sécurisée dans la base de données 
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
// ==================== INSCRIPTION PUBLIQUE ====================

const register = asyncHandler(async (req, res) => {
    console.log("======== REGISTER ========")
    console.log("BODY:", req.body)
    console.log("ROLE:", req.body.role)
    console.log("isValid?", isValidPublicRole(req.body.role))
    
    const { nom, prenom, email, mot_de_passe, role, ...specificData } = req.body;
    if (!isValidPublicRole(role)) {
        console.log("ROLE INVALIDE:", role)  
        return res.status(400).json({
            success: false,
            message: 'Rôle invalide'
        });
    }
// Vérification de l'unicité de l'email
  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Cet email est déjà utilisé'
    });
  }
// Hashage du mot de passe
  const hashedPassword = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);
// Génération du code de vérification et envoi de l'email de vérification
  const verificationCode = genererCode();
const tokenExpiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_HOURS * 60 * 60 * 1000); // 24 heures

let adminActionToken = null;
let adminActionTokenHash = null;
let adminActionExpiresAt = null;

if (role === 'PROFESSIONNEL') {
  adminActionToken=generateAdminActionToken();
  adminActionTokenHash=hashToken(adminActionToken);
  adminActionExpiresAt=new Date(Date.now() + ADMIN_LINK_EXPIRY_HOURS * 60 * 60 * 1000); // 48 heures
}

  // Création de l'utilisateur et des données spécifiques au rôle dans une transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.utilisateur.create({
      data: {
        email,
        mot_de_passe_hashe: hashedPassword,
        nom,
        prenom,
        role,
        est_actif: false,
        email_verifie: false,
        email_verification:verificationCode,
        token_expires_at: tokenExpiresAt,
        ...(role === 'PROFESSIONNEL' && {
          admin_action_token: adminActionTokenHash,
          admin_action_expires_at: adminActionExpiresAt
        })
      }
    });
//Creer le profil vide pour tous les roles
    await tx.profil.create({
      data: { id_utilisateur: newUser.id_utilisateur }
    });
// Création des données spécifiques au rôle
    if (role === 'ETUDIANT') {
        // Création de l'étudiant
       await tx.etudiant.create({
        data: {
          id_utilisateur: newUser.id_utilisateur,
          numero_etudiant: specificData.numero_etudiant,
          filiere: specificData.filiere,
          annee_universitaire: specificData.annee_universitaire,
        }
      });
      
    }
// Création du professeur
    if (role === 'PROFESSEUR') {
      await tx.professeur.create({
        data: {
          id_utilisateur: newUser.id_utilisateur,
          code_administratif: specificData.code_administratif,
          departement: specificData.departement,
          specialite: specificData.specialite
        }
      });
    }
// Création du professionnel

    if (role === 'PROFESSIONNEL') {
      await tx.professionnel.create({
        data: {
          id_utilisateur: newUser.id_utilisateur,
          entreprise: specificData.entreprise,
          poste: specificData.poste,
          secteur: specificData.secteur,
          est_valide: false
        }
      });
    }

    return newUser;
  });

    // Envoi de l'email de vérification
    await sendVerificationCode(email, verificationCode, nom);
    if (role === 'PROFESSIONNEL') {
        const proComplet = await prisma.utilisateur.findUnique({
            where: { id_utilisateur: user.id_utilisateur },
            include: { professionnel: true }
        });
        await sendAdminValidationRequest(proComplet, adminActionToken);

    }
    res.status(201).json({
        success: true,
        message: 'Inscription réussie! Veuillez vérifier votre email pour activer votre compte.',
        data: {
            userId: user.id_utilisateur,
            email: user.email,
            role: user.role
        } 
    });
});
//Verification par code de vérification

const verifierCode = asyncHandler(async (req, res) => {
    const { email, code } = req.body;
    const user = await prisma.utilisateur.findUnique({ where: { email } });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Email introuvable'
        });
    }
    if (user.email_verifie) {
        return res.status(400).json({
            success: false,
            message: 'Email déjà vérifié'
        });
    }
    if (user.email_verification !== code) {
        return res.status(400).json({
            success: false,
            message: 'Code de vérification incorrect'
        });
    }
    if (user.token_expires_at < new Date()) {
        return res.status(400).json({
            success: false,
            message: 'Code de vérification expiré, veuillez demander un nouveau code'
        });
    }
 const updateData={
    email_verifie:true,
    email_verification:null,
    token_expires_at:null
 };

 if(user.role==='ETUDIANT' || user.role==='PROFESSEUR'){
    updateData.est_actif=true;
 }
    await prisma.utilisateur.update({
        where: { id_utilisateur: user.id_utilisateur },
        data: updateData
    });
    
    const message = user.role === 'PROFESSIONNEL'?'Email vérifié! Votre compte est en attente de validation par un administrateur.'
    :'Email vérifié et compte activé! Vous pouvez maintenant vous connecter.';
    res.json({
        success: true,
        message
    });
}); 

//renvoyer le code de vérification
const renvoyerCode=asyncHandler(async(req,res)=>{
    const {email}=req.body;
    const user=await prisma.utilisateur.findUnique({where:{email}});
    if(!user || user.email_verifie){
        return res.status(400).json({
            success:false,  
            message:'Email introuvable ou déjà vérifié'
        });
    }

    const newCode=genererCode();
    const newExpiresAt=new Date(Date.now()+VERIFICATION_CODE_EXPIRY_HOURS*60*60*1000);
    await prisma.utilisateur.update({
        where:{id_utilisateur:user.id_utilisateur},
        data:{
            email_verification:newCode,
            token_expires_at:newExpiresAt
        }
    });

    // Envoi du nouveau code de vérification
    await sendVerificationCode(email, newCode, user.nom);

    res.json({
        success: true,
        message: 'Nouveau code de vérification envoyé!'
    });
});


// ==================== CONNEXION ====================

const login = asyncHandler(async (req, res) => {
  const { email, mot_de_passe } = req.body;

  const user = await prisma.utilisateur.findUnique({
    where: { email },
    include: {
      etudiant: true,
      professeur: true,
      professionnel: true,
      administrateur: true,
      profil:true
    }
  });
// Vérification de l'existence de l'utilisateur et de son statut actif
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email ou mot de passe incorrect'
    });
  }
if (!user.email_verifie) {
  return res.status(403).json({ message: 'Veuillez vérifier votre email.' });
}
// 2. Compte inactif (professionnel en attente admin)
if (!user.est_actif) {
  return res.status(403).json({ message: 'En attente de validation administrative.' });
}

// Vérification du mot de passe par la fonction compare de bcrypt
  const isValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hashe);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: 'Email ou mot de passe incorrect'
    });
  }
  await prisma.utilisateur.update({
    where: { id_utilisateur: user.id_utilisateur },
    data: { derniere_connexion: new Date() }
  });
// Génération du token JWT et envoi de la réponse avec les données de l'utilisateur (sans le mot de passe)
  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Connexion réussie',
    data: {
      token,
      user: sanitizeUser(user)
    }
  });
});

// ==================== PROFIL ====================

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: req.utilisateur.id_utilisateur },
    include: {
      etudiant: true,
      professeur: true,
      professionnel: true,
      administrateur: true,
      profil:true
    }
  });
  if (!user) {
    return res.status(404).json({
      success: false, 
      message: 'Utilisateur non trouvé'
    });
  }

  res.json({
    success: true,
    data: sanitizeUser(user)
  });
});

// ==================== CREATION ADMIN (RESERVE) ====================

const createAdmin = asyncHandler(async (req, res) => {
  const { nom, prenom, email, mot_de_passe ,niveau_acces='STANDARD'} = req.body;

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Cet email est déjà utilisé'
    });
  }

  const hashedPassword = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.utilisateur.create({
      data: {
        email,
        mot_de_passe_hashe: hashedPassword,
        nom,
        prenom,
        role: 'ADMINISTRATEUR',
        est_actif: true,
        email_verifie: true
}
    });
    // Profil vide créé aussi pour l'admin
    await tx.profil.create({
      data: { id_utilisateur: newUser.id_utilisateur }
    });

     await tx.administrateur.create({
            data: {
                id_utilisateur: newUser.id_utilisateur,
                niveau_acces
            }
        });

    return newUser;
  });

  res.status(201).json({
    success: true,
    message: 'Administrateur créé avec succès!',
    data: {
      user: sanitizeUser(user)
    }
  });
});
// ==================== VALIDATION PAR LIEN EMAIL (GET) ====================

const validerProfessionnelParLien = asyncHandler(async (req, res) => {
  const { utilisateurId } = req.params;
  const { token } = req.query;

  // Vérification du token secret
  if (!token || token.length !== 64||!/^[a-f0-9]+$/.test(token)) {
    return res.status(403).send(renderErrorPage('Token invalide', 'Ce lien est mal formé ou incomplet.'));
  }
// Hash du token reçu pour comparaison sécurisée avec la base de données
const tokenHash = hashToken(token);

if (!utilisateurId || !/^\d+$/.test(utilisateurId)) {
  return res.status(400).send(renderErrorPage('ID invalide', 'L\'identifiant de l\'utilisateur est invalide.'));
}
const id = BigInt(utilisateurId);

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: id },
    include: { professionnel: true }
  });

  if (!utilisateur || !utilisateur.professionnel) {
   return res.status(404).send(renderErrorPage('Utilisateur introuvable', 'Ce compte n\'existe pas ou a déjà été traité.'));
  }

  if (!utilisateur.email_verifie) {
    return res.status(400).send(renderErrorPage('Email non vérifié','Le professionnel doit d\'abord vérifier son email avant d\'être validé.'
    ));
  }

  if (utilisateur.est_actif && utilisateur.professionnel.est_valide) {
    return res.status(400).send(renderWarningPage('Déjà activé', 'Ce compte est déjà actif et validé.'));
  }

  // Vérification du token admin
  if (!utilisateur.admin_action_token || utilisateur.admin_action_token !== tokenHash) {
    return res.status(403).send(renderErrorPage(
      'Token invalide',
      'Ce lien de validation n\'est pas autorisé ou a expiré.'
    ));
  }

  if (utilisateur.admin_action_expires_at < new Date()) {
    return res.status(410).send(renderErrorPage(
      'Lien expiré',
      'Ce lien de validation a expiré. Veuillez demander un nouveau lien.'
    ));
  }
  
// Validation du professionnel et activation du compte dans une transaction
await prisma.$transaction
([prisma.professionnel.update({
    where: { id_utilisateur: id },
    data: { est_valide: true ,
      statut_validation:'VALIDE',
      date_validation: new Date()
    }
  }),
  prisma.utilisateur.update({
    where: { id_utilisateur: id },
    data: {
      est_actif: true,
      admin_action_token: null,
      admin_action_expires_at: null
    }
  })
]);

// Envoi de l'email de résultat de validation
  await sendValidationResultEmail(utilisateur.email, utilisateur.nom, true);

  // Page de confirmation affichée dans le navigateur
  return res.send(renderSuccessPage('Compte validé', `Le compte de ${utilisateur.prenom} ${utilisateur.nom} a été validé avec succès.`,
    `un email de confirmation a été envoyé à ${utilisateur.email}.`));       
});

const refuserProfessionnelParLien = asyncHandler(async (req, res) => {
  const { utilisateurId } = req.params;
  const { token } = req.query;
//meme validation du token que pour la validation, mais avec des messages d'erreur différents
   if (!token || token.length !== 64 || !/^[a-f0-9]+$/.test(token)) {
    return res.status(400).send(renderErrorPage(
      'Token invalide',
      'Le lien est malformé ou incomplet.'
    ));
  }

  const tokenHash = hashToken(token);
if (!utilisateurId || !/^\d+$/.test(utilisateurId)) {
  return res.status(400).send(renderErrorPage(
      'ID invalide',
      'L\'ID utilisateur doit être un nombre entier.'
    ));
  }
  const id = BigInt(utilisateurId);
  
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: id },
    include: { professionnel: true }
  });

  if (!utilisateur || !utilisateur.professionnel) {
    return res.status(404).send(renderErrorPage('Utilisateur introuvable', 'Ce compte n\'existe pas ou a déjà été traité.'));
  }

  if (!utilisateur.email_verifie) {
    return res.status(400).send(renderWarningPage('Email non vérifié', 'Ce compte n\'a pas encore vérifié son email, impossible de le refuser.'));
  }
  if(utilisateur.est_actif && utilisateur.professionnel.est_valide){
    return res.status(400).send(renderWarningPage('Déjà activé', 'Ce compte est déjà actif et validé, impossible de le refuser.'));
  }
  if (!utilisateur.admin_action_token || utilisateur.admin_action_token !== tokenHash) {
    return res.status(403).send(renderErrorPage('Token invalide', 'Ce lien de refus n\'est pas autorisé ou a expiré.'));
  }
  if (utilisateur.admin_action_expires_at < new Date()) {
    return res.status(410).send(renderErrorPage('Lien expiré', 'Ce lien de refus a expiré. Veuillez demander un nouveau lien.'));
  }

// Mise à jour du statut professionnel et désactivation du compte
    await prisma.$transaction([
      prisma.professionnel.update({
        where: { id_utilisateur: id },
        data: {
          est_valide: false,
          statut_validation: 'REFUSE',
          date_validation: new Date()
        }
      }),
      prisma.utilisateur.update({
        where: { id_utilisateur: id },
        data: {
          est_actif: false,
          admin_action_token: null,
          admin_action_expires_at: null
        }
      })
    ]);

  await sendValidationResultEmail(utilisateur.email, utilisateur.nom, false);

  return res.send(renderErrorPage('Compte refusé', 
     `Le compte de <strong>${escapeHtml(utilisateur.prenom)} ${escapeHtml(utilisateur.nom)}</strong> a été refusé et supprimé.`,
        `Un email de notification a été envoyé à ${escapeHtml(utilisateur.email)}.`));
});

//lister les professionnels en attente de validation
const getProfessionnelsEnAttente=asyncHandler(async(req,res)=>{
    const professionnels=await prisma.utilisateur.findMany({
        where:{
            role:ROLES.PROFESSIONNEL,
            est_actif:false,
            email_verifie:true,
            professionnel:{est_valide:false,statut_validation:'EN_ATTENTE'}
        },
        include:{professionnel:true},
          orderBy:{date_creation:'asc'}
    });

    res.json({
        success: true,
        count: professionnels.length,
        data: professionnels.map(sanitizeUser)
    });
});


// ==================== HELPERS RENDU HTML ====================

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderPage(title, message, submessage = '', color = '#4F46E5', icon = 'ℹ️') {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(title)}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                background: #f3f4f6; 
                min-height: 100vh; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                padding: 20px;
            }
            .card {
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                max-width: 500px;
                width: 100%;
                overflow: hidden;
            }
            .header {
                background: ${color};
                padding: 24px 30px;
                color: #fff;
            }
            .header h1 { font-size: 20px; margin: 0; }
            .body {
                padding: 30px;
                text-align: center;
            }
            .body p { color: #374151; line-height: 1.6; margin-bottom: 12px; }
            .body .sub { color: #6B7280; font-size: 14px; }
            .icon { font-size: 48px; margin-bottom: 16px; display: block; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h1>${escapeHtml(title)}</h1>
            </div>
            <div class="body">
                <span class="icon">${icon}</span>
                <p>${message}</p>
                ${submessage ? `<p class="sub">${submessage}</p>` : ''}
            </div>
        </div>
    </body>
    </html>`;
}

function renderSuccessPage(title, message, submessage) {
    return renderPage(title, message, submessage, '#16a34a', '✅');
}

function renderErrorPage(title, message, submessage) {
    return renderPage(title, message, submessage, '#dc2626', '❌');
}

function renderWarningPage(title, message, submessage) {
    return renderPage(title, message, submessage, '#D97706', '⚠️');
}
module.exports = {
    register,
    login,
    verifierCode,
    renvoyerCode, 
    getCurrentUser,
    createAdmin,
    validerProfessionnelParLien,
    refuserProfessionnelParLien,
    getProfessionnelsEnAttente,
    sanitizeUser
};
