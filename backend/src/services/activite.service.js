const { prisma, toBigInt } = require('../models/prisma')

const activiteService = {
  async findAll(filters = {}) {
    const where = {}
    if (filters.etudiantId) where.id_etudiant = BigInt(filters.etudiantId)
    if (filters.statut) where.statut = filters.statut
    if (filters.validateurId) where.id_validateur = BigInt(filters.validateurId)

    return prisma.activiteParascolaire.findMany({
      where,
      include: {
        etudiant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
        validateur: { include: { utilisateur: { select: { nom: true, prenom: true } } } }
      },
      orderBy: { id_activite: 'desc' }
    })
  },

  async findById(id) {
    return prisma.activiteParascolaire.findUnique({
      where: { id_activite: BigInt(id) },
      include: {
        etudiant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
        validateur: { include: { utilisateur: { select: { nom: true, prenom: true } } } }
      }
    })
  },

  async create(data, etudiantId) {
    const { nom, type, periode, description } = data
    return prisma.activiteParascolaire.create({
      data: {
        nom,
        type,
        periode,
        description,
        id_etudiant: BigInt(etudiantId),
        statut: 'DECLAREE'
      }
    })
  },

  async update(id, data, etudiantId) {
    const activite = await prisma.activiteParascolaire.findUnique({ where: { id_activite: BigInt(id) } })
    if (!activite) return null
    if (activite.id_etudiant !== BigInt(etudiantId)) throw { statusCode: 403, message: 'Accès refusé' }

    const { nom, type, periode, description } = data
    return prisma.activiteParascolaire.update({
      where: { id_activite: BigInt(id) },
      data: {
        ...(nom && { nom }),
        ...(type !== undefined && { type }),
        ...(periode !== undefined && { periode }),
        ...(description !== undefined && { description }),
      }
    })
  },

  async delete(id, etudiantId) {
    const activite = await prisma.activiteParascolaire.findUnique({ where: { id_activite: BigInt(id) } })
    if (!activite) return null
    if (activite.id_etudiant !== BigInt(etudiantId)) throw { statusCode: 403, message: 'Accès refusé' }
    return prisma.activiteParascolaire.delete({ where: { id_activite: BigInt(id) } })
  },

  async uploadJustificatif(id, justificatifUrl, etudiantId) {
    const activite = await prisma.activiteParascolaire.findUnique({ where: { id_activite: BigInt(id) } })
    if (!activite) return null
    if (activite.id_etudiant !== BigInt(etudiantId)) throw { statusCode: 403, message: 'Accès refusé' }
    return prisma.activiteParascolaire.update({
      where: { id_activite: BigInt(id) },
      data: { justificatif_url: justificatifUrl }
    })
  },

  async valider(id, validateurId, statut) {
    const activite = await prisma.activiteParascolaire.findUnique({ where: { id_activite: BigInt(id) } })
    if (!activite) return null

    return prisma.activiteParascolaire.update({
      where: { id_activite: BigInt(id) },
      data: {
        statut,
        id_validateur: BigInt(validateurId)
      }
    })
  }
}

module.exports = activiteService