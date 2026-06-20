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
const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

const FILIERE_NORMALIZATION = [
  { label: 'Informatique', variants: ['Informatique', 'Genie Informatique', 'Génie Informatique', 'GINF', 'INFO'] },
  { label: 'Reseaux et Telecoms', variants: ['Reseaux et Telecoms', 'Réseaux et Télécoms', 'Reseaux', 'Réseaux', 'GSTR', 'GTR'] },
  { label: 'Data Science', variants: ['Data Science', 'Data', 'Big Data'] },
  { label: 'Cybersecurite', variants: ['Cybersecurite', 'Cybersécurité', 'Cybersecurity', 'Securite', 'Sécurité'] },
  { label: 'IA', variants: ['IA', 'Intelligence Artificielle', 'IID'] },
  { label: 'Developpement', variants: ['Developpement', 'Développement', 'Web', 'Mobile'] },
  { label: 'DevOps', variants: ['DevOps'] },
  { label: 'Cloud', variants: ['Cloud'] },
  { label: 'Marketing', variants: ['Marketing'] },
  { label: 'Design', variants: ['Design'] }
];

const canonicalFiliere = (value) => {
  const normalized = normalizeText(value);
  const match = FILIERE_NORMALIZATION.find((item) =>
    item.variants.some((variant) => normalizeText(variant) === normalized)
  );

  return match?.label || String(value || '').trim();
};

const filiereFilterVariants = (value) => {
  const canonical = canonicalFiliere(value);
  const match = FILIERE_NORMALIZATION.find((item) => item.label === canonical);
  return match ? match.variants : [canonical].filter(Boolean);
};

const VILLE_NORMALIZATION = [
  { label: 'Tanger', variants: ['Tanger', 'Tanger, Maroc'] },
  { label: 'Rabat', variants: ['Rabat', 'Rabat, Maroc'] },
  { label: 'Fès', variants: ['Fès', 'Fes', 'Fez', 'Fès, Maroc', 'Fes, Maroc'] },
  { label: 'Casablanca', variants: ['Casablanca', 'Casa', 'Casablanca, Maroc'] },
  { label: 'Marrakech', variants: ['Marrakech', 'Marrakesh', 'Marrakech, Maroc'] },
  { label: 'Agadir', variants: ['Agadir', 'Agadir, Maroc'] },
  { label: 'Oujda', variants: ['Oujda', 'Oujda, Maroc'] },
  { label: 'Tetouan', variants: ['Tetouan', 'Tétouan', 'Tetouan, Maroc', 'Tétouan, Maroc'] },
  { label: 'Kenitra', variants: ['Kenitra', 'Kénitra', 'Kenitra, Maroc', 'Kénitra, Maroc'] },
  { label: 'Meknes', variants: ['Meknes', 'Meknès', 'Meknes, Maroc', 'Meknès, Maroc'] },
  { label: 'El Jadida', variants: ['El Jadida', 'El Jadida, Maroc'] },
  { label: 'Safi', variants: ['Safi', 'Safi, Maroc'] },
  { label: 'Beni Mellal', variants: ['Beni Mellal', 'Béni Mellal', 'Beni Mellal, Maroc', 'Béni Mellal, Maroc'] },
  { label: 'Nador', variants: ['Nador', 'Nador, Maroc'] },
  { label: 'Settat', variants: ['Settat', 'Settat, Maroc'] },
  { label: 'Taza', variants: ['Taza', 'Taza, Maroc'] },
  { label: 'Khouribga', variants: ['Khouribga', 'Khouribga, Maroc'] },
  { label: 'Mohammedia', variants: ['Mohammedia', 'Mohammedia, Maroc'] },
  { label: 'Laayoune', variants: ['Laayoune', 'Laâyoune', 'Laayoune, Maroc', 'Laâyoune, Maroc'] },
  { label: 'Dakhla', variants: ['Dakhla', 'Dakhla, Maroc'] }
];

const canonicalVille = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  const match = VILLE_NORMALIZATION.find((item) =>
    item.variants.some((variant) => normalizeText(variant) === normalized)
  );

  return match?.label || String(value || '').trim();
};

const villeFilterVariants = (value) => {
  const canonical = canonicalVille(value);
  const match = VILLE_NORMALIZATION.find((item) => item.label === canonical);
  return match ? match.variants : [canonical].filter(Boolean);
};

const uniqueStrings = (values) => {
  return [...new Set(
    values
      .filter(Boolean)
      .map((value) => String(value).trim())
      .filter(Boolean)
  )];
};

const splitDisplayName = (value) => {
  const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { prenom: undefined, nom: undefined };
  if (parts.length === 1) return { prenom: parts[0], nom: '' };
  return { prenom: parts[0], nom: parts.slice(1).join(' ') };
};

const expandVilleFilter = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  const aliases = {
    fes: ['Fes', 'Fès'],
    fès: ['Fes', 'Fès'],
    tetouan: ['Tetouan', 'Tétouan'],
    tétouan: ['Tetouan', 'Tétouan'],
    kenitra: ['Kenitra', 'Kénitra'],
    kénitra: ['Kenitra', 'Kénitra'],
    meknes: ['Meknes', 'Meknès'],
    meknès: ['Meknes', 'Meknès'],
    'beni mellal': ['Beni Mellal', 'Béni Mellal'],
    'béni mellal': ['Beni Mellal', 'Béni Mellal'],
    laayoune: ['Laayoune', 'Laâyoune'],
    laâyoune: ['Laayoune', 'Laâyoune']
  };

  return uniqueStrings([value, ...(aliases[normalized] || [])]);
};

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

    return {
      ...donnees,
      profil: donnees.profil ? {
        ...donnees.profil,
        adresse: canonicalVille(donnees.profil.adresse)
      } : null,
      ...avecRole,
      etudiant: avecRole?.etudiant ? {
        ...avecRole.etudiant,
        filiere: canonicalFiliere(avecRole.etudiant.filiere)
      } : avecRole?.etudiant
    };
  }

  // ─── ÉCRITURE ─────────────────────────────

  async mettreAJourProfil(idUtilisateur, data) {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: BigInt(idUtilisateur) },
      select: { role: true }
    });

    const adresseNormalisee = data.adresse !== undefined ? canonicalVille(data.adresse) : undefined;
    const nameParts = data.name !== undefined ? splitDisplayName(data.name) : null;

    if (nameParts) {
      await prisma.utilisateur.update({
        where: { id_utilisateur: BigInt(idUtilisateur) },
        data: {
          ...(nameParts.prenom !== undefined && { prenom: nameParts.prenom }),
          ...(nameParts.nom !== undefined && { nom: nameParts.nom })
        }
      });
    }

    const champsCommuns = {
      ...(data.photo_profil        !== undefined && { photo_profil:        data.photo_profil }),
      ...(data.telephone           !== undefined && { telephone:           data.telephone }),
      ...(data.adresse             !== undefined && { adresse:             adresseNormalisee }),
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
        adresse:             adresseNormalisee        ?? null,
        email_professionnel: data.email_professionnel ?? null,
        bio:                 data.bio                 ?? null,
        linkedin_url:        data.linkedin_url        ?? null,
        visibilite:          data.visibilite          ?? 'PUBLIC'
      }
    });

    if (
      utilisateur?.role === ROLES.ETUDIANT &&
      data.etablissement !== undefined
    ) {
      await prisma.etudiant.update({
        where: { id_utilisateur: BigInt(idUtilisateur) },
        data: { etablissement: data.etablissement || null }
      });
    }

    if (data.title !== undefined) {
      if (utilisateur?.role === ROLES.ETUDIANT) {
        await prisma.etudiant.update({
          where: { id_utilisateur: BigInt(idUtilisateur) },
          data: { filiere: data.title || null }
        });
      } else if (utilisateur?.role === ROLES.PROFESSEUR) {
        await prisma.professeur.update({
          where: { id_utilisateur: BigInt(idUtilisateur) },
          data: { specialite: data.title || null }
        });
      } else if (utilisateur?.role === ROLES.PROFESSIONNEL) {
        await prisma.professionnel.update({
          where: { id_utilisateur: BigInt(idUtilisateur) },
          data: { poste: data.title || null }
        });
      }
    }

    await recalculerScore(idUtilisateur);
    return profil;
  }

  async updateProfilParId(idCible, data) {
    const utilisateur = await prisma.utilisateur.findUnique({
      where:  { id_utilisateur: BigInt(idCible) },
      select: { id_utilisateur: true, role: true }
    });

    if (!utilisateur) {
      const err = new Error('Utilisateur introuvable');
      err.status = 404;
      throw err;
    }

    const adresseNormalisee = data.adresse !== undefined ? canonicalVille(data.adresse) : undefined;
    const nameParts = data.name !== undefined ? splitDisplayName(data.name) : null;

    if (nameParts) {
      await prisma.utilisateur.update({
        where: { id_utilisateur: BigInt(idCible) },
        data: {
          ...(nameParts.prenom !== undefined && { prenom: nameParts.prenom }),
          ...(nameParts.nom !== undefined && { nom: nameParts.nom })
        }
      });
    }

    const profil = await prisma.profil.upsert({
      where:  { id_utilisateur: BigInt(idCible) },
      update: {
        ...(data.photo_profil        !== undefined && { photo_profil:        data.photo_profil }),
        ...(data.telephone           !== undefined && { telephone:           data.telephone }),
        ...(data.adresse             !== undefined && { adresse:             adresseNormalisee }),
        ...(data.email_professionnel !== undefined && { email_professionnel: data.email_professionnel }),
        ...(data.bio                 !== undefined && { bio:                 data.bio }),
        ...(data.linkedin_url        !== undefined && { linkedin_url:        data.linkedin_url }),
        ...(data.visibilite          !== undefined && { visibilite:          data.visibilite })
      },
      create: {
        id_utilisateur:      BigInt(idCible),
        photo_profil:        data.photo_profil        ?? null,
        telephone:           data.telephone           ?? null,
        adresse:             adresseNormalisee        ?? null,
        email_professionnel: data.email_professionnel ?? null,
        bio:                 data.bio                 ?? null,
        linkedin_url:        data.linkedin_url        ?? null,
        visibilite:          data.visibilite          ?? 'PUBLIC'
      }
    });

    if (data.title !== undefined) {
      if (utilisateur?.role === ROLES.ETUDIANT) {
        await prisma.etudiant.update({
          where: { id_utilisateur: BigInt(idCible) },
          data: { filiere: data.title || null }
        });
      } else if (utilisateur?.role === ROLES.PROFESSEUR) {
        await prisma.professeur.update({
          where: { id_utilisateur: BigInt(idCible) },
          data: { specialite: data.title || null }
        });
      } else if (utilisateur?.role === ROLES.PROFESSIONNEL) {
        await prisma.professionnel.update({
          where: { id_utilisateur: BigInt(idCible) },
          data: { poste: data.title || null }
        });
      }
    }

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
        where.etudiant.OR = filiereFilterVariants(filiere).map((item) => ({
          filiere: { equals: item, mode: 'insensitive' }
        }));
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
      const villeMatches = villeFilterVariants(ville).flatMap((item) => [
        { profil: { adresse: { equals: item, mode: 'insensitive' } } },
        { etudiant: { etablissement: { contains: item, mode: 'insensitive' } } },
        {
          etudiant: {
            diplomes: {
              some: {
                etablissement: { contains: item, mode: 'insensitive' }
              }
            }
          }
        }
      ]);

      where.AND = [
        ...(where.AND || []),
        { OR: villeMatches }
      ];
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
              etablissement:       true,
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
      profil: p.profil ? {
        ...p.profil,
        adresse: canonicalVille(p.profil.adresse)
      } : null,
      etudiant: p.etudiant ? {
        ...p.etudiant,
        filiere: canonicalFiliere(p.etudiant.filiere),
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
                etablissement: true,
                score_credibilite: {
                  select: { score_total: true, niveau: true }
                },
                portfolio: {
                  select: { est_public: true }
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
