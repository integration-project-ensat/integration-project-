import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createPortfolio = (data) =>
  prisma.portfolio.create({ data })

export const findPortfoliosUser = (id_utilisateur) =>
  prisma.portfolio.findMany({ where: { id_utilisateur } })

export const findPortfolioPublic = (id_portfolio) =>
  prisma.portfolio.findFirst({
    where: { id_portfolio, est_public: true }
  })

export const updatePortfolio = (id_portfolio, data) =>
  prisma.portfolio.update({ where: { id_portfolio }, data })

export const deletePortfolio = (id_portfolio) =>
  prisma.portfolio.delete({ where: { id_portfolio } })

export const incrementVues = (id_portfolio) =>
  prisma.portfolio.update({
    where: { id_portfolio },
    data: { nombre_vues: { increment: 1 } }
  })
