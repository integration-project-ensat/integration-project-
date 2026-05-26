const prisma = require('../models/prisma')

const includeUsers = {
  demandeur: { select: { id_utilisateur: true, nom: true, prenom: true, email: true, role: true } },
  destinataire: { select: { id_utilisateur: true, nom: true, prenom: true, email: true, role: true } },
}

const connexionService = {
  async create(demandeurId, data) {
    if (BigInt(demandeurId) === BigInt(data.id_destinataire)) {
      throw { statusCode: 422, message: 'Impossible de se connecter avec soi-meme' }
    }

    return prisma.connexion.upsert({
      where: {
        id_demandeur_id_destinataire: {
          id_demandeur: BigInt(demandeurId),
          id_destinataire: BigInt(data.id_destinataire),
        },
      },
      update: {
        statut: 'EN_ATTENTE',
        message: data.message || null,
        date_demande: new Date(),
        date_reponse: null,
      },
      create: {
        id_demandeur: BigInt(demandeurId),
        id_destinataire: BigInt(data.id_destinataire),
        message: data.message || null,
      },
      include: includeUsers,
    })
  },

  async findMine(utilisateurId) {
    return prisma.connexion.findMany({
      where: {
        OR: [
          { id_demandeur: BigInt(utilisateurId) },
          { id_destinataire: BigInt(utilisateurId) },
        ],
      },
      include: includeUsers,
      orderBy: { date_demande: 'desc' },
    })
  },

  async changerStatut(id, utilisateurId, statut) {
    const connexion = await prisma.connexion.findUnique({
      where: { id_connexion: BigInt(id) },
    })

    if (!connexion) return null
    if (connexion.id_destinataire !== BigInt(utilisateurId)) {
      throw { statusCode: 403, message: 'Acces refuse' }
    }

    return prisma.connexion.update({
      where: { id_connexion: BigInt(id) },
      data: { statut, date_reponse: new Date() },
      include: includeUsers,
    })
  },
}

module.exports = connexionService
