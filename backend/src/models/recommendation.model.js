import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createRecommendation = (data) =>
  prisma.recommendation.create({ data })

export const findRecommendationsUser = (id_utilisateur) =>
  prisma.recommendation.findMany({ where: { id_utilisateur } })

export const updateRecommendation = (id_recommendation, data) =>
  prisma.recommendation.update({ where: { id_recommendation }, data })
