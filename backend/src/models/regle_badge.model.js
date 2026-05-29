const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const REGLE_BADGE_ID_FIELDS = ['id_regle', 'id_badge']

const createRegleBadge = (data) =>
  prisma.regleBadge.create({
    data: normalizeBigIntFields(data, REGLE_BADGE_ID_FIELDS),
  })

const findAllReglesBadge = () =>
  prisma.regleBadge.findMany({
    include: { badge: true },
  })

const findRegleBadgeById = (id_regle) =>
  prisma.regleBadge.findUnique({
    where: { id_regle: toBigInt(id_regle) },
    include: { badge: true },
  })

const updateRegleBadge = (id_regle, data) =>
  prisma.regleBadge.update({
    where: { id_regle: toBigInt(id_regle) },
    data: normalizeBigIntFields(data, REGLE_BADGE_ID_FIELDS),
  })

module.exports = {
  createRegleBadge,
  findAllReglesBadge,
  findRegleBadgeById,
  updateRegleBadge,
}
