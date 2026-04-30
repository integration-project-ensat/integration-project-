const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/client');
const{PUBLIC_ROLES, ROLES} = require('../config/roles');
const {genererCode,sendVerificationCode,sendAdminValidationRequest}=require('../services/email.service');
const { emit } = require('node:cluster');

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '24h';

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

const register = async (req, res) => {
    // Validation des données d'inscription
  const { nom, prenom, email, mot_de_passe_hashe, role, ...specificData } = req.body;
// Vérification de l'unicité de l'email
  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Cet email est déjà utilisé'
    });
  }
// Hashage du mot de passe
  const hashedPassword = await bcrypt.hash(mot_de_passe_hashe, SALT_ROUNDS);
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
          numero_etudiant: specificData.numero_etudiant
        }
      });
      await tx.profil.create({
        data: {
          id_utilisateur: etudiant.id_utilisateur,
          filiere: specificData.filiere,
          annee_universitaire: specificData.annee_universitaire
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
};
//Verification par code de vérification

const verifierCode = async (req, res) => {
    const { email, code } = req.body;
    const user = await prisma.utilisateur.findUnique({ where: { email } });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Email introuvable'
        });
    }
    if (user.token_verification !== code) {
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
    token_verification:null,
    token_expires_at:null
 };

 if(user.role==='ETUDIANT' || user.role==='PROFESSEUR'){
    updateData.est_actif=true;
 }
    await prisma.utilisateur.update({
        where: { id_utilisateur: user.id_utilisateur },
        data: updateData
    });
    
    const message = user.role === 'PROFESSIONNEL'?'Email vérifié! Votre compte est en attente de validation par un administrateur.':'Email vérifié et compte activé! Vous pouvez maintenant vous connecter.';
    res.json({
        success: true,
        message
    });
}

//renvoyer le code de vérification
const renvoyerCode=async(req,res)=>{
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
        where:{id:user.id_utilisateur},
        data:{
            token_verification:newCode,
            token_expires_at:newExpiresAt
        }
    });

    // Envoi du nouveau code de vérification
    await sendVerificationCode(email, newCode, user.nom);

    res.json({
        success: true,
        message: 'Nouveau code de vérification envoyé!'
    });
};


// ==================== CONNEXION ====================

const login = async (req, res) => {
  const { email, mot_de_passe_hashe } = req.body;

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
  const isValid = await bcrypt.compare(mot_de_passe_hashe, user.mot_de_passe_hashe);
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
    message: 'Connexion reussie',
    data: {
      token,
      user: sanitizeUser(user)
    }
  });
};

// ==================== PROFIL ====================

const getCurrentUser = async (req, res) => {
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
};

// ==================== CREATION ADMIN (RESERVE) ====================

const createAdmin = async (req, res) => {
  const { nom, prenom, email, mot_de_passe_hashe } = req.body;

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
        email_verifie: true
      }
    });

    await tx.administrateur.create({
      data: {
        id_utilisateur: newUser.id_utilisateur,
        niveau_acces: 'STANDARD'
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
};
//Valider Professionnel par admin
const validerProfessionnel=async(req,res)=>{
    const {id_utilisateur}=req.params;

    const professionnel=await prisma.professionnel.findUnique({
        where:{id_utilisateur:parseInt(id_utilisateur)}
    });
    if(!professionnel){
        return res.status(404).json({
            success:false,
            message:'Utilisateur introuvable'
        });
    }
    if(professionnel.role!=='PROFESSIONNEL'){
        return res.status(400).json({
            success:false,  
            message:'Cet utilisateur n\'est pas un professionnel'
        });
    }
    if(professionnel.utilisateur.est_actif){
        return res.status(400).json({
            success:false,
            message:'Ce compte est déjà activé'
        });
    }
    const updated=await prisma.utilisateur.update({
        where:{id_utilisateur:parseInt(id_utilisateur)},
        data:{est_actif:true}
    });

    res.json({
        success: true,
        message: 'Professionnel validé avec succès!',
        data: {
            utilisateur: sanitizeUser(updated)
        }

    });
};
//lister les professionnels en attente de validation
const getProfessionnelsEnAttente=async(req,res)=>{
    const professionnels=await prisma.professionnel.findMany({
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
};

module.exports = {
  register,
  login,
  getCurrentUser,
  createAdmin,
  verifierCode,
  renvoyerCode,
  validerProfessionnel,
  getProfessionnelsEnAttente
};