import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createLettreRecommandation = (data) =>
  prisma.lettreRecommandation.create({ data })

export const findLettresUser = (id_utilisateur) =>
  prisma.lettreRecommandation.findMany({ where: { id_utilisateur } })

export const deleteLettreRecommandation = (id_element) =>
  prisma.lettreRecommandation.delete({ where: { id_element } })
