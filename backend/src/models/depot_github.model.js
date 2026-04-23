import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createDepot = (data) =>
  prisma.depotGithub.create({ data })

export const findDepotsUser = (id_utilisateur) =>
  prisma.depotGithub.findMany({ where: { id_utilisateur } })

export const syncDepots = async (id_utilisateur, depots) => {
  await prisma.depotGithub.deleteMany({ where: { id_utilisateur } })
  return prisma.depotGithub.createMany({
    data: depots.map((depot) => ({ ...depot, id_utilisateur }))
  })
}
