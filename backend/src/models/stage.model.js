import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createStage = (data) =>
  prisma.stage.create({ data })

export const findStagesUser = (id_utilisateur) =>
  prisma.stage.findMany({ where: { id_utilisateur } })

export const findStageById = (id_element) =>
  prisma.stage.findUnique({ where: { id_element } })

export const updateStage = (id_element, data) =>
  prisma.stage.update({ where: { id_element }, data })

export const deleteStage = (id_element) =>
  prisma.stage.delete({ where: { id_element } })
