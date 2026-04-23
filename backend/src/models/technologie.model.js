import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createTechnologie = (data) =>
  prisma.technologie.create({ data })

export const findAllTechnologies = () =>
  prisma.technologie.findMany({ where: { est_valide: true } })
