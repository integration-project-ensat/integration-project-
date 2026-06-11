// src/services/profil.service.js
const prisma = require('../../prisma/client');
const { ROLES } = require('../config/roles');
const { recalculerScore } = require('./score.service');

// ─────────────────────────────────────────────
// SCRUM-55 : buildProfileInclude(role)
// ─────────────────────────────────────────────
const buildProfileInclude = (role) => {
  switch (role) {
    case ROLES.ETUDIANT:
      return {
        etudiant: {
          include: {
            competences: { include: { competence: true } },
            diplomes: true,
            projets: {
              where: { statut: 'VALIDE' },
              include: { technologies: { include: { technologie: true } } }
            },
            stages: { where: { statut: 'VALIDE' } },
            activites: true,
            badges: { include: { badge: true } },
            score_credibilite: true
          }
        }
      };
    case ROLES.PROFESSEUR:
      return {
        professeur: {
          include: {
            projets_encadres: {
              where: { statut: 'VALIDE' },
              select: { id_projet: true, titre: true, type: true, statut: true }
            },
            stages_encadres: {
              select: { id_stage: true, entreprise: true, poste: true, statut: true }
            }
          }
        }
      };
    case ROLES.ADMINISTRATEUR:
      return {
        administrateur: {
          select: { niveau_acces: true, date_validation: true }
        }
      };
    case ROLES.PROFESSIONNEL:
      return {
        professionnel: {
          select: { entreprise: true, poste: true, secteur: true, est_valide: true }
        }
      };
    default:
      return {};
  }
};

// ─────────────────────────────────────────────
// Vérification visibilité
// ─────────────────────────────────────────────
const verifierVisibilite = (visibilite, utilisateurConnecte) => {
  if (visibilite === 'PUBLIC') return true;
  if (!utilisateurConnecte) return false;
  if (visibilite === 'PRIVE') return false;
  if (visibilite === 'ENSEIGNANTS') {
    return [ROLES.PROFESSEUR, ROLES.ADMINISTRATEUR].includes(utilisateurConnecte.role);
  }
  return true;
};

// ─────────────────────────────────────────────

class ProfilService {

  // ─── LECTURE ──────────────────────────────

  async getMonProfil(utilisateur) {
    const donnees = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: BigInt(utilisateur.id_utilisateur) },
      select: {
        id_utilisateur: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        date_creation: true,
        derniere_connexion: true,
        profil: true,
        ...buildProfileInclude(utilisateur.role)
      }
    });

    if (!donnees) return null;

    // score_completude vient de score_credibilite déjà inclus dans buildProfileInclude
    return donnees;
  }

  async getProfilParId(idCible, utilisateurConnecte) {
    const donnees = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: BigInt(idCible) },
      select: {
        id_utilisateur: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        profil: true
      }
    });

    if (!donnees) return null;

    const accesAutorise = verifierVisibilite(
      donnees.profil?.visibilite ?? 'PUBLIC',
      utilisateurConnecte
    );

    if (!accesAutorise) {
      const err = new Error('Accès refusé : ce profil est privé');
      err.status = 403;
      throw err;
    }

    const avecRole = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: BigInt(idCible) },
      select: { ...buildProfileInclude(donnees.role) }
    });

    return { ...donnees, ...avecRole };
  }

  // ─── ÉCRITURE ─────────────────────────────

  async mettreAJourProfil(idUtilisateur, data) {
 const champsCommuns = {
      ...(data.photo_profil        !== undefined && { photo_profil:        data.photo_profil }),
      ...(data.telephone           !== undefined && { telephone:           data.telephone }),
      ...(data.adresse             !== undefined && { adresse:             data.adresse }),
      ...(data.email_professionnel !== undefined && { email_professionnel: data.email_professionnel }),
      ...(data.bio                 !== undefined && { bio:                 data.bio }),
      ...(data.linkedin_url        !== undefined && { linkedin_url:        data.linkedin_url }),
      ...(data.visibilite          !== undefined && { visibilite:          data.visibilite })
    }; 
//si le profil n'existe pas (migration, bug inscription, etc.)
    const profil = await prisma.profil.upsert({
      where: { id_utilisateur: BigInt(idUtilisateur) },
      update: champsCommuns,
    create: {
        id_utilisateur: BigInt(idUtilisateur),
        photo_profil:        data.photo_profil        ?? null,
        telephone:           data.telephone           ?? null,
        adresse:             data.adresse             ?? null,
        email_professionnel: data.email_professionnel ?? null,
        bio:                 data.bio                 ?? null,
        linkedin_url:        data.linkedin_url        ?? null,
        visibilite:          data.visibilite          ?? 'PUBLIC'
      }
    });

    await recalculerScore(idUtilisateur);

    return profil;
  }

  // ─── ADMIN : modifier le profil d'un utilisateur ──

  async updateProfilParId(idCible, data) {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: BigInt(idCible) },
      select: { id_utilisateur: true }
    });

    if (!utilisateur) {
      const err = new Error('Utilisateur introuvable');
      err.status = 404;
      throw err;
    }

    const profil = await prisma.profil.upsert({
      where: { id_utilisateur: BigInt(idCible) },
      update: {
        ...(data.photo_profil        !== undefined && { photo_profil:        data.photo_profil }),
        ...(data.telephone           !== undefined && { telephone:           data.telephone }),
        ...(data.adresse             !== undefined && { adresse:             data.adresse }),
        ...(data.email_professionnel !== undefined && { email_professionnel: data.email_professionnel }),
        ...(data.bio                 !== undefined && { bio:                 data.bio }),
        ...(data.linkedin_url        !== undefined && { linkedin_url:        data.linkedin_url }),
        ...(data.visibilite          !== undefined && { visibilite:          data.visibilite })
      },
      create: {
        id_utilisateur:      BigInt(idCible),
        photo_profil:        data.photo_profil        ?? null,
        telephone:           data.telephone           ?? null,
        adresse:             data.adresse             ?? null,
        email_professionnel: data.email_professionnel ?? null,
        bio:                 data.bio                 ?? null,
        linkedin_url:        data.linkedin_url        ?? null,
        visibilite:          data.visibilite          ?? 'PUBLIC'
      }
    });

    await recalculerScore(idCible);

    return profil;
  }
}

module.exports = new ProfilService();