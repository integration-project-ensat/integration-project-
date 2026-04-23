import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createDiplome = (data) =>
  prisma.diplome.create({ data })

export const findDiplomesUser = (id_utilisateur) =>
  prisma.diplome.findMany({ where: { id_utilisateur } })

export const updateDiplome = (id_diplome, data) =>
  prisma.diplome.update({ where: { id_diplome }, data })

export const deleteDiplome = (id_diplome) =>
  prisma.diplome.delete({ where: { id_diplome } })
