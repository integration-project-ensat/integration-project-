const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const PORTFOLIO_ID_FIELDS = ['id_portfolio', 'id_etudiant', 'id_modele']

const createPortfolio = (data) =>
  prisma.portfolio.create({
    data: normalizeBigIntFields(data, PORTFOLIO_ID_FIELDS),
  })

const findPortfoliosUser = (id_utilisateur) =>
  prisma.portfolio.findMany({
    where: { id_etudiant: toBigInt(id_utilisateur) },
    include: {
      modele: true,
      recommandations: { include: { recommandation: true } },
    },
  })

const findPortfolioPublic = (id_portfolio) =>
  prisma.portfolio.findFirst({
    where: { id_portfolio: toBigInt(id_portfolio), est_public: true },
    include: {
      etudiant: { include: { utilisateur: true, profil: true } },
      modele: true,
      commentaires: true,
      recommandations: {
        where: { est_affichee: true },
        include: { recommandation: { include: { auteur: true, profil: true } } },
        orderBy: { position: 'asc' },
      },
    },
  })

const updatePortfolio = (id_portfolio, data) =>
  prisma.portfolio.update({
    where: { id_portfolio: toBigInt(id_portfolio) },
    data: normalizeBigIntFields(data, PORTFOLIO_ID_FIELDS),
  })

const deletePortfolio = (id_portfolio) =>
  prisma.portfolio.delete({ where: { id_portfolio: toBigInt(id_portfolio) } })

const incrementVues = (id_portfolio) =>
  prisma.portfolio.findUnique({ where: { id_portfolio: toBigInt(id_portfolio) } })

module.exports = {
  createPortfolio,
  findPortfoliosUser,
  findPortfolioPublic,
  updatePortfolio,
  deletePortfolio,
  incrementVues,
}
