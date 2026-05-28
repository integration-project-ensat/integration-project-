const { prisma, toBigInt } = require('../models/prisma')

const includeAuteur = {
  auteur: { select: { id_utilisateur: true, nom: true, prenom: true, role: true } },
}

const commentaireService = {
  async create(data, auteurId) {
    const commentaire = await prisma.commentaire.create({
      data: {
        contenu: data.contenu,
        id_auteur: BigInt(auteurId),
        id_portfolio: data.id_portfolio ? BigInt(data.id_portfolio) : null,
        id_poste: data.id_poste ? BigInt(data.id_poste) : null,
        statut: 'EN_ATTENTE',
        date: new Date(),
      },
      include: includeAuteur,
    })

    await prisma.elementValidable.create({
      data: {
        type: 'COMMENTAIRE',
        reference_id: commentaire.id_commentaire,
        statut: 'EN_ATTENTE',
        date_soumission: new Date(),
      },
    })

    return commentaire
  },

  async findAll(filters = {}) {
    const where = {}
    if (filters.statut) where.statut = filters.statut
    if (filters.id_portfolio) where.id_portfolio = BigInt(filters.id_portfolio)
    if (filters.id_poste) where.id_poste = BigInt(filters.id_poste)

    return prisma.commentaire.findMany({
      where,
      include: includeAuteur,
      orderBy: { date: 'desc' },
    })
  },

  async changerStatut(id, statut, validateurId, motifRefus = null) {
    const commentaire = await prisma.commentaire.findUnique({
      where: { id_commentaire: BigInt(id) },
    })
    if (!commentaire) return null

    await prisma.elementValidable.create({
      data: {
        type: 'COMMENTAIRE',
        reference_id: commentaire.id_commentaire,
        statut,
        validateur_id: BigInt(validateurId),
        date_soumission: commentaire.date || new Date(),
        date_validation: new Date(),
        motif_refus: motifRefus,
      },
    })

    return prisma.commentaire.update({
      where: { id_commentaire: BigInt(id) },
      data: { statut },
      include: includeAuteur,
    })
  },

  async getHistorique(id) {
    return prisma.elementValidable.findMany({
      where: { type: 'COMMENTAIRE', reference_id: BigInt(id) },
      include: {
        validateur: { select: { id_utilisateur: true, nom: true, prenom: true, role: true } },
      },
      orderBy: { id_element: 'desc' },
    })
  },
}

module.exports = commentaireService
