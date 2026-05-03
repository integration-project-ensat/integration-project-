const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/client');
const{PUBLIC_ROLES, ROLES} = require('../config/roles');
const { genererCode, sendVerificationCode, sendAdminValidationRequest,sendValidationResultEmail } = require('../services/email.service');
const asyncHandler = require('../middlewares/asyncHandler');

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '24h';
// Fonction pour générer un token JWTavec les informations de l'utilisateur et une clé secrète, valable pendant 24 heures.
function generateToken(user) {
  return jwt.sign(
    { userId: user.id_utilisateur, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}
//pour ne pas exposer le mot de passe dans les reponses
function sanitizeUser(user) {
  const { mot_de_passe_hashe, ...safe } = user;
  return safe;
}

// ==================== INSCRIPTION PUBLIQUE ====================

const register = asyncHandler(async (req, res) => {
    // Validation des données d'inscription
  const { nom, prenom, email, mot_de_passe, role, ...specificData } = req.body;
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
const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

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
        token_expires_at: tokenExpiresAt
      }
    });
// Création des données spécifiques au rôle
    if (role === 'ETUDIANT') {
        // Création de l'étudiant
      const etudiant = await tx.etudiant.create({
        data: {
          id_utilisateur: newUser.id_utilisateur,
          numero_etudiant: specificData.numero_etudiant,
          filiere: specificData.filiere,
          annee_universitaire: specificData.annee_universitaire,
          profil: { create: {} } // Création du profil vide associé à l'étudiant
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
          poste: specificData.poste
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
        await sendAdminValidationRequest(proComplet);

    }
    res.status(201).json({
        success: true,
        message: 'Inscription réussie! Veuillez vérifier votre email pour activer votre compte.',
        data: {
            userId: user.id_utilisateur,
            email: user.email
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
    const newExpiresAt=new Date(Date.now()+24*60*60*1000);
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
      etudiant: { include: { profil: true } },
      professeur: true,
      professionnel: true,
      administrateur: true
    }
  });
// Vérification de l'existence de l'utilisateur et de son statut actif
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email ou mot de passe incorrect'
    });
  }
    if (!user.est_actif) {
    return res.status(403).json({
        success: false,
        message:'Votre compte n\'est pas encore activé. Veuillez vérifier votre email pour activer votre compte.'
    });
}

// Vérification du mot de passe par la fonction compare de bcrypt
  const isValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hashe);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: 'Email ou mot de passe incorrect'
    });
  }
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
      etudiant: { include: { profil: true } },
      professeur: true,
      professionnel: true,
      administrateur: true
    }
  });

  res.json({
    success: true,
    data: sanitizeUser(user)
  });
});

// ==================== CREATION ADMIN (RESERVE) ====================

const createAdmin = asyncHandler(async (req, res) => {
  const { nom, prenom, email, mot_de_passe } = req.body;

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Cet email est déjà utilisé'
    });
  }

  const hashedPassword = await bcrypt.hash(mot_de_passe_hashe, SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.utilisateur.create({
      data: {
        email,
        mot_de_passe_hashe: hashedPassword,
        nom,
        prenom,
        role: 'ADMINISTRATEUR',
        est_actif: true,
        email_verifie: true,
        administrateur: {
          create: {niveau_acces: 'STANDARD'
}}
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
  if (token !== process.env.ADMIN_ACTION_SECRET) {
    return res.status(403).send(`
      <h2 style="font-family:Arial;color:#dc2626;">❌ Token invalide</h2>
      <p style="font-family:Arial;">Ce lien n'est pas autorisé.</p>
    `);
  }

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: parseInt(utilisateurId) },
    include: { professionnel: true }
  });

  if (!utilisateur || !utilisateur.professionnel) {
    return res.status(404).send(`
      <h2 style="font-family:Arial;color:#dc2626;">❌ Utilisateur introuvable</h2>
      <p style="font-family:Arial;">Ce compte n'existe pas ou a déjà été traité.</p>
    `);
  }

  if (utilisateur.est_actif) {
    return res.status(400).send(`
      <h2 style="font-family:Arial;color:#D97706;">⚠️ Déjà activé</h2>
      <p style="font-family:Arial;">Ce compte est déjà actif.</p>
    `);
  }

  await prisma.utilisateur.update({
    where: { id_utilisateur: parseInt(utilisateurId) },
    data: { est_actif: true }
  });

  await sendValidationResultEmail(utilisateur.email, utilisateur.nom, true);

  // Page de confirmation affichée dans le navigateur
  return res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Compte validé</title></head>
    <body style="font-family:Arial;max-width:500px;margin:80px auto;text-align:center;">
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:40px;">
        <h1 style="color:#16a34a;">✅ Compte validé</h1>
        <p style="color:#374151;">
          Le compte de <strong>${utilisateur.prenom} ${utilisateur.nom}</strong> 
          a été validé avec succès.
        </p>
        <p style="color:#6B7280;font-size:14px;">
          Un email de confirmation a été envoyé à ${utilisateur.email}.
        </p>
      </div>
    </body>
    </html>
  `);
});

const refuserProfessionnelParLien = asyncHandler(async (req, res) => {
  const { utilisateurId } = req.params;
  const { token } = req.query;

  // Vérification du token secret
  if (token !== process.env.ADMIN_ACTION_SECRET) {
    return res.status(403).send(`
      <h2 style="font-family:Arial;color:#dc2626;">❌ Token invalide</h2>
      <p style="font-family:Arial;">Ce lien n'est pas autorisé.</p>
    `);
  }

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: parseInt(utilisateurId) },
    include: { professionnel: true }
  });

  if (!utilisateur || !utilisateur.professionnel) {
    return res.status(404).send(`
      <h2 style="font-family:Arial;color:#dc2626;">❌ Utilisateur introuvable</h2>
      <p style="font-family:Arial;">Ce compte n'existe pas ou a déjà été traité.</p>
    `);
  }

  if (utilisateur.est_actif) {
    return res.status(400).send(`
      <h2 style="font-family:Arial;color:#D97706;">⚠️ Déjà activé</h2>
      <p style="font-family:Arial;">Ce compte est déjà actif, impossible de le refuser.</p>
    `);
  }

  await prisma.utilisateur.delete({
    where: { id_utilisateur: parseInt(utilisateurId) }
  });

  await sendValidationResultEmail(utilisateur.email, utilisateur.nom, false);

  return res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Compte refusé</title></head>
    <body style="font-family:Arial;max-width:500px;margin:80px auto;text-align:center;">
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:40px;">
        <h1 style="color:#dc2626;">❌ Compte refusé</h1>
        <p style="color:#374151;">
          Le compte de <strong>${utilisateur.prenom} ${utilisateur.nom}</strong> 
          a été refusé et supprimé.
        </p>
        <p style="color:#6B7280;font-size:14px;">
          Un email de notification a été envoyé à ${utilisateur.email}.
        </p>
      </div>
    </body>
    </html>
  `);
});
//lister les professionnels en attente de validation
const getProfessionnelsEnAttente=asyncHandler(async(req,res)=>{
    const professionnels=await prisma.utilisateur.findMany({
        where:{
            role:'PROFESSIONNEL',
            est_actif:false,
            email_verifie:true
        },
        include:{professionnel:true}
    });

    res.json({
        success: true,
        data: professionnels.map(sanitizeUser)
    });
});

module.exports = {
    register,
    login,
    verifierCode,
    renvoyerCode, 
    getCurrentUser,
    createAdmin,
    validerProfessionnelParLien,
    refuserProfessionnelParLien,
    getProfessionnelsEnAttente
};
