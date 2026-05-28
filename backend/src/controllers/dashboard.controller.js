const prisma = require('../../prisma/client')
const asyncHandler = require('../middlewares/asyncHandler')
const profilService = require('../services/profil.service')

const _formatName = (utilisateur) => {
  if (!utilisateur) return 'Utilisateur'
  return `${utilisateur.prenom || ''} ${utilisateur.nom || ''}`.trim()
}

const _toInitials = (nomComplet) => {
  return nomComplet
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const _mapStatut = (statut) => {
  if (statut === 'VALIDE') return 'Validé'
  if (statut === 'REFUSE') return 'Refusé'
  return 'En attente'
}

const getProfDashboard = asyncHandler(async (req, res) => {
  const userId = BigInt(req.utilisateur.id_utilisateur)

  const [projets, stages, lettres] = await Promise.all([
    prisma.projet.findMany({
      where: { id_professeur: userId },
      include: {
        etudiant: {
          select: {
            id_utilisateur: true,
            prenom: true,
            nom: true,
            filiere: true,
          }
        }
      }
    }),
    prisma.stage.findMany({
      where: { id_encadrant: userId },
      include: {
        etudiant: {
          select: {
            id_utilisateur: true,
            prenom: true,
            nom: true,
            filiere: true,
          }
        }
      }
    }),
    prisma.lettreRecommandation.findMany({
      where: { id_professeur: userId },
      include: {
        etudiant: {
          select: {
            id_utilisateur: true,
            prenom: true,
            nom: true,
            filiere: true,
          }
        }
      }
    })
  ])

  const validationRequests = [
    ...projets.map((projet) => ({
      id: projet.id_projet.toString(),
      studentId: projet.etudiant?.id_utilisateur?.toString() ?? 'unknown',
      studentName: _formatName(projet.etudiant),
      initials: _toInitials(_formatName(projet.etudiant)),
      type: 'Projet',
      title: projet.titre || 'Projet',
      description: projet.description || 'Validation du projet',
      date: projet.date_debut ? projet.date_debut.toISOString() : new Date().toISOString(),
      status: _mapStatut(projet.statut),
    })),
    ...stages.map((stage) => ({
      id: stage.id_stage.toString(),
      studentId: stage.etudiant?.id_utilisateur?.toString() ?? 'unknown',
      studentName: _formatName(stage.etudiant),
      initials: _toInitials(_formatName(stage.etudiant)),
      type: 'Stage',
      title: stage.entreprise || 'Stage',
      description: stage.missions || 'Validation du stage',
      date: stage.date_debut ? stage.date_debut.toISOString() : new Date().toISOString(),
      status: _mapStatut(stage.statut),
    })),
  ]

  const recommendationRequests = lettres.map((lettre) => ({
    id: lettre.id_lettre.toString(),
    studentId: lettre.etudiant?.id_utilisateur?.toString() ?? 'unknown',
    studentName: _formatName(lettre.etudiant),
    initials: _toInitials(_formatName(lettre.etudiant)),
    profileInfo: lettre.etudiant?.filiere || 'Étudiant',
    title: lettre.motif ? `Lettre ${lettre.motif.toLowerCase()}` : 'Lettre de recommandation',
    message: lettre.contenu || 'Demande de lettre de recommandation',
    date: lettre.date_souhaitee ? lettre.date_souhaitee.toISOString() : new Date().toISOString(),
    status: lettre.statut === 'REDIGEE' ? 'Acceptée' : lettre.statut === 'EN_ATTENTE' ? 'En attente' : 'Refusée',
    writtenLetter: lettre.contenu || null,
  }))

  const stats = {
    total: validationRequests.length,
    pending: validationRequests.filter((item) => item.status === 'En attente').length,
    validated: validationRequests.filter((item) => item.status === 'Validé').length,
    refused: validationRequests.filter((item) => item.status === 'Refusé').length,
  }

  const recommendationStats = {
    total: recommendationRequests.length,
    pending: recommendationRequests.filter((item) => item.status === 'En attente').length,
    accepted: recommendationRequests.filter((item) => item.status === 'Acceptée').length,
    refused: recommendationRequests.filter((item) => item.status === 'Refusée').length,
  }

  return res.json({
    success: true,
    data: {
      profile: {
        name: _formatName(req.utilisateur),
      },
      stats,
      validationRequests,
      recommendationRequests,
      recommendationStats,
    }
  })
})

const getProDashboard = asyncHandler(async (req, res) => {
  const userId = BigInt(req.utilisateur.id_utilisateur)

  const [savedProfiles, pendingConnections, acceptedConnections, refusedConnections, publishedOffers, currentUser] = await Promise.all([
    profilService.getMesSauvegardes(userId),
    prisma.connexion.count({
      where: {
        destinataire_id: userId,
        statut: 'EN_ATTENTE'
      }
    }),
    prisma.connexion.count({
      where: {
        statut: 'ACCEPTEE',
        OR: [
          { demandeur_id: userId },
          { destinataire_id: userId }
        ]
      }
    }),
    prisma.connexion.count({
      where: {
        statut: 'REFUSEE',
        OR: [
          { demandeur_id: userId },
          { destinataire_id: userId }
        ]
      }
    }),
    prisma.poste.count({ where: { id_auteur: userId } }),
    prisma.utilisateur.findUnique({
      where: { id_utilisateur: userId },
      select: { prenom: true, nom: true }
    })
  ])

  const acceptedConnectionsList = await prisma.connexion.findMany({
    where: {
      statut: 'ACCEPTEE',
      OR: [
        { demandeur_id: userId },
        { destinataire_id: userId }
      ]
    },
    include: {
      demandeur: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          role: true,
          profil: { select: { adresse: true } },
          etudiant: {
            select: {
              filiere: true,
              score_credibilite: { select: { score_total: true } }
            }
          }
        }
      },
      destinataire: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          role: true,
          profil: { select: { adresse: true } },
          etudiant: {
            select: {
              filiere: true,
              score_credibilite: { select: { score_total: true } }
            }
          }
        }
      }
    },
    orderBy: { date_reponse: 'desc' }
  })

  const interns = acceptedConnectionsList
    .map((connexion) => {
      const otherUser = connexion.demandeur.role === 'ETUDIANT' ? connexion.demandeur : connexion.destinataire.role === 'ETUDIANT' ? connexion.destinataire : null
      if (!otherUser) return null
      const fullName = _formatName(otherUser)
      return {
        id: otherUser.id_utilisateur.toString(),
        initials: _toInitials(fullName),
        name: fullName,
        school: otherUser.etudiant?.filiere || 'Étudiant',
        field: otherUser.etudiant?.filiere || '—',
        city: otherUser.profil?.adresse || '—',
        score: Number(otherUser.etudiant?.score_credibilite?.score_total ?? 0),
        startDate: connexion.date_reponse ? connexion.date_reponse.toISOString().split('T')[0] : connexion.date_demande.toISOString().split('T')[0],
        badges: [],
        status: 'Actif',
        profilePath: `/profile/student/${otherUser.id_utilisateur}`,
        portfolioPath: `/profile/student/${otherUser.id_utilisateur}`
      }
    })
    .filter(Boolean)

  const savedProfilesData = savedProfiles.map((saved) => {
    const etudiant = saved.etudiant
    const fullName = _formatName(etudiant)
    return {
      id: saved.id,
      name: fullName,
      school: etudiant.etudiant?.filiere || 'Étudiant',
      field: etudiant.etudiant?.filiere || '—',
      city: etudiant.profil?.adresse || '—',
      score: Number(etudiant.etudiant?.score_credibilite?.score_total ?? 0),
      recommendations: 0,
      badges: (etudiant.etudiant?.badges || []).map((item) => item.badge?.nom).filter(Boolean),
      hasPortfolio: Boolean(etudiant.etudiant?.score_credibilite),
      profilePath: `/profile/student/${etudiant.id_utilisateur}`,
      portfolioPath: `/profile/student/${etudiant.id_utilisateur}`
    }
  })

  return res.json({
    success: true,
    data: {
      profile: {
        name: _formatName(currentUser)
      },
      stats: {
        totalInterns: interns.length,
        activeInterns: interns.length,
        savedProfiles: savedProfilesData.length,
        publishedOffers: publishedOffers
      },
      connections: {
        pending: pendingConnections,
        accepted: acceptedConnections,
        refused: refusedConnections
      },
      interns,
      savedProfiles: savedProfilesData
    }
  })
})

module.exports = {
  getProfDashboard,
  getProDashboard
}
