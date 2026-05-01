import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const REGLE_BADGE_ID_FIELDS = ['id_regle', 'id_badge']

export const createRegleBadge = (data) =>
  prisma.regleBadge.create({
    data: normalizeBigIntFields(data, REGLE_BADGE_ID_FIELDS),
  })

export const findAllReglesBadge = () =>
  prisma.regleBadge.findMany({
    include: { badge: true },
  })

export const findRegleBadgeById = (id_regle) =>
  prisma.regleBadge.findUnique({
    where: { id_regle: toBigInt(id_regle) },
    include: { badge: true },
  })

export const updateRegleBadge = (id_regle, data) =>
  prisma.regleBadge.update({
    where: { id_regle: toBigInt(id_regle) },
    data: normalizeBigIntFields(data, REGLE_BADGE_ID_FIELDS),
  })
