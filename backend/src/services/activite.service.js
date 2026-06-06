const { prisma, toBigInt } = require('../models/prisma')
const notificationService = require('./notification.service')

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

  async valider(id, validateur, statut) {
    const activite = await prisma.activiteParascolaire.findUnique({ where: { id_activite: BigInt(id) } })
    if (!activite) return null
    const validateurId = validateur?.id_utilisateur ?? validateur
    const isProfesseur = validateur?.role === 'PROFESSEUR'
    const statutElement =
      statut === 'ATTESTEE_INSTITUTION'
        ? 'VALIDE'
        : statut === 'REFUSEE'
          ? 'REFUSE'
          : 'EN_ATTENTE'
    // Mettre à jour la table activite
    const updated = await prisma.activiteParascolaire.update({
      where: { id_activite: BigInt(id) },
      data: {
        statut,
        ...(isProfesseur && { id_validateur: BigInt(validateurId) })
      }
    })

    // Enregistrer / mettre à jour l'élément validable associé
    try {
      const existing = await prisma.elementValidable.findFirst({ where: { type: 'ACTIVITE', reference_id: activite.id_activite } })
      if (existing) {
        await prisma.elementValidable.update({
          where: { id_element: existing.id_element },
          data: { statut: statutElement, validateur_id: toBigInt(validateurId), date_validation: new Date() }
        })
      } else {
        await prisma.elementValidable.create({
          data: { type: 'ACTIVITE', reference_id: activite.id_activite, statut: statutElement, validateur_id: toBigInt(validateurId), date_soumission: new Date(), date_validation: new Date() }
        })
      }

      // Notifications: informer l'étudiant
      const utilisateurId = activite.id_etudiant
      if (statut === 'ATTESTEE_INSTITUTION') {
        await notificationService.creerNotification({
          utilisateurId,
          type: 'VALIDATION_STAGE',
          message: `Votre activité \"${activite.nom || 'Activité'}\" a été validée.`,
          cibleId: activite.id_activite,
          cibleType: 'ACTIVITE'
        })
      } else {
        // traitement générique pour autres statuts
        await notificationService.creerNotification({
          utilisateurId,
          type: 'REFUS_STAGE',
          message: `Le statut de votre activité \"${activite.nom || 'Activité'}\" a été mis à jour: ${statut}.`,
          cibleId: activite.id_activite,
          cibleType: 'ACTIVITE'
        })
      }
    } catch (e) {
      // ne pas bloquer la validation si la notification échoue
    }

    return updated
  }
}

module.exports = activiteService
