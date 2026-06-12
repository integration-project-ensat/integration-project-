const { prisma, toBigInt } = require('../models/prisma')
const notificationService = require('./notification.service')
const { recalculerScore } = require('./score.service')

const createServiceError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.status = statusCode
  return error
}

async function ensureAttachedProfessorStudent(professorId, studentId) {
  const attached = await prisma.professeurEtudiant.findUnique({
    where: {
      id_professeur_id_etudiant: {
        id_professeur: toBigInt(professorId),
        id_etudiant: toBigInt(studentId),
      },
    },
    select: { id_professeur: true },
  })

  if (!attached) {
    throw createServiceError(403, "Ajoutez d'abord cet Ã©tudiant Ã  votre liste avant de valider sa demande.")
  }
}

const buildStageValidationElement = (stage, statut, validateurId, motif_refus) => ({
  type: 'STAGE',
  reference_id: stage.id_stage,
  statut,
  validateur_id: BigInt(validateurId),
  date_soumission: new Date(),
  date_validation: new Date(),
  motif_refus: motif_refus ?? null,
})

const persistStageValidationElement = async (stage, statut, validateurId, motif_refus) => {
  const existingElement = await prisma.elementValidable.findFirst({
    where: { type: 'STAGE', reference_id: stage.id_stage }
  })

  const data = buildStageValidationElement(stage, statut, validateurId, motif_refus)

  if (existingElement) {
    await prisma.elementValidable.update({
      where: { id_element: existingElement.id_element },
      data,
    })
    return
  }

  await prisma.elementValidable.create({ data })
}

const notifyStageStatusChange = async (stage, statut, motif_refus) => {
  try {
    const message =
      statut === 'VALIDE'
        ? `Votre stage "${stage.entreprise || 'Stage'}" a Ã©tÃ© validÃ©.`
        : `Votre stage "${stage.entreprise || 'Stage'}" a Ã©tÃ© refusÃ©.${motif_refus ? ` Motif: ${motif_refus}` : ''}`

    await notificationService.creerNotification({
      utilisateurId: stage.id_etudiant,
      type: statut === 'VALIDE' ? 'VALIDATION_STAGE' : 'REFUS_STAGE',
      message,
      cibleId: stage.id_stage,
      cibleType: 'STAGE',
    })
  } catch (e) {}
}

const stageService = {
  async findAll(filters = {}) {
    const where = {}
    if (filters.etudiantId) where.id_etudiant = BigInt(filters.etudiantId)
    if (filters.statut) where.statut = filters.statut
    if (filters.encadrantId) where.id_encadrant = BigInt(filters.encadrantId)

    return prisma.stage.findMany({
      where,
      include: {
        etudiant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
        encadrant: { include: { utilisateur: { select: { nom: true, prenom: true } } } },
        professionnel: { include: { utilisateur: { select: { nom: true, prenom: true } } } }
      },
      orderBy: { id_stage: 'desc' }
    })
  },

  async findById(id) {
    return prisma.stage.findUnique({
      where: { id_stage: BigInt(id) },
      include: {
        etudiant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
        encadrant: { include: { utilisateur: { select: { nom: true, prenom: true } } } },
        professionnel: { include: { utilisateur: { select: { nom: true, prenom: true } } } }
      }
    })
  },

  async create(data, etudiantId) {
    const { entreprise, etablissement, poste, duree_semaines, missions, technologies, date_debut, date_fin, id_encadrant, id_professionnel } = data
    const professionnel = id_professionnel
      ? await prisma.professionnel.findUnique({
          where: { id_utilisateur: BigInt(id_professionnel) },
          select: { entreprise: true },
        })
      : null
    if (id_professionnel && !professionnel) {
      throw createServiceError(400, 'Professionnel introuvable')
    }

    const stage = await prisma.stage.create({
      data: {
        entreprise: professionnel?.entreprise || entreprise,
        etablissement: etablissement || null,
        poste,
        duree_semaines,
        missions,
        technologies,
        date_debut: date_debut ? new Date(date_debut) : null,
        date_fin: date_fin ? new Date(date_fin) : null,
        id_etudiant: BigInt(etudiantId),
        ...(id_encadrant && { id_encadrant: BigInt(id_encadrant) }),
        ...(id_professionnel && { id_professionnel: BigInt(id_professionnel) }),
        statut: 'EN_ATTENTE'
      }
    })

    if (id_encadrant) {
      try {
        await notificationService.creerNotification({
          utilisateurId: id_encadrant,
          type: 'SOUMISSION_STAGE',
          message: `Un Ã©tudiant vous a soumis un stage "${entreprise || 'Stage'}" pour validation.`,
          cibleId: stage.id_stage,
          cibleType: 'STAGE',
        })
      } catch (e) {}
    }

    return stage
  },

  async update(id, data, etudiantId) {
    const stage = await prisma.stage.findUnique({ where: { id_stage: BigInt(id) } })
    if (!stage) return null
    if (stage.id_etudiant !== BigInt(etudiantId)) throw createServiceError(403, 'AccÃ¨s refusÃ©')

    const { entreprise, etablissement, poste, duree_semaines, missions, technologies, date_debut, date_fin, id_encadrant, id_professionnel } = data
    const professionnel = id_professionnel
      ? await prisma.professionnel.findUnique({
          where: { id_utilisateur: BigInt(id_professionnel) },
          select: { entreprise: true },
        })
      : null
    if (id_professionnel && !professionnel) {
      throw createServiceError(400, 'Professionnel introuvable')
    }

    return prisma.stage.update({
      where: { id_stage: BigInt(id) },
      data: {
        ...((professionnel?.entreprise || entreprise) && { entreprise: professionnel?.entreprise || entreprise }),
        ...(etablissement !== undefined && { etablissement: etablissement || null }),
        ...(poste !== undefined && { poste }),
        ...(duree_semaines !== undefined && { duree_semaines }),
        ...(missions !== undefined && { missions }),
        ...(technologies !== undefined && { technologies }),
        ...(date_debut && { date_debut: new Date(date_debut) }),
        ...(date_fin && { date_fin: new Date(date_fin) }),
        ...(id_encadrant && { id_encadrant: BigInt(id_encadrant) }),
        ...(id_professionnel && { id_professionnel: BigInt(id_professionnel) }),
      }
    })
  },

  async delete(id, etudiantId) {
    const stage = await prisma.stage.findUnique({ where: { id_stage: BigInt(id) } })
    if (!stage) return null
    if (stage.id_etudiant !== BigInt(etudiantId)) throw createServiceError(403, 'AccÃ¨s refusÃ©')
    return prisma.stage.delete({ where: { id_stage: BigInt(id) } })
  },

  async uploadRapport(id, rapportUrl, etudiantId) {
    const stage = await prisma.stage.findUnique({ where: { id_stage: BigInt(id) } })
    if (!stage) return null
    if (stage.id_etudiant !== BigInt(etudiantId)) throw createServiceError(403, 'AccÃ¨s refusÃ©')
    return prisma.stage.update({
      where: { id_stage: BigInt(id) },
      data: { rapport_url: rapportUrl }
    })
  },

  async changerStatut(id, statut, validateurId, { commentaire_prof, motif_refus } = {}) {
    const stage = await prisma.stage.findUnique({ where: { id_stage: BigInt(id) } })
    if (!stage) return null
    if (stage.id_encadrant && stage.id_encadrant !== BigInt(validateurId)) {
      throw createServiceError(403, 'AccÃ¨s refusÃ©')
    }

    await ensureAttachedProfessorStudent(validateurId, stage.id_etudiant)
    await persistStageValidationElement(stage, statut, validateurId, motif_refus)
    await notifyStageStatusChange(stage, statut, motif_refus)

    const updatedStage = await prisma.stage.update({
      where: { id_stage: BigInt(id) },
      data: {
        statut,
        ...(commentaire_prof !== undefined && { commentaire_prof })
      }
    })

    await recalculerScore(stage.id_etudiant)

    return updatedStage
  },

  async getHistorique(id) {
    return prisma.elementValidable.findMany({
      where: { type: 'STAGE', reference_id: BigInt(id) },
      include: {
        validateur: { select: { nom: true, prenom: true, role: true } }
      },
      orderBy: { id_element: 'desc' }
    })
  }
}

module.exports = stageService
