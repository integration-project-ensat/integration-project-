const { prisma, toBigInt } = require('../models/prisma')
const notificationService = require('./notification.service')

const attestationService = {
  async findAll(filters = {}) {
    const where = {}
    if (filters.etudiantId) where.id_etudiant = BigInt(filters.etudiantId)
    if (filters.statut) where.element = { statut: filters.statut }
    if (filters.validateurId) where.element = { ...where.element, validateur_id: toBigInt(filters.validateurId) }

    return prisma.attestation.findMany({
      where,
      include: {
        etudiant: { include: { utilisateur: { select: { id_utilisateur: true, nom: true, prenom: true, email: true, role: true } } } },
        element: {
          include: {
            validateur: { select: { id_utilisateur: true, nom: true, prenom: true, role: true } }
          }
        }
      },
      orderBy: { id_attestation: 'desc' }
    })
  },

  async findById(id) {
    return prisma.attestation.findUnique({
      where: { id_attestation: BigInt(id) },
      include: {
        etudiant: { include: { utilisateur: { select: { id_utilisateur: true, nom: true, prenom: true, email: true, role: true } } } },
        element: {
          include: {
            validateur: { select: { id_utilisateur: true, nom: true, prenom: true, role: true } }
          }
        }
      }
    })
  },

  async create(data, utilisateurId, fichierUrl) {
    const element = await prisma.elementValidable.create({
      data: {
        type: 'ATTESTATION',
        reference_id: 0,
        statut: 'EN_ATTENTE',
        date_soumission: new Date()
      }
    })

    const attestation = await prisma.attestation.create({
      data: {
        id_element: element.id_element,
        id_etudiant: BigInt(utilisateurId),
        titre: data.titre,
        type: data.type,
        date: data.date ? new Date(data.date) : null,
        organisme: data.organisme,
        description: data.description,
        fichier: fichierUrl
      }
    })

    await prisma.elementValidable.update({
      where: { id_element: element.id_element },
      data: { reference_id: attestation.id_attestation }
    })

    return attestation
  },

  async update(id, data, utilisateurId) {
    return prisma.attestation.update({
      where: { id_attestation: BigInt(id) },
      data: {
        ...(data.titre !== undefined && { titre: data.titre }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.organisme !== undefined && { organisme: data.organisme }),
        ...(data.description !== undefined && { description: data.description })
      }
    })
  },

  async delete(id) {
    return prisma.attestation.delete({ where: { id_attestation: BigInt(id) } })
  },

  async changerStatut(id, statut, validateurId, motif_refus) {
    const attestation = await prisma.attestation.findUnique({ where: { id_attestation: BigInt(id) } })
    if (!attestation) return null

    await prisma.elementValidable.update({
      where: { id_element: attestation.id_element },
      data: {
        statut,
        validateur_id: toBigInt(validateurId),
        date_validation: new Date(),
        motif_refus: motif_refus ?? null
      }
    })

    try {
      const message = statut === 'VALIDE'
        ? `Votre attestation \"${attestation.titre || 'attestation'}\" a été validée.`
        : `Votre attestation \"${attestation.titre || 'attestation'}\" a été refusée.${motif_refus ? ' Motif: ' + motif_refus : ''}`

      const utilisateurId = attestation.id_etudiant
      if (utilisateurId) {
        await notificationService.creerNotification({
          utilisateurId,
          type: statut === 'VALIDE' ? 'VALIDATION_ATTESTATION' : 'REFUS_ATTESTATION',
          message,
          cibleId: attestation.id_attestation,
          cibleType: 'ATTESTATION'
        })
      }
    } catch (e) {
      // Ignore notification failure
    }

    return attestation
  },

  async getHistorique(id) {
    return prisma.elementValidable.findMany({
      where: { type: 'ATTESTATION', reference_id: BigInt(id) },
      include: {
        validateur: { select: { id_utilisateur: true, nom: true, prenom: true, role: true } }
      },
      orderBy: { id_element: 'desc' }
    })
  }
}

module.exports = attestationService