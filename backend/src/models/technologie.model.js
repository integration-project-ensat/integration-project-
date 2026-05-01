import { normalizeBigIntFields, prisma } from './prisma.js'

export const createTechnologie = (data) =>
  prisma.technologie.create({
    data: normalizeBigIntFields(data, ['id_technologie']),
  })

export const findAllTechnologies = () =>
  prisma.technologie.findMany({ where: { est_validee: true } })
