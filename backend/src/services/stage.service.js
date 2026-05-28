const { prisma, toBigInt } = require('../models/prisma')

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
        encadrant: { include: { utilisateur: { select: { nom: true, prenom: true } } } }
      },
      orderBy: { id_stage: 'desc' }
    })
  },

  async findById(id) {
    return prisma.stage.findUnique({
      where: { id_stage: BigInt(id) },
      include: {
        etudiant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
        encadrant: { include: { utilisateur: { select: { nom: true, prenom: true } } } }
      }
    })
  },

  async create(data, etudiantId) {
    const { entreprise, poste, duree_semaines, missions, technologies, date_debut, date_fin, id_encadrant } = data
    return prisma.stage.create({
      data: {
        entreprise,
        poste,
        duree_semaines,
        missions,
        technologies,
        date_debut: date_debut ? new Date(date_debut) : null,
        date_fin: date_fin ? new Date(date_fin) : null,
        id_etudiant: BigInt(etudiantId),
        ...(id_encadrant && { id_encadrant: BigInt(id_encadrant) }),
        statut: 'EN_ATTENTE'
      }
    })
  },

  async update(id, data, etudiantId) {
    const stage = await prisma.stage.findUnique({ where: { id_stage: BigInt(id) } })
    if (!stage) return null
    if (stage.id_etudiant !== BigInt(etudiantId)) throw { statusCode: 403, message: 'Accès refusé' }

    const { entreprise, poste, duree_semaines, missions, technologies, date_debut, date_fin, id_encadrant } = data
    return prisma.stage.update({
      where: { id_stage: BigInt(id) },
      data: {
        ...(entreprise && { entreprise }),
        ...(poste !== undefined && { poste }),
        ...(duree_semaines !== undefined && { duree_semaines }),
        ...(missions !== undefined && { missions }),
        ...(technologies !== undefined && { technologies }),
        ...(date_debut && { date_debut: new Date(date_debut) }),
        ...(date_fin && { date_fin: new Date(date_fin) }),
        ...(id_encadrant && { id_encadrant: BigInt(id_encadrant) }),
      }
    })
  },

  async delete(id, etudiantId) {
    const stage = await prisma.stage.findUnique({ where: { id_stage: BigInt(id) } })
    if (!stage) return null
    if (stage.id_etudiant !== BigInt(etudiantId)) throw { statusCode: 403, message: 'Accès refusé' }
    return prisma.stage.delete({ where: { id_stage: BigInt(id) } })
  },

  async uploadRapport(id, rapportUrl, etudiantId) {
    const stage = await prisma.stage.findUnique({ where: { id_stage: BigInt(id) } })
    if (!stage) return null
    if (stage.id_etudiant !== BigInt(etudiantId)) throw { statusCode: 403, message: 'Accès refusé' }
    return prisma.stage.update({
      where: { id_stage: BigInt(id) },
      data: { rapport_url: rapportUrl }
    })
  },

  async changerStatut(id, statut, validateurId, { commentaire_prof, motif_refus } = {}) {
    const stage = await prisma.stage.findUnique({ where: { id_stage: BigInt(id) } })
    if (!stage) return null

    await prisma.elementValidable.upsert({
      where: { id_element: stage.id_stage },
      update: {
        statut,
        validateur_id: BigInt(validateurId),
        date_validation: new Date(),
        motif_refus: motif_refus ?? null
      },
      create: {
        type: 'STAGE',
        reference_id: stage.id_stage,
        statut,
        validateur_id: BigInt(validateurId),
        date_soumission: new Date(),
        date_validation: new Date(),
        motif_refus: motif_refus ?? null
      }
    })

    return prisma.stage.update({
      where: { id_stage: BigInt(id) },
      data: {
        statut,
        ...(commentaire_prof !== undefined && { commentaire_prof })
      }
    })
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