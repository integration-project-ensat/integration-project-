const { prisma, toBigInt } = require('../models/prisma')

const projetService = {
  async findAll(filters = {}) {
    const where = {}
    if (filters.etudiantId) where.id_etudiant = BigInt(filters.etudiantId)
    if (filters.statut) where.statut = filters.statut
    if (filters.professeurId) where.id_professeur = BigInt(filters.professeurId)

    return prisma.projet.findMany({
      where,
      include: {
        etudiant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
        professeur: { include: { utilisateur: { select: { nom: true, prenom: true } } } },
        technologies: { include: { technologie: true } }
      },
      orderBy: { id_projet: 'desc' }
    })
  },

  async findById(id) {
    return prisma.projet.findUnique({
      where: { id_projet: BigInt(id) },
      include: {
        etudiant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
        professeur: { include: { utilisateur: { select: { nom: true, prenom: true } } } },
        technologies: { include: { technologie: true } }
      }
    })
  },

  async create(data, etudiantId) {
    const { titre, description, type, role, resultats, lien_github, id_professeur, visibilite } = data
    return prisma.projet.create({
      data: {
        titre,
        description,
        type,
        role,
        resultats,
        lien_github,
        visibilite,
        id_etudiant: BigInt(etudiantId),
        ...(id_professeur && { id_professeur: BigInt(id_professeur) }),
        statut: 'EN_ATTENTE'
      }
    })
  },

  async update(id, data, etudiantId) {
    const projet = await prisma.projet.findUnique({ where: { id_projet: BigInt(id) } })
    if (!projet) return null
    if (projet.id_etudiant !== BigInt(etudiantId)) throw { statusCode: 403, message: 'Accès refusé' }

    const { titre, description, type, role, resultats, lien_github, visibilite, id_professeur } = data
    return prisma.projet.update({
      where: { id_projet: BigInt(id) },
      data: {
        ...(titre && { titre }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(role !== undefined && { role }),
        ...(resultats !== undefined && { resultats }),
        ...(lien_github !== undefined && { lien_github }),
        ...(visibilite && { visibilite }),
        ...(id_professeur && { id_professeur: BigInt(id_professeur) }),
      }
    })
  },

  async delete(id, etudiantId) {
    const projet = await prisma.projet.findUnique({ where: { id_projet: BigInt(id) } })
    if (!projet) return null
    if (projet.id_etudiant !== BigInt(etudiantId)) throw { statusCode: 403, message: 'Accès refusé' }
    return prisma.projet.delete({ where: { id_projet: BigInt(id) } })
  },

  async changerStatut(id, statut, validateurId, { motif_refus, appreciation_professeur } = {}) {
    const projet = await prisma.projet.findUnique({ where: { id_projet: BigInt(id) } })
    if (!projet) return null

    // Enregistrer dans ElementValidable pour historisation
    await prisma.elementValidable.upsert({
      where: { id_element: projet.id_projet },
      update: {
        statut,
        validateur_id: BigInt(validateurId),
        date_validation: new Date(),
        motif_refus: motif_refus ?? null
      },
      create: {
        type: 'PROJET',
        reference_id: projet.id_projet,
        statut,
        validateur_id: BigInt(validateurId),
        date_soumission: new Date(),
        date_validation: new Date(),
        motif_refus: motif_refus ?? null
      }
    })

    return prisma.projet.update({
      where: { id_projet: BigInt(id) },
      data: {
        statut,
        ...(appreciation_professeur !== undefined && { appreciation_professeur })
      }
    })
  },

  async soumettre(id, etudiantId) {
    const projet = await prisma.projet.findUnique({ where: { id_projet: BigInt(id) } })
    if (!projet) return null
    if (projet.id_etudiant !== BigInt(etudiantId)) throw { statusCode: 403, message: 'Accès refusé' }

    await prisma.elementValidable.create({
      data: {
        type: 'PROJET',
        reference_id: projet.id_projet,
        statut: 'EN_ATTENTE',
        date_soumission: new Date()
      }
    })

    return prisma.projet.update({
      where: { id_projet: BigInt(id) },
      data: { statut: 'EN_ATTENTE' }
    })
  },

  async getHistorique(id) {
    return prisma.elementValidable.findMany({
      where: { type: 'PROJET', reference_id: BigInt(id) },
      include: {
        validateur: { select: { nom: true, prenom: true, role: true } }
      },
      orderBy: { id_element: 'desc' }
    })
  }
}

module.exports = projetService