// src/controllers/admin.controller.js

const prisma = require('../../prisma/client');
const asyncHandler = require('../middlewares/asyncHandler');
const { sanitizeUser } = require('./auth.controller');
const { getPaginationParams, buildPaginatedResult } = require('../utils/pagination');

// ==================== DASHBOARD ====================

// GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const maintenant = new Date();
  const il_y_a_6_mois = new Date();
  il_y_a_6_mois.setMonth(il_y_a_6_mois.getMonth() - 6);
  il_y_a_6_mois.setDate(1);
  il_y_a_6_mois.setHours(0, 0, 0, 0);

  const [
    totalProfils,
    totalPortfolios,
    totalVerifies,
    enAttente,
    croissance,
    repartitionFilieres,
    activiteRecente,
    nouveauxUsers,
    recentPortfolios
  ] = await Promise.all([

    // Profils totaux (tous rôles actifs)
    prisma.utilisateur.count({ where: { est_actif: true } }),

    // Portfolios soumis
    prisma.portfolio.count(),

    // Éléments validés
    prisma.elementValidable.count({ where: { statut: 'VALIDE' } }),

    // Éléments en attente
    prisma.elementValidable.count({ where: { statut: 'EN_ATTENTE' } }),

    // Croissance 6 mois : inscriptions + portfolios soumis par mois
    prisma.$queryRaw`
      SELECT
        TO_CHAR(DATE_TRUNC('month', date_creation), 'Mon') AS mois,
        DATE_TRUNC('month', date_creation)                 AS mois_date,
        COUNT(*)                                           AS inscriptions
      FROM utilisateurs
      WHERE date_creation >= ${il_y_a_6_mois}
      GROUP BY DATE_TRUNC('month', date_creation)
      ORDER BY mois_date ASC
    `,

    // Répartition par filière (top 4)
    prisma.etudiant.groupBy({
      by: ['filiere'],
      _count: { filiere: true },
      where: { filiere: { not: null } },
      orderBy: { _count: { filiere: 'desc' } },
      take: 4,
    }),

    // Activité récente : dernières actions (connexions)
    prisma.journalConnexion.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      include: {
        utilisateur: {
          select: {
            nom: true,
            prenom: true,
            email: true,
            profil: { select: { photo_profil: true } },
          },
        },
      },
    }),

    // Nouveaux utilisateurs
    prisma.utilisateur.findMany({
      take: 5,
      orderBy: { date_creation: 'desc' },
      select: {
        id_utilisateur: true, nom: true, prenom: true, email: true, role: true, date_creation: true,
        profil: { select: { photo_profil: true } }
      }
    }),

    // Portfolios recents
    prisma.portfolio.findMany({
      take: 5,
      orderBy: { date_modification: 'desc' },
      include: {
        etudiant: {
          include: {
            utilisateur: {
              select: { nom: true, prenom: true, email: true, profil: { select: { photo_profil: true } } }
            }
          }
        }
      }
    })
  ]);

  // Portfolios soumis par mois (pour la deuxième courbe du graphique)
  const portfoliosMois = await prisma.$queryRaw`
    SELECT
      TO_CHAR(DATE_TRUNC('month', date_modification), 'Mon') AS mois,
      DATE_TRUNC('month', date_modification)                  AS mois_date,
      COUNT(*)                                                AS portfolios
    FROM portfolios
    WHERE date_modification >= ${il_y_a_6_mois}
    GROUP BY DATE_TRUNC('month', date_modification)
    ORDER BY mois_date ASC
  `;

  // Formatage activité récente (connexions)
  const activiteFormatee = activiteRecente.map((log) => ({
    id: log.id,
    utilisateur: log.utilisateur
      ? {
          nom_complet: `${log.utilisateur.prenom} ${log.utilisateur.nom}`,
          email: log.utilisateur.email,
          photo: log.utilisateur.profil?.photo_profil ?? null,
        }
      : { nom_complet: log.nom_complet ?? 'Inconnu', email: log.email, photo: null },
    action: _labelAction(log.action, log.raison),
    date: log.date,
    statut: _statutAction(log.action),
  }));

  const activitesPlateforme = [];
  nouveauxUsers.forEach(u => {
    activitesPlateforme.push({
      id: `u_${u.id_utilisateur}`,
      utilisateur: {
        nom_complet: `${u.prenom} ${u.nom}`,
        email: u.email,
        photo: u.profil?.photo_profil ?? null
      },
      action: `Nouvelle inscription (${u.role.toLowerCase()})`,
      date: u.date_creation,
      statut: 'complete'
    });
  });

  recentPortfolios.forEach(p => {
    if (p.etudiant && p.etudiant.utilisateur) {
      activitesPlateforme.push({
        id: `p_${p.id_portfolio}`,
        utilisateur: {
          nom_complet: `${p.etudiant.utilisateur.prenom} ${p.etudiant.utilisateur.nom}`,
          email: p.etudiant.utilisateur.email,
          photo: p.etudiant.utilisateur.profil?.photo_profil ?? null
        },
        action: 'Portfolio mis à jour',
        date: p.date_modification ?? new Date(),
        statut: 'pending'
      });
    }
  });

  activitesPlateforme.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({
    success: true,
    data: {
      stats: {
        totalProfils: Number(totalProfils),
        totalPortfolios: Number(totalPortfolios),
        totalVerifies: Number(totalVerifies),
        enAttente: Number(enAttente),
      },
      croissance: {
        inscriptions: croissance.map((r) => ({
          mois: r.mois,
          valeur: Number(r.inscriptions),
        })),
        portfolios: portfoliosMois.map((r) => ({
          mois: r.mois,
          valeur: Number(r.portfolios),
        })),
      },
      repartitionFilieres: repartitionFilieres.map((f) => ({
        filiere: f.filiere ?? 'Autre',
        count: f._count.filiere,
      })),
      activiteRecente: activiteFormatee,
      activitesPlateforme: activitesPlateforme.slice(0, 5),
    },
  });
});

// Helpers dashboard
function _labelAction(action, raison) {
  if (action === 'LOGIN_REUSSI')  return 'Connexion réussie';
  if (action === 'DECONNEXION')   return 'Déconnexion';
  if (action === 'LOGIN_ECHOUE') {
    const labels = {
      MOT_DE_PASSE_INCORRECT: 'Tentative connexion (mauvais MDP)',
      EMAIL_INEXISTANT:       'Tentative connexion (email inconnu)',
      EMAIL_NON_VERIFIE:      'Tentative connexion (email non vérifié)',
      COMPTE_INACTIF:         'Tentative connexion (compte inactif)',
    };
    return labels[raison] ?? 'Tentative de connexion échouée';
  }
  return action;
}

function _statutAction(action) {
  if (action === 'LOGIN_REUSSI') return 'complete';
  if (action === 'LOGIN_ECHOUE') return 'annule';
  return 'complete';
}

// ==================== GESTION ÉTUDIANTS ====================

// GET /api/admin/etudiants
// Query params :
//   recherche     nom, prénom ou email (insensible à la casse)
//   ville         filtre sur profil.adresse
//   etablissement filtre sur diplomes.etablissement (dernier diplôme)
//   scoreMin      score_total minimum (0-100)
//   statut        verifie | en_attente | non_verifie
//   page / limit

const getEtudiants = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);
  const { recherche, ville, etablissement, scoreMin, statut } = req.query;

  // Validation scoreMin
  let scoreMinVal = null;
  if (scoreMin !== undefined) {
    scoreMinVal = parseFloat(scoreMin);
    if (isNaN(scoreMinVal) || scoreMinVal < 0 || scoreMinVal > 100) {
      return res.status(400).json({ success: false, message: 'scoreMin doit être un nombre entre 0 et 100' });
    }
  }

  // Construction du where principal
  const where = {
    role: 'ETUDIANT',
    est_actif: true,
  };

  // Recherche nom / prénom / email
  if (recherche?.trim()) {
    const q = recherche.trim();
    where.OR = [
      { nom:    { contains: q, mode: 'insensitive' } },
      { prenom: { contains: q, mode: 'insensitive' } },
      { email:  { contains: q, mode: 'insensitive' } },
    ];
  }

  // Filtre ville via profil.adresse
  if (ville?.trim()) {
    where.profil = { adresse: { contains: ville.trim(), mode: 'insensitive' } };
  }

  // Filtre score minimum via score_credibilite
  if (scoreMinVal !== null) {
    where.etudiant = {
      ...where.etudiant,
      score_credibilite: { score_total: { gte: scoreMinVal } },
    };
  }

  // Filtre établissement via diplômes
  // On filtre les étudiants qui ont AU MOINS UN diplôme dans cet établissement
  if (etablissement?.trim()) {
    where.etudiant = {
      ...where.etudiant,
      diplomes: {
        some: { etablissement: { contains: etablissement.trim(), mode: 'insensitive' } },
      },
    };
  }

  // Filtre statut portfolio (basé sur email_verifie + score)
  if (statut) {
    const statutsValides = ['verifie', 'en_attente', 'non_verifie'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: `statut invalide. Valeurs acceptées : ${statutsValides.join(', ')}`,
      });
    }
    // verifie  → email vérifié + score >= 70
    // en_attente → email vérifié + score < 70 ou pas de score
    // non_verifie → email non vérifié
    if (statut === 'non_verifie') {
      where.email_verifie = false;
    } else if (statut === 'verifie') {
      where.email_verifie = true;
      where.etudiant = {
        ...where.etudiant,
        score_credibilite: { score_total: { gte: 70 } },
      };
    } else if (statut === 'en_attente') {
      where.email_verifie = true;
      where.etudiant = {
        ...where.etudiant,
        OR: [
          { score_credibilite: null },
          { score_credibilite: { score_total: { lt: 70 } } },
        ],
      };
    }
  }

  const [items, total] = await Promise.all([
    prisma.utilisateur.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date_creation: 'desc' },
      include: {
        profil: true,
        etudiant: {
          include: {
            score_credibilite: true,
            diplomes: { orderBy: { annee_fin: 'desc' }, take: 1 },
          },
        },
      },
    }),
    prisma.utilisateur.count({ where }),
  ]);

  // Formatage de la réponse
  const data = items.map((u) => {
    const score = u.etudiant?.score_credibilite?.score_total
      ? Number(u.etudiant.score_credibilite.score_total)
      : null;
    const dernierDiplome = u.etudiant?.diplomes?.[0] ?? null;

    return {
      id: u.id_utilisateur,
      nom_complet: `${u.prenom} ${u.nom}`,
      email: u.email,
      photo: u.profil?.photo_profil ?? null,
      etablissement: dernierDiplome?.etablissement ?? null,
      localisation: u.profil?.adresse ?? null,
      score_portfolio: score,
      statut: _statutEtudiant(u.email_verifie, score),
      portfolio_url: null, // sera peuplé quand la route portfolio sera prête
      date_inscription: u.date_creation,
    };
  });

  res.json({
    success: true,
    ...buildPaginatedResult(data, page, limit, total),
  });
});

// Statut affiché dans le tableau
function _statutEtudiant(emailVerifie, score) {
  if (!emailVerifie)            return 'non_verifie';
  if (score !== null && score >= 70) return 'verifie';
  return 'en_attente';
}

// GET /api/admin/etudiants/:id
const getEtudiantDetail = asyncHandler(async (req, res) => {
  const id = BigInt(req.params.id);

  const etudiant = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: id, role: 'ETUDIANT' },
    include: {
      profil: true,
      etudiant: {
        include: {
          score_credibilite: true,
          diplomes: true,
          competences: { include: { competence: true } },
          badges: { include: { badge: true } },
          portfolio: true,
          stages: true,
          projets: true,
          activites: true,
        },
      },
    },
  });

  if (!etudiant) {
    return res.status(404).json({ success: false, message: 'Étudiant introuvable' });
  }

  res.json({ success: true, data: sanitizeUser(etudiant) });
});

// ==================== EXPORT CSV ====================

// GET /api/admin/etudiants/export-csv
// Mêmes filtres que getEtudiants, sans pagination
const exportEtudiantsCSV = asyncHandler(async (req, res) => {
  const { recherche, ville, etablissement, scoreMin, statut } = req.query;

  let scoreMinVal = null;
  if (scoreMin !== undefined) {
    scoreMinVal = parseFloat(scoreMin);
    if (isNaN(scoreMinVal)) scoreMinVal = null;
  }

  const where = { role: 'ETUDIANT', est_actif: true };

  if (recherche?.trim()) {
    const q = recherche.trim();
    where.OR = [
      { nom:    { contains: q, mode: 'insensitive' } },
      { prenom: { contains: q, mode: 'insensitive' } },
      { email:  { contains: q, mode: 'insensitive' } },
    ];
  }
  if (ville?.trim()) {
    where.profil = { adresse: { contains: ville.trim(), mode: 'insensitive' } };
  }
  if (scoreMinVal !== null) {
    where.etudiant = { score_credibilite: { score_total: { gte: scoreMinVal } } };
  }
  if (etablissement?.trim()) {
    where.etudiant = {
      ...where.etudiant,
      diplomes: { some: { etablissement: { contains: etablissement.trim(), mode: 'insensitive' } } },
    };
  }

  const items = await prisma.utilisateur.findMany({
    where,
    orderBy: { date_creation: 'desc' },
    include: {
      profil: true,
      etudiant: {
        include: {
          score_credibilite: true,
          diplomes: { orderBy: { annee_fin: 'desc' }, take: 1 },
        },
      },
    },
  });

  // Construction CSV
  const lignes = [
    ['ID', 'Prénom', 'Nom', 'Email', 'Établissement', 'Localisation', 'Score', 'Statut', 'Date inscription'].join(','),
    ...items.map((u) => {
      const score = u.etudiant?.score_credibilite?.score_total
        ? Number(u.etudiant.score_credibilite.score_total)
        : '';
      const diplome = u.etudiant?.diplomes?.[0];
      return [
        u.id_utilisateur,
        _csvEscape(u.prenom),
        _csvEscape(u.nom),
        _csvEscape(u.email),
        _csvEscape(diplome?.etablissement ?? ''),
        _csvEscape(u.profil?.adresse ?? ''),
        score,
        _statutEtudiant(u.email_verifie, score || null),
        u.date_creation.toISOString().split('T')[0],
      ].join(',');
    }),
  ];

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="etudiants.csv"');
  res.send('\uFEFF' + lignes.join('\n')); // BOM UTF-8 pour Excel
});

function _csvEscape(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ==================== VÉRIFICATION GROUPÉE ====================

// POST /api/admin/etudiants/verification-groupee
// Body: { ids: [1, 2, 3] }
const verificationGroupee = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'ids doit être un tableau non vide' });
  }
  if (ids.length > 50) {
    return res.status(400).json({ success: false, message: 'Maximum 50 étudiants par opération groupée' });
  }

  const bigIds = ids.map((id) => BigInt(id));

  // Vérifier que tous les ids sont bien des étudiants actifs
  const etudiants = await prisma.utilisateur.findMany({
    where: { id_utilisateur: { in: bigIds }, role: 'ETUDIANT', est_actif: true },
    select: { id_utilisateur: true },
  });

  if (etudiants.length !== ids.length) {
    return res.status(400).json({
      success: false,
      message: `${ids.length - etudiants.length} identifiant(s) invalide(s) ou non étudiant(s)`,
    });
  }

  // Marquer leurs portfolios comme vérifiés (statut VALIDE sur leurs éléments EN_ATTENTE)
  const result = await prisma.elementValidable.updateMany({
    where: {
      statut: 'EN_ATTENTE',
      // éléments liés aux étudiants sélectionnés via les projets/stages
    },
    data: {
      statut: 'VALIDE',
      validateur_id: req.utilisateur.id_utilisateur,
      date_validation: new Date(),
    },
  });

  res.json({
    success: true,
    message: `Vérification groupée effectuée pour ${etudiants.length} étudiant(s)`,
    data: { modifies: result.count },
  });
});

// ==================== LISTE DES ÉTABLISSEMENTS (pour le filtre) ====================

// GET /api/admin/etablissements
// Retourne la liste distincte des établissements pour alimenter le <select>
const getEtablissements = asyncHandler(async (req, res) => {
  const etablissements = await prisma.diplome.findMany({
    where: { etablissement: { not: null } },
    select: { etablissement: true },
    distinct: ['etablissement'],
    orderBy: { etablissement: 'asc' },
  });

  res.json({
    success: true,
    data: etablissements.map((e) => e.etablissement).filter(Boolean),
  });
});

// GET /api/admin/villes
// Retourne la liste distincte des villes (depuis profil.adresse)
const getVilles = asyncHandler(async (req, res) => {
  const profils = await prisma.profil.findMany({
    where: { adresse: { not: null } },
    select: { adresse: true },
    distinct: ['adresse'],
    orderBy: { adresse: 'asc' },
  });

  res.json({
    success: true,
    data: profils.map((p) => p.adresse).filter(Boolean),
  });
});
// GET /api/admin/portfolios
const getPortfolios = asyncHandler(async (req, res) => {

  const portfolios = await prisma.portfolio.findMany({
    include: {
      etudiant: {
        include: {
          utilisateur: {
            select: {
              id_utilisateur: true,
              nom: true,
              prenom: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: {
      date_modification: 'desc'
    }
  })

  res.json({
    success: true,
    data: portfolios
  })
})

// GET /api/admin/portfolios/:id
const getPortfolioDetail = asyncHandler(async (req, res) => {

  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id_portfolio: BigInt(req.params.id)
    },
    include: {
      etudiant: {
        include: {
          utilisateur: {
            include: {
              profil: true
            }
          }
        }
      },
      commentaires: true,
      recommandations: true,
      modele: true
    }
  })

  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: 'Portfolio introuvable'
    })
  }

  res.json({
    success: true,
    data: portfolio
  })
})
// DELETE /api/admin/portfolios/:id
const deletePortfolio = asyncHandler(async (req, res) => {

  const portfolio = await prisma.portfolio.findUnique({
    where: {
      id_portfolio: BigInt(req.params.id)
    }
  })

  if (!portfolio) {
    return res.status(404).json({
      success: false,
      message: 'Portfolio introuvable'
    })
  }

  await prisma.portfolio.delete({
    where: {
      id_portfolio: BigInt(req.params.id)
    }
  })

  res.json({
    success: true,
    message: 'Portfolio supprimé avec succès'
  })
})

module.exports = {
  getDashboard,
  getEtudiants,
  getEtudiantDetail,
  exportEtudiantsCSV,
  verificationGroupee,
  getEtablissements,
  getVilles,
  getPortfolios,
  getPortfolioDetail,
  deletePortfolio,
};
