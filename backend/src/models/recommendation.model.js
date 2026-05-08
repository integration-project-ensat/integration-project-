const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const RECOMMANDATION_ID_FIELDS = ['id_recommandation', 'id_auteur', 'id_profil']
const PORTFOLIO_RECOMMANDATION_ID_FIELDS = ['id_portfolio', 'id_recommandation']

const createRecommendation = (data) =>
  prisma.recommandation.create({
    data: normalizeBigIntFields(data, RECOMMANDATION_ID_FIELDS),
  })

const createRecommendationForUserProfile = async (id_utilisateur, data) => {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!profil) {
    throw new Error('Profil introuvable pour cet utilisateur')
  }

  return createRecommendation({
    ...data,
    id_profil: profil.id_profil,
  })
}

const findRecommendationsUser = async (id_utilisateur) => {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!profil) return []

  return prisma.recommandation.findMany({
    where: { id_profil: profil.id_profil },
    include: {
      auteur: true,
      portfolios: { include: { portfolio: true } },
    },
  })
}

const findRecommendationsProfil = (id_profil) =>
  prisma.recommandation.findMany({
    where: { id_profil: toBigInt(id_profil) },
    include: {
      auteur: true,
      portfolios: { include: { portfolio: true } },
    },
  })

const findRecommendationsPortfolio = (id_portfolio) =>
  prisma.portfolioRecommandation.findMany({
    where: { id_portfolio: toBigInt(id_portfolio), est_affichee: true },
    include: {
      recommandation: { include: { auteur: true, profil: true } },
    },
    orderBy: { position: 'asc' },
  })

const ajouterRecommendationAuPortfolio = (id_portfolio, id_recommandation, data = {}) =>
  prisma.portfolioRecommandation.upsert({
    where: {
      id_portfolio_id_recommandation: {
        id_portfolio: toBigInt(id_portfolio),
        id_recommandation: toBigInt(id_recommandation),
      },
    },
    update: {
      position: data.position,
      est_affichee: data.est_affichee ?? true,
    },
    create: normalizeBigIntFields(
      {
        id_portfolio,
        id_recommandation,
        position: data.position,
        est_affichee: data.est_affichee ?? true,
      },
      PORTFOLIO_RECOMMANDATION_ID_FIELDS,
    ),
  })

const retirerRecommendationDuPortfolio = (id_portfolio, id_recommandation) =>
  prisma.portfolioRecommandation.delete({
    where: {
      id_portfolio_id_recommandation: {
        id_portfolio: toBigInt(id_portfolio),
        id_recommandation: toBigInt(id_recommandation),
      },
    },
  })

const updateRecommendation = (id_recommendation, data) =>
  prisma.recommandation.update({
    where: { id_recommandation: toBigInt(id_recommendation) },
    data: normalizeBigIntFields(data, RECOMMANDATION_ID_FIELDS),
  })

module.exports = {
  createRecommendation,
  createRecommendationForUserProfile,
  findRecommendationsUser,
  findRecommendationsProfil,
  findRecommendationsPortfolio,
  ajouterRecommendationAuPortfolio,
  retirerRecommendationDuPortfolio,
  updateRecommendation,
}
