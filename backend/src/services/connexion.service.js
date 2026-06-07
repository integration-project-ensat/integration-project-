const { prisma } = require('../models/prisma')

const includeUsers = {
  demandeur: {
    select: { id_utilisateur: true, nom: true, prenom: true, email: true, role: true, profil: true }
  },
  destinataire: {
    select: { id_utilisateur: true, nom: true, prenom: true, email: true, role: true, profil: true }
  },
}

const verifierUtilisateur = async (id) => {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: BigInt(id) },
    select: { id_utilisateur: true, nom: true, prenom: true, role: true, est_actif: true }
  })
  if (!utilisateur || !utilisateur.est_actif) {
    throw { statusCode: 404, message: 'Utilisateur introuvable' }
  }
  return utilisateur
}

const connexionService = {
  async envoyerDemande(demandeurId, destinataireId) {
    if (BigInt(demandeurId) === BigInt(destinataireId)) {
      throw { statusCode: 400, message: 'Vous ne pouvez pas vous connecter avec vous-même' }
    }

    const demandeur = await verifierUtilisateur(demandeurId)
    const destinataire = await verifierUtilisateur(destinataireId)

    if (demandeur.role === 'ADMINISTRATEUR' || destinataire.role === 'ADMINISTRATEUR') {
      throw { statusCode: 403, message: 'Les administrateurs ne participent pas aux connexions' }
    }

    const existe = await prisma.connexion.findFirst({
      where: {
        OR: [
          { demandeur_id: BigInt(demandeurId), destinataire_id: BigInt(destinataireId) },
          { demandeur_id: BigInt(destinataireId), destinataire_id: BigInt(demandeurId) }
        ]
      }
    })

    if (existe) {
      throw { statusCode: 409, message: 'Une demande ou connexion existe déjà' }
    }

    return prisma.$transaction(async (tx) => {
      const connexion = await tx.connexion.create({
        data: {
          demandeur_id: BigInt(demandeurId),
          destinataire_id: BigInt(destinataireId),
          statut: 'EN_ATTENTE'
        },
        include: includeUsers
      })

      await tx.notification.create({
        data: {
          utilisateur_id: BigInt(destinataireId),
          type: 'DEMANDE_CONNEXION',
          message: `${demandeur.prenom} ${demandeur.nom} vous a envoyé une demande de connexion`,
          cible_id: connexion.id_connexion,
          cible_type: 'CONNEXION',
          date_reception: new Date()
        }
      })

      return connexion
    })
  },

  async changerStatut(connexionId, utilisateurId, statut) {
    const connexion = await prisma.connexion.findUnique({
      where: { id_connexion: BigInt(connexionId) },
      include: includeUsers
    })

    if (!connexion) return null

    if (connexion.demandeur.role === 'ADMINISTRATEUR' || connexion.destinataire.role === 'ADMINISTRATEUR') {
      throw { statusCode: 403, message: 'Les administrateurs ne participent pas aux connexions' }
    }

    if (BigInt(connexion.destinataire_id) !== BigInt(utilisateurId)) {
      throw { statusCode: 403, message: 'Vous ne pouvez traiter que les demandes reçues' }
    }

    if (connexion.statut !== 'EN_ATTENTE') {
      throw { statusCode: 400, message: 'Cette demande a déjà été traitée' }
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.connexion.update({
        where: { id_connexion: BigInt(connexionId) },
        data: { statut, date_reponse: new Date() },
        include: includeUsers
      })

      if (statut === 'ACCEPTEE') {
        await tx.notification.create({
          data: {
            utilisateur_id: connexion.demandeur_id,
            type: 'CONNEXION_ACCEPTEE',
            message: `${connexion.destinataire.prenom} ${connexion.destinataire.nom} a accepté votre demande de connexion`,
            cible_id: connexion.id_connexion,
            cible_type: 'CONNEXION',
            date_reception: new Date()
          }
        })
      }

      return updated
    })
  },

  async findMine(utilisateurId) {
    return prisma.connexion.findMany({
      where: {
        OR: [
          { demandeur_id: BigInt(utilisateurId) },
          { destinataire_id: BigInt(utilisateurId) }
        ]
      },
      include: includeUsers,
      orderBy: { date_demande: 'desc' }
    })
  },

  async getMesDemandes(utilisateurId) {
    return prisma.connexion.findMany({
      where: {
        demandeur_id: BigInt(utilisateurId),
        demandeur: { role: { not: 'ADMINISTRATEUR' } },
        destinataire: { role: { not: 'ADMINISTRATEUR' } }
      },
      include: {
        destinataire: {
          select: { id_utilisateur: true, nom: true, prenom: true, email: true, role: true, profil: true }
        }
      },
      orderBy: { date_demande: 'desc' }
    })
  },

  async getDemandesRecues(utilisateurId) {
    return prisma.connexion.findMany({
      where: {
        destinataire_id: BigInt(utilisateurId),
        statut: 'EN_ATTENTE',
        demandeur: { role: { not: 'ADMINISTRATEUR' } },
        destinataire: { role: { not: 'ADMINISTRATEUR' } }
      },
      include: {
        demandeur: {
          select: { id_utilisateur: true, nom: true, prenom: true, email: true, role: true, profil: true }
        }
      },
      orderBy: { date_demande: 'desc' }
    })
  },

  async getMesConnexions(utilisateurId) {
    return prisma.connexion.findMany({
      where: {
        statut: 'ACCEPTEE',
        OR: [
          { demandeur_id: BigInt(utilisateurId) },
          { destinataire_id: BigInt(utilisateurId) }
        ],
        demandeur: { role: { not: 'ADMINISTRATEUR' } },
        destinataire: { role: { not: 'ADMINISTRATEUR' } }
      },
      include: includeUsers,
      orderBy: { date_reponse: 'desc' }
    })
  },

  async supprimerConnexion(connexionId, utilisateurId) {
    const connexion = await prisma.connexion.findUnique({
      where: { id_connexion: BigInt(connexionId) }
    })

    if (!connexion) throw { statusCode: 404, message: 'Connexion introuvable' }

    const estParticipant =
      BigInt(connexion.demandeur_id) === BigInt(utilisateurId) ||
      BigInt(connexion.destinataire_id) === BigInt(utilisateurId)

    if (!estParticipant) throw { statusCode: 403, message: 'Action non autorisée' }

    if (connexion.statut !== 'ACCEPTEE') {
      throw { statusCode: 422, message: 'Seule une connexion acceptée peut être supprimée' }
    }

    await prisma.connexion.delete({ where: { id_connexion: BigInt(connexionId) } })
    return true
  }
}

module.exports = connexionService