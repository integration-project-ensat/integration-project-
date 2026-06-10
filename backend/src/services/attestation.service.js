const { prisma, toBigInt } = require('../models/prisma')
const notificationService = require('./notification.service')
const { recalculerScore } = require('./score.service')

const attestationService = {
  async findAll(filters = {}) {
    const where = {}
    if (filters.statut) where.element = { statut: filters.statut }
    if (filters.validateurId) where.element = { ...where.element, validateur_id: toBigInt(filters.validateurId) }

    if (filters.etudiantId) {
      const etudiantId = toBigInt(filters.etudiantId)
      const [projets, stages, activites] = await Promise.all([
        prisma.projet.findMany({
          where: { id_etudiant: etudiantId },
          select: { id_projet: true }
        }),
        prisma.stage.findMany({
          where: { id_etudiant: etudiantId },
          select: { id_stage: true }
        }),
        prisma.activiteParascolaire.findMany({
          where: { id_etudiant: etudiantId },
          select: { id_activite: true }
        })
      ])

      const legacyElementReferences = [
        ...projets.map((projet) => ({ type: 'PROJET', reference_id: projet.id_projet })),
        ...stages.map((stage) => ({ type: 'STAGE', reference_id: stage.id_stage })),
        ...activites.map((activite) => ({ type: 'ACTIVITE', reference_id: activite.id_activite }))
      ]

      const legacyElements = legacyElementReferences.length
        ? await prisma.elementValidable.findMany({
            where: {
              OR: legacyElementReferences
            },
            select: { id_element: true }
          })
        : []

      const legacyElementIds = legacyElements.map((element) => element.id_element)

      where.OR = [
        { id_etudiant: etudiantId },
        ...(legacyElementIds.length ? [{ id_element: { in: legacyElementIds } }] : [])
      ]
    }

    return prisma.attestation.findMany({
      where,
      include: {
        etudiant: {
          select: {
            id_utilisateur: true,
            utilisateur: {
              select: { nom: true, prenom: true, email: true }
            }
          }
        },
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
        etudiant: {
          select: {
            id_utilisateur: true,
            utilisateur: {
              select: { nom: true, prenom: true, email: true }
            }
          }
        },
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
        id_etudiant: toBigInt(utilisateurId),
        titre: data.titre,
        type: data.type,
        date: data.date ? new Date(data.date) : null,
        organisme: data.organisme,
        description: data.description
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

      // Le modele Attestation actuel ne stocke pas l'etudiant proprietaire.
      // La notification sera branchee quand cette relation sera ajoutee au schema.
    } catch (e) {
      // Ignore notification failure
    }

    if (attestation.id_etudiant) {
      await recalculerScore(attestation.id_etudiant)
    }

    return this.findById(id)
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
