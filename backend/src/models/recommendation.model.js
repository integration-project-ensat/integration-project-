const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const RECOMMANDATION_ID_FIELDS = ['id_recommandation', 'id_auteur', 'id_etudiant_cible']
const PORTFOLIO_RECOMMANDATION_ID_FIELDS = ['id_portfolio', 'id_recommandation']

const createRecommendation = (data) =>
  prisma.recommandation.create({
    data: normalizeBigIntFields(data, RECOMMANDATION_ID_FIELDS),
  })

const createRecommendationForUserProfile = async (id_utilisateur, data) => {
  const etudiant = await prisma.etudiant.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!etudiant) {
    throw new Error('Etudiant introuvable pour cet utilisateur')
  }

  return createRecommendation({
    ...data,
    id_etudiant_cible: etudiant.id_utilisateur,
  })
}

const findRecommendationsUser = async (id_utilisateur) => {
  const etudiant = await prisma.etudiant.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!etudiant) return []

  return prisma.recommandation.findMany({
    where: { id_etudiant_cible: etudiant.id_utilisateur },
    include: {
      auteur: true,
      etudiant_cible: { include: { utilisateur: { include: { profil: true } } } },
      portfolios: { include: { portfolio: true } },
    },
  })
}

const findRecommendationsProfil = async (id_profil) => {
  const profil = await prisma.profil.findUnique({
    where: { id_profil: toBigInt(id_profil) },
    select: { id_utilisateur: true },
  })

  if (!profil) return []

  return findRecommendationsUser(profil.id_utilisateur)
}

const findRecommendationsPortfolio = (id_portfolio) =>
  prisma.portfolioRecommandation.findMany({
    where: { id_portfolio: toBigInt(id_portfolio), est_affichee: true },
    include: {
      recommandation: {
        include: {
          auteur: true,
          etudiant_cible: { include: { utilisateur: { include: { profil: true } } } },
        },
      },
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
