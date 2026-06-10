const prisma = require('../../prisma/client')
const asyncHandler = require('../middlewares/asyncHandler');


// ==================== DASHBOARD ÉTUDIANT ====================

const getDashboard = asyncHandler(async (req, res) => {
  const id_utilisateur = BigInt(req.utilisateur.id_utilisateur)

  const etudiant = await prisma.etudiant.findUnique({
    where: { id_utilisateur },
    include: {
      utilisateur: {
        select: {
          id_utilisateur: true,
          nom:            true,
          prenom:         true,
          email:          true,
          profil:         { select: { photo_profil: true } }
        }
      },
      score_credibilite: true,
      diplomes:          true,
      competences:       true,
      projets:           true,
      stages:            true,
      portfolio:         true,
      badges:            { include: { badge: true } },
      recommandations_recues: {
        where: { statut: 'VALIDE' }
      }
    }
  })

  if (!etudiant) {
    return res.status(404).json({ success: false, message: 'Étudiant non trouvé' })
  }

  // Activité récente depuis journal_connexions
  const activiteRecente = await prisma.journalConnexion.findMany({
    where:   { utilisateur_id: id_utilisateur },
    select:  { action: true, date: true, raison: true },
    orderBy: { date: 'desc' },
    take: 5
  })

  // Progression du profil
  let profileProgress = 0
  if (etudiant.utilisateur.profil)      profileProgress += 15
  if (etudiant.diplomes.length > 0)     profileProgress += 20
  if (etudiant.competences.length > 0)  profileProgress += 20
  if (etudiant.projets.length > 0)      profileProgress += 15
  if (etudiant.portfolio)               profileProgress += 20
  if (etudiant.utilisateur.email)       profileProgress += 10
  profileProgress = Math.min(profileProgress, 100)

  res.json({
    success: true,
    data: {
      stats: {
        scoreProfile:    Number(etudiant.score_credibilite?.score_total ?? 0),
        niveau:          etudiant.score_credibilite?.niveau      ?? null,
        recommandations: etudiant.recommandations_recues.length,
        projets:         etudiant.projets.length,
        stages:          etudiant.stages.length,
        badges:          etudiant.badges.length,
        competences:     etudiant.competences.length,
        portfolio:       etudiant.portfolio ? 1 : 0,
      },
      profileProgress,
      activities: activiteRecente.map(log => ({
        action: _labelAction(log.action, log.raison),
        date:   log.date
      })),
      profile: {
        nom:     `${etudiant.utilisateur.prenom} ${etudiant.utilisateur.nom}`,
        email:   etudiant.utilisateur.email,
        filiere: etudiant.filiere,
        photo:   etudiant.utilisateur.profil?.photo_profil ?? null
      }
    }
  })
})

// ==================== PROFIL PROGRESSION ====================

const getProfileProgress = asyncHandler(async (req, res) => {
  const id_utilisateur = BigInt(req.utilisateur.id_utilisateur)

  const etudiant = await prisma.etudiant.findUnique({
    where: { id_utilisateur },
    include: {
      utilisateur: {
        select: { profil: true, email: true }
      },
      diplomes:    true,
      competences: true,
      projets:     true,
      portfolio:   true
    }
  })

  if (!etudiant) {
    return res.status(404).json({ success: false, message: 'Étudiant non trouvé' })
  }

  const sections = {
    personalInfo: {
      completed:  !!etudiant.utilisateur.profil,
      percentage: etudiant.utilisateur.profil ? 100 : 0
    },
    education: {
      completed:  etudiant.diplomes.length > 0,
      percentage: etudiant.diplomes.length > 0 ? 100 : 0
    },
    skills: {
      completed:  etudiant.competences.length > 0,
      percentage: etudiant.competences.length > 0 ? 100 : 0
    },
    projects: {
      completed:  etudiant.projets.length > 0,
      percentage: etudiant.projets.length > 0 ? 100 : 0
    },
    portfolio: {
      completed:  !!etudiant.portfolio,
      percentage: etudiant.portfolio ? 100 : 0
    }
  }

  const totalScore = Object.values(sections).reduce(
    (acc, s) => acc + s.percentage, 0
  ) / Object.keys(sections).length

  res.json({
    success: true,
    data: { totalScore, sections }
  })
})

// ==================== OPPORTUNITÉS ====================

const getOpportunities = asyncHandler(async (req, res) => {
  const id_utilisateur = BigInt(req.utilisateur.id_utilisateur)

  // Professionnels pas encore connectés
  const connexionsExistantes = await prisma.connexion.findMany({
    where: {
      OR: [
        { demandeur_id:    id_utilisateur },
        { destinataire_id: id_utilisateur }
      ]
    },
    select: { demandeur_id: true, destinataire_id: true }
  })

  const idsConnectes = connexionsExistantes.flatMap(c => [
    c.demandeur_id,
    c.destinataire_id
  ])

  const professionnels = await prisma.utilisateur.findMany({
    where: {
      role:      'PROFESSIONNEL',
      est_actif: true,
      id_utilisateur: { notIn: [...idsConnectes, id_utilisateur] },
      professionnel:  { est_valide: true }
    },
    select: {
      id_utilisateur: true,
      nom:            true,
      prenom:         true,
      profil:         { select: { photo_profil: true, adresse: true } },
      professionnel:  { select: { entreprise: true, poste: true, secteur: true } }
    },
    take: 10
  })

  res.json({
    success: true,
    data: {
      professionnels: professionnels.map(p => ({
        id:         p.id_utilisateur.toString(),
        nom:        `${p.prenom} ${p.nom}`,
        poste:      p.professionnel?.poste,
        entreprise: p.professionnel?.entreprise,
        secteur:    p.professionnel?.secteur,
        photo:      p.profil?.photo_profil ?? null
      }))
    }
  })
})

const getProfessionnels = asyncHandler(async (req, res) => {
  const professionnels = await prisma.utilisateur.findMany({
    where: {
      role: 'PROFESSIONNEL',
      est_actif: true,
      professionnel: { est_valide: true }
    },
    select: {
      id_utilisateur: true,
      nom: true,
      prenom: true,
      profil: { select: { photo_profil: true, adresse: true } },
      professionnel: { select: { entreprise: true, poste: true, secteur: true } }
    },
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }]
  })

  res.json({
    success: true,
    data: professionnels.map(p => ({
      id: p.id_utilisateur.toString(),
      nom: `${p.prenom} ${p.nom}`,
      poste: p.professionnel?.poste,
      entreprise: p.professionnel?.entreprise,
      secteur: p.professionnel?.secteur,
      photo: p.profil?.photo_profil ?? null
    }))
  })
})

// ==================== ACTIVITÉ RÉCENTE ====================

const getRecentActivity = asyncHandler(async (req, res) => {
  const id_utilisateur = BigInt(req.utilisateur.id_utilisateur)

  const activities = await prisma.journalConnexion.findMany({
    where:   { utilisateur_id: id_utilisateur },
    select:  { id: true, action: true, date: true, raison: true },
    orderBy: { date: 'desc' },
    take: 20
  })

  res.json({
    success: true,
    data: activities.map(log => ({
      id:     log.id.toString(),
      action: _labelAction(log.action, log.raison),
      date:   log.date
    }))
  })
})

// ==================== HELPERS ====================

function _labelAction(action, raison) {
  const labels = {
    LOGIN_REUSSI:  'Connexion réussie',
    DECONNEXION:   'Déconnexion',
    LOGIN_ECHOUE:  'Tentative de connexion échouée'
  }

  if (action === 'LOGIN_ECHOUE') {
    const failReasons = {
      MOT_DE_PASSE_INCORRECT: 'Tentative de connexion (mauvais MDP)',
      EMAIL_INEXISTANT:       'Tentative de connexion (email inconnu)',
      EMAIL_NON_VERIFIE:      'Tentative de connexion (email non vérifié)',
      COMPTE_INACTIF:         'Tentative de connexion (compte inactif)'
    }
    return failReasons[raison] ?? 'Tentative de connexion échouée'
  }

  return labels[action] ?? action
}

module.exports = {
  getDashboard,
  getProfileProgress,
  getOpportunities,
  getProfessionnels,
  getRecentActivity
}
