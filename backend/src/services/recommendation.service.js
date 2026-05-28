const { prisma, toBigInt } = require('../models/prisma')

const includeRecommendation = {
  auteur: { select: { id_utilisateur: true, nom: true, prenom: true, role: true } },
  etudiant_cible: {
    include: {
      utilisateur: { select: { id_utilisateur: true, nom: true, prenom: true, email: true } },
    },
  },
  portfolios: { include: { portfolio: true } },
}

const recommendationService = {
  async create(data, auteurId) {
    const recommendation = await prisma.recommandation.create({
      data: {
        id_auteur: BigInt(auteurId),
        id_etudiant_cible: BigInt(data.id_etudiant_cible),
        message: data.message || null,
        role_auteur: data.role_auteur || null,
        statut: 'EN_ATTENTE',
      },
      include: includeRecommendation,
    })

    if (data.id_portfolio) {
      await prisma.portfolioRecommandation.create({
        data: {
          id_portfolio: BigInt(data.id_portfolio),
          id_recommandation: recommendation.id_recommandation,
          est_affichee: false,
        },
      })
    }

    await prisma.elementValidable.create({
      data: {
        type: 'RECOMMANDATION',
        reference_id: recommendation.id_recommandation,
        statut: 'EN_ATTENTE',
        date_soumission: new Date(),
      },
    })

    return recommendation
  },

  async findAll(filters = {}) {
    const where = {}
    if (filters.statut) where.statut = filters.statut
    if (filters.id_etudiant_cible) where.id_etudiant_cible = BigInt(filters.id_etudiant_cible)
    if (filters.id_auteur) where.id_auteur = BigInt(filters.id_auteur)

    return prisma.recommandation.findMany({
      where,
      include: includeRecommendation,
      orderBy: { id_recommandation: 'desc' },
    })
  },

  async changerStatut(id, statut, validateurId, motifRefus = null) {
    const recommendation = await prisma.recommandation.findUnique({
      where: { id_recommandation: BigInt(id) },
    })
    if (!recommendation) return null

    await prisma.elementValidable.create({
      data: {
        type: 'RECOMMANDATION',
        reference_id: recommendation.id_recommandation,
        statut,
        validateur_id: BigInt(validateurId),
        date_soumission: new Date(),
        date_validation: new Date(),
        motif_refus: motifRefus,
      },
    })

    return prisma.recommandation.update({
      where: { id_recommandation: BigInt(id) },
      data: { statut },
      include: includeRecommendation,
    })
  },

  async ajouterAuPortfolio(id, data) {
    const recommendation = await prisma.recommandation.findUnique({
      where: { id_recommandation: BigInt(id) },
    })
    if (!recommendation) return null
    if (recommendation.statut !== 'VALIDE') {
      throw { statusCode: 422, message: 'La recommandation doit etre validee avant affichage' }
    }

    return prisma.portfolioRecommandation.upsert({
      where: {
        id_portfolio_id_recommandation: {
          id_portfolio: BigInt(data.id_portfolio),
          id_recommandation: BigInt(id),
        },
      },
      update: {
        position: data.position,
        est_affichee: data.est_affichee ?? true,
      },
      create: {
        id_portfolio: BigInt(data.id_portfolio),
        id_recommandation: BigInt(id),
        position: data.position,
        est_affichee: data.est_affichee ?? true,
      },
      include: { portfolio: true, recommandation: true },
    })
  },

  async compter(filters = {}) {
    const where = { statut: 'VALIDE' }
    if (filters.id_etudiant_cible) where.id_etudiant_cible = BigInt(filters.id_etudiant_cible)
    if (filters.id_portfolio) {
      return prisma.portfolioRecommandation.count({
        where: {
          id_portfolio: BigInt(filters.id_portfolio),
          est_affichee: true,
          recommandation: { statut: 'VALIDE' },
        },
      })
    }
    return prisma.recommandation.count({ where })
  },
}

module.exports = recommendationService
