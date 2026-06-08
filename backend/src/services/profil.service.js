// src/services/profil.service.js
const prisma = require('../../prisma/client');
const { ROLES } = require('../config/roles');
const { recalculerScore } = require('./score.service');

// ─────────────────────────────────────────────
// buildProfileInclude(role)
// ─────────────────────────────────────────────
const buildProfileInclude = (role) => {
  switch (role) {
    case ROLES.ETUDIANT:
      return {
        etudiant: {
          include: {
            competences: { include: { competence: true } },
            diplomes: true,
            portfolio: true,
            projets: {
              where: { statut: 'VALIDE' },
              include: { technologies: { include: { technologie: true } } }
            },
            stages: { where: { statut: 'VALIDE' } },
            activites: true,
            recommandations_recues: {
              include: {
                auteur: {
                  select: {
                    id_utilisateur: true,
                    nom: true,
                    prenom: true,
                    role: true,
                    profil: { select: { photo_profil: true } }
                  }
                }
              },
              orderBy: { id_recommandation: 'desc' }
            },
            github_integration: {
              include: {
                depots: {
                  orderBy: { nb_commits: 'desc' }
                }
              }
            },
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
        id_utilisateur:     true,
        nom:                true,
        prenom:             true,
        email:              true,
        role:               true,
        date_creation:      true,
        derniere_connexion: true,
        profil:             true,
        ...buildProfileInclude(utilisateur.role)
      }
    });

    if (!donnees) return null;
    return donnees;
  }

  async getProfilParId(idCible, utilisateurConnecte) {
    const donnees = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: BigInt(idCible) },
      select: {
        id_utilisateur: true,
        nom:            true,
        prenom:         true,
        email:          true,
        role:           true,
        profil:         true
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
      where:  { id_utilisateur: BigInt(idCible) },
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

    const profil = await prisma.profil.upsert({
      where:  { id_utilisateur: BigInt(idUtilisateur) },
      update: champsCommuns,
      create: {
        id_utilisateur:      BigInt(idUtilisateur),
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

  async updateProfilParId(idCible, data) {
    const utilisateur = await prisma.utilisateur.findUnique({
      where:  { id_utilisateur: BigInt(idCible) },
      select: { id_utilisateur: true }
    });

    if (!utilisateur) {
      const err = new Error('Utilisateur introuvable');
      err.status = 404;
      throw err;
    }

    const profil = await prisma.profil.upsert({
      where:  { id_utilisateur: BigInt(idCible) },
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

  // ─── EXPLORER ─────────────────────────────

  async explorerProfils(filtres) {
    const {
      search,
      filiere,
      ville,
      competences,
      score,
      recommandations,
      page  = 1,
      limit = 10
    } = filtres;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const where = {
      role:      'ETUDIANT',
      est_actif: true,
      profil:    { visibilite: { not: 'PRIVE' } }
    };

    if (search) {
      where.OR = [
        { nom:    { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (filiere || competences || score || recommandations) {
      where.etudiant = {};

      if (filiere) {
        where.etudiant.filiere = { contains: filiere, mode: 'insensitive' };
      }

      if (competences) {
        const liste = Array.isArray(competences) ? competences : [competences];
        where.etudiant.competences = {
          some: {
            competence: { nom: { in: liste, mode: 'insensitive' } }
          }
        };
      }

      if (score) {
        where.etudiant.score_credibilite = {
          score_total: { gte: parseFloat(score) }
        };
      }

      if (recommandations) {
        where.etudiant.recommandations_recues = {
          some: { statut: 'VALIDE' }
        };
      }
    }

    if (ville) {
      where.profil = {
        ...where.profil,
        adresse: { contains: ville, mode: 'insensitive' }
      };
    }

    const [total, profils] = await Promise.all([
      prisma.utilisateur.count({ where }),
      prisma.utilisateur.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id_utilisateur: true,
          nom:            true,
          prenom:         true,
          profil: {
            select: {
              photo_profil: true,
              bio:          true,
              adresse:      true,
              linkedin_url: true,
              visibilite:   true
            }
          },
          etudiant: {
            select: {
              filiere:             true,
              annee_universitaire: true,
              score_credibilite: {
                select: { score_total: true, niveau: true }
              },
              competences: {
                select: {
                  competence:      { select: { nom: true, categorie: true } },
                  niveau_maitrise: true
                },
                take: 5
              },
              recommandations_recues: {
                where:  { statut: 'VALIDE' },
                select: { id_recommandation: true }
              },
              diplomes: {
                select:  { titre_diplome: true, etablissement: true, annee_fin: true },
                orderBy: { annee_fin: 'desc' },
                take: 1
              },
              badges: {
                select: { badge: { select: { nom: true, icone_url: true } } },
                take: 3
              }
            }
          }
        },
        orderBy: [
          { etudiant: { score_credibilite: { score_total: 'desc' } } },
          { date_creation: 'desc' }
        ]
      })
    ]);

    const data = profils.map(p => ({
      ...p,
      id_utilisateur:     p.id_utilisateur.toString(),
      nb_recommandations: p.etudiant?.recommandations_recues?.length ?? 0,
      etudiant: p.etudiant ? {
        ...p.etudiant,
        recommandations_recues: undefined
      } : null
    }));

    return {
      data,
      pagination: {
        total,
        page:  pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  // ─── SAUVEGARDES ──────────────────────────

  async sauvegarderProfil(idSauvegardeur, idEtudiant) {
    const cible = await prisma.utilisateur.findUnique({
      where:  { id_utilisateur: BigInt(idEtudiant) },
      select: { role: true, est_actif: true }
    });

    if (!cible || cible.role !== 'ETUDIANT' || !cible.est_actif) {
      const err = new Error('Étudiant introuvable');
      err.status = 404;
      throw err;
    }

    const saved = await prisma.profilSauvegarde.upsert({
      where: {
        id_sauvegardeur_id_etudiant: {
          id_sauvegardeur: BigInt(idSauvegardeur),
          id_etudiant:     BigInt(idEtudiant)
        }
      },
      update: {},
      create: {
        id_sauvegardeur: BigInt(idSauvegardeur),
        id_etudiant:     BigInt(idEtudiant)
      }
    });

    return { ...saved, id: saved.id.toString() };
  }

  async supprimerSauvegarde(idSauvegardeur, idEtudiant) {
    await prisma.profilSauvegarde.deleteMany({
      where: {
        id_sauvegardeur: BigInt(idSauvegardeur),
        id_etudiant:     BigInt(idEtudiant)
      }
    });
  }

  async getMesSauvegardes(idSauvegardeur) {
    const sauvegardes = await prisma.profilSauvegarde.findMany({
      where:   { id_sauvegardeur: BigInt(idSauvegardeur) },
      orderBy: { date_sauvegarde: 'desc' },
      select: {
        id:              true,
        date_sauvegarde: true,
        etudiant: {
          select: {
            id_utilisateur: true,
            nom:            true,
            prenom:         true,
            profil: {
              select: { photo_profil: true, bio: true, adresse: true }
            },
            etudiant: {
              select: {
                filiere: true,
                score_credibilite: {
                  select: { score_total: true, niveau: true }
                },
                badges: {
                  select: { badge: { select: { nom: true, icone_url: true } } },
                  take: 3
                }
              }
            }
          }
        }
      }
    });

    return sauvegardes.map(s => ({
      ...s,
      id: s.id.toString(),
      etudiant: {
        ...s.etudiant,
        id_utilisateur: s.etudiant.id_utilisateur.toString()
      }
    }));
  }
}

module.exports = new ProfilService();
