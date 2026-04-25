const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/client');
const { PUBLIC_ROLES } = require('../config/roles');

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '24h';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}
//pour ne pas exposer le mot de passe dans les reponses
function sanitizeUser(user) {
  const { mot_de_passe, ...safe } = user;
  return safe;
}

// ==================== INSCRIPTION PUBLIQUE ====================

const register = async (req, res) => {
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
// Création de l'utilisateur et des données spécifiques au rôle dans une transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.utilisateur.create({
      data: {
        email,
        mot_de_passe: hashedPassword,
        nom,
        prenom,
        role,
        est_actif: true
      }
    });
// Création des données spécifiques au rôle
    if (role === PUBLIC_ROLES.ETUDIANT) {
        // Création de l'étudiant
      const etudiant = await tx.etudiant.create({
        data: {
          utilisateur_id: newUser.id,
          numero_etudiant: specificData.numero_etudiant
        }
      });
      await tx.profil.create({
        data: {
          etudiant_id: etudiant.id,
          filiere: specificData.filiere,
          annee_universitaire: specificData.annee_universitaire
        }
      });
    }
// Création du professeur
    if (role === PUBLIC_ROLES.PROFESSEUR) {
      await tx.professeur.create({
        data: {
          utilisateur_id: newUser.id,
          code_administratif: specificData.code_administratif,
          departement: specificData.departement,
          specialite: specificData.specialite
        }
      });
    }
// Création du professionnel

    if (role === PUBLIC_ROLES.PROFESSIONNEL) {
      await tx.professionnel.create({
        data: {
          utilisateur_id: newUser.id,
          entreprise: specificData.entreprise,
          poste: specificData.poste
        }
      });
    }

    return newUser;
  });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Inscription reussie ! Bienvenue.',
    data: {
      token,
      user: sanitizeUser(user)
    }
  });
};

// ==================== CONNEXION ====================

const login = async (req, res) => {
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
  if (!user || !user.est_actif) {
    return res.status(401).json({
      success: false,
      message: 'Email ou mot de passe incorrect'
    });
  }
// Vérification du mot de passe par la fonction compare de bcrypt
  const isValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
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
    where: { id: req.utilisateur.id },
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
  const { nom, prenom, email, mot_de_passe } = req.body;

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
        mot_de_passe: hashedPassword,
        nom,
        prenom,
        role: 'ADMINISTRATEUR',
        est_actif: true
      }
    });

    await tx.administrateur.create({
      data: {
        utilisateur_id: newUser.id,
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

module.exports = {
  register,
  login,
  getCurrentUser,
  createAdmin
};