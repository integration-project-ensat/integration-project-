import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createActivite = (data) =>
  prisma.activite.create({ data })

export const findAllActivites = () =>
  prisma.activite.findMany({
    orderBy: { createdAt: 'desc' }
  })

export const findActiviteById = (id_element) =>
  prisma.activite.findUnique({ where: { id_element } })

export const updateActivite = (id_element, data) =>
  prisma.activite.update({ where: { id_element }, data })

export const deleteActivite = (id_element) =>
  prisma.activite.delete({ where: { id_element } })

export const validerActivite = (id_element) =>
  prisma.activite.update({
    where: { id_element },
    data: { date_validation: new Date() }
  })
