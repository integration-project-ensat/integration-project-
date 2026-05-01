import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const PORTFOLIO_ID_FIELDS = ['id_portfolio', 'id_etudiant', 'id_modele']

export const createPortfolio = (data) =>
  prisma.portfolio.create({
    data: normalizeBigIntFields(data, PORTFOLIO_ID_FIELDS),
  })

export const findPortfoliosUser = (id_utilisateur) =>
  prisma.portfolio.findMany({
    where: { id_etudiant: toBigInt(id_utilisateur) },
    include: {
      modele: true,
      recommandations: { include: { recommandation: true } },
    },
  })

export const findPortfolioPublic = (id_portfolio) =>
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

export const updatePortfolio = (id_portfolio, data) =>
  prisma.portfolio.update({
    where: { id_portfolio: toBigInt(id_portfolio) },
    data: normalizeBigIntFields(data, PORTFOLIO_ID_FIELDS),
  })

export const deletePortfolio = (id_portfolio) =>
  prisma.portfolio.delete({ where: { id_portfolio: toBigInt(id_portfolio) } })

export const incrementVues = (id_portfolio) =>
  prisma.portfolio.findUnique({ where: { id_portfolio: toBigInt(id_portfolio) } })
