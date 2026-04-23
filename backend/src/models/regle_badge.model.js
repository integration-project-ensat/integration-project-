import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createRegleBadge = (data) =>
  prisma.regleBadge.create({ data })

export const findAllReglesBadge = () =>
  prisma.regleBadge.findMany({
    include: { badges: true },
    orderBy: { createdAt: 'desc' }
  })

export const findRegleBadgeById = (id_nom) =>
  prisma.regleBadge.findUnique({
    where: { id_nom },
    include: { badges: true }
  })

export const updateRegleBadge = (id_nom, data) =>
  prisma.regleBadge.update({ where: { id_nom }, data })
